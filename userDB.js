require('dotenv').config();
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
            console.error('Error creating table', error.message);
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

    async getUserFirstLast(id){
        user = this.findUserById(id);
        return user.first + user.last;
    }
  
    close() {
      this.db.close();
    }
  }


module.exports = UserDB;