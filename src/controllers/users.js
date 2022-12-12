import { Account, Doctor, Token, User } from "../models/index";
import bcrypt from "bcryptjs";
import sequelize, { Op } from "sequelize";
import user from "../models/user";
import { isCompanyAdmin } from "../services/user";
import db, { Appointment, AppointmentHistory } from "../models";

// export const getUserById = async (req, res) => {
//   try {
//     const user = await User.findOne({
//       where: {
//         id: req.params.id
//       },
//       include: [
//         {
//           model: Token,
//           as: 'token'
//         }
//       ]
//     })
//     res.json(user)
//   } catch (e) {
//     req.log.error('error in get user', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }

// // get user by Id with address
// export const getUserByIdWithAddress = async (req, res) => {
//   try {
//     const user = await User.findOne({
//       where: {
//         id: req.params.id
//       },
//       include: [
//         {
//           model: Address,
//           as: 'address',
//           where: {
//             deletedAt: {
//               [Op.is]: null // IS NULL
//             }
//           }
//         }
//       ]
//     })
//     res.json(user)
//   } catch (e) {
//     req.log.error('error in get user', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }
// // delete addres of User (Soft delete)
// export const addressDelete = async (req, res) => {
//   try {
//     const address = await Address.update(
//       { deletedAt: new Date() },
//       {
//         where: { userId: req.params.id }
//       }
//     )
//     res.json(address)
//   } catch (e) {
//     req.log.error('error in deleting address of user', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }
// // create user

// export const createUser = async (req, res) => {
//   try {
//     const body = req.body
//     const user = await User.create({
//       firstName: body.firstName,
//       lastName: body.lastName,
//       email: body.email,
//       role: body.role
//     })

//     res.json(user)
//   } catch (e) {
//     req.log.error('error in create user', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }
// // get role from user
// export const getRoleByUser = async (req, res) => {
//   try {
//     const user = await User.findOne({
//       where: { id: req.params.id }
//     })
//     res.json(user.role)
//   } catch (e) {
//     req.log.error('get role of user', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }
// // change  password of user

