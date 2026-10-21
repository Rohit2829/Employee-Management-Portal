const mysql = require("mysql2/promise");
require("dotenv").config();

// Create the connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10, // Adjust according to your needs
  queueLimit: 0, // 0 means no limit
});

async function query(sql: any, params: any) {
  let connection;
  try {
    // Get a connection from the pool
    connection = await pool.getConnection();

    // Execute the query
    const [results] = await connection.query(sql, params);
    return results;
  } catch (error) {
    // Handle the error as needed
    console.error("Database query error:", error);
    throw error;
  } finally {
    // Ensure the connection is released back to the pool
    if (connection) connection.release();
  }
}

module.exports = {
  query,
};
