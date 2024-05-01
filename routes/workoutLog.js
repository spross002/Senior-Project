const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const moment = require('moment');

//If logged in then allow contact addition and deletion and editing
const logged_in = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/unauthorized');
    }
}

//Unauthorized Page Render
router.get('/unauthorized', async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    res.render('unauthorized');
})

//When a user clicks log out, the user session is abandoned and they are redirected to the home page
router.get('/logout', async (req, res) => {
    req.session.user = undefined;
    res.redirect('/');
});

//Renders a blank workout logging page
router.get('/:id/newWorkout', logged_in, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Retreive all of the possible exercises from the exercises table
    const exercises = await req.db.getExercises();

    res.render('newWorkout', { user: user, exercises: exercises });
});

//Workout page functionality (saving, etc)
router.post('/:id/newWorkout', async (req, res) => {

    /*
        Current plan: when a workout is saved/submitted, an ID is created for said workout, then each exercise is individually saved
        into a table with the workout id, and the exercise id
        (exercise id is linked with the id from the Exercises table)

        That way, if someone wants to re-open a workout, it searches through the table of workout exercises and finds all with the corresponding
        workout ID. 
    */

    //Get the current date (for the workout entry)
    const currentDate = new Date().toDateString();

    //Get the duration of the workout (for the workout duration entry)
    const startTimeStr = req.body.startTime;
    const endTimeStr = req.body.endTime;

    const startTime = moment(startTimeStr, 'HH:mm');
    const endTime = moment(endTimeStr, 'HH:mm');

    //Calculates the workout time in minutes
    const workoutDuration = endTime.diff(startTime, 'minutes');

    console.log(workoutDuration);

    //Get the current user id (for the workout entry)
    const userId = req.session.user.id;
    const user = await req.db.findUserById(userId);

    //Creates a new workout table entry and returns the workout ID
    const workoutId = await req.db.createWorkout(userId, currentDate, workoutDuration);

    res.redirect('/dashboard');
});

module.exports = router;
