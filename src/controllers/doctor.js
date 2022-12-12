// import db, {
//   Account,
//   AccountFees,
//   Branch,
//   Cities,
//   Countries,
//   PackageTypes,
//   Transactions,
//   TransactionOrders,
//   TransactionsHistory,
//   Order,
//   User,
//   OrderFees,
//   OrderHistory,
//   CommentOrder,
//   Arka,
//   Zeri,
//   OrderRoutes,
// } from "../models/index";
// import { getPagination, getPagingData } from "../lib/util";
// import sequelize, { Op, QueryTypes } from "sequelize";

// import bcrypt from "bcryptjs";
// import { generate } from "../lib/password";
// import { sentRegistrationsEmail } from "../services/emails";
// import {
//   isFinanceOrCompanyAdminOrBranchManager,
//   isSystemAdmin,
//   isBranchAdminOrFinance,
//   isBranchOrAAdminOrCourier,
//   isCompanyAdmin,
//   isCompanyAdminOrCompanyBranch,
//   isBranchAdmin,
// } from "../services/user";
// import {
//   isInTrasit,
//   isCompleted,
//   isRejected,
//   isLikuiduar,
//   isKthyer,
// } from "../services/status";

// export const createAccount = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const {
//       name,
//       nipt,
//       nid,
//       firstName,
//       lastName,
//       address,
//       email,
//       phone,
//       city,
//       country,
//       type,
//       pickUp,
//       active,
//       inCity,
//       cost,
//       finalCost,
//       taxKs,
//       taxMq,
//       taxMn,
//     } = req.body;
//     const salt = await bcrypt.genSalt(10);
//     const password = generate({
//       length: 14,
//       numbers: true,
//     });
//     const usr = {
//       email,
//       password: await bcrypt.hash(password, salt),
//       firstName,
//       lastName,
//       role: "companyAdmin",
//       nid,
//       salt,
//     };
//     const account = await Account.create(
//       {
//         name,
//         nipt,
//         owner: firstName + " " + lastName,
//         ownerNID: nid,
//         email,
//         phone,
//         cityId: city || 1,
//         addressText: address,
//         countryId: country,
//         type: type || "primary",
//         pickUp: pickUp || false,
//         active: active || true,
//         createdBy: req.user.id,
//         createdAt: new Date(),
//       },
//       { transaction }
//     );
//     await AccountFees.create(
//       {
//         accountId: account.id,
//         perKg: 50,
//         maxKg: 5,
//         inCity: inCity || 200,
//         cost: cost || 300,
//         discount: 0,
//         finalCost: finalCost || 300,
//         taxKs: taxKs || 7,
//         taxMq: taxMq || 7,
//         taxMn: taxMn || 7,
//         createdAt: new Date(),
//       },
//       { transaction }
//     );
//     usr.accountId = account.id;
//     const user = await User.create(usr, { transaction });
//     if (user) {
//       await sentRegistrationsEmail(email, email, password);
//     }
//     transaction.commit();
//     res.json(account);
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in create account", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getBusiness = async (req, res) => {
//   try {
//     const { page, size, name } = req.query;
//     const { user } = req;
//     const { limit, offset } = getPagination(page, size);
//     const condition = name ? { name: { [Op.like]: `%${name}%` } } : null;
//     if (user.role === "branchManager") {
//       const branch = await Branch.findByPk(user.branchId);

//       const accounts = await Account.findAndCountAll({
//         where: { ...condition, cityId: branch.cityId },
//         include: [
//           { model: Countries, as: "country", attributes: ["name"] },
//           { model: Cities, as: "city", attributes: ["name"] },
//         ],
//         attributes: {
//           include: [
//             [sequelize.col("country.name"), "countryName"],
//             [sequelize.col("city.name"), "cityName"],
//           ],
//           exclude: ["updatedAt", "deletedAt"],
//         },
//         offset,
//         limit,
//         order: [["createdAt", "DESC"]],
//       });
//       const response = getPagingData(accounts, page, limit);
//       // await new Promise(resolve => setTimeout(resolve, 3000))
//       res.json(response);
//     }
//     const accounts = await Account.findAndCountAll({
//       where: condition,
//       include: [
//         { model: Countries, as: "country", attributes: ["name"] },
//         { model: Cities, as: "city", attributes: ["name"] },
//       ],
//       attributes: {
//         include: [
//           [sequelize.col("country.name"), "countryName"],
//           [sequelize.col("city.name"), "cityName"],
//         ],
//         exclude: ["updatedAt", "deletedAt"],
//       },
//       offset,
//       limit,
//       order: [["createdAt", "DESC"]],
//     });
//     const response = getPagingData(accounts, page, limit);
//     // await new Promise(resolve => setTimeout(resolve, 3000))
//     res.json(response);
//   } catch (e) {
//     req.log.error("error in get business", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// // export const getBranchById = async (req, res) => {
// //   try {
// //     const accounts = await Account.findAll({
// //       where: { condition },
// //       include: [
// //         { model: Countries, as: "country", attributes: ["name"] },
// //         { model: Cities, as: "city", attributes: ["name"] },
// //       ],
// //       attributes: {
// //         include: [
// //           [sequelize.col("country.name"), "countryName"],
// //           [sequelize.col("city.name"), "cityName"],
// //         ],
// //         exclude: ["updatedAt", "deletedAt"],
// //       },
// //       offset,
// //       limit,
// //       order: [["createdAt", "DESC"]],
// //     });
// //     const response = getPagingData(accounts, page, limit);
// //     // await new Promise(resolve => setTimeout(resolve, 3000))
// //     res.json(response);
// //   } catch (e) {
// //     req.log.error("error in get business", { error: e.message });
// //     return res.status(500).json({ error: e.message });
// //   }
// // };
// export const getOneBusiness = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const account = await db.sequelize.query(
//       "SELECT A.*, AF.inCity, AF.cost, AF.finalCost, AF.taxKs, AF.taxMq, AF.taxMn\n" +
//         " from `Account` A\n" +
//         "           join AccountFees AF\n" +
//         "               on AF.id = (SELECT id FROM AccountFees WHERE AccountFees.deletedAt IS NULL and AccountFees.accountId = A.id LIMIT 1)\n" +
//         "  where A.id = $accountId",
//       {
//         bind: {
//           accountId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const users = await db.sequelize.query(
//       "SELECT A.*\n" + " from `User` A\n" + "  where A.accountId = $idAccount",
//       {
//         bind: {
//           idAccount: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json({ account: account[0], users });
//   } catch (error) {
//     req.log.error("error in get one business", { error: error.message });
//     return res.status(500).json({ error: error.message });
//   }
// };
// export const changePassAccoun = async (req, res) => {
//   const { id, email, password } = req.body;
//   const { user } = req;
//   try {
//     const userNew = await User.findByPk(id);
//     if (!isSystemAdmin(user.role)) throw new Error("Not Authorized");
//     if (userNew) {
//       const salt = await bcrypt.genSalt(10);
//       userNew.password = await bcrypt.hash(password, salt);
//       userNew.email = email;
//       await userNew.save({ fields: ["password", "email"] });

