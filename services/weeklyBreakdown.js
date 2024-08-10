const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//This function will calculate the weekly workout breakdown

const calculateWeeklyBreakdown = (userId, week_workouts, week_exercises, week_sportActivities) => {
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
    console.log(totalTimeGym);

    let totalTimeSports = 0;
    for(const activity of week_sportActivities){
        totalTimeSports = totalTimeSports + activity.duration_minutes;
    }
    console.log(totalTimeSports);


    //STEP 2: PERCENTAGES OF EACH OF THE MAJOR MUSCLE GROUPS




    //STEP 3: LONGEST AMOUNT OF TIME SPENT AT THE GYM

}


module.exports = { 
    calculateWeeklyBreakdown,
};