require("dotenv").config();
const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

async function run() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USERNAME || "root",
      password: process.env.DB_PASSWORD || "rohityadav",
      multipleStatements: true
    });
    
    // First drop the database
    await connection.query("DROP DATABASE IF EXISTS `hzl_employee_db`;");
    console.log("Dropped database hzl_employee_db");

    const sql = fs.readFileSync(path.join(__dirname, "../database/employee.sql"), "utf8");
    
    await connection.query(sql);

    console.log("Database reset complete with employee.sql");
    process.exit(0);
  } catch (err) {
    console.error("Error running SQL:", err);
    process.exit(1);
  }
}

run();
