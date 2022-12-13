import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { users } from "./users";

import { getUserFromToken } from "../controllers/token";

export const v1 = () => {
  const v1 = Router();

  v1.use("/users", verifyToken, users());

  v1.use("/account/my-account", verifyToken, getUserFromToken);

  return v1;
};
