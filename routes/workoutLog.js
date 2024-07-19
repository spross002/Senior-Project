const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

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

    function parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    // Parse the start and end times
    const start = parseTime(startTimeStr);
    const end = parseTime(endTimeStr);

    //If the end time is before the start time, that means it ends on the next day (for those late night lifters)
    // so, we need to account for that
    if(end < start){
        end.setDate(end.getDate() + 1);
    }

    //Calculates the workout time in milliseconds
    const diffMilliseconds = end - start;

    //Convert the milliseconds to minutes
    const diffMinutes = diffMilliseconds / (1000 * 60);

    //Calculates the workout time in minutes
    const workoutDuration = diffMinutes;

    console.log(workoutDuration);

    //Get the current user id (for the workout entry)
    const userId = req.session.user.id;
    const user = await req.db.findUserById(userId);

    //Creates a new workout table entry and returns the workout ID
    const workoutId = await req.db.createWorkout(userId, currentDate, workoutDuration);

    //Right here will be a loop to take all of the exercises from the page and create entries in the "UserExercises" table
    //This is done at this point in the post function because the workout id needs to be known already to properly store the user's exercises.
    //For the mainRowContainer, we loop through all the rows
    const mainRowCount = req.body.mainRowCount;

    //Starts with nothing, then adds one to each, so we begin with the very first row
    var exerciseName = req.body.m_exercise_dropdown;
    var exerciseSets = req.body.m_sets;
    var exerciseReps = req.body.m_reps;
    var exerciseWeight = req.body.m_weight;

    const newExercise = await req.db.addUserExercise(workoutId, exerciseName, exerciseSets, exerciseReps, exerciseWeight);

    for(var i = 1; i < mainRowCount; i++){

    }
    

    //For the accessoryRowContainer, we loop through all the rows
    const accessoryRowCount = req.body.accessoryRowCount;

    res.redirect('/dashboard');
});

module.exports = router;
