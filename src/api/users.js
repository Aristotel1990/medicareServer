import { Router } from "express";
import {
  changePassword,
  editUser,
  selectDoctor,
  newAppointment,
  getAppointmenByDate,
  getTwoDoctors,
  getMyDoctor,
  getUser,
  editDoctor,
  getAllAppointments,
  deleteAppointment,
} from "../controllers/users";
// import { verifyToken } from '../middleware/auth'

export const users = () => {
  const users = Router();

  users.post("/appointment", getAppointmenByDate);
  users.get("/mydoctor", getMyDoctor);
  users.get("/", getUser);

  users.get("/doctor/:id(\\d+)", selectDoctor);
  users.post("/newappointment", newAppointment);
  users.get("/doctors", getTwoDoctors);
  users.post("/edit", editUser);
  users.post("/doctor", editDoctor);
  users.get("/list", getAllAppointments);
  users.post("/delete", deleteAppointment);

  users.post("/reset", changePassword);

  return users;
};