//       res.status(200).json("passwordi u updatua");
//     } else {
//       req.log.error({ error: "User not found" }, "unable to login");
//       res.status(500).json({ error: "Server error" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "Server error" });
//   }
// };
// export const getBussinesById = async (req, res) => {
//   try {
//     const id = req.params.id;
//     const account = await Account.findOne({
//       where: { id },
//       include: [
//         {
//           model: AccountFees,
//           as: "fees",
//           attributes: [
//             "inCity",
//             "taxKs",
//             "taxMn",
//             "taxMq",
//             "finalCost",
//             "cost",
//           ],
//         },
//       ],
//       attributes: {
//         include: ["id", "name", "cityId", "countryId"],
//         exclude: [
//           "nipt",
//           "owner",
//           "ownerNID",
//           "email",
//           "phone",
//           "addressText",
//           "type",
//           "pickUp",
//           "active",
//           "accountId",
//           "createdBy",
//           "createdAt",
//           "updatedAt",
//           "deletedAt",
//         ],
//       },
//     });

//     res.json(account);
//   } catch (error) {
//     req.log.error("error in get one business", { error: error.message });
//     return res.status(500).json({ error: error.message });
//   }
// };

// export const editBusiness = async (req, res) => {
//   try {
//     const {
//       id,
//       name,
//       nipt,
//       nid,
//       firstName,
//       lastName,
//       address,
//       email,
//       phone,
//       city,
//       country,
//       type,
//       pickUp,
//       active,
//       zeroTrans,
//       inCity,
//       finalCost,
//       taxKs,
//       taxMn,
//       taxMq,
//       cost,
//     } = req.body;
//     const account = await Account.update(
//       {
//         name,
//         nipt,
//         owner: firstName + " " + lastName,
//         ownerNID: nid,
//         email,
//         phone,
//         cityId: city || 1,
//         addressText: address,
//         countryId: country,
//         type: type || "primary",
//         pickUp: pickUp || false,
//         zeroTrans: zeroTrans || null,

//         active,
//         updatedAt: new Date(),
//       },
//       {
//         where: {
//           id,
//         },
//       }
//     );
//     await AccountFees.update(
//       {
//         inCity,
//         finalCost,
//         cost,
//         taxKs,
//         taxMq,
//         taxMn,
//         updatedAt: new Date(),
//       },
//       {
//         where: {
//           accountId: id,
//         },
//       }
//     );
//     res.json(account);
//   } catch (error) {
//     req.log.error("error in edit business", { error: error.message });
//     return res.status(500).json({ error: error.message });
//   }
// };

// export const getTransportFees = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user.accountId) throw new Error("Not Authorized");
//     const fees = await AccountFees.findOne({
//       where: {
//         accountId: user.accountId,
//       },
//       attributes: {
//         exclude: ["createdAt", "updatedAt", "deletedAt"],
//       },
//     });
//     const generalFees = await PackageTypes.findAll();
//     res.json({ ...fees.toJSON(), generalFees });
//   } catch (error) {
//     req.log.error("error in getTransportFees", { error: error.message });
//     return res.status(500).json({ error: error.message });
//   }
// };
// export const getUserCompany = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user.accountId) throw new Error("Not Authorized");
//     const account = await Account.findByPk(user.accountId, {
//       attributes: {
//         exclude: ["createdAt", "updatedAt", "deletedAt"],
//       },
//     });
//     res.json(account);
//   } catch (error) {
//     req.log.error("error in getUserCompany", { error: error.message });
//     return res.status(500).json({ error: error.message });
//   }
// };
// export const deleteAccount = async (req, res) => {
//   const transaction = await db.sequelize.transaction();