export const changePassword = async (req, res) => {
  try {
    const userNew = await User.findOne({
      where: { id: req.user.id },
    });
    if (userNew) {
      const passwordValid = await bcrypt.compare(
        req.body.oldPassword,
        userNew.password()
      );
      if (passwordValid) {
        // updato passwordin
        const salt = await bcrypt.genSalt(10);
        const { newPassword } = req.body;
        userNew.password = await bcrypt.hash(newPassword, salt);
        await userNew.save({ fields: ["password"] });
        res.status(200).json("passwordi u updatua");
      } else {
        req.log.error({ error: "Password Incorrect" }, "unable to login");
        res.status(500).json({ error: "Old password is not the same" });
      }
    } else {
      req.log.error({ error: "User not found" }, "unable to login");
      res.status(500).json({ error: "Server error" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
// edit user atributes
export const editUser = async (req, res) => {
  const {
    firstName,
    lastName,
    nid,
    phone,
    email,
    alergies,
    reason,
    insurance,
    medications,
    problems,
  } = req.body.data;
  try {
    const us = await User.findOne({
      where: { id: req.user.id },
    });

    if (us) {
      const user = await User.update(
        {
          firstName,
          lastName,
          nid,
          phone,
          reason,
          insurance,
          alergies,
          medications,
          problems,
          email,
        },
        {
          where: { id: req.user.id },
        }
      );

      res.json({ user });
    } else {
      req.log.error({ error: "User not found" });
      res.status(500).json({ error: "User  not found !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
export const editDoctor = async (req, res) => {
  const {
    name,
    nipt,
    nid,
    phone,
    email,
    profile,
    addressText,
    postgraduate,
    undergraduate,
    hospital,
  } = req.body.data;
  try {
    const us = await Doctor.findOne({
      where: { id: req.user.doctorId },
    });

    if (us) {
      const doctor = await Doctor.update(
        {
          name,
          nipt,
          nid,
          phone,
          email,
          profile,
          addressText,
          postgraduate,
          undergraduate,
          hospital,
        },
        {
          where: { id: req.user.doctorId },
        }
      );
      res.json(doctor);
    } else {
      req.log.error({ error: "User not found" });
      res.status(500).json({ error: "User  not found !" });
    }
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
export const getTwoDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.findAll();
    if (!doctors) throw new Error("Doctors  not found");

    res.json(doctors);
  } catch (e) {
    req.log.error("error in select doctor", { error: e.message });
    return res.status(500).json({ error: "ERROR" });
  }
};

export const getMyDoctor = async (req, res) => {
  const { user } = req;

  try {
    const doctor = await Doctor.findByPk(user.doctorId);
    if (!doctor) throw new Error("Doctor does not exist");

    res.json(doctor);
  } catch (e) {
    req.log.error("error in select doctor", { error: e.message });
    return res.status(500).json({ error: "ERROR" });
  }
};
export const getUser = async (req, res) => {
  const { user } = req;

  try {
    const CurrentUser = await User.findByPk(user.id);
    if (!user) throw new Error("User does not exist");

    res.json(CurrentUser);
  } catch (e) {
    req.log.error("error in select doctor", { error: e.message });
    return res.status(500).json({ error: "ERROR" });
  }
};
// udate role of user
export const selectDoctor = async (req, res) => {
  const { user } = req;
  const { id } = req.params;
  try {
    const doctor = await Doctor.findByPk(id);
    if (!doctor) throw new Error("Doctor does not exist");

    await User.update(
      { doctorId: doctor.id, dactorName: doctor.name, updatedAt: new Date() },
      {
        where: { id: user.id },
      }
    );

    res.json(doctor);
  } catch (e) {
    req.log.error("error in select doctor", { error: e.message });
    return res.status(500).json({ error: "ERROR" });
  }
};
// create order
export const newAppointment = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id, doctorId, fullName } = req.user;
    const { day, year, month, interval } = req.body.data;
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) throw new Error("Doctor does not exist");

    const findApp = await Appointment.findOne({
      where: {
        day,
        month,
        year,
      },
    });
    if (findApp) {
      const findHistory = await AppointmentHistory.findOne({
        where: {
          appointmentId: findApp.id,
          interval,
        },
      });
      if (findHistory) throw new Error("That interval is occupied ");
      const appHistory = await AppointmentHistory.create(
        {
          appointmentId: findApp.id,
          name: fullName,
          interval,
          createdBy: id,
        },
        { transaction }
      );
      res.json(appHistory);

      transaction.commit();
    }

    const appointment = await Appointment.create(
      {
        day,
        month,
        year,
        createdBy: id,
        doctorId,
      },
      { transaction }
    );

    const appHistory = await AppointmentHistory.create(
      {
        appointmentId: appointment.id,
        name: fullName,
        interval,
        createdBy: id,
      },
      { transaction }
    );
    res.json(appHistory);

    transaction.commit();
  } catch (e) {
    transaction.rollback();
    req.log.error("error in create appointment", { error: e.message });
    return res.status(500).json({ error: e.message });
  }
};
export const getAllAppointments = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { id } = req.user;
    const findHistory = await db.sequelize.query(
      "SELECT O.*,OT.name as name, OT.interval,OT.id as nr\n" +
        "from `Appointment` O\n" +
        "        join AppointmentHistory OT on O.id = OT.appointmentId\n" +
        "where OT.deletedAt IS NULL and OT.createdBy=$userId ORDER BY O.id DESC",
      {
        bind: {
          userId: id,
        },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    res.json(findHistory);
    transaction.commit();
  } catch (e) {
    transaction.rollback();
    req.log.error("error in create appointment", { error: e.message });
    return res.status(500).json({ error: e.message });
  }
};
export const getAppointmenByDate = async (req, res) => {
  const transaction = await db.sequelize.transaction();
  try {
    const { day, year, month } = req.body.data;

    const findApp = await Appointment.findOne({
      where: {
        day,
        month,
        year,
      },
    });
    if (findApp) {
      const findHistory = await AppointmentHistory.findAll({
        where: {
          appointmentId: findApp.id,
        },
        transaction,
      });
      transaction.commit();
      res.json(findHistory);
    }
    transaction.commit();
    res.json([]);
  } catch (e) {
    transaction.rollback();
    req.log.error("error in create appointment", { error: e.message });
    return res.status(500).json({ error: e.message });
  }
};
export const deleteAppointment = async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    const id = req.params.id;
    const user = req.user;
    const acc = await AppointmentHistory.findByPk(id);
    if (!acc) throw new Error("Appointment not found");
    if (acc.createdBy !== user.id)
      throw new Error("You cannot delete this appointment");

    await AppointmentHistory.destroy(
      {
        where: {
          id: id,
        },
      },
      { transaction }
    );
    res.json(id);
  } catch (error) {
    req.log.error("error in get one courier", { error: error.message });
    return res.status(500).json({ error: error.message });
  }
};

// export const getAccount = async (req, res) => {
//   const { user } = req

//   try {
//     if (isSystemAdmin(user.role)) {
//       const account = {
//         addressText: 'Tirane Zyrat Qendrore',
//         cityId: 1,
//         countryId: 1
//       }
//       res.json(account)
//     } else if (isBranchAdmin(user.role)) {
//       const account = await Branch.findOne({
//         where: { id: user.branchId }
//       })
//       res.json(account)
//     } else if (isCompanyAdminOrCompanyBranch(user.role)) {
//       const account = await Account.findOne({
//         where: { id: user.accountId }
//       })
//       res.json(account)
//     }
//     res.status('error in user')
//   } catch (e) {
//     req.log.error('error in get account', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }
