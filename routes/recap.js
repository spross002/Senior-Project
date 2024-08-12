const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { formatDate } = require('../services/commonFunctions');
const { calculateWeeklyBreakdown } = require('../services/weeklyBreakdown'); // Imports the function to generate the recap

//This function checks if the user is logged in (for authorization)
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/unauthorized');
    }
}

//Render the latest recap dashboard page
router.get('/recap', logged_in, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Check which day it is
    const today = new Date();
    const isSunday = today.getDay() === 0;

    //Find the date of the last monday that passed and store it
    let lastMonday = new Date();
    const daysToSubtract = ((today.getDay() + 6) % 7);
    lastMonday.setDate(today.getDate() - daysToSubtract);

    lastMonday = formatDate(lastMonday);
    let formattedToday = formatDate(today);

    //Now we have the dates we are calculating the recap in, we can query the database for everything within that range
    //Get the workouts for the week
    const week_workouts = await req.db.getAllWorkoutsForWeek(userId, lastMonday, formattedToday);

    let workout_ids = [];

    //Fill the workout_ids array with all of the workout ids from this week's workouts
    for(const workout of week_workouts){
        workout_ids.push(workout.id);
    }

    //Get all of the exercises from the workouts for the week
    let week_exercises = []
    for(var i = 0; i < workout_ids.length; i++){
        week_exercises.push(await req.db.getAllWorkoutExercises(workout_ids[i]));
    }

    //"Flatten" the week_exercises array so its just an array of objects, not an "array of object arrays"
    week_exercises = week_exercises.flat();

    //Get all of the sport activities for the week
    const week_sportActivities = await req.db.getAllSportsForWeek(userId, lastMonday, formattedToday);

    //Get the table of available exercises from the database to pass into the breakdown function 
    // so it can see muscle groups and workout categories
    const exerciseTable = await req.db.getExercises();

    //Take all of the information gathered and pass it into the function to generate the weekly recap
    const recap = calculateWeeklyBreakdown(userId, week_workouts, week_exercises, week_sportActivities, exerciseTable);


    //If "isSunday" is true, that means the day is sunday and we can store the recap to the database
    if(isSunday){
        //Save recap in the database
        //const recap = await req.db.saveRecap();
    }

    res.render('recap', { user: user, recap: recap })
})

//This function

module.exports = router;