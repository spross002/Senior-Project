const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

//This function checks if the user is logged in (for authorization)
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
        When a workout is saved/submitted, an ID is created for said workout, then each exercise is individually saved
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
    const workoutId = await req.db.createWorkout(userId, currentDate, startTimeStr, endTimeStr, workoutDuration);

    //-------------------------------------------------------------------------------------------

    //Right here will be a loop to take all of the exercises from the page and create entries in the "UserExercises" table
    //This is done here specifically at this point in the post function because the workout id needs to be known already to properly store the user's exercises.
    
    //For the mainRowContainer, we first need to get the amount of rows
    const mainRowCount = req.body.mainRowCount;

    //Starts with nothing, then adds one to each, so we begin with the very first row
    const main_exerciseName = req.body.m_exercise_dropdown;
    const main_exerciseSets = req.body.m_sets;
    const main_exerciseReps = req.body.m_reps;
    const main_exerciseWeight = req.body.m_weight;

    const main_string = "Main";

    //As long as one of the fields are filled, we log the exercise, if none of them are filled the exercise doesn't get logged. This will be the same in the loop
    if (main_exerciseSets != '' || main_exerciseReps != '' || main_exerciseWeight != ''){
        const firstMain = await req.db.addUserExercise(workoutId, main_exerciseName, main_string, main_exerciseSets, main_exerciseReps, main_exerciseWeight);
    }
    //Loop through each main row and add the exercises
    for(var i = 1; i < mainRowCount; i++){
        var loop_main_exerciseName = req.body[`m_exercise_dropdown${i}`];
        var loop_main_exerciseSets = req.body[`m_sets${i}`];
        var loop_main_exerciseReps = req.body[`m_reps${i}`];
        var loop_main_exerciseWeight = req.body[`m_weight${i}`];

        if (loop_main_exerciseSets != '' || loop_main_exerciseReps != '' || loop_main_exerciseWeight != ''){
            const mainExercise = await req.db.addUserExercise(workoutId, loop_main_exerciseName, main_string, loop_main_exerciseSets, loop_main_exerciseReps, loop_main_exerciseWeight);
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

    const accessory_string = "Accessory";

    //As long as one of the fields are filled, we log the exercise, if none of them are filled the exercise doesn't get logged. This will be the same in the loop
    if (accessory_exerciseSets != '' || accessory_exerciseReps != '' || accessory_exerciseWeight != ''){
        const firstAccesory = await req.db.addUserExercise(workoutId, accessory_exerciseName, accessory_string, accessory_exerciseSets, accessory_exerciseReps, accessory_exerciseWeight);
    }

    //Loop through each accessory row and add the exercises
    for(var i = 1; i < accessoryRowCount; i++){
        var loop_accessory_exerciseName = req.body[`a_exercise_dropdown${i}`];
        var loop_accessory_exerciseSets = req.body[`a_sets${i}`];
        var loop_accessory_exerciseReps = req.body[`a_reps${i}`];
        var loop_accessory_exerciseWeight = req.body[`a_weight${i}`];

        if (loop_accessory_exerciseSets != '' || loop_accessory_exerciseReps != '' || loop_accessory_exerciseWeight != ''){
            var accesoryExercise = await req.db.addUserExercise(workoutId, loop_accessory_exerciseName, accessory_string, loop_accessory_exerciseSets, loop_accessory_exerciseReps, loop_accessory_exerciseWeight);
        }
    }

    res.redirect('/dashboard');
});

//This renders the workout editting page
router.get('/workouts/:id', logged_in, async (req, res) => {
    //In this router.get we need to do something extra instead of just rendering something, which is double checking that the user ID matches the user id that is connected to the workout
    // This is done to ensure that a user can only edit their own workouts.

    //Get the user id from the database
    const userId = req.session.user.id;
    const user = await req.db.findUserById(userId);

    //Find the workout from the database based on the ID in the URL
    const workoutId = req.params.id;
    const workout = await req.db.findWorkoutById(workoutId);

    //Retreive all of the possible exercises from the exercises table
    const exercises = await req.db.getExercises();

    //Store the start and end times to pass into the render call
    const startTime = workout.start_time;
    const endTime = workout.end_time;
     
    //Check the user's id matches with the workout's user id to ensure that the workout they are trying to view is in fact theirs.
    if(workout.user_id == userId){
        //Retreive all of the exercises that have the workout and user id from userExercises if they match
        const userExercises = await req.db.getAllWorkoutExercises(workoutId);

        //Variables to store the amount of main and accessories.
        var m_count = 0;
        var a_count = 0;

        //Loop through userExercises to find how many mains and accessories are in the workout to pass to the page
        for(const exercise of userExercises){
            if(exercise.classification === 'Main'){
                m_count++;
            } else if (exercise.classification === 'Accessory'){
                a_count++;
            }
        }

        //Render the edit page
        res.render('editWorkout', { user: user, workout: workout, exercises: exercises, userExercises: userExercises, startTime: startTime, endTime: endTime, m_count: m_count, a_count: a_count });
    } else {
        //Render unauthorized if they don't match
        res.render('unauthorized', { userUnauthorized: true });
    }
});