//   try {
//     const id = req.params.id;
//     const acc = await Account.findByPk(id);
//     if (!acc) throw new Error("Not Authorized");
//     await Account.destroy(
//       {
//         where: {
//           id,
//         },
//       },
//       { transaction }
//     );
//     await AccountFees.destroy(
//       {
//         where: {
//           accountId: id,
//         },
//       },
//       { transaction }
//     );
//     await User.destroy(
//       {
//         where: {
//           accountId: id,
//         },
//       },
//       { transaction }
//     );
//     res.json(id);
//   } catch (error) {
//     req.log.error("error in get one business", { error: error.message });
//     return res.status(500).json({ error: error.message });
//   }
// };
// export const getAccountByCityId = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const accounts = await db.sequelize.query(
//       "Select A.*\n" +
//         "from Account A\n" +
//         "         join AccountFees AF on A.id = AF.accountId\n" +
//         "where A.cityId = $city",
//       {
//         bind: {
//           city: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(accounts);
//   } catch (e) {
//     req.log.error("error in getBranchAccounts", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getTransactionById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     await Account.findByPk(id);
//     const accounts = await db.sequelize.query(
//       "Select T.*\n" +
//         "from Transactions T\n" +
//         "where T.deletedAt IS NULL and T.accountId = $accountId and T.status IN ('ReqLikuid', 'OnLikuid', 'GetLikuid', 'Likuiduar')  order by id DESC",
//       {
//         bind: {
//           accountId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(accounts);
//   } catch (e) {
//     req.log.error("error in getBranchAccounts", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getTransOrdersById = async (req, res) => {
//   const transaction = await db.sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const user = req.user;
//     if (!isFinanceOrCompanyAdminOrBranchManager(user.role)) {
//       throw new Error("Unauthorized");
//     }
//     const trans = await Transactions.findByPk(id);
//     if (!trans) throw new Error("Error in ");
//     const transOrders = await TransactionOrders.findAll(
//       {
//         where: { transactionId: id },
//       },
//       {
//         transaction,
//       }
//     );
//     if (transOrders.length <= 0) throw new Error("NotFound");

//     const ids = await transOrders.map((item) => item.orderId);
//     const order = await OrderFees.findAll(
//       {
//         where: {
//           orderId: {
//             [Op.in]: ids,
//           },
//         },
//         include: [{ model: Order, attributes: ["code"] }],
//         attributes: {
//           include: [
//             [sequelize.col("code"), "code"],
//             [sequelize.col("name"), "name"],
//             [sequelize.col("content"), "content"],
//             [sequelize.col("originCountry"), "originCountry"],
//           ],
//           exclude: ["updatedAt", "deletedAt"],
//         },

//         order: [["createdAt", "DESC"]],
//       },

//       {
//         transaction,
//       }
//     );
//     const all = await order.filter((item) => item.currency === "ALL");
//     const euro = await order.filter((item) => item.currency === "EUR");
//     const vektor = { all, euro };

//     const account = await Account.findByPk(trans.accountId);

//     res.json({ trans, vektor, account });
//     await transaction.commit();
//   } catch (e) {
//     await transaction.rollback();

//     req.log.error("error in getTrans", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const stepBackOrderHistory = async (req, res) => {
//   const transaction = await db.sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const user = req.user;
//     if (!isSystemAdmin(user.role)) {
//       throw new Error("Unauthorized");
//     }

//     const orderH = await OrderHistory.findByPk(id);
//     if (!orderH) throw new Error("Error in  order History");
//     await OrderHistory.destroy(
//       {
//         where: {
//           id,
//         },
//       },
//       { transaction }
//     );

//     res.json("done");
//     await transaction.commit();
//   } catch (e) {
//     await transaction.rollback();

//     req.log.error("error in getTrans", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const stepBackOrderHisSave = async (req, res) => {
//   const transaction = await db.sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const user = req.user;
//     if (!isSystemAdmin(user.role)) {
//       throw new Error("Unauthorized");
//     }

//     const orderH = await OrderHistory.findAll({
//       limit: 1,
//       where: {
//         orderId: id,
//       },
//       order: [["createdAt", "DESC"]],
//     });

//     if (!orderH) throw new Error("Error in  order History");

//     if (isInTrasit(orderH[0].status)) {
//       await Order.update(
//         {
//           status: "In Transit",
//           updatedAt: new Date(),
//         },
//         {
//           where: {
//             id,
//           },
//         },
//         { transaction }
//       );
//     } else if (isCompleted(orderH[0].status)) {
//       await Order.update(
//         {
//           status: "Completed",
//           updatedAt: new Date(),
//         },
//         {
//           where: {
//             id,
//           },
//         },
//         { transaction }
//       );
//     } else if (isRejected(orderH[0].status)) {
//       await Order.update(
//         {
//           status: "Rejected",
//           updatedAt: new Date(),
//         },
//         {
//           where: {
//             id,
//           },
//         },
//         { transaction }
//       );
//     } else if (isLikuiduar(orderH[0].status)) {
//       await Order.update(
//         {
//           status: "Likuiduar",
//           updatedAt: new Date(),
//         },
//         {
//           where: {
//             id,
//           },
//         },
//         { transaction }
//       );
//     } else if (isKthyer(orderH[0].status)) {
//       await Order.update(
//         {
//           status: "Kthyer",
//           updatedAt: new Date(),
//         },
//         {
//           where: {
//             id,
//           },
//         },
//         { transaction }
//       );
//     } else {
//       throw new Error("Error in  stus of  History", orderH.status);
//     }
//     res.json("done");
//     await transaction.commit();
//   } catch (e) {
//     await transaction.rollback();

//     req.log.error("error in getTrans", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// // superAdmin delete transactions
// export const deleteTransactions = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { id } = req.params;
//     if (!id) throw new Error("Nothing to delete");
//     const trans = await Transactions.findByPk(id);
//     if (!trans) throw new Error("Error in ");
//     const account = await Account.findByPk(trans.accountId);

//     if (!account) throw new Error("Account not found");
//     if (trans.status !== "Likuiduar") {
//       const transHistory = await TransactionsHistory.findAll({
//         where: { transactionsId: id },
//         transaction,
//       });
//       if (transHistory.length <= 0) throw new Error("NotFound");

//       await TransactionsHistory.destroy({
//         where: {
//           transactionsId: id,
//         },
//         transaction,
//       });

