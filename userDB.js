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

    //Makes the workout table (upon very first run)
    async makeWorkoutTable(){
        try{
            await this.db.schema('Workouts', [
                { name: 'id', type: 'INTEGER' },
                { name: 'user_id', type: 'INTEGER' },
                { name: 'date', type: 'DATE' },
                { name: 'duration_minutes', type: 'INTEGER' },
            ], 'id', ', FOREIGN KEY ("user_id") REFERENCES Users ("id") )');
        } catch (error) {
            console.error('Error creating workout table', error.message);
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
            console.log(user);
            return user;
        } catch (error) {
            console.error('Error finding user by id: ', error.message);
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
  
    close() {
      this.db.close();
    }
  }


module.exports = UserDB;