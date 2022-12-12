import { version } from "../../package.json";
import { Router } from "express";

// import { verifyToken } from '../middleware/auth'
import { v1 } from "./v1";
// import { auth } from "./auth";
import { SENDGRID_API_KEY } from "../config/env";
// import { Order, Transactions } from '../models'
// import { defineBranch } from '../services/order'
import { auth } from "./auth";

export const api = () => {
  const api = Router();

  api.use("/v1", v1());
  api.use("/auth", auth());

  // perhaps expose some API metadata at the root
  api.get("/", (req, res) => {
    res.json({ version });
  });

  return api;
};
