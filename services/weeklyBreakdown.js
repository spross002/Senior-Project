const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//This function will calculate the weekly workout breakdown

const calculateWeeklyBreakdown = (userId, start_date, end_date) => {
    /*
        CHECKLIST:
            1. Calculate the amount of time spent in the gym during set week.
            2. Out of all of their exercises, calculate the percentages each of the major muscle groups take up.
            3. Find the longest amount of time spent at the gym for that certain week.
            4. A list to look at each workout they did (possibly too much for one page, may change/disregard)
    */
    const finalBreakdown = {};

    //PREREQUISITES
    
    //First we need to query the database to get all workouts from the user from the certain week.
    //let week_workouts = db.all();

    //Then we need to query the database to get all of the exercises logged from all of those workouts


    //STEP 1: AMOUNT OF TIME SPENT IN THE GYM


}


module.exports = { 
    calculateWeeklyBreakdown,
};