const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//This function will calculate the weekly workout breakdown
/*

    NAME:
        calculateWeeklyBreakdown() - Calculates the breakdown of all workouts/exercises/activities from a certain week

    SYNOPSIS:
        const calculateWeeklyBreakdown(userId, week_workouts, week_exercises, week_sportActivities, exerciseTable) 

        user_id --> The ID of the user the breakdown is for (integer)
        week_workouts --> All of the workout entries for the week (object array)
        week_exercises --> All of the logged exercises for the week (object array)
        week_sportActivities --> All of the logged sports activity for the week (object array)
        exerciseTable --> The table of exercise information from the database (object array)

    DESCRIPTION:
        This function takes all of the workouts/exercises/sports activities for the week and calculates a breakdown/recap.
        This includes the amount of time spent in the gym during that week/the amount of time active outside of the gym,
        as well as the percentages each of the major muscle groups and workout categories take up of their totals,
        and the longest amount of time spent at once for that certain week.

    RETURNS:
        An object array with all of the information generated in the breakdown.

*/
const calculateWeeklyBreakdown = (userId, week_workouts, week_exercises, week_sportActivities, exerciseTable) => {
    //The object array to store all of the breakdown information as it is calculated
    const fullBreakdown = {};

    //STEP 1: AMOUNT OF TIME SPENT IN THE GYM / AMOUNT OF TIME ACTIVE (SPORTS/ETC)
    //Loop through workouts and add together time
    let totalTimeGym = 0;
    for(const workout of week_workouts){
        totalTimeGym = totalTimeGym + workout.duration_minutes;
    }
    fullBreakdown['totalGymTime'] = totalTimeGym;

    let totalTimeSports = 0;
    for(const activity of week_sportActivities){
        totalTimeSports = totalTimeSports + activity.duration_minutes;
    }
    fullBreakdown['totalSportsTime'] = totalTimeSports;


    //STEP 2: PERCENTAGES OF EACH OF THE MAJOR MUSCLE GROUPS

    //Pass this week's exercises into a function to return the percentage breakdown of muscle groups
    const breakdownMuscleGroup = calcMuscleGroupPercentages(week_exercises, exerciseTable);
    fullBreakdown['MuscleGroupPercent'] = breakdownMuscleGroup;

    //Pass this week's exercises into a function to return the percentage breakdown of workout categories
    const breakdownCategories = calcCategoryPercentages(week_exercises, exerciseTable);
    fullBreakdown['CategoryPercent'] = breakdownCategories;

    //STEP 3: LONGEST AMOUNT OF TIME SPENT AT THE GYM

    //Pass this week's workouts into a function to return the workout with the longest time.
    const longestWorkout = findLongestWorkout(week_workouts);
    fullBreakdown['longestWorkout'] = longestWorkout;

    return fullBreakdown;
}

//This function finds the workout in the list with the longest amount of time spent doing said workout.
/*

    NAME:
        findLongestWorkout() - Finds the workout with the longest time

    SYNOPSIS:
        const findLongestWorkout(workouts);

        workouts --> An object array of all the workouts to compare with each other (object array)

    DESCRIPTION:
        This function takes all of the workouts given, and loops through them to find the workout that
        has the longest duration.

    RETURNS:
        Returns a workout object. 

*/
const findLongestWorkout = (workouts) => {
    let longestTimeGym = 0;
    let longestWorkout = null;
    for(const workout of workouts){
        if(workout.duration_minutes > longestTimeGym){
            //This means it is the longest time found
            longestTimeGym = workout.duration_minutes;
            longestWorkout = workout;
        }
    }

    return longestWorkout;
}

