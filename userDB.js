require('dotenv').config();
const Database = require('./DBindex');

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
    async createUser(){
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

    //Find a user by their username
    async findUserByUsername(username) {
        try {
            const us = await this.db.read('Users', [{ column: 'username', value: username }]);
        } catch (error) {
            console.error('Error finding by user:', error.message);
        }
        if (us.length > 0) return us[0];
        else {
            return undefined;
        }
    }
  
    close() {
      this.db.close();
    }
  }


module.exports = UserDB;