//       const transOrders = await TransactionOrders.findAll({
//         where: { transactionId: id },
//         transaction,
//       });
//       if (transOrders.length <= 0) {
//         await TransactionOrders.destroy({
//           where: {
//             id,
//           },
//           transaction,
//         });
//       }
//       const ids = await transOrders.map((item) => item.orderId);

//       await TransactionOrders.destroy({
//         where: {
//           transactionId: id,
//         },
//         transaction,
//       });
//       await Transactions.destroy({
//         where: {
//           id,
//         },
//         transaction,
//       });

//       const idsRejec = await db.sequelize.query(
//         "SELECT  O.id\n" +
//           "from `Order` O\n" +
//           "  where O.deletedAt IS NULL and O.status ='Rejected' and O.id IN (:ids)",
//         {
//           replacements: { ids: ids },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );

//       const idsComp = await db.sequelize.query(
//         "SELECT  O.id\n" +
//           "from `Order` O\n" +
//           "  where O.deletedAt IS NULL and O.status !='Rejected' and O.id IN (:ids)",
//         {
//           replacements: { ids: ids },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const rejectedId = await idsRejec.map((item) => item.id);
//       const completedId = await idsComp.map((item) => item.id);

//       const mainArka = await db.sequelize.query(
//         "Select A.*\n" +
//           "from Arka A\n" +
//           "where A.deletedAt IS NULL ORDER BY id DESC LIMIT 1    ",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         },
//         {
//           transaction,
//         }
//       );
//       const all = !mainArka ? 0 : mainArka[0].totalALL;
//       const eur = !mainArka ? 0 : mainArka[0].totalEUR;
//       const client = await Zeri.create(
//         {
//           valueALL: trans.likuidValue || 0,
//           valueEUR: trans.likuidValueEUR || 0,
//           arkaALL: all + trans.likuidValue,
//           arkaEUR: eur + trans.likuidValueEUR,
//           tipi: "biznes",
//           status: "Hyrje",
//           comment: `Fshirje fature likuidimi me nr.${trans.id} per kompanine: ${account.name}  `,
//           createdBy: user.id,
//           createdAt: new Date(),
//         },
//         {
//           transaction,
//         }
//       );
//       await Arka.create(
//         {
//           zeriId: client.id,
//           totalALL: all + trans.likuidValue,
//           totalEUR: eur + trans.likuidValueEUR,
//           hyrjeALL: trans.likuidValue,
//           hyrjeEUR: trans.likuidValueEUR,
//           createdBy: user.id,
//           createdAt: new Date(),
//         },
//         {
//           transaction,
//         }
//       );
//       await Order.update(
//         { status: "Completed", updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: completedId,
//             },
//           },
//           transaction,
//         }
//       );
//       await OrderRoutes.update(
//         { rejected: "ForLikuid", updatedAt: new Date() },
//         {
//           where: {
//             orderId: {
//               [Op.in]: rejectedId,
//             },
//           },
//           transaction,
//         }
//       );
//       if (Array.isArray(completedId)) {
//         const vektor = await OrderHistory.findAll(
//           {
//             where: {
//               orderId: {
//                 [Op.in]: completedId,
//               },
//               status: "Likuiduar",
//             },

//             exclude: ["deletedAt"],
//           },

//           {
//             transaction,
//           }
//         );
//         const curre = vektor.map((src, index) => {
//           return src.id;
//         });
//         await OrderHistory.destroy({
//           where: {
//             id: {
//               [Op.in]: curre,
//             },
//             status: "Likuiduar",
//           },
//           transaction,
//         });
//       }

//       const vektor = await OrderHistory.findOne(
//         {
//           where: {
//             orderId: completedId[0],
//           },

//           exclude: ["deletedAt"],
//         },

//         {
//           transaction,
//         }
//       );

//       await OrderHistory.destroy({
//         where: {
//           id: vektor.id,
//         },
//         transaction,
//       });
//       transaction.commit();
//       res.json(ids);
//     }
//     const transHistory = await TransactionsHistory.findAll({
//       where: { transactionsId: id },
//       transaction,
//     });
//     if (transHistory.length <= 0) throw new Error("NotFound");

//     await TransactionsHistory.destroy({
//       where: {
//         transactionsId: id,
//       },
//       transaction,
//     });

//     const transOrders = await TransactionOrders.findAll({
//       where: { transactionId: id },
//       transaction,
//     });
//     if (transOrders.length <= 0) {
//       await TransactionOrders.destroy({
//         where: {
//           id,
//         },
//         transaction,
//       });
//     }
//     const ids = await transOrders.map((item) => item.orderId);

//     await TransactionOrders.destroy({
//       where: {
//         transactionId: id,
//       },
//       transaction,
//     });
//     const idsRejec = await db.sequelize.query(
//       "SELECT  O.id\n" +
//         "from `Order` O\n" +
//         "  where O.deletedAt IS NULL and O.status ='Rejected' and O.id IN (:ids)",
//       {
//         replacements: { ids: ids },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const idsComp = await db.sequelize.query(
//       "SELECT  O.id\n" +
//         "from `Order` O\n" +
//         "  where O.deletedAt IS NULL and O.status !='Rejected' and O.id IN (:ids)",
//       {
//         replacements: { ids: ids },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const rejectedId = await idsRejec.map((item) => item.id);
//     const completedId = await idsComp.map((item) => item.id);

