import {
  DB_HOST,
  DB_NAME,
  DB_PASS,
  DB_PORT,
  DB_USER,
  DB_DIALECT,
} from "../config/env";
import { Sequelize, DataTypes } from "sequelize";

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DB_DIALECT,
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

const User = require("../models/user")(sequelize, DataTypes);

const Appointment = require("./appointment")(sequelize, DataTypes);
const Token = require("../models/token")(sequelize, DataTypes);
const AppointmentHistory = require("../models//appointmentHistory")(
  sequelize,
  DataTypes
);

const Doctor = require("./doctor")(sequelize, DataTypes);

User.associate({
  Token,
  Appointment,
  Doctor,
});
Token.associate({ User });
Appointment.associate({
  AppointmentHistory,
  User,
});

Doctor.associate({
  User,
});

export { User, Token, Appointment, Doctor, AppointmentHistory };
export default db;
