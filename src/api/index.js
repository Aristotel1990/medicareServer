// eslint-disable-next-line no-unused-vars
import { validationResult } from "express-validator";

import { api } from "./api";

export const validateRequest = function (req) {
  const error = validationResult(req);
  if (!error.isEmpty()) {
    return error.array()[0].msg;
  }
};
export { api };
