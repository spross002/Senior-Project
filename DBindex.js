const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();

//DataStore Class
//All of the basic functions for interacting with the database, all specific functions will call one of these in order to generate a sql query.
class DataStore {
    constructor() {
        // Read Configuration
        this.path = process.env.DBPATH;
        this.db = new sqlite3.Database('./gymbuds.db');
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                console.log('Connected to database ');
                resolve;
            });

            this.db.on('error', (err) => {
                console.error('Database error:', err.message);
                reject(err);
            });
        });
    }


    /*

        NAME:
            schema() - Creates a table in the database

        SYNOPSIS:
            schema(table, schema, pkey, fkey);

            table --> The name of the table to be created (text)
            schema --> The names of the table data categories (text)
            pkey --> The primary key of the table (integer)
            fkey --> A foreign key if needed (integer)

        DESCRIPTION:
            This function takes information passed in and generates a SQL query to
            create a table according to information passed in.

        RETURNS:
            Returns a blank promise if successful, and outputs if the creation is successful or not into console.
    */
    schema(table, schema, pkey, fkey) {
        let sql = `CREATE TABLE IF NOT EXISTS "${table}" 
            (${schema.map(c => `"${c.name}" ${c.type}`).join(", ")}, 
            PRIMARY KEY ("${pkey}")`;

        if(fkey){
            sql += fkey;
        } else{
            sql += ')';
        }
    
        return new Promise((resolve, reject) => {
          this.db.run(sql, (err) => {
            if (err) {
              console.error('Error creating table:', err.message);
              reject(err);
            } else {
              console.log('Table created or already exists');
              resolve();
            }
          });
        });
    }

    /*

        NAME:
            read() - Generates SQL to read from a certain table in database

        SYNOPSIS:
            read(table, query);

            table --> The name of the table that will be read from (text)
            query --> The object containing the search parameters (object array)

        DESCRIPTION:
            This functions takes a table name and values and generates an SQL query
            to retrieve information from the database.

        RETURNS:
            Returns a promise containing all rows found from the table given the query parameters. 
            Reports error otherwise.

    */
    read(table, query){
        let sql = `SELECT * from ${table}`;
        if (query.length > 0) {
            sql += ` WHERE ${query.map(d => `${d.column} = '${d.value}'`).join(' and ')}`
        }

        return new Promise((resolve, reject) => {
            this.db.get(sql, (err, rows) => {
                if (err) {
                    console.error('Error:', err.message);
                    reject(err);
                } else {
                    console.log('Successful lookup');
                    resolve(rows);
                }
            });
        });
    }

    //Update an entry in a table
    /*

        NAME:
            update() - Generates SQL to update an entry in the database

        SYNOPSIS:
            update(table, data, query);

            table --> The name of the table to be accessed (text)
            data --> The new information of columns of data that is being changed (object array)
            query --> The ID of the entry that is being changed (integer)

        DESCRIPTION:
            This takes the array of data, and maps all of it into a string of text, that is an
            SQL query, and runs the generated SQL.

        RETURNS:
            Returns a blank promise if successful, and logs to console whether or not it is successful.

    */
    update(table, data, query){
        const params = Array(data.length).fill('?')
        let sql = `UPDATE ${table} set ${data.map(d => `${d.column}=?`)} where ${query.map(d => `${d.column} = ?`).join(' and ')}`;
        const _data = data.map(d => d.value).concat(query.map(q => q.value));

        return new Promise((resolve, reject) => {
            this.db.run(sql, _data, (err) => {
              if (err) {
                console.error('Error updating table:', err.message);
                reject(err);
              } else {
                console.log('Table successfully updated');
                resolve();
              }
            });
          });
    }

    /*

        NAME:
            delete() - Generates SQL to delete an entry from a specified table in the database

        SYNOPSIS:
            delete(table, query);

            table --> The name of the table to be deleted (text)
            query --> The ID of the row to be deleted (integer)

        DESCRIPTION:
            This function takes the table name and id (query) and maps that information to a string of text,
            and passes that string of text to the databse as an SQL query, running that query and deleting
            the row specified from the query.

        RETURNS:
            Returns a blank promise. Logs to console if successful or unsuccessful.
    */
    delete(table, query){
        let sql = `DELETE from ${table}`;
        if (query.length > 0) {
            sql += ` WHERE ${query.map(d => `${d.column} = '${d.value}'`).join(' and ')}`
        }

        return new Promise((resolve, reject) => {
            this.db.run(sql, (err) => {
              if (err) {
                console.error('Error deleting from table:', err.message);
                reject(err);
              } else {
                console.log('Table entry successfully deleted');
                resolve();
              }
            });
          });
    }


    /*
        
        NAME:
            create() - Generates an SQL query to create an entry in a specified table

        SYNOPSIS:
            create(table, data);

            table --> The name of the table to be updated (text)
            data --> The data of the new table entry (object array)

        DESCRIPTION:
            This function takes a table name and column data and maps that data to a string, and
            passes that string to the database as an SQL query, running that query and creating an
            entry in the table.

        RETURNS:
            Returns a promise with the ID of the created row. Logs to console if successful/unsuccessful.

    */
    create(table, data) {
        const params = Array(data.length).fill('?')
        const sql = `INSERT into ${table} (${data.map(d => d.column).join(',')}) values (${params.join(',')})`;
        console.log(sql, data.map(d => d.value));

        let lastID = null;

        //Insert the item into the specified table
        return new Promise((resolve, reject) => {
            this.db.run(sql, data.map(d => d.value), function(err) {
                if (err) {
                    reject(err);
                    return;
                } else {
                    lastID = this.lastID;
                    resolve(lastID);
                }
            });
        })
    }

    /*

        NAME:
            isTableEmpty() - Checks if a specified table is empty

        SYNOPSIS:
            isTableEmpty(table);

            table --> The name of the table to be accessed/checked (text)

        DESCRIPTION:
            Maps the table name to an SQL query that selects the amount of 
            rows in the table.

        RETURNS:
            True if the amount of rows is 0, false otherwise.
            
    */
    isTableEmpty(table){
        return new Promise((resolve, reject) => {
            this.db.get(`SELECT COUNT(*) AS count FROM ${table}`, (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    const rowCount = row.count;
                    resolve(rowCount === 0);
                }
            });
        });
    }

    /*

        NAME:
            getAll() - Returns all rows from a specified table in the database

        SYNOPSIS:
            getAll(table);

            table --> The name of the table to be queried from (text)

        DESCRIPTION:
            Maps the name of the table into a string of text, then passes that
            string of text to the database as an SQL query.

        RETURNS:
            An object array of all of the rows retrieved from the specified
            table in the database

    */
    getAll(table){
        return new Promise((resolve, reject) => {
            this.db.all(`SELECT * FROM ${table}`, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    /*

        NAME:
            getAllWhere() - Returns all rows from a specified table with the specified data

        SYNOPSIS:
            getAllWhere(table, query);

            table --> The name of the table to be accessed (text)
            query --> The data and ID for the SQL query (object array)

        DESCRIPTION:
            This function takes the information from the query and maps the table name and information
            from the query into a string of text, which is then passed into the database as SQL query.

        RETURNS:
            An object array of all rows found from the table with the specified information.

    */
    getAllWhere(table, query){
        let sql = `SELECT * from ${table}`;
        if (query.length > 0) {
            sql += ` WHERE ${query.map(d => `${d.column} = '${d.value}'`).join(' and ')}`
        }

        return new Promise((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) {
                    console.error('Error:', err.message);
                    reject(err);
                } else {
                    console.log('Successful lookup');
                    resolve(rows);
                }
            });
        });
    }

    /*
        
        NAME:
            getAllInRange() - Retrieves all rows in specified table from specified user in a specific date range

        SYNOPSIS:
            getAllInRange(table, user_id, query);

            table --> The name of the table to be accessed (text)
            user_id --> The ID of the user the rows in the table will belong to (integer)
            query --> An object containing the two dates the data needs to be in-between (object array)

        DESCRIPTION:
            This function takes the table name, user ID, and two dates, and maps it all to a string of
            text, which is then passed to the database as an SQL query. In this specific case, a query that
            returns all rows between two specified dates.

        RETURNS:
            Returns an object array of all rows between the two dates from the specific user. 


    */
    getAllInRange(table, user_id, query){
        let sql = `SELECT * from ${table} WHERE user_id = ${user_id}`;
        if (query.length > 0){
            sql += ` AND date BETWEEN ${query.map(d => `'${d.value}'`).join(' and ')}`
        }

        return new Promise((resolve, reject) => {
            this.db.all(sql, (err, rows) => {
                if (err) {
                    console.error('Error: ', err.message);
                    reject(err);
                } else {
                    console.log('Successful lookup');
                    resolve(rows);
                }
            });
        });
    }

}

module.exports = DataStore;