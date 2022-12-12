import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env";
import { User } from "../models";

export const verifyToken = async (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers.authorization;

  if (!token || token.split(" ")[0] !== "Bearer") {
    return res
      .status(403)
      .json({ error: "A token is required for authentication" });
  }
  try {
    const jwtToken = token.split(" ")[1];
    // todo : find token in db and get user, compare with user in token id = id
    const payload = jwt.verify(jwtToken, JWT_SECRET);
    const user = await User.findByPk(payload.id);
    const usr = user.toJSON();
    // if (usr.accountId) {
    //   const company = await Account.findByPk(usr.accountId)
    //   usr.countryId = company.countryId
    // }
    req.user = usr;
  } catch (err) {
    return res.status(401).json({ error: "Invalid Token" });
  }
  return next();
};