//     const mainArka = await db.sequelize.query(
//       "Select A.*\n" +
//         "from Arka A\n" +
//         "where A.deletedAt IS NULL ORDER BY id DESC LIMIT 1    ",
//       {
//         type: sequelize.QueryTypes.SELECT,
//       },
//       {
//         transaction,
//       }
//     );
//     const all = !mainArka ? 0 : mainArka[0].totalALL;
//     const eur = !mainArka ? 0 : mainArka[0].totalEUR;
//     const client = await Zeri.create(
//       {
//         valueALL: trans.likuidValue || 0,
//         valueEUR: trans.likuidValueEUR || 0,
//         arkaALL: all + trans.likuidValue,
//         arkaEUR: eur + trans.likuidValueEUR,
//         tipi: "biznes",
//         status: "Hyrje",
//         comment: `Fshirje fature likuidimi me nr.${trans.id} per kompanine: ${account.name}  `,
//         createdBy: user.id,
//         createdAt: new Date(),
//       },
//       {
//         transaction,
//       }
//     );
//     await Arka.create(
//       {
//         zeriId: client.id,
//         totalALL: all + trans.likuidValue,
//         totalEUR: eur + trans.likuidValueEUR,
//         hyrjeALL: trans.likuidValue,
//         hyrjeEUR: trans.likuidValueEUR,
//         createdBy: user.id,
//         createdAt: new Date(),
//       },
//       {
//         transaction,
//       }
//     );
//     await Transactions.destroy({
//       where: {
//         id,
//       },
//       transaction,
//     });

//     await Order.update(
//       { status: "Completed", updatedAt: new Date() },
//       {
//         where: {
//           id: {
//             [Op.in]: completedId,
//           },
//         },
//         transaction,
//       }
//     );
//     await OrderRoutes.update(
//       { rejected: "ForLikuid", updatedAt: new Date() },
//       {
//         where: {
//           orderId: {
//             [Op.in]: rejectedId,
//           },
//         },
//         transaction,
//       }
//     );
//     if (Array.isArray(completedId)) {
//       const vektor = await OrderHistory.findAll(
//         {
//           where: {
//             orderId: {
//               [Op.in]: completedId,
//             },
//             status: "Likuiduar",
//           },

//           exclude: ["deletedAt"],
//         },

//         {
//           transaction,
//         }
//       );
//       const curre = vektor.map((src, index) => {
//         return src.id;
//       });
//       await OrderHistory.destroy({
//         where: {
//           id: {
//             [Op.in]: curre,
//           },
//           status: "Likuiduar",
//         },
//         transaction,
//       });
//     }

//     const vektor = await OrderHistory.findOne(
//       {
//         where: {
//           orderId: completedId[0],
//         },

//         exclude: ["deletedAt"],
//       },

//       {
//         transaction,
//       }
//     );

//     await OrderHistory.destroy({
//       where: {
//         id: vektor.id,
//       },
//       transaction,
//     });

//     transaction.commit();
//     res.json(ids);
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in delete order", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getAccountTotalLikuid = async (req, res) => {
//   try {
//     const orderTotal = await db.sequelize.query(
//       "        SELECT OS.currency as currency, SUM(OS.senderCollect) as total\n" +
//         "           from `Order` O\n" +
//         "                       join OrderFees OS on O.id = OS.orderId\n" +
//         "  where O.deletedAt IS NULL and (O.status = 'Completed' or O.status = 'OnLikuid')   group by OS.currency",

//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const totalAll = orderTotal.find(({ currency }) => currency === "ALL");
//     const totalEuro = orderTotal.find(({ currency }) => currency === "EUR");
//     const total = {
//       totalAll: !totalAll ? 0 : totalAll.total,
//       totalEuro: !totalEuro ? 0 : totalEuro.total,
//     };
//     res.json(total);
//   } catch (e) {
//     req.log.error("error in getCompletedBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getOrderCommentbyId = async (req, res) => {
//   const transaction = await db.sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const user = req.user;
//     if (!isFinanceOrCompanyAdminOrBranchManager(user.role)) {
//       throw new Error("Unauthorized");
//     }
//     const trans = await Order.findByPk(id);
//     if (!trans) throw new Error("No order found");
//     if (isCompanyAdminOrCompanyBranch(user.role)) {
//       const transOrders = await CommentOrder.findAll(
//         {
//           where: { orderId: id },
//           order: [["createdAt", "DESC"]],
//         },

//         {
//           transaction,
//         }
//       );
//       if (transOrders.length <= 0) throw new Error("NotFound");

//       res.json(transOrders);
//       await transaction.commit();
//     }

//     const transOrders = await CommentOrder.findAll(
//       {
//         where: { orderId: id },
//         order: [["createdAt", "DESC"]],
//       },

//       {
//         transaction,
//       }
//     );
//     await CommentOrder.update(
//       { read: true, updatedAt: new Date() },
//       {
//         where: {
//           orderId: id,
//         },
//         transaction,
//       }
//     );
//     if (transOrders.length <= 0) throw new Error("NotFound");

//     res.json(transOrders);
//     await transaction.commit();
//   } catch (e) {
//     await transaction.rollback();

//     req.log.error("error in getOrderCommentbyId", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getOrderComments = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const order = await Order.findByPk(id);
//     if (!id || !order) throw new Error("No order found");
//     const comments = await CommentOrder.findAll({
//       where: { orderId: id },
//       order: [["createdAt", "DESC"]],
//     });
//     res.json(comments);
//   } catch (e) {
//     req.log.error("error in getOrderComments", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getLikuidCompByIdAndMonth = async (req, res) => {
//   try {
//     const { year, month, id } = req.body.data;
//     const user = req.user;
//     const account = await Account.findByPk(id);

//     if (!isBranchAdminOrFinance(user.role)) throw new Error("not allowed");
//     if (!account) throw new Error("not found");

