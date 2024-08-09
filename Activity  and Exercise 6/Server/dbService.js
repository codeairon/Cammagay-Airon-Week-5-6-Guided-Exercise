const mysql = require('mysql');
const dotenv = require('dotenv');
dotenv.config();

const connection = mysql.createConnection({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.message);
    return;
  }
  console.log('db ' + connection.state);
});

class DbService {
  static getDbServiceInstance() {
    return instance ? instance : new DbService();
  }

  async getAllData() {
    try {
      const query = "SELECT * FROM students;";
      const response = await new Promise((resolve, reject) => {
        connection.query(query, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.error('Error fetching data from database:', error);
      throw error;
    }
  }

  async updateNameById(id, name, program) {
    try {
      const query = "UPDATE students SET name = ?, program = ? WHERE id = ?";
      const response = await new Promise((resolve, reject) => {
        connection.query(query, [name, program, id], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results.affectedRows > 0); // returns true if a row was updated
        });
      });
      return response;
    } catch (error) {
      console.error('Error updating data in database:', error);
      throw error;
    }
  }

  async insertData(name, program) {
    try {
      const query = "INSERT INTO students (name, program, date_added) VALUES (?, ?, NOW())";
      const response = await new Promise((resolve, reject) => {
        connection.query(query, [name, program], (err, results) => {
          if (err) {
            console.error('Error inserting data:', err.message);
            reject(new Error(err.message));
          }
          resolve(results.insertId); // returns the ID of the newly inserted row
        });
      });
      return response;
    } catch (error) {
      console.error('Error inserting data into database:', error);
      throw error;
    }
  }

  async deleteRowById(id) {
    try {
      const query = "DELETE FROM students WHERE id = ?";
      const response = await new Promise((resolve, reject) => {
        connection.query(query, [id], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results.affectedRows > 0); // returns true if a row was deleted
        });
      });

      // Check if the table is empty
      const countQuery = "SELECT COUNT(*) AS count FROM students";
      const countResponse = await new Promise((resolve, reject) => {
        connection.query(countQuery, (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results[0].count);
        });
      });

      // If table is empty, reset auto-increment
      if (countResponse === 0) {
        await new Promise((resolve, reject) => {
          connection.query("ALTER TABLE students AUTO_INCREMENT = 1", (err, results) => {
            if (err) reject(new Error(err.message));
            resolve(results);
          });
        });
      }

      return response;
    } catch (error) {
      console.error('Error deleting data from database:', error);
      throw error;
    }
  }

  async searchByName(name) {
    try {
      const query = "SELECT * FROM students WHERE name LIKE ?";
      const response = await new Promise((resolve, reject) => {
        connection.query(query, [`%${name}%`], (err, results) => {
          if (err) reject(new Error(err.message));
          resolve(results);
        });
      });
      return response;
    } catch (error) {
      console.error('Error searching data in database:', error);
      throw error;
    }
  }
}

let instance = null;
module.exports = DbService;