/*

    NAME:
        calcMuscleGroupPercentages() - Calculates the percentages of the muscle groups

    SYNOPSIS:
        const calcMuscleGroupPercentages(exercises, exerciseTable);

        exercises --> All of the exercises that are going to be tallied (object array)
        exerciseTable --> All of the Exercises table information (object array) (To check the muscle groups of each exercise)

    DESCRIPTION:
        This function takes the exercises the user logged that week and looks at every single one of them, and uses the
        ExercisesTable to check all of the muscle groups that exercise targets (quads, biceps, etc). 

    RETURNS:
        An array of objects containing the percentages of muscle groups hit for the week (sorted in descending order).

*/
const calcMuscleGroupPercentages = (exercises, exerciseTable) => {
    //Tally for each major muscle group
    const tally = {};
    //Total amount of muscle groups trained
    let totalCount = 0;

    var exerciseDetails;
    var muscleGroupsString;

    exercises.forEach(exercise => {
        exerciseDetails = exerciseTable.find(item => item.name === exercise.exercise_name);
        muscleGroupsString = exerciseDetails.muscleGroups;
        
        //Since the musclegroups are stored as a string, we need to strip that string
        let muscleGroupsArray = muscleGroupsString.split(', ').map(word => word.trim());

        //Loop through the muscle groups
        for(var i = 0; i < muscleGroupsArray.length; i++){
            if(tally[muscleGroupsArray[i]]){
                tally[muscleGroupsArray[i]]++;
            } else {
                tally[muscleGroupsArray[i]] = 1;
            }

            totalCount++;
        }
    })

    //Now that we have the counts of each muscle group, we calculate what percentage of the total they each are
    for(const key in tally){
        const count = tally[key];

        tally[key] = {
            count: count,
            percentage: ((count / totalCount) * 100).toFixed(2)
        };
    }

    //Sort by highest-lowest percentage
    const sorted = percentageSortDesc(tally);

    return sorted;
}

/*

    NAME:
        calcCategoryPercentages() - Calculates the percentages of the workout categories (upper body, lower body, etc.)

    SYNOPSIS:
        const calcCategoryPercentages(exercises, exerciseTable);

        exercises --> All of the exercises that are going to be tallied (object array)
        exerciseTable --> All of the Exercises table information (object array) (To check the category of each exercise)

    DESCRIPTION:
        This function takes the exercises the user logged that week and looks at every single one of them, and uses the
        ExercisesTable to check if it is upper body, lower body, or total body, and tallies up each entry. 

    RETURNS:
        An array of objects containing the percentages of upper/lower/total body exercises for the week (sorted in descending order).

*/
const calcCategoryPercentages = (exercises, exerciseTable) => {
    //Tally for each workout category
    const tally = {};
    //Total amount of workout exercises
    let totalCount = 0;

    var exerciseDetails;
    var category;

    exercises.forEach(exercise => {
        exerciseDetails = exerciseTable.find(item => item.name === exercise.exercise_name);
        category = exerciseDetails.bodyPart;
        if(tally[category]) {
            tally[category]++;
        } else {
            tally[category] = 1;
        }

        //Increment the total count
        totalCount++;
    })

    //Now that we have the counts of each category calculated, we calculate what percentage of the total they each are.
    for(const key in tally){
        const count = tally[key];

        tally[key] = {
            count: count,
            percentage: ((count / totalCount) * 100).toFixed(2)
        };
    }

    //Sort by highest-lowest percentage
    const sorted = percentageSortDesc(tally);

    return sorted;
}

//This function takes an array of objects that have percentages and sorts it in descending order
/*

    NAME:
        percentageSortDesc() - Sorts a dictionary based on entries

    SYNOPSIS:
        const percentageSortDesc(tally);

        tally - A dictionary of entries and their counts

    DESCRIPTION:
        This function takes a dictionary of entries and their total counts/percentages and sorts them
        in descending order.

    RETURNS:
        The passed in object, but sorted in descending order.


*/
const percentageSortDesc = (tally) => {
    //Converts the object to an array of entries
    let sortedPercent = Object.entries(tally).sort((a, b) => {
        //Sort by percentage descending
        return parseFloat(b[1].percentage) - parseFloat(a[1].percentage);
    });

    //Converts the sorted array back to an object
    let sortedPercentObj = Object.fromEntries(sortedPercent);

    return sortedPercentObj;
}


module.exports = { 
    calculateWeeklyBreakdown,
};