//     const org = await db.sequelize.query(
//       "SELECT  COUNT(DISTINCT OS.id) as `count`, SUM(OS.receiverPays) as receiverPays, SUM(OS.senderCollect) as totalCollect,SUM(OS.orderTotalFee) as orderTotalFee,OS.currency as currency\n" +
//         "from `Order` O\n" +
//         "                       join OrderFees OS on O.id = OS.orderId\n" +
//         "  where O.deletedAt IS NULL  and O.status='Likuiduar' and (YEAR(OS.createdAt) = $year AND MONTH(OS.createdAt) = $month) and O.company = $account group by OS.currency",
//       {
//         bind: {
//           account: account.id,
//           year,
//           month,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const totalAll = org.find(({ currency }) => currency === "ALL");
//     const totalEuro = org.find(({ currency }) => currency === "EUR");
//     const total = {
//       name: account.name,
//       totalAll: !totalAll ? 0 : totalAll.totalCollect,
//       totalEuro: !totalEuro ? 0 : totalEuro.totalCollect,
//       priceAll: !totalAll ? 0 : totalAll.receiverPays,
//       priceEuro: !totalEuro ? 0 : totalEuro.receiverPays,
//       transAll: !totalAll ? 0 : totalAll.orderTotalFee,
//       transEuro: !totalEuro ? 0 : totalEuro.orderTotalFee,
//       countALL: !totalAll ? 0 : totalAll.count,
//       countEUR: !totalEuro ? 0 : totalEuro.count,
//     };
//     res.json(total);
//   } catch (e) {
//     req.log.error("error in getCompletedBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const testCollected = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const orders = await db.sequelize.query(
//       "        SELECT O.id, O.completedAt,OH.createdAt\n" +
//         "from `Order` O\n" +
//         "       join OrderHistory OH on O.id = OH.orderId  \n" +
//         "where O.deletedAt IS NULL and(O.status = 'Likuiduar' or O.status = 'OnLikuid' or O.status = 'Completed') and O.completedAt IS NULL and OH.status = 'Completed' ",

//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     await orders.forEach(async (element) => {
//       await Order.update(
//         { completedAt: element.createdAt },
//         {
//           where: {
//             id: element.id,
//           },
//           transaction,
//         }
//       );
//     });

//     await transaction.commit();
//     res.json(orders);
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in onCollect", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const getLikuidValueCompany = async (req, res) => {
//   try {
//     const accounts = await await db.sequelize.query(
//       "        SELECT A.id as id,A.name\n" +
//         "        from `Order` O\n" +
//         "        join Account A on O.company = A.id \n" +
//         "  where O.deletedAt IS NULL and O.status = 'Completed' group by O.company",

//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const ordersALL = await db.sequelize.query(
//       "        SELECT COUNT(DISTINCT O.id) as `count` ,SUM(OT.senderCollect) as total,A.name,A.id as id\n" +
//         "        from `Order` O\n" +
//         "        join OrderFees OT on O.id = OT.orderId\n" +
//         "        join Account A on O.company = A.id \n" +
//         "  where O.deletedAt IS NULL and O.status = 'Completed' and O.currency = 'ALL'  group by O.company",

//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const ordersEUR = await db.sequelize.query(
//       "        SELECT COUNT(DISTINCT O.id) as `count` ,SUM(OT.senderCollect) as total,A.name,A.id as id\n" +
//         "        from `Order` O\n" +
//         "        join OrderFees OT on O.id = OT.orderId\n" +
//         "        join Account A on O.company = A.id \n" +
//         "  where O.deletedAt IS NULL and O.status = 'Completed' and O.currency = 'EUR'  group by O.company",

//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const orderTotal = await db.sequelize.query(
//       "        SELECT O.currency,SUM(OT.senderCollect) as total\n" +
//         "        from `Order` O\n" +
//         "        join OrderFees OT on O.id = OT.orderId\n" +
//         "  where O.deletedAt IS NULL and O.status = 'Completed' group by O.currency",

//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const newArray = await accounts.map((e) => {
//       const resultAll = ordersALL.find(({ id }) => id === e.id);
//       const resultEUR = ordersEUR.find(({ id }) => id === e.id);

//       if (!resultAll || !resultEUR) {
//         return {
//           id: e.id,
//           accountName: e.name,
//           totalAll: !resultAll ? 0 : resultAll.total,
//           totalEuro: !resultEUR ? 0 : resultEUR.total,
//           countAll: !resultAll ? 0 : resultAll.count,
//           countEuro: !resultEUR ? 0 : resultEUR.count,
//         };
//       }

//       return {
//         id: e.id,
//         accountName: e.name,
//         totalAll: resultAll.total,
//         totalEuro: resultEUR.total,
//         countAll: resultAll.count,
//         countEuro: resultEUR.count,
//       };
//     });
//     const totalAll = orderTotal.find(({ currency }) => currency === "ALL");
//     const totalEuro = orderTotal.find(({ currency }) => currency === "EUR");
//     const total = {
//       totalAll: !totalAll ? 0 : totalAll.total,
//       totalEuro: !totalEuro ? 0 : totalEuro.total,
//     };
//     res.json({ newArray, total });
//   } catch (e) {
//     req.log.error("error in getCompletedBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getAccountPickUp = async (req, res) => {
//   try {
//     const user = req.user;
//     const { id } = req.params;
//     if (!isBranchOrAAdminOrCourier(user.role)) throw new Error("Unauthorized");
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status, A.name as companyName,A.pickup as pickup, A.addressText as companyAddress, A.phone as companyPhone, A.cityId, CO.name as orgCity from `Order` O join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1) join Account A on O.company = A.id join Cities CO on O.originCity = CO.id where OH.status IN ($created, $courier) and O.company = $id",
//       {
//         bind: {
//           created: "Order Created",
//           courier: "Marre nga Korieri",
//           id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in suAdminpickUpOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getExportOrders = async (req, res) => {
//   try {
//     const { selected } = req.body;

