import { Router } from "express";
import { check } from "express-validator";

import { login, loginInternal, register } from "../controllers/auth";

export const LoginValidation = [
  check("email", "BAD_REQUEST").exists().not().isEmpty().isEmail().trim(),
  check("password", "BAD_REQUEST").exists().not().isEmpty().isString().trim(),
];
export const RegisterValidation = [
  check("email", "BAD_REQUEST").exists().not().isEmpty().isEmail().trim(),
  check("password", "BAD_REQUEST").exists().not().isEmpty().isString().trim(),
];

export const auth = () => {
  const auth = Router();

  // login
  auth.post("/login", LoginValidation, login);
  // register
  auth.post("/register", RegisterValidation, register);
  // login internal
  auth.post("/login/internal", LoginValidation, loginInternal);
  return auth;
};
