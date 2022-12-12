import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { Token, User, Doctor } from "../models";
import { createTokenFromPayload } from "../services/auth";
import { validateRequest } from "../api";

// login
export const login = async (req, res) => {
  const validationError = validateRequest(req);
  if (validationError) {
    req.log.error({ error: validationError }, "validationError in login local");
    return res.status(500).json({ error: "Something went wrong!" });
  }
  const user = await User.findOne({ where: { email: req.body.email } });
  if (user) {
    const passwordValid = await bcrypt.compare(
      req.body.password,
      user.password()
    );
    if (passwordValid) {
      const token = createTokenFromPayload(user.toJSON());
      Token.update(
        { token: token.accessToken },
        { where: { usersId: user.id } }
      )
        .then((token) => {
          console.log("updated");
        })
        .catch((err) => console.log("error: " + err));
      const usr = user.toJSON();

      res.status(200).json({
        user: usr,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      });
    } else {
      req.log.error({ error: "Password Incorrect" }, "unable to login");
      res.status(500).json({ error: "Password Incorrect!" });
    }
  } else {
    req.log.error({ error: "User not found" }, "unable to login");
    res.status(500).json({ error: "User not found!" });
  }
};
// register
export const register = async (req, res) => {
  // res.status(201).json(req.body);
  // add new user and return 201
  const validationError = validateRequest(req);
  if (validationError) {
    req.log.error(
      { error: validationError },
      "validationError in register local"
    );
    return res.status(500).json({ error: "Something went wrong!" });
  }
  const user = await User.findOne({
    where: {
      email: req.body.email,
      role: {
        [Op.in]: ["companyAdmin"],
      },
    },
  });
  if (user) {
    req.log.error({ user }, "email exist");
    return res.status(500).json({ error: "Something went wrong!" });
  }
  const salt = await bcrypt.genSalt(10);
  const usr = {
    email: req.body.email,
    password: await bcrypt.hash(req.body.password, salt),
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    role: req.body.role,
    salt,
  };
  const createdUser = await User.create(usr);
  const jwt = createTokenFromPayload(createdUser.toJSON());
  const token = await Token.create({
    token: jwt.accessToken,
    refreshToken: jwt.refreshToken,
    usersId: createdUser.id,
  });

  res.status(200).json({ user: createdUser, token });
};
// login internal
export const loginInternal = async (req, res) => {
  const validationError = validateRequest(req);
  if (validationError) {
    req.log.error({ error: validationError }, "validationError in login local");
    return res.status(500).json({ error: "Something went wrong!" });
  }
  const user = await User.findOne({
    where: {
      email: req.body.email,
      role: {
        [Op.in]: ["superAdmin", "admin", "branchManager", "courier", "finance"],
      },
    },
  });
  if (user) {
    const passwordValid = await bcrypt.compare(
      req.body.password,
      user.password()
    );
    if (passwordValid) {
      const token = createTokenFromPayload(user.toJSON());
      Token.update(
        { token: token.accessToken },
        { where: { usersId: user.id } }
      )
        .then((token) => {
          console.log(token);
        })
        .catch((err) => console.log("error: " + err));
      res.status(200).json({
        user,
        accessToken: token.accessToken,
        refreshToken: token.refreshToken,
      });
    } else {
      req.log.error({ error: "Password Incorrect" }, "unable to login");
      res.status(500).json({ error: "Password Incorrect!" });
    }
  } else {
    req.log.error({ error: "User not found" }, "unable to login");
    res.status(500).json({ error: "User not found!" });
  }
};