//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status,OH.comment as commentStatus, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "  where O.deletedAt IS NULL and O.id IN (:ids)",
//       {
//         replacements: { ids: selected },
//         type: QueryTypes.SELECT,
//       }
//     );

//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in get business", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getAccountAllStats = async (req, res) => {
//   try {
//     const user = req.user;
//     const account = await Account.findByPk(user.accountId);

//     if (!isFinanceOrCompanyAdminOrBranchManager(user.role)) {
//       throw new Error("not allowed");
//     }
//     if (user.role === "superAdmin" || user.role === "finance") {
//       const completed = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT O.id) as `completed`\n" +
//           "                      from `Order` O\n" +
//           "  where O.deletedAt IS NULL and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar')",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const transit = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT O.id) as `transit`\n" +
//           "                      from `Order` O\n" +
//           "  where O.deletedAt IS NULL and O.status = 'In Transit'",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const all = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT O.id) as `all`\n" +
//           "                      from `Order` O\n" +
//           "  where O.deletedAt IS NULL",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const rejected = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT O.id) as `rejected`\n" +
//           "                      from `Order` O\n" +
//           "  where O.deletedAt IS NULL and (O.status = 'Rejected' or O.status = 'Kthyer')",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );

//       res.json({
//         completed: completed[0],
//         rejected: rejected[0],
//         all: all[0],
//         transit: transit[0],
//       });
//     }
//     const completed = await db.sequelize.query(
//       "        SELECT COUNT(DISTINCT O.id) as `completed`\n" +
//         "                      from `Order` O\n" +
//         "  where O.deletedAt IS NULL and O.company = $branch and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar')",
//       {
//         bind: {
//           branch: account.id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const all = await db.sequelize.query(
//       "        SELECT COUNT(DISTINCT O.id) as `all`\n" +
//         "                      from `Order` O\n" +
//         "  where O.deletedAt IS NULL and O.company = $branch",
//       {
//         bind: {
//           branch: account.id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const rejected = await db.sequelize.query(
//       "        SELECT COUNT(DISTINCT O.id) as `rejected`\n" +
//         "                      from `Order` O\n" +
//         "  where O.deletedAt IS NULL and O.company = $branch and (O.status = 'Rejected' or O.status = 'Kthyer')",
//       {
//         bind: {
//           branch: account.id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const transit = await db.sequelize.query(
//       "        SELECT COUNT(DISTINCT O.id) as `transit`\n" +
//         "                      from `Order` O\n" +
//         "  where O.deletedAt IS NULL and O.company = $branch and O.status = 'In Transit'",
//       {
//         bind: {
//           branch: account.id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json({
//       completed: completed[0],
//       rejected: rejected[0],
//       all: all[0],
//       transit: transit[0],
//     });
//   } catch (e) {
//     req.log.error("error in get business", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getMonthAccountChart = async (req, res) => {
//   try {
//     const user = req.user;

//     const { year, month } = req.body.data;
//     if (isSystemAdmin(user.role)) {
//       const org = await db.sequelize.query(
//         "SELECT COUNT(DISTINCT O.id) as `count` ,DAY(O.completedAt) as 'date'\n" +
//           "from `Order` O\n" +
//           " where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and O.completedAt IS NOT NULL  group by date",
//         {
//           bind: {
//             year,
//             month,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const allDays = await new Date(year, month, 0).getDate();
//       const foo = [];

//       for (let i = 0; i <= allDays; i++) {
//         const result = org.find((word) => word.date === i);
//         const x = !result ? 0 : result.count;
//         foo.push(x);
//       }

//       res.json(foo);
//     }

//     if (isCompanyAdmin(user.role)) {
//       const account = await Account.findByPk(user.accountId);

//       if (!account) throw new Error("not found");

//       const org = await db.sequelize.query(
//         "SELECT COUNT(DISTINCT O.id) as `count` ,DAY(O.completedAt) as 'date'\n" +
//           "from `Order` O\n" +
//           " where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month)  and O.company = $id and O.completedAt IS NOT NULL group by date",
//         {
//           bind: {
//             year,
//             month,
//             id: account.id,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const allDays = await new Date(year, month, 0).getDate();
//       const foo = [];

//       for (let i = 0; i <= allDays; i++) {
//         const result = org.find((word) => word.date === i);
//         const x = !result ? 0 : result.count;
//         foo.push(x);
//       }

//       res.json(foo);
//     }

//     throw new Error("not allowed");
//   } catch (e) {
//     req.log.error("error in get business", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getProvinceChart = async (req, res) => {
//   try {
//     const user = req.user;
//     const account = await Account.findByPk(user.accountId);

//     if (!isCompanyAdmin(user.role)) throw new Error("not allowed");
//     if (!account) throw new Error("not found");

//     const org = await db.sequelize.query(
//       "SELECT COUNT(DISTINCT O.id) as `count`,BR.name,CT.name as city\n" +
//         "from `Order` O\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Branch BR on OT.destBranchId = BR.id\n" +
//         "                join Cities CT on BR.cityId = CT.id\n" +
//         "     where O.deletedAt IS NULL and  (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar') and O.company = $id group by OT.destBranchId ",

//       {
//         bind: {
//           id: account.id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     res.json(org);
//   } catch (e) {
//     req.log.error("error in get business", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const accOrderSearchQuery = async (req, res) => {
//   try {
//     const user = req.user;
//     const { name } = req.body;
//     if (isCompanyAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.name as branchName, CD.name as destCity ,CU.name as destCountry\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "where O.deletedAt IS NULL and  O.company = $accountId and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text or O.addressText REGEXP  $text or  O.total REGEXP $text or CD.name REGEXP $text or CU.name REGEXP $text) ORDER BY O.id DESC ",

