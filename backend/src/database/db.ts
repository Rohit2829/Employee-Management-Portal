import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const rawHost = process.env.DB_HOST || 'localhost';
const hostParts = rawHost.split('\\');
const hostName = hostParts[0];

// Because SQL Browser might be disabled, we use the specific port SQL Express is listening on
const sqlPort = Number(process.env.DB_PORT) || 1433;

export const sequelize = new Sequelize(
  process.env.DB_DATABASE!,
  process.env.DB_USERNAME!,
  process.env.DB_PASSWORD!,
  {
    host: hostName,
    port: sqlPort,
    dialect: "mssql",
    dialectOptions: {
      options: {
        encrypt: true,
        trustServerCertificate: true
      }
    },
    logging: false,
  }
);

sequelize
  .authenticate()
  .then(() => console.log("MSSQL Database connected seamlessly..."))
  .catch((err: Error) => console.log("Database connection error: " + err));
