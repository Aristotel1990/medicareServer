import mysql from "mysql2/promise";
import db from "../models/index";
import { DB_HOST, DB_NAME, DB_PASS, DB_PORT, DB_USER } from "../config/env";

export const init = async () => {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASS,
    });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    connection.close();
    await db.sequelize.sync();
    // await db.sequelize.sync({ force: true });

    await db.sequelize.authenticate();
    console.log("Database has been created");
    console.log("Connection has been established successfully.");
    return db;
  } catch (err) {
    console.error("Unable to connect to the database:", err);
    throw err;
  }
};