//         {
//           bind: {
//             accountId: user.accountId,
//             text: name,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     if (isSystemAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.name as branchName, CD.name as destCity ,CU.name as destCountry\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "where O.deletedAt IS NULL and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text or O.addressText REGEXP  $text or  O.total REGEXP $text or CD.name REGEXP $text or CU.name REGEXP $text) ORDER BY O.id DESC ",

//         {
//           bind: {
//             text: name,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     if (isBranchAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.name as branchName, CD.name as destCity ,CU.name as destCountry\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "where O.deletedAt IS NULL and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text or O.addressText REGEXP  $text or  O.total REGEXP $text or CD.name REGEXP $text or CU.name REGEXP $text) ORDER BY O.id DESC ",

//         {
//           bind: {
//             branchId: user.branchId,
//             text: name,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     throw new Error("not allowed");
//   } catch (e) {
//     req.log.error("error in getOrdersByCompany", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const accSearchQueryProccess = async (req, res) => {
//   const { name, condition } = req.body;
//   const user = req.user;
//   if (condition === "proccess") {
//     try {
//       if (isCompanyAdminOrCompanyBranch(user.role)) {
//         const orders = await db.sequelize.query(
//           "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName,BR.name as magazine\n" +
//             "from `Order` O\n" +
//             "         join OrderHistory OH\n" +
//             "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//             "        join Account A on O.company = A.id\n" +
//             "        join OrderRoutes OT on O.id = OT.orderId\n" +
//             "        join Cities CD on O.destinationCity = CD.id\n" +
//             "        join Countries CU on O.destinationCountry = CU.id\n" +
//             " left join Branch BR on OH.branchId = BR.id\n" +
//             "        join Cities CA on O.originCity = CA.id\n" +
//             "          left  join CommentOrder CO\n" +
//             "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//             "where O.deletedAt IS NULL and O.company = $branchId and O.status = 'In Transit' and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               branchId: user.accountId,
//               text: name,
//             },
//             type: sequelize.QueryTypes.SELECT,
//           }
//         );
//         if (orders.length === 0) throw new Error("Order not found!");
//         res.json(orders);
//       }
//       throw new Error("Not allowed!");
//     } catch (e) {
//       req.log.error("error in get one order as admin", { error: e.message });
//       return res.status(500).json({ error: e.message });
//     }
//   }
//   if (condition === "completed") {
//     try {
//       if (isCompanyAdminOrCompanyBranch(user.role)) {
//         const orders = await db.sequelize.query(
//           "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//             "from `Order` O\n" +
//             "         join OrderHistory OH\n" +
//             "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//             "        join Account A on O.company = A.id\n" +
//             "        join OrderRoutes OT on O.id = OT.orderId\n" +
//             "        join Cities CD on O.destinationCity = CD.id\n" +
//             "        join Countries CU on O.destinationCountry = CU.id\n" +
//             "        join Cities CA on O.originCity = CA.id\n" +
//             "          left  join CommentOrder CO\n" +
//             "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//             "where O.deletedAt IS NULL and  O.company = $branchId and (O.status = 'Completed' or O.status = 'OnLikuid') and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               branchId: user.accountId,
//               text: name,
//             },
//             type: sequelize.QueryTypes.SELECT,
//           }
//         );
//         if (orders.length === 0) throw new Error("Order not found!");
//         res.json(orders);
//       }
//       throw new Error("Not allowed!");
//     } catch (e) {
//       req.log.error("error in get one order as admin", { error: e.message });
//       return res.status(500).json({ error: e.message });
//     }
//   }
//   if (condition === "likuid") {
//     try {
//       if (!isCompanyAdminOrCompanyBranch(user.role)) {
//         throw new Error("Not allowed!");
//       }
//       const orders = await db.sequelize.query(
//         "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id\n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "          left  join CommentOrder CO\n" +
//           "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//           "where O.deletedAt IS NULL  and O.company = $branchId and O.status = 'Likuiduar' and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//         {
//           bind: {
//             branchId: user.accountId,
//             text: name,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       if (orders.length === 0) throw new Error("Order not found!");
//       res.json(orders);
//     } catch (e) {
//       req.log.error("error in get one order as admin", { error: e.message });
//       return res.status(500).json({ error: e.message });
//     }
//   }
//   if (condition === "rejected") {
//     try {
//       if (isCompanyAdminOrCompanyBranch(user.role)) {
//         const orders = await db.sequelize.query(
//           "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//             "from `Order` O\n" +
//             "         join OrderHistory OH\n" +
//             "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//             "        join Account A on O.company = A.id\n" +
//             "        join OrderRoutes OT on O.id = OT.orderId\n" +
//             "        join Cities CD on O.destinationCity = CD.id\n" +
//             "        join Countries CU on O.destinationCountry = CU.id\n" +
//             "        join Cities CA on O.originCity = CA.id\n" +
//             "          left  join CommentOrder CO\n" +
//             "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//             "where O.deletedAt IS NULL  and O.company = $branchId and (O.status = 'Rejected' or O.status = 'Kthyer' ) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               branchId: user.accountId,
//               text: name,
//             },
//             type: sequelize.QueryTypes.SELECT,
//           }
//         );
//         if (orders.length === 0) throw new Error("Order not found!");
//         res.json(orders);
//       }
//       throw new Error("Not Allowed!");
//     } catch (e) {
//       req.log.error("error in get one order as admin", { error: e.message });
//       return res.status(500).json({ error: e.message });
//     }
//   }
//   throw new Error("Not allowed end!");
// };
