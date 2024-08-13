require('dotenv').config();
const fs = require('fs');
const DataStore = require('./DBindex');
const Database = require('./DBindex');
const sqlite3 = require('sqlite3').verbose();

class UserDB {
    constructor(databasePath) {
      this.db = new Database(databasePath);
    }
  
    //Initializes the database connection
    async initialize() {
      try {
        await this.db.connect();
      } catch (error) {
        console.error('Error initializing database:', error.message);
      }
    }

    //Makes the user table (upon very first run)
    async makeUserTable(){
        try{
            await this.db.schema('Users', [
                { name: 'id', type: 'INTEGER' },
                { name: 'first_name', type: 'TEXT' },
                { name: 'last_name', type: 'TEXT' },
                { name: 'username', type: 'TEXT' },
                { name: 'password', type: 'TEXT' }
            ], 'id');
        } catch (error) {
            console.error('Error creating user table', error.message);
        }
    }

    //Makes the friends table (upon very first run)
    async makeFriendsTable(){
        try {
            await this.db.schema('Friends', [
                { name: 'id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'friend_id', type: 'INTEGER' }
            ], 'id', ', FOREIGN KEY ("user_id") REFERENCES Users ("id"), FOREIGN KEY ("friend_id") REFERENCES Users ("id"), UNIQUE ("user_id", "friend_id") )')
        } catch (error) {
            console.error('Error creating friends table', error.message);
        }
    }

    //Makes the workout table (upon very first run)
    async makeWorkoutTable(){
        try{
            await this.db.schema('Workouts', [
                { name: 'id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'date', type: 'DATE' },
                { name: 'duration_minutes', type: 'INTEGER' },
                { name: 'start_time', type: 'TEXT'},
                { name: 'end_time', type: 'TEXT'}
            ], 'id', ', FOREIGN KEY ("user_id") REFERENCES Users ("id") )');
        } catch (error) {
            console.error('Error creating workout table', error.message);
        }
    }

    //Makes the sport activity table (upon very first run)
    async makeSportsActivityTable(){
        try {
            await this.db.schema('SportActivity', [
                { name: 'id', type: 'INTEGER'},
                { name: 'user_id', type: 'INTEGER'},
                { name: 'sport', type: 'TEXT' },
                { name: 'date', type: 'DATE' },
                { name: 'duration_minutes', type: 'INTEGER' },
                { name: 'start_time', type: 'TEXT'},
                { name: 'end_time', type: 'TEXT'}
            ], 'id', ', FOREIGN KEY ("user_id") REFERENCES Users ("id") )');
        } catch (error) {
            console.error('Error creating sports activity table', error.message);
        }
    }

    //Makes the table for exercises (upon very first run)
    async makeExercisesTable(){
        try{
            await this.db.schema('Exercises', [
                { name: 'id', type: 'INTEGER' },
                { name: 'name', type: 'TEXT'},
                { name: 'classification', type: 'TEXT'},
                { name: 'muscleGroups', type: 'TEXT'},
                { name: 'bodyPart', type: 'TEXT'}
            ], 'id');
        } catch (error) {
            console.error('Error creating workout table', error.message);
        }
    }

    //Makes the table to store all the sports for the users to choose from (upon very first run)
    async makeSportsTable(){
        try{
            await this.db.schema('Sports', [
                { name: 'id', type: 'INTEGER' },
                { name: 'sport', type: 'TEXT'},
            ], 'id');
        } catch (error) {
            console.error('Error creating sports table: ', error.message);
        }
    }

    //Makes the table to store all the exercises in the user's workouts (upon very first run)
    async makeUserExercisesTable(){
        try{
            await this.db.schema('UserExercises', [
                { name: 'id', type: 'INTEGER' },
                { name: 'workout_id', type: 'INTEGER' },
                { name: 'exercise_name', type: 'TEXT' },
                { name: 'classification', type: 'TEXT' },
                { name: 'sets', type: 'INTEGER' },
                { name: 'reps', type: 'INTEGER' },
                { name: 'weight', type: 'INTEGER' }
            ], 'id', ', FOREIGN KEY ("workout_id") REFERENCES Workouts ("id") )');
        } catch (error) {
            console.error('Error creating User Exercises Table', error.message);
        }
    }

    //Makes the table to store all of the user's weekly recaps
    async makeRecapTable(){
        try{
            await this.db.schema('Recaps', [
                { name: 'id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'total_time', type: 'INTEGER' },
                { name: 'longest_time', type: 'INTEGER' },
                { name: 'total_body', type: 'REAL' },
                { name: 'upper_body', type: 'REAL' },
                { name: 'lower_body', type: 'REAL' },
                { name: 'monday_date', type: 'TEXT' },
                { name: 'sunday_date', type: 'TEXT' }
            ], 'id', ', FOREIGN KEY ("user_id") REFERENCES Users ("id") )');
        } catch (error) {
            console.error('Error creating recaps table', error.message);
        }
    }

    

    /*

    NAME: 
        createWorkout() - Creates a workout in the database

    SYNOPSIS:
        async createWorkout(user_id, date, start_time, end_time, duration_minutes);

        user_id --> The ID of the user creating a workout (integer)
        date --> The date that the workout is being created (YYYY:MM:DD format)
        start_time - The time the workout began (24:00 Format)
        end_time --> The time the workout ended (24:00 Format)
        duration_minutes --> The duration of the workout in minutes (integer)

    DESCRIPTION:
        This function takes all of the details of a workout entry and calls a function to
        query the database with an "INSERT" function with the input information to add a new
        entry to the 'Workouts' table

    RETURNS:
        Returns the ID of the workout entry created. Reports an error to console if unsuccessful.

    */
    async createWorkout(user_id, date, start_time, end_time, duration_minutes){
        try{
            const id = await this.db.create('Workouts', [
                { column: 'user_id', value: user_id },
                { column: 'date', value: date},
                { column: 'duration_minutes', value: duration_minutes },
                { column: 'start_time', value: start_time },
                { column: 'end_time', value: end_time }
            ])
            return id;
        } catch (error) {
            console.error('Error creating a new workout: ', error);
        }
    }

    /*

    NAME:
        updateWorkout() - Updates a workout in the database

    SYNOPSIS:
        async updateWorkout(workout_id, start_time, end_time, duration_minutes)

        workout_id --> The ID of the workout that will be updated/changed. (integer)
        start_time - The time the workout began (24:00 Format)
        end_time --> The time the workout ended (24:00 Format)
        duration_minutes --> The duration of the workout in minutes (integer)

    DESCRIPTION:
        This function takes all of the details of a workout entry (minus the date because that doesn't change)
        and calls a function to query the database with an "UPDATE" function with the input information to change
        the details of the workout entry under the given workout ID.

    RETURNS:
        Reports an error to console if unsuccessful.

    */
    async updateWorkout(workout_id, start_time, end_time, duration_minutes){
        try{
            const id = await this.db.update('Workouts', [
                { column: 'start_time', value: start_time },
                { column: 'end_time', value: end_time},
                { column: 'duration_minutes', value: duration_minutes }
            ], [{ column: 'id', value: workout_id }]);
        } catch (error) {
            console.error('Error updating workout: ', error);
        }
    }

    //Creates a sports activity
    /*

    NAME:
        createSportsActivity() - Creates a sports activity entry in the database

    SYNOPSIS:
        async createSportsActivity(user_id, sport, date, duration_minutes, start_time, end_time);

        user_id --> The ID of the user creating the sports activity entry (integer)
        sport --> The name of the sport the user is logging (text)
        date --> The date that the workout is being created (YYYY:MM:DD format)
        start_time - The time the workout began (24:00 Format)
        end_time --> The time the workout ended (24:00 Format)
        duration_minutes --> The duration of the workout in minutes (integer)


    DESCRIPTION:
        This function takes all of the details of a sports activity entry and calls a function to
        query the database with an "INSERT" function with the input information to create a new entry
        in the "SportActivity" table in the database.

    RETURNS:
        Returns the ID of the Sport Activity entry created. Reports an error to console if unsuccessful.

    */
    async createSportsActivity(user_id, sport, date, duration_minutes, start_time, end_time){
        try{
            const id = await this.db.create('SportActivity', [
                { column: 'user_id', value: user_id },
                { column: 'sport', value: sport },
                { column: 'date', value: date },
                { column: 'duration_minutes', value: duration_minutes },
                { column: 'start_time', value: start_time},
                { column: 'end_time', value: end_time}
            ])
            return id;
        } catch (error) {
            console.error('Error creating a new sports activity entry: ', error);
        }
    }

    /*

    NAME:
        updateSportActivity() - Updates a SportActivity entry in the database

    SYNOPSIS:
        async updateSportActivity(activity_id, sport, duration_minutes, start_time, end_time);

        activity_id --> The ID of the activity that will be updated/changed. (integer)
        sport --> The name of the sport being logged (text)
        start_time - The time the workout began (24:00 Format)
        end_time --> The time the workout ended (24:00 Format)
        duration_minutes --> The duration of the workout in minutes (integer)

    DESCRIPTION:
        This function takes all of the details of a sports activity entry (minus the date because that doesn't change)
        and calls a function to query the database with an "UPDATE" function with the input information to change
        the details of the sports activity entry under the given workout ID.

    RETURNS:
        Returns the ID of the entry in the table changed. Reports an error to console if unsuccessful.

    */
    async updateSportsActivity(activity_id, sport, duration_minutes, start_time, end_time){
        try{
            const id = await this.db.update('SportActivity', [
                { column: 'sport', value: sport },
                { column: 'duration_minutes', value: duration_minutes },
                { column: 'start_time', value: start_time},
                { column: 'end_time', value: end_time}
            ], [{ column: 'id', value: activity_id }]);
            return id;
        } catch (error) {
            console.error('Error updating sports activity entry: ', error);
        }

    }

    /*

    NAME:
        addUserExercise() - Creates/Adds a user exercise entry in the database

    SYNOPSIS:
        async addUserExercise(workout_id, exercise_name, classification, sets, reps, weight);

        workout_id --> The ID of the workout associated with this certain exercise (integer)
        exercise_name --> The name of the exercise being logged (text)
        classification --> The type (main, accessory) of the exercise being logged (text)
        sets --> The amount of sets of the exercise (integer)
        reps --> The amount of reps of the exercise (integer)
        weight --> The weight of the exercise (integer)

    DESCRIPTION:
        This function takes all of the details of an exercise entry and calls a function to
        query the database with an "INSERT" function with the input information to create an
        entry in the 'UserExercises' table.

    RETURNS:
        Returns of ID of the entry in the table created. Reports an error to console if unsuccessful.

    */
    async addUserExercise(workout_id, exercise_name, classification, sets, reps, weight){
        try {
            const id = await this.db.create('UserExercises', [
                { column: 'workout_id', value: workout_id },
                { column: 'exercise_name', value: exercise_name },
                { column: 'classification', value: classification },
                { column: 'sets', value: sets },
                { column: 'reps', value: reps },
                { column: 'weight', value: weight }
            ])
            return id;
        } catch (error) {
            console.error('Error creating a new exercise in user exercises: ', error);
        }
    }

    /*

    NAME:
        updateUserExercise() - Updates a user exercise entry in the database

    SYNOPSIS:
        async updateUserExercise(exercise_id, workout_id, exercise_name, classification, sets, reps, weight);

        exercise_id --> The ID of the exercise entry that will be updated/changed. (integer)
        workout_id --> The ID of the workout associated with the entry (integer)
        exercise_name --> The name of the exercise being logged (text)
        sets --> The amount of sets of the exercise (integer)
        reps --> The amount of reps of the exercise (integer)
        weight --> The weight of the exercise (integer)

    DESCRIPTION:
        This function takes all of the details of a user exercise entry and calls a function to query the database with 
        an "UPDATE" function with the input information to change the details of the user exercise entry under the given 
        exercise ID.

    RETURNS:
        Reports an error to console if unsuccessful.

    */
    async updateUserExercise(exercise_id, workout_id, exercise_name, classification, sets, reps, weight){
        try {
            const id = await this.db.update('userExercises', [
                { column: 'exercise_name', value: exercise_name },
                { column: 'classification', value: classification },
                { column: 'sets', value: sets },
                { column: 'reps', value: reps },
                { column: 'weight', value: weight }
            ], [{ column: 'id', value: exercise_id }]);
        } catch (error) {
            console.error('Error updating exercise entry: ', error.message);
        }
    }

    /*

    NAME:
        deleteUserExercise() - Deletes a user exercise entry in the database

    SYNOPSIS:
        async deleteUserExercise(exercise_id);

        exercise_id --> The ID of the exercise to be deleted (integer)

    DESCRIPTION:
        This function takes an ID of an exercise, then calls a function to query the database with a
        "DELETE" function to delete the entry with the given ID.

    RETURNS:
        Reports an error if unsuccessful.

    */
    async deleteUserExercise(exercise_id){
        try {
            await this.db.delete('userExercises', [{ column: 'id', value: exercise_id}])
        } catch (error) {
            console.error('Error deleting user exercise: ', error.message);
        }
    }

    /*

    NAME:
        fillExercisesTable() - Fills the Exercises database table from a JSON file

    SYNOPSIS:
        async fillExercisesTable();

    DESCRIPTION:
        This function checks if the 'Exercises' table is empty, and if it is not, it parses the data
        from the 'exercises.json' file and stores all of it into the 'Exercises' table.

    RETURNS:
        Reports an error if unsuccessful.

    */
    async fillExercisesTable(){
        //Checks if Exercises is empty, because if it is not empty then we are just re-entering data again unecessarily
        const empty = await this.db.isTableEmpty('Exercises');

        //If Exercises is empty, we fill the table from the JSON file.
        if(empty){
            try{
                const jsonData = fs.readFileSync('exercises.json', 'utf-8');
    
                const parsedData = JSON.parse(jsonData);
        
                //Loop through the parsed data from the JSON (the exercises) and add them to the table by calling create
                parsedData.forEach(exercise => {
                    this.db.create('Exercises', [
                        { column: 'name', value: exercise.name },
                        { column: 'classification', value: exercise.classification },
                        { column: 'muscleGroups', value: exercise.muscleGroups.join(', ')},
                        { column: 'bodyPart', value: exercise.bodyPart }
                    ])
                });
            } catch (error) {
                console.error('Error reading or parsing JSON file: ', error);
            }
        }
    }

    /*

    NAME:
        fillSportsTable() - Fills the Exercises database table from a JSON file

    SYNOPSIS:
        async fillSportsTable();

    DESCRIPTION:
        This function checks if the 'Sports' table is empty, and if it is not, it parses the data
        from the 'sports.json' file and stores all of it into the 'Sports' table.

    RETURNS:
        Reports an error if unsuccessful.

    */
    async fillSportsTable(){
        //Checks if sports is empty, because if it is not empty then we are just ren-entering data again unecessarily
        const empty = await this.db.isTableEmpty('Sports');

        if(empty){
            try {
                const jsonData = fs.readFileSync('sports.json', 'utf-8');

                const parsedData = JSON.parse(jsonData);

                //Loop through the parsed data from the JSON (the sports) and add them to the table by calling create
                parsedData.forEach(sport => {
                    this.db.create('Sports', [
                        { column: 'sport', value: sport.name }
                    ]);
                });
            } catch (error) { 
                console.error('Error reading or parsing JSON file: ', error);
            }
        }
    }

    /*

    NAME:
        createUser() - Creates a user in the database

    SYNOPSIS:
        async createUser(first, last, username, password);

        first --> The user's first name (text)
        last --> The user's last name (text)
        username --> The user's username (text)
        password --> The user's hashed password (text)

    DESCRIPTION:
        This function takes all of the details of an new user and calls a function to
        query the database with an "INSERT" function with the input information to create a user
        in the 'Users' table.

    RETURNS:
        The ID of the user created. Reports an error if unsuccessful.

    */
    async createUser(first, last, username, password){
        try{
            const id = await this.db.create('Users', [
                { column: 'first_name', value: first },
                { column: 'last_name', value: last },
                { column: 'username', value: username },
                { column: 'password', value: password }
            ])
            return id;
        } catch (error) {
            console.error('Error adding user:', error.message);
        }
    }

    /*
    NAME:
        updateUser() - Updates a user in the database

    SYNOPSIS:
        async updateUser(id, first, last, username);

        id --> The ID of the user being updated (integer)
        first --> The user's first name to be potentially changed (text)
        last --> The user's last name to be potentially changed (text)
        username --> The user's username to be potentially changed (text)

    DESCRIPTION:
        This function takes all of the details of a user and calls a function to query the database with an 
        "UPDATE" function with the input information to change the details of the user under the given
        user ID.

    RETURNS:
        Reports an error to console if unsuccessful.

    */
    async updateUser(id, first, last, username){
        try{
            await this.db.update('Users', [
                { column: 'first_name', value: first },
                { column: 'last_name', value: last },
                { column: 'username', value: username }
            ], [{ column: 'id', value: id }]);
        } catch (error) {
            console.error("Error updating user: ", error.message);
        }
    }

    /*
    NAME:
        updateUserPassword() - Updates a user's password in the database

    SYNOPSIS:
        async updateUser(id, password);

        id --> The ID of the user being updated (integer)
        password --> The new password of the user. 

    DESCRIPTION:
        This function takes all of the details of a user and calls a function to query the database with an 
        "UPDATE" function with the input information to change the details of the user under the given
        user ID.

    RETURNS:
        Reports an error to console if unsuccessful.

    */
    async updateUserPassword(id, password){
        try{
            await this.db.update('Users', [
                { column: 'password', value: password }
            ], [{ column: 'id', value: id }]);
        } catch (error) {
            console.error("Error updating user password: ", error.message);
        }
    }

    /*
    NAME:
        findUserByUsername() - Finds a user from the database given their username

    SYNOPSIS:
        async findUserByUsername(username);

        username --> The user's username to be used as a search query (text)

    DESCRIPTION:
        This function takes the username of a user and calls a function to query the database for the user
        with the stated username. 

    RETURNS:
        Returns an object of the user's details. Reports an error to console if unsuccessful.

    */
    async findUserByUsername(username) {
        try {
            const user = await this.db.read('Users', [{ column: 'username', value: username }]);
            console.log(user);
            return user;
        } catch (error) {
            console.error('Error finding user by username: ', error.message);
        }
    }

    /*
    NAME:
        findUserById() - Finds a user from the database given their id

    SYNOPSIS:
        async findUserById(id);

        id --> The user's ID to be used as a search query (text)

    DESCRIPTION:
        This function takes the ID of a user and calls a function to query the database for the user
        with the stated user ID. 

    RETURNS:
        Returns an object of the user's details. Reports an error to console if unsuccessful.

    */
    async findUserById(id) {
        try {
            const user = await this.db.read('Users', [{ column: 'id', value: id }]);
            return user;
        } catch (error) {
            console.error('Error finding user by id: ', error.message);
        }
        
    }

    /*
    NAME:
        findWorkoutById() - Finds a workout from the database given its ID

    SYNOPSIS:
        async findWorkoutById(id);

        id --> The workout's ID to be used as a search query (text)

    DESCRIPTION:
        This function takes the ID of a workout and calls a function to query the database for the workout
        with the stated ID. 

    RETURNS:
        Returns an object of the workout's details. Reports an error to console if unsuccessful.

    */
    async findWorkoutById(id) {
        try {
            const workout = await this.db.read('Workouts', [{ column: 'id', value: id }]);
            return workout;
        } catch (error) {
            console.error('Error finding the workout by id: ', error.message);
        }
    }

    /*
    NAME:
        findUserExerciseById() - Finds a user exercise from the database given its ID.

    SYNOPSIS:
        async findUserExerciseById(id);

        id --> The user exercises's ID to be used as a search query (text)

    DESCRIPTION:
        This function takes the ID of a user logged exercise and calls a function to query the database for the user
        exercise with the stated ID. 

    RETURNS:
        Returns an object of the user exercise's details. Reports an error to console if unsuccessful.

    */
    async findUserExerciseById(id) {
        try { 
            const exercise = await this.db.read('userExercises', [{ column: 'id', value: id}]);
            return exercise;
        } catch (error) {
            console.error('Error in finding user Exercise by ID: ', error.message);
        }
    }

    /*
    NAME:
        findSportsActivityById() - Finds a sports activity from the database given its ID.

    SYNOPSIS:
        async findSportsActivityById(id);

        id --> The user sport activity's ID to be used as a search query (text)

    DESCRIPTION:
        This function takes the ID of a user logged sports activity and calls a function to query the database for the user
        logged sports activity with the stated ID. 

    RETURNS:
        Returns an object of the sports activity's details. Reports an error to console if unsuccessful.

    */
    async findSportsActivityById(id) {
        try {
            const sportActivity = await this.db.read('SportActivity', [{ column: 'id', value: id }]);
            return sportActivity;
        } catch (error) {
            console.error('Error finding the sport activity by id: ', error.message);
        }
    }

    /*
    NAME:
        getAllUsers() - Gets all of the user's from the 'Users' table.

    SYNOPSIS:
        async getAllUsers();

    DESCRIPTION:
        This function calls a function to query the 'Users' table and retreives all of the entries in that table.

    RETURNS:
        Returns all of the users in the table in the form of an array of objects. Reports an error to console if unsuccessful.

    */
    async getAllUsers(){
        try {
            const users = await this.db.getAll('Users');
            return users;
        } catch (error) {
            console.error("Error finding all users: ", error.message);
        }
    }


    /*

    NAME:
        getUserFirstLast(); - Gets the user's first and last name from database

    SYNOPSIS:
        async getUserFirstLast(id);

        id --> The ID of the user being searched for (integer)

    DESCRIPTION:
        This function takes a user's ID and calls a function to find a user by the ID to retrive the
        user's information.

    RETURNS:
        Returns the user's first and last name. 

    */
    async getUserFirstLast(id){
        user = this.findUserById(id);
        return user.first + user.last;
    }

    /*
    NAME:
        getExercises() - Gets all of the exercises from the 'Exercises' table.

    SYNOPSIS:
        async getExercises();

    DESCRIPTION:
        This function calls a function to query the 'Exercises' table and retrieves all of the entries in that table.

    RETURNS:
        Returns all of the exercises in the table in the form of an array of objects. Reports an error to console if unsuccessful.

    */
    async getExercises(){
        try{
            let exercises = await this.db.getAll('Exercises');
            return exercises;
        } catch (error) {
            console.error('Error retrieving exercises:', error.message);
        }
    }

    //Finds the exercise from the exercises table by the name
    /*
    NAME:
        findExerciseByName() - Finds an exercise from the 'Exercises' table by the name

    SYNOPSIS:
        async findExerciseByName(exercise_name);

        exercise_name --> The name of the exercise to be searched for (text)

    DESCRIPTION:
        This function takes an exercise name, and calls a function to query the 'Exercises' table to retrieve the information
        of the exercise with that name.

    RETURNS:
        Returns the exercise information from the table in the form of an object. Reports an error to console if unsuccessful.

    */
    async findExerciseByName(exercise_name){
        try{
            const exercise = await this.db.read('Exercises', [{ column: 'name', value: exercise_name }]);
            return exercise;
        } catch (error) {
            console.error('Error finding the exercise by name: ', error.message);
        }
    }

    /*
    NAME:
        getSports() - Gets all of the sports from the 'Sports' table.

    SYNOPSIS:
        async getSports();

    DESCRIPTION:
        This function calls a function to query the 'Sports' table and retrieves all of the entries in that table.

    RETURNS:
        Returns all of the sports in the table in the form of an array of objects. Reports an error to console if unsuccessful.

    */
    async getSports(){
        try{
            let sports = await this.db.getAll('Sports');
            return sports;
        } catch (error) {
            console.error('Error retreiving sports: ', error.message);
        }
    }

    /*
    NAME:
        getAllWorkoutExercises() - Gets all of the exercises from a workout from database

    SYNOPSIS:
        async getAllWorkoutExercises(workout_id);

        workout_id --> The ID of the workout the exercises are associated with (integer)

    DESCRIPTION:
        This function calls a function to query the 'UserExercises' table and retrieves all of the exercises with stated workout ID.

    RETURNS:
        Returns all of the exercises with the set workout ID in the form of an array of objects. Reports an error to console if unsuccessful.

    */
    async getAllWorkoutExercises(workout_id){
        try {
            let exercises = await this.db.getAllWhere('UserExercises', [{ column: 'workout_id', value: workout_id }]);
            return exercises;
        } catch (error) {
            console.error('Error retreiving workout exercises from userExercises: ', error.message);
        }
    }

    /*
    NAME:
        getAllWorkouts() - Gets all of the workouts from a specified user from database

    SYNOPSIS:
        async getAllWorkouts(id);

        id --> The ID of the user (integer)

    DESCRIPTION:
        This function calls a function to query the 'Workouts' table and retrieves all of the workouts with stated user ID.

    RETURNS:
        Returns all of the workouts with the set user ID in the form of an array of objects. Reports an error to console if unsuccessful.

    */
    async getAllWorkouts(id){
        const user = this.findUserById(id);

        try{
            let workouts = await this.db.getAllWhere('Workouts', [{ column: 'user_id', value: id }]);
            return workouts;
        } catch (error) {
            console.error('Error retreiving the user workouts: ', error.message);
        }
    }

    /*
    NAME:
        getAllSportsActivity() - Gets all of the sports activity logs from a specified user from database

    SYNOPSIS:
        async getAllSportsActivity(id);

        id --> The ID of the user (integer)

    DESCRIPTION:
        This function calls a function to query the 'SportActivity' table and retrieves all of the sports activity
        log with the stated workout ID.

    RETURNS:
        Returns all of the sports activity logs with the set user ID in the form of an array of objects. Reports an error to console if unsuccessful.

    */
    async getAllSportsActivity(id){
        const user = this.findUserById(id);

        try{
            let sports = await this.db.getAllWhere('SportActivity', [{ column: 'user_id', value: id }]);
            return sports;
        } catch (error) {
            console.error('Error retreiving the user sports activity logs: ', error.message);
        }
    }

    /*
    NAME:
        getAllWorkoutsForWeek() - Gets all of the workouts of a user in set week from database

    SYNOPSIS:
        async getAllWorkoutsForWeek(id, start_date, end_date);

        id --> The ID of the user (integer)
        start_date --> The first date of the week being searched (YYYY:MM:DD Format)
        end_date --> The last date of the week being searched (YYYY:MM:DD Format)

    DESCRIPTION:
        This function takes the user ID, and the start/end date of the specified week, and calls a function to query the 'workouts' table
        in the database to return all workouts between the two dates.

    RETURNS:
        Returns an array of objects containing the workouts in specified week. Reports an error to console if unsuccessful.

    */
    async getAllWorkoutsForWeek(id, start_date, end_date){
        try {
            let workouts = await this.db.getAllInRange('Workouts', id, [
                { column: 'date', value: start_date },
                { column: 'date', value: end_date }
            ]);
            return workouts;
        } catch (error) {
            console.error('Error retrieving all workouts within set range: ', error.message);
        }
    }

    /*
    NAME:
        getAllSportsForWeek() - Gets all of the workouts of a user in set week from database

    SYNOPSIS:
        async getAllSportsForWeek(id, start_date, end_date);

        id --> The ID of the user (integer)
        start_date --> The first date of the week being searched (YYYY:MM:DD Format)
        end_date --> The last date of the week being searched (YYYY:MM:DD Format)

    DESCRIPTION:
        This function takes the user ID, and the start/end date of the specified week, and calls a function to query the 'SportActivity' table
        in the database to return all logged sport activities between the two dates.

    RETURNS:
        Returns an array of objects containing the sports activies in specified week. Reports an error to console if unsuccessful.

    */
    async getAllSportsForWeek(id, start_date, end_date){
        try {
            let sports = await this.db.getAllInRange('SportActivity', id, [
                { column: 'date', value: start_date },
                { column: 'date', value: end_date }
            ]);
            return sports;
        } catch (error) {
            console.error('Error retrieving all sport activites within set range: ', error.message);
        }
    }

    /*
    NAME:
        getAllFriends() - Gets all of the friends of a certain user from database

    SYNOPSIS:
        async getAllFriends(user_id);

        user_id --> The ID of the user (integer)

    DESCRIPTION:
        This function takes the user ID, and calls a function to query the 'Friends' table and search for all entries 
        where the user_id is the same as the specified user_id.

    RETURNS:
        Returns an array of all the user's friends. Reports an error to console if unsuccessful.

    */
    async getAllFriends(user_id){
        try {
            const friends = await this.db.getAllWhere('Friends', [{ column: 'user_id', value: user_id }]);
            return friends;
        } catch (error) {
            console.error('Error finding all friends of certain user: ', error.message);
        }
    }

    /*

    NAME:
        addFriend(); - Creates an entry in the 'Friends' table

    SYNOPSIS:
        async addFriend(user_id, friend_id);

        user_id --> The ID of the user adding a friend (integer)
        friend_id --> The ID of the user that is being added as a friend (integer)

    DESCRIPTION:
        This function takes the User ID and the friend's ID and calls a function to query the 'Friends'
        table with an "INSERT" to create an entry with the user ID and friend ID.

    RETURNS:
        The ID of the entry created. Reports an error if unsuccessful.

    */
    async addFriend(user_id, friend_id){
        try {
            const id = await this.db.create('Friends', [
                { column: 'user_id', value: user_id },
                { column: 'friend_id', value: friend_id }
            ])
            return id;
        } catch (error) {
            console.error('Error adding friend: ', error.message);
        }
    }

    /*

    NAME:
        removeFriend(); - Removes an entry from the 'Friends' table

    SYNOPSIS:
        async removeFriend(user_id, friend_id);

        user_id --> The ID of the user removing a friend (integer)
        friend_id --> The ID of the user that is being removed as a friend (integer)

    DESCRIPTION:
        This function takes the User ID and the friend's ID and calls a function to query the 'Friends'
        table with an "DELETE" to delete the entry with the two IDs to 'remove' them as friends

    RETURNS:
        Reports an error if unsuccessful.

    */
    async removeFriend(user_id, friend_id){
        try {
            await this.db.delete('Friends', [
                { column: 'user_id', value: user_id },
                { column: 'friend_id', value: friend_id }
            ])
        } catch (error) {
            console.error("Error removing friend: ", error.message);
        }
    }

    /*

    NAME:
        checkFriendStatus(); - Checks the status of two user IDs to see if they are friends.

    SYNOPSIS:
        async checkFriendStatus(user_id, friend_id);

        user_id --> The ID of the user (integer)
        friend_id --> The ID of the friend (integer)

    DESCRIPTION:
        This function takes the User ID and the friend's ID and calls a function to query the 'Friends'
        table to find the entry with both user_id and friend_id.

    RETURNS:
        The ID of the table entry found. Reports an error if unsuccessful.

    */
    async checkFriendStatus(user_id, friend_id){
        try {
            const id = await this.db.read('Friends', [
                { column: 'user_id', value: user_id },
                { column: 'friend_id', value: friend_id }
            ])
            return id;
        } catch (error) {
            console.error("Error checking friend status: ", error.message);
        }
    }
  
    close() {
      this.db.close();
    }
  }


module.exports = UserDB;