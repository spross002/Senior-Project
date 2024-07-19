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

    //Get the current user id (for the workout entry)
    const userId = req.session.user.id;
    const user = await req.db.findUserById(userId);

    //Creates a new workout table entry and returns the workout ID
    const workoutId = await req.db.createWorkout(userId, currentDate, workoutDuration);

    //-------------------------------------------------------------------------------------------

    //Right here will be a loop to take all of the exercises from the page and create entries in the "UserExercises" table
    //This is done at this point in the post function because the workout id needs to be known already to properly store the user's exercises.
    
    //For the mainRowContainer, we first need to get the amount of rows
    const mainRowCount = req.body.mainRowCount;

    //Starts with nothing, then adds one to each, so we begin with the very first row
    const main_exerciseName = req.body.m_exercise_dropdown;
    const main_exerciseSets = req.body.m_sets;
    const main_exerciseReps = req.body.m_reps;
    const main_exerciseWeight = req.body.m_weight;

    //As long as one of the fields are filled, we log the exercise, if none of them are filled the exercise doesn't get logged. This will be the same in the loop
    if (main_exerciseSets != '' || main_exerciseReps != '' || main_exerciseWeight != ''){
        const firstMain = await req.db.addUserExercise(workoutId, main_exerciseName, main_exerciseSets, main_exerciseReps, main_exerciseWeight);
    }
    //Loop through each main row and add the exercises
    for(var i = 1; i < mainRowCount; i++){
        var loop_main_exerciseName = req.body[`m_exercise_dropdown${i}`];
        var loop_main_exerciseSets = req.body[`m_sets${i}`];
        var loop_main_exerciseReps = req.body[`m_reps${i}`];
        var loop_main_exerciseWeight = req.body[`m_weight${i}`];

        if (loop_main_exerciseSets != '' || loop_main_exerciseReps != '' || loop_main_exerciseWeight != ''){
            var mainExercise = await req.db.addUserExercise(workoutId, loop_main_exerciseName, loop_main_exerciseSets, loop_main_exerciseReps, loop_main_exerciseWeight);
        }
    }
    
    //-------------------------------------------------------------------------------------------

    //For the accessoryRowContainer, we loop through all the rows
    const accessoryRowCount = req.body.accessoryRowCount;

    //Starts with nothing, then adds one to each, so we begin with the very first row
    var accessory_exerciseName = req.body.a_exercise_dropdown;
    var accessory_exerciseSets = req.body.a_sets;
    var accessory_exerciseReps = req.body.a_reps;
    var accessory_exerciseWeight = req.body.a_weight;

    //As long as one of the fields are filled, we log the exercise, if none of them are filled the exercise doesn't get logged. This will be the same in the loop
    if (accessory_exerciseSets != '' || accessory_exerciseReps != '' || accessory_exerciseWeight != ''){
        const firstAccesory = await req.db.addUserExercise(workoutId, accessory_exerciseName, accessory_exerciseSets, accessory_exerciseReps, accessory_exerciseWeight);
    }

    //Loop through each accessory row and add the exercises
    for(var i = 1; i < accessoryRowCount; i++){
        var loop_accessory_exerciseName = req.body[`a_exercise_dropdown${i}`];
        var loop_accessory_exerciseSets = req.body[`a_sets${i}`];
        var loop_accessory_exerciseReps = req.body[`a_reps${i}`];
        var loop_accessory_exerciseWeight = req.body[`a_weight${i}`];

        if (loop_accessory_exerciseSets != '' || loop_accessory_exerciseReps != '' || loop_accessory_exerciseWeight != ''){
            var accesoryExercise = await req.db.addUserExercise(workoutId, loop_accessory_exerciseName, loop_accessory_exerciseSets, loop_accessory_exerciseReps, loop_accessory_exerciseWeight);
        }
    }

    res.redirect('/dashboard');
});

module.exports = router;
