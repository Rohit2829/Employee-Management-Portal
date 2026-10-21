import app from "./app";
import dotenv from "dotenv";
import { sequelize } from "./database/db";

dotenv.config();

const PORT = process.env.PORT || 3005;

// Helper to safely ensure database columns exist, avoiding dialect-specific alter table sync limitations.
async function ensureColumnsExist() {
  try {
    const [results]: any[] = await sequelize.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'health_records' AND COLUMN_NAME = 'status'`
    );
    if (results.length === 0) {
      console.log("Adding missing 'status' column to 'health_records' table...");
      await sequelize.query(
        `ALTER TABLE health_records ADD status VARCHAR(20) NOT NULL DEFAULT 'Active'`
      );
      console.log("Column 'status' added successfully.");
    }
  } catch (err) {
    console.error("Error checking or adding status column:", err);
  }
}

import { seedNewFeaturesData } from "./utils/seeder";

// Automatically sync the database to create tables if they don't exist
sequelize.sync().then(async () => {
  console.log("Database synchronized successfully.");
  await ensureColumnsExist();
  await seedNewFeaturesData();

  // Set up periodic rotation scheduler run (every hour)
  setInterval(async () => {
    try {
      const { runRotationSchedulerSimulation } = require("./services/rotationScheduler");
      await runRotationSchedulerSimulation();
    } catch (err) {
      console.error("Error running scheduler interval:", err);
    }
  }, 3600000);

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch((error) => {
  console.error("Error synchronizing database:", error);
});
