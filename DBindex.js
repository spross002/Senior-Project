const assert = require('assert');
const sqlite3 = require('sqlite3').verbose();

class DataStore {
    constructor() {
        // Read Configuration
        this.path = process.env.DBPATH;
        this.db = new sqlite3.Database('./gymbuds.db');
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.db.serialize(() => {
                console.log('Connected to database');
                resolve;
            });

            this.db.on('error', (err) => {
                console.error('Database error:', err.message);
                reject(err);
            });
        });
    }

    //Creates table if it doesn't exist
    schema(table, schema, pkey) {
        const sql = `CREATE TABLE IF NOT EXISTS "${table}" 
            (${schema.map(c => `"${c.name}" ${c.type}`).join(", ")}, 
            PRIMARY KEY ("${pkey}"))`;
    
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

    //Read from a table
    read(table, query){
        let sql = `SELECT * from ${table}`;
        if (query.length > 0) {
            sql += ` WHERE ${query.map(d => `${d.column} = ?`).join(' and ')}`
        }

        return new Promise((resolve, reject) => {
            this.db.run(sql, (err) => {
                if (err) {
                    console.error('Eroor reading from table:', err.message);
                    reject(err);
                } else {
                    console.log('Read from table successfully');
                    resolve();
                }
            });
        });
    }
    

    // async create(table, data) {
    //     const params = Array(data.length).fill('?')
    //     const sql = `INSERT into ${table} (${data.map(d => d.column).join(',')}) values (${params.join(',')})`;
    //     console.log(sql, data.map(d => d.value));
    //     const result = await this.db.run(
    //         sql,
    //         data.map(d => d.value));
    //     return result.lastID;
    // }

    // /** This is limited to supporting direct match query parameters.
    //  *  Query is an array of column/value pairs
    //  */
    // async read(table, query) {
    //     let sql = `SELECT * from ${table}`;
    //     if (query.length > 0) {
    //         sql += ` WHERE ${query.map(d => `${d.column} = ?`).join(' and ')}`
    //     }
    //     console.log(sql, query.map(d => d.value));
    //     return await this.db.all(
    //         sql, query.map(d => d.value)
    //     );
    // }

    // async update(table, data, query) {
    //     let sql = `UPDATE ${table} set ${data.map(d => `${d.column}=?`)} where ${query.map(d => `${d.column} = ?`).join(' and ')}`;
    //     const _data = data.map(d => d.value).concat(query.map(q => q.value));
    //     console.log(sql, _data);
    //     return await this.db.run(sql, _data)
    // }

    // async delete(table, query) {
    //     assert(query.length > 0, 'Deleting without query is a bad idea');
    //     let sql = `DELETE from ${table} WHERE ${query.map(d => `${d.column} = ?`).join(' and ')}`;
    //     console.log(sql, query.map(d => d.value));
    //     return await this.db.all(
    //         sql, query.map(d => d.value)
    //     );
    // }
}

module.exports = DataStore;