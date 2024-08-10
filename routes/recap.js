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

    //This gets removed later *******IMPORTANT*******
    const isFriday = today.getDay() === 5;

    //Find the date of the last monday that passed and store it
    let lastMonday = new Date();
    const daysToSubtract = ((today.getDay() + 6) % 7);
    lastMonday.setDate(today.getDate() - daysToSubtract);

    lastMonday = formatDate(lastMonday);
    let formattedToday = formatDate(today);

    //Now we have the dates we are calculating the recap in, we can query the database for everything within that range
    //Get the workouts for the week
    const week_workouts = await req.db.getAllWorkoutsForWeek(userId, lastMonday, formattedToday);
    console.log(week_workouts);

    //Get all of the exercises from the workouts for the week

    //Take the information and generate the weekly recap


    //If "isSunday" is true, that means the day is sunday and we can store the recap to the database
    if(isSunday){
        //Save recap in the database
        //const recap = await req.db.saveRecap();
    }

    res.render('recap', { user: user })
})

//This function

module.exports = router;