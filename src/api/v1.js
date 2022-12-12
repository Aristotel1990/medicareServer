import { Router } from "express";
import { verifyToken } from "../middleware/auth";
import { users } from "./users";

import { getUserFromToken } from "../controllers/token";
import doctor from "./doctor";

export const v1 = () => {
  const v1 = Router();

  v1.use("/users", verifyToken, users());
  //   v1.use('/orders', verifyToken, orders())
  //   v1.use('/address', verifyToken, address())
  //   v1.use('/history', verifyToken, ordersHistory())
  v1.use("/account/my-account", verifyToken, getUserFromToken);
  // v1.use("/doctor", verifyToken, doctor());
  //   v1.use('/vehicles', verifyToken, vehicles())
  //   v1.use('/couriers', verifyToken, couriers())
  //   v1.use('/branches', verifyToken, branches())
  //   v1.use('/clients', verifyToken, clients())
  //   v1.use('/settings', verifyToken, settings())

  return v1;
};