//Workout editing page functionality/post
router.post('/workouts/:id', async (req, res) => {
    //We don't need the get the current date here because that is already saved, so it doesn't need to be touched. 

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

    //Now we need to update/change the workout saved by getting the workout ID from the URL and calling a function to update the workout table entry
    const workoutId = req.body.workoutId;
    const edittedWorkoutId = await req.db.updateWorkout(workoutId, startTimeStr, endTimeStr, workoutDuration);

    //The next step is to update all of the exercises that were changed. 

    /*
        Strategy: Loop through the rows in the container. If there is an ID associated with that row, then we update with that ID.
        Else, we create a new entry.

        Check 'm_exercise_id${rowCount}`, and if the value is a number, that is the exercise ID to edit, and if it is 'null' (meaning it is a new addition), then we make a new table entry.
    */

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    //For the mainRowContainer, we first need to get the amount of rows
    const mainRowCount = req.body.mainRowCount;

    //Starts with nothing, then adds one to each, so we begin with the very first row
    const main_exerciseID = req.body.m_exercise_id;
    const main_exerciseName = req.body.m_exercise_dropdown;
    const main_exerciseSets = req.body.m_sets;
    const main_exerciseReps = req.body.m_reps;
    const main_exerciseWeight = req.body.m_weight;

    var exerciseID_list = [];

    const main_string = "Main";

    //Check if the first exercise has an ID
    if(main_exerciseID != 'null'){
        exerciseID_list.push(main_exerciseID);
        //If it does, we update the entry in the table

        //As long as one of the fields are filled, we log the exercise, if none of them are filled the exercise doesn't get logged. This will be the same in the loop
        if (main_exerciseSets != '' || main_exerciseReps != '' || main_exerciseWeight != ''){
            const firstMain = await req.db.updateUserExercise(main_exerciseID, workoutId, main_exerciseName, main_string, main_exerciseSets, main_exerciseReps, main_exerciseWeight);
        }
        
    } else {
        //If it does not, we create a new entry
        if (main_exerciseSets != '' || main_exerciseReps != '' || main_exerciseWeight != ''){
            const firstMain = await req.db.addUserExercise(workoutId, main_exerciseName, main_string, main_exerciseSets, main_exerciseReps, main_exerciseWeight);
            exerciseID_list.push(firstMain.id);
        }
    }


    //Now the first one is handled, we loop through each main row and update or add the exercises
    for(var i = 1; i < mainRowCount; i++){
        var loop_main_exerciseID = req.body[`m_exercise_id${i}`];
        var loop_main_exerciseName = req.body[`m_exercise_dropdown${i}`];
        var loop_main_exerciseSets = req.body[`m_sets${i}`];
        var loop_main_exerciseReps = req.body[`m_reps${i}`];
        var loop_main_exerciseWeight = req.body[`m_weight${i}`];

        if(loop_main_exerciseID != 'null'){
            //Append to the list of exercise IDs (for deletion checking later)
            exerciseID_list.push(loop_main_exerciseID);

            //If there is a value, we update the entry

            //As long as one of the fields are filled, we log the exercise, if none of them are filled the exercise doesn't get logged. This will be the same in the loop
            if (loop_main_exerciseSets != '' || loop_main_exerciseReps != '' || loop_main_exerciseWeight != ''){
                const mainExercise = await req.db.updateUserExercise(loop_main_exerciseID, workoutId, loop_main_exerciseName, main_string, loop_main_exerciseSets, loop_main_exerciseReps, loop_main_exerciseWeight);
            }   

        } else {
            //If it does not, we create a new entry
            if (loop_main_exerciseSets != '' || loop_main_exerciseReps != '' || loop_main_exerciseWeight != ''){
                const mainExercise = await req.db.addUserExercise(workoutId, loop_main_exerciseName, main_string, loop_main_exerciseSets, loop_main_exerciseReps, loop_main_exerciseWeight);
                exerciseID_list.push(mainExercise.id);
            }
        }
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------

    //For the accessoryRowContainer, we loop through all the rows
    const accessoryRowCount = req.body.accessoryRowCount;

    //Starts with nothing, then adds one to each, so we begin with the very first row
    const accessory_exerciseID = req.body.a_exercise_id;
    var accessory_exerciseName = req.body.a_exercise_dropdown;
    var accessory_exerciseSets = req.body.a_sets;
    var accessory_exerciseReps = req.body.a_reps;
    var accessory_exerciseWeight = req.body.a_weight;

    const accessory_string = "Accessory";

    //Check if the first exercise has an ID
    if(accessory_exerciseID != 'null'){
        exerciseID_list.push(accessory_exerciseID);
        //If it does, we update the entry in the table

        //As long as one of the fields are filled, we log the exercise, if none of them are filled the exercise doesn't get logged. This will be the same in the loop
        if (accessory_exerciseSets != '' || accessory_exerciseReps != '' || accessory_exerciseWeight != ''){
            const firstAccesory = await req.db.updateUserExercise(accessory_exerciseID, workoutId, accessory_exerciseName, accessory_string, accessory_exerciseSets, accessory_exerciseReps, accessory_exerciseWeight);
        }

        
    } else {
        //If it does not, we create a new entry
        if (accessory_exerciseSets != '' || accessory_exerciseReps != '' || accessory_exerciseWeight != ''){
            const firstAccesory = await req.db.addUserExercise(workoutId, accessory_exerciseName, accessory_string, accessory_exerciseSets, accessory_exerciseReps, accessory_exerciseWeight);
            exerciseID_list.push(firstAccesory.id);
        }
    }

    //Now that the first one is handled, we loop through each accessory row and update or add the exercises.

    //Loop through each accessory row and add the exercises
    for(var i = 1; i < accessoryRowCount; i++){
        var loop_accessory_exerciseID = req.body[`a_exercise_id${i}`];
        var loop_accessory_exerciseName = req.body[`a_exercise_dropdown${i}`];
        var loop_accessory_exerciseSets = req.body[`a_sets${i}`];
        var loop_accessory_exerciseReps = req.body[`a_reps${i}`];
        var loop_accessory_exerciseWeight = req.body[`a_weight${i}`];

        if(loop_accessory_exerciseID != 'null'){
            //Append to the list of exercise IDs (for deletion checking later)
            exerciseID_list.push(loop_accessory_exerciseID);

            //If there is a value, we update the entry
            if (loop_accessory_exerciseSets != '' || loop_accessory_exerciseReps != '' || loop_accessory_exerciseWeight != ''){
                const accesoryExercise = await req.db.updateUserExercise(loop_accessory_exerciseID, workoutId, loop_accessory_exerciseName, accessory_string, loop_accessory_exerciseSets, loop_accessory_exerciseReps, loop_accessory_exerciseWeight);
            }


        } else {
            //If it does not, we create a new entry
            if (loop_accessory_exerciseSets != '' || loop_accessory_exerciseReps != '' || loop_accessory_exerciseWeight != ''){
                const accesoryExercise = await req.db.addUserExercise(workoutId, loop_accessory_exerciseName, accessory_string, loop_accessory_exerciseSets, loop_accessory_exerciseReps, loop_accessory_exerciseWeight);
                exerciseID_list.push(accesoryExercise.id);
            }
        }
    }

    //The last thing we need to do is check for any deleted exercises from the workout.

    //Get all exercise IDs that have this workout ID.
    const allExercises = await req.db.getAllWorkoutExercises(workoutId);
    var databaseIDs_list = [];

    for(const exercise of allExercises){
        databaseIDs_list.push(exercise.id);
    }

    //If the exercises in the list don't correspond with the exercises from the database, we delete the ones that aren't in the list
    var idFound
    //Loop through databse IDs
    for(var i = 0; i < databaseIDs_list.length; i++){
        idFound = false
        //loop through exercise IDs
        for(var j = 0; j < exerciseID_list.length; j++){
            //If the database ID is found in the exercise list we exit the inner loop to check the next ID
            if(databaseIDs_list[i] == exerciseID_list[j]){
                idFound = true;
                j = exerciseID_list.length;
            }
        }
        //Check at the end if the ID was found. If it is in the database, but not the user list, that means they deleted it.
        if(idFound == false){
            //Call the delete function here
            await req.db.deleteUserExercise(databaseIDs_list[i]);
        }
    }

    res.redirect('/dashboard');
});

//Renders the page to log a sport activity (non-gym activity)
router.get('/:id/newSportsActivity', logged_in, async (req, res) => {
    const userId = req.session.user ? req.session.user.id : -1;
    const user = await req.db.findUserById(userId);

    //Retrieve all of the possible sports from the sports table
    const sports = await req.db.getSports();

    res.render('newSportActivity', { user: user, sports: sports });
})

//Sport activity page functionality (saving, etc)
router.post('/:id/newSportsActivity', async (req, res) => {

    //Get the current date (for the sports activity entry)
    const currentDate = new Date().toDateString();

    //Get the duration of the workout (for the duration entry)
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

    //If the end time is before the start time, that means it ends on the next day (for those people active late at night)
    // so, we need to account for that
    if(end < start){
        end.setDate(end.getDate() + 1);
    }

    //Calculates the workout time in milliseconds
    const diffMilliseconds = end - start;

    //Convert the milliseconds to minutes
    const diffMinutes = diffMilliseconds / (1000 * 60);

    //Calculates the workout time in minutes
    const activityDuration = diffMinutes;

    const userId = req.session.user.id;
    const user = await req.db.findUserById(userId);

    //Retreive the sport the person is logging
    const sport = req.body.sport_dropdown;

    //Creates a new sport activity entry and returns the generated ID.
    const activityId = await req.db.createSportsActivity(userId, sport, currentDate, activityDuration);

    res.redirect('/dashboard');
})

module.exports = router;
