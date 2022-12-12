import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import {
  addressDelete,
  changePassword,
  editUser,
  getRoleByUser,
  getUserById,
  getUserByIdWithAddress,
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
import { permit } from "../middleware/pemrissions";

export const users = () => {
  const users = Router();

  // users.get("/add", addNewUser);

  // // get user by Id with address
  // users.get('/address/:id(\\d+)', getUserByIdWithAddress)
  // // delete addres of User (Soft delete)
  // users.post('/address/delete/:id(\\d+)', addressDelete)
  // // udate role of user
  users.post("/appointment", getAppointmenByDate);
  users.get("/mydoctor", getMyDoctor);
  users.get("/", getUser);

  users.get("/doctor/:id(\\d+)", selectDoctor);
  users.post("/newappointment", newAppointment);
  users.get("/doctors", getTwoDoctors);
  users.post("/edit", editUser);
  users.post("/doctor", editDoctor);
  users.get("/list", getAllAppointments);
  // users.delete("/delete/:id(\\d+)", deleteAppointment);

  // // get role from user
  // users.get('/role/:id(\\d+)', getRoleByUser)
  // // change  password of user
  users.post("/reset", changePassword);
  // // edit user atributes
  // users.post('/modifiko', editUser)
  // users.get('/account', getAccount)

  return users;
};
