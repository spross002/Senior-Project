const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//This function will calculate the weekly workout breakdown
const calculateWeeklyBreakdown = (userId, week_workouts, week_exercises, week_sportActivities, exerciseTable) => {
    const fullBreakdown = {};
    /*
        CHECKLIST:
            1. Calculate the amount of time spent in the gym during set week.
            2. Out of all of their exercises, calculate the percentages each of the major muscle groups take up.
            3. Find the longest amount of time spent at the gym for that certain week.
            4. A list to look at each workout they did (possibly too much for one page, may change/disregard)
    */

    //PREREQUISITES
    //Week_workouts is an array of the workouts from the week
    //Week_exercises is an array of the exercises from the week

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
    //Now we need to loop through all of the exercises, storing each major muscle group when a new one is found, and tallying the rest.
    const breakdownMuscleGroup = calcMuscleGroupPercentages(week_exercises, exerciseTable);

    const breakdownCategories = calcCategoryPercentages(week_exercises, exerciseTable);
    fullBreakdown['CategoryPercent'] = breakdownCategories;



    //STEP 3: LONGEST AMOUNT OF TIME SPENT AT THE GYM

    //Pass this week's workouts into a function to return the workout with the longest time.
    const longestWorkout = findLongestTime(week_workouts);
    fullBreakdown['longestWorkout'] = longestWorkout;

    console.log('FULL BREAKDOWN', fullBreakdown);
    return fullBreakdown;
}

//This function finds the workout in the list with the longest amount of time spent doing said workout.
const findLongestTime = (workouts) => {
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

//This function calculates and returns the percentages of major muscle groups
const calcMuscleGroupPercentages = (exercises, exerciseTable) => {

}

//This function calculates and returns the percentages of the workout categories (upper body, lower body, etc.)
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

    return tally;
}


module.exports = { 
    calculateWeeklyBreakdown,
};