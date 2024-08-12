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

    

    //Adds a workout to the workout table
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

    //Updates a workout
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

    //Updates a sports activity
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

    //Adds an exercise to the user exercises table
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

    //Updates a userExercuse entry
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

    //Deletes a userExercise
    async deleteUserExercise(exercise_id){
        try {
            await this.db.delete('userExercises', [{ column: 'id', value: exercise_id}])
        } catch (error) {
            console.error('Error deleting user exercise: ', error.message);
        }
    }

    //Fills exercise Table from JSON
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

    //Fills sports Table from JSON
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

    //Creates a user
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

    //Updates a user
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

    //Updates a user's password
    async updateUserPassword(id, password){
        try{
            await this.db.update('Users', [
                { column: 'password', value: password }
            ], [{ column: 'id', value: id }]);
        } catch (error) {
            console.error("Error updating user password: ", error.message);
        }
    }

    //Find a user by their username
    async findUserByUsername(username) {
        try {
            const user = await this.db.read('Users', [{ column: 'username', value: username }]);
            console.log(user);
            return user;
        } catch (error) {
            console.error('Error finding user by username: ', error.message);
        }
    }

    //Find user by ID
    async findUserById(id) {
        try {
            const user = await this.db.read('Users', [{ column: 'id', value: id }]);
            return user;
        } catch (error) {
            console.error('Error finding user by id: ', error.message);
        }
        
    }

    //Find the workout by the ID
    async findWorkoutById(id) {
        try {
            const workout = await this.db.read('Workouts', [{ column: 'id', value: id }]);
            return workout;
        } catch (error) {
            console.error('Error finding the workout by id: ', error.message);
        }
    }

    //Finds a userExercise by the ID
    async findUserExerciseById(id) {
        try { 
            const exercise = await this.db.read('userExercises', [{ column: 'id', value: id}]);
            return exercise;
        } catch (error) {
            console.error('Error in finding user Exercise by ID: ', error.message);
        }
    }

    //Finds a sports activity by the ID
    async findSportsActivityById(id) {
        try {
            const sportActivity = await this.db.read('SportActivity', [{ column: 'id', value: id }]);
            return sportActivity;
        } catch (error) {
            console.error('Error finding the sport activity by id: ', error.message);
        }
    }

    //Returns the user's first and last name (searched by their ID)
    async getUserFirstLast(id){
        user = this.findUserById(id);
        return user.first + user.last;
    }

    //Returns all of the exercises from the exercises table
    async getExercises(){
        try{
            let exercises = await this.db.getAll('Exercises');
            return exercises;
        } catch (error) {
            console.error('Error retrieving exercises:', error.message);
        }
    }

    //Finds the exercise from the exercises table by the name
    async findExerciseByName(exercise_name){
        try{
            const exercise = await this.db.read('Exercises', [{ column: 'name', value: exercise_name }]);
            return exercise;
        } catch (error) {
            console.error('Error finding the exercise by name: ', error.message);
        }
    }

    //Returns all of the sports from the sports table
    async getSports(){
        try{
            let sports = await this.db.getAll('Sports');
            return sports;
        } catch (error) {
            console.error('Error retreiving sports: ', error.message);
        }
    }

    //Returns all of the exercises logged in a specific workout from userExercises
    async getAllWorkoutExercises(workout_id){
        try {
            let exercises = await this.db.getAllWhere('UserExercises', [{ column: 'workout_id', value: workout_id }]);
            return exercises;
        } catch (error) {
            console.error('Error retreiving workout exercises from userExercises: ', error.message);
        }
    }

    //Returns all the workouts from a specified user id
    async getAllWorkouts(id){
        const user = this.findUserById(id);

        try{
            let workouts = await this.db.getAllWhere('Workouts', [{ column: 'user_id', value: id }]);
            return workouts;
        } catch (error) {
            console.error('Error retreiving the user workouts: ', error.message);
        }
    }

    //Returns all sports activity logs from a specified user id
    async getAllSportsActivity(id){
        const user = this.findUserById(id);

        try{
            let sports = await this.db.getAllWhere('SportActivity', [{ column: 'user_id', value: id }]);
            return sports;
        } catch (error) {
            console.error('Error retreiving the user sports activity logs: ', error.message);
        }
    }

    //Returns all of the workouts within a set date range for a set user
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

    //Returns all of the sports activities logged within a set date range for a set user
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

    //Queries the database and returns all of one user's friends
    async getAllFriends(user_id){
        try {
            const friends = await this.db.getAllWhere('Friends', [{ column: 'user_id', value: user_id }]);
            return friends;
        } catch (error) {
            console.error('Error finding all friends of certain user: ', error.message);
        }
    }

    //Adds a friend
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

    //Removes a friend
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

    //Checks friend status
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