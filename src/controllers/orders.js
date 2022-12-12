// import sequelize, { Op } from "sequelize";
// import excelToJson from "convert-excel-to-json";
// import db, {
//   Account,
//   AccountFees,
//   Branch,
//   Order,
//   OrderFees,
//   OrderHistory,
//   OrderRoutes,
//   Transactions,
//   TransactionOrders,
//   User,
//   Vehicles,
//   TransactionsHistory,
//   PackageTypes,
//   BranchOperations,
//   CollectOrders,
//   CollectTransactions,
//   CollectHistory,
//   BilledTransactions,
//   BilledHistory,
//   CommentOrder,
//   CourierTransactions,
//   SwitchOrder,
//   Countries,
//   Cities,
//   Zeri,
//   Arka,
// } from "../models/index";
// import {
//   defineRoutes,
//   generateOrderCode,
//   generateTransCode,
//   newFeeCalculation,
// } from "../services/order";
// import {
//   canEditOrder,
//   isBranchAdmin,
//   isCompanyAdmin,
//   isCourier,
//   isFinance,
//   isSystemAdmin,
//   isFinanceOrAAdmin,
//   isBranchOrAAdminOrCourier,
//   isSystemCourierGetter,
//   isCompanyAdminOrBranchManager,
// } from "../services/user";
// import { generateBarcode } from "../lib/barcode";
// import { generatePDFOrdersTags } from "../lib/pdf";
// import path from "path";
// // create order history tu curent vehicle
// export const orderHistory = async (req, res) => {
//   try {
//     const body = req.body;
//     if (body.orderId && body.vehicle) {
//       const order = await OrderHistory.create({
//         orderId: body.orderId,
//         status: "test",
//         vehicle: body.vehicle,
//         updatedBy: req.user.id,
//       });

//       res.json(order);
//     } else {
//       res.status(400).json({ error: "orderId and vehicle must not be null" });
//     }
//   } catch (e) {
//     req.log.error("error in orderHistory", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// // create order
// export const createOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const createdBy = req.user.id;
//     let company, fees, originCity, originCountry, sender;
//     const {
//       accountId,
//       fullName,
//       phone,
//       // email,
//       country,
//       city,
//       address,
//       type,
//       content,
//       taxBillNumber,
//       notes,
//       weight,
//       price,
//       currency,
//       posta,
//       size,
//       canCheck,
//       express,
//       fragile,
//     } = req.body;
//     const packageType = await PackageTypes.findByPk(parseInt(size));
//     const destinationCity = parseInt(city);
//     const destinationCountry = parseInt(country);
//     const user = req.user;
//     sender = user.fullName || `${user.firstName} ${user.lastName}`;

//     if (isCompanyAdmin(user.role)) {
//       company = await Account.findByPk(user.accountId);
//       fees = await AccountFees.findOne({ where: { accountId: company.id } });
//       if (packageType.id === 1) {
//         packageType.cost.in = fees.inCity;
//         packageType.cost.out = fees.finalCost;
//       }
//       if (packageType.id === 2) {
//         packageType.cost.ks = fees.taxKs;
//         packageType.cost.mq = fees.taxMq;
//         packageType.cost.mn = fees.taxMn;
//       }
//       // 300
//       originCity = company.cityId;
//       originCountry = company.countryId;
//       // branch = await Branch.findOne({ where: { cityId: company.cityId } })
//       sender = company.name;
//       // branchId = company.branchId || null
//     }
//     if (isBranchAdmin(user.role) && accountId) {
//       company = await Account.findByPk(accountId);
//       fees = await AccountFees.findOne({ where: { accountId: company.id } });
//       if (packageType.id === 1) {
//         packageType.cost.in = fees.inCity;
//         packageType.cost.out = fees.finalCost;
//       }
//       if (packageType.id === 2) {
//         packageType.cost.ks = fees.taxKs;
//         packageType.cost.mq = fees.taxMq;
//         packageType.cost.mn = fees.taxMn;
//       }
//       // 300
//       originCity = company.cityId;
//       originCountry = company.countryId;
//       // branch = await Branch.findOne({ where: { cityId: company.cityId } })
//       sender = company.name;
//       // branchId = company.branchId || null
//     }
//     const routes = await defineRoutes(
//       originCity,
//       destinationCity,
//       originCountry,
//       destinationCountry
//     );
//     const TODAY_START = new Date(new Date().setHours(0, 0, 0, 0));
//     const NOW = new Date();
//     const countOrders = await Order.count({
//       where: {
//         company: company.id,
//         createdAt: {
//           [Op.gt]: TODAY_START,
//           [Op.lt]: NOW,
//         },
//       },
//       paranoid: false,
//     });
//     const code = await generateOrderCode(
//       originCity,
//       company.id,
//       countOrders + 1,
//       destinationCity
//     );
//     const order = await Order.create(
//       {
//         nr: countOrders + 1,
//         code,
//         name: fullName,
//         packageType: packageType.id,
//         weight,
//         comment: "",
//         contact: phone,
//         addressText: address,
//         content,
//         notes,
//         transport:
//           destinationCity === originCity ? fees.inCity : fees.finalCost,
//         total: 0,
//         type: type || "PAKO",
//         price: parseFloat(parseFloat(price).toFixed(2)),
//         taxNr: taxBillNumber,
//         currency: currency || "LEKE",
//         discount: 0,
//         company: company.id || null,
//         canOpen: canCheck,
//         express,
//         fragile,
//         originCity: originCity || 1,
//         destinationCity: destinationCity || 1,
//         originCountry: originCountry || 1,
//         destinationCountry: destinationCountry || 1,
//         createdBy,
//       },
//       { transaction }
//     );
//     const calculatedFees = await newFeeCalculation(
//       order,
//       packageType,
//       destinationCountry !== originCountry,
//       routes.fromKS,
//       routes.fromMQ
//     );
//     let finaleFee = calculatedFees.total;
//     const postaNr =
//       posta === parseInt(posta)
//         ? parseInt(posta)
//         : parseFloat(parseFloat(posta).toFixed(2));
//     if (postaNr >= 0 && postaNr !== order.transport) {
//       finaleFee = postaNr;
//     }
//     order.transport = finaleFee;
//     order.total = finaleFee + order.price;
//     await order.save({ transaction });
//     let senderCollect = order.price + (finaleFee - calculatedFees.total);
//     let receiverPays = order.price + finaleFee;
//     if (routes.fromKS) {
//       senderCollect = order.price + (finaleFee - calculatedFees.main);
//       receiverPays = order.price + finaleFee;
//     }
//     await OrderFees.create(
//       {
//         orderId: order.id,
//         senderCollect,
//         receiverPays,
//         orderTotalFee: calculatedFees.total,
//         originBranchFee: calculatedFees.origin,
//         destinationBranchFee: calculatedFees.destination,
//         mainFee: calculatedFees.main,
//         currency,
//       },
//       { transaction }
//     );
//     await OrderRoutes.create(
//       {
//         orderId: order.id,
//         orgBranchId: routes.origin.id,
//         destBranchId: routes.destination.id,
//       },
//       { transaction }
//     );
//     await OrderHistory.create(
//       {
//         orderId: order.id,
//         vehicle: null,
//         status: "Order Created",
//         branchId: null,
//         name: user.fullName,
//         createdBy,
//       },
//       { transaction }
//     );

//     transaction.commit();
//     res.json({
//       ...order.toJSON(),
//       sender,
//     });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in create order", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// // edit order
// export const editOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const createdBy = req.user.id;
//     let company, fees, originCity, originCountry, sender;
//     const {
//       id,
//       accountId,
//       fullName,
//       phone,
//       // email,
//       country,
//       city,
//       address,
//       type,
//       content,
//       taxBillNumber,
//       notes,
//       // weight,
//       price,
//       currency,
//       posta,
//       size,
//       canCheck,
//       express,
//       fragile,
//     } = req.body;
//     const oldOrder = await Order.findByPk(id);
//     const lastHistory = await OrderHistory.findAll({
//       limit: 1,
//       where: {
//         orderId: id,
//       },
//       order: [["createdAt", "DESC"]],
//     });
//     const bypassRules = isSystemAdmin(req.user.role);
//     if (!canEditOrder(req.user.role)) throw new Error("Not authorized");
//     if (!bypassRules && lastHistory[0].status !== "Order Created") {
//       throw new Error("Cannot modify order at this state");
//     }
//     if (isBranchAdmin(req.user.role)) {
//       const operations = await BranchOperations.findAll({
//         where: {
//           cityId: oldOrder.originCity,
//           branchId: req.user.branchId,
//         },
//       });
//       if (operations.length === 0) throw new Error("Not authorized");
//     }
//     if (
//       isCompanyAdmin(req.user.role) &&
//       oldOrder.accountId !== req.user.account
//     ) {
//       throw new Error("Not authorized");
//     }
//     const packageType = await PackageTypes.findByPk(parseInt(size));
//     const destinationCity = parseInt(city);
//     const destinationCountry = parseInt(country);
//     const user = req.user;
//     sender = user.fullName || `${user.firstName} ${user.lastName}`;
//     if (isCompanyAdmin(user.role)) {
//       company = await Account.findByPk(user.accountId);
//       fees = await AccountFees.findOne({ where: { accountId: company.id } });
//       if (packageType.id === 1) {
//         packageType.cost.in = fees.inCity;
//         packageType.cost.out = fees.finalCost;
//       }
//       if (packageType.id === 2) {
//         packageType.cost.ks = fees.taxKs;
//         packageType.cost.mq = fees.taxMq;
//         packageType.cost.mn = fees.taxMn;
//       }
//       // 300
//       originCity = oldOrder.originCity;
//       originCountry = oldOrder.originCountry;
//       // branch = await Branch.findOne({ where: { cityId: company.cityId } })
//       sender = company.name;
//       // branchId = company.branchId || null
//     }
//     if ((bypassRules || isBranchAdmin(user.role)) && accountId) {
//       company = await Account.findByPk(accountId);
//       fees = await AccountFees.findOne({ where: { accountId: company.id } });
//       if (packageType.id === 1) {
//         packageType.cost.in = fees.inCity;
//         packageType.cost.out = fees.finalCost;
//       }
//       if (packageType.id === 2) {
//         packageType.cost.ks = fees.taxKs;
//         packageType.cost.mq = fees.taxMq;
//         packageType.cost.mn = fees.taxMn;
//       }
//       // 300
//       originCity = company.cityId;
//       originCountry = company.countryId;
//       // branch = await Branch.findOne({ where: { cityId: company.cityId } })
//       sender = company.name;
//       // branchId = company.branchId || null
//     }
//     const routes = await defineRoutes(
//       originCity,
//       destinationCity,
//       originCountry,
//       destinationCountry
//     );
//     if (destinationCity !== oldOrder.destinationCity) {
//       const orderRoutes = await OrderRoutes.findOne({
//         where: {
//           orderId: oldOrder.id,
//         },
//       });
//       orderRoutes.destBranchId = routes.destination.id;
//       await orderRoutes.save({ transaction });
//     }
//     // const countOrders = await Order.count({ where: { createdBy } })
//     let code = oldOrder.code;
//     if (destinationCity !== oldOrder.destinationCity) {
//       code = await generateOrderCode(
//         originCity,
//         createdBy,
//         oldOrder.nr,
//         destinationCity
//       );
//     }
//     oldOrder.code = code;
//     oldOrder.name = fullName;
//     oldOrder.packageType = packageType.id;
//     oldOrder.contact = phone;
//     oldOrder.addressText = address;
//     oldOrder.content = content;
//     oldOrder.notes = notes;
//     oldOrder.transport =
//       destinationCity === originCity ? fees.inCity : fees.finalCost;
//     oldOrder.type = type;
//     oldOrder.price = price;
//     oldOrder.taxNr = taxBillNumber;
//     oldOrder.currency = currency || "ALL";
//     oldOrder.canOpen = canCheck;
//     oldOrder.express = express;
//     oldOrder.fragile = fragile;
//     oldOrder.originCity = originCity || 1;
//     oldOrder.destinationCity = destinationCity || 1;
//     oldOrder.originCountry = originCountry || 1;
//     oldOrder.destinationCountry = destinationCountry || 1;
//     const calculatedFees = await newFeeCalculation(
//       oldOrder,
//       packageType,
//       destinationCountry !== originCountry,
//       routes.fromKS,
//       routes.fromMQ
//     );
//     let finaleFee = calculatedFees.total;
//     const postaNr =
//       posta === parseInt(posta)
//         ? parseInt(posta)
//         : parseFloat(parseFloat(posta).toFixed(2));
//     if (postaNr >= 0 && postaNr !== oldOrder.transport) {
//       finaleFee = postaNr;
//     }
//     oldOrder.transport = finaleFee;
//     oldOrder.total = finaleFee + oldOrder.price;
//     await oldOrder.save({ transaction });
//     let senderCollect = oldOrder.price + (finaleFee - calculatedFees.total);
//     let receiverPays = oldOrder.price + finaleFee;
//     if (routes.fromKS) {
//       senderCollect = oldOrder.price + (finaleFee - calculatedFees.main);
//       receiverPays = oldOrder.price + finaleFee;
//     }
//     const orderFees = await OrderFees.findOne({
//       where: {
//         orderId: oldOrder.id,
//       },
//     });
//     orderFees.senderCollect = senderCollect;
//     orderFees.receiverPays = receiverPays;
//     orderFees.orderTotalFee = calculatedFees.total;
//     orderFees.originBranchFee = calculatedFees.origin;
//     orderFees.destinationBranchFee = calculatedFees.destination;
//     orderFees.mainFee = calculatedFees.main;
//     orderFees.currency = currency;
//     await orderFees.save({ transaction });
//     transaction.commit();
//     res.json({
//       ...oldOrder.toJSON(),
//       sender,
//     });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in edit order", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// // delete order
// export const deleteOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const { id } = req.body;
//     let queryId = id;
//     let checkQuery =
//       "SELECT O.id, OH.status\n" +
//       "from `Order` O join OrderHistory OH\n" +
//       " on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//       " where O.id = $ids and OH.status = $status";
//     if (Array.isArray(id)) {
//       queryId = id.join(",");
//       checkQuery =
//         "SELECT O.id, OH.status\n" +
//         "from `Order` O join OrderHistory OH\n" +
//         " on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         " where O.id in ($ids) and OH.status = $status";
//     }
//     const checkOrders = await db.sequelize.query(checkQuery, {
//       bind: {
//         ids: queryId,
//         status: "Order Created",
//       },
//       type: sequelize.QueryTypes.SELECT,
//     });
//     const toDelete = checkOrders.map((i) => i.id);
//     if (toDelete.length === 0) throw new Error("Nothing to delete");
//     await Order.destroy(
//       {
//         where: {
//           id: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     await OrderHistory.destroy(
//       {
//         where: {
//           orderId: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     await OrderFees.destroy(
//       {
//         where: {
//           orderId: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     await OrderRoutes.destroy(
//       {
//         where: {
//           orderId: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     await SwitchOrder.destroy(
//       {
//         where: {
//           new: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     transaction.commit();
//     const failToDelete = Array.isArray(id)
//       ? id.filter((x) => !toDelete.includes(x))
//       : [];
//     res.json({
//       requested: Array.isArray(id) ? id.length : 1,
//       deleted: toDelete.length,
//       fail: failToDelete,
//       success: toDelete,
//     });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in delete order", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// // delete order as admin
// export const deleteOrderAsAdmin = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const { id } = req.body;
//     const user = req.user;
//     if (!isSystemAdmin(user.role)) throw new Error("Not Authorized");
//     const order = await Order.findByPk(id);
//     if (!order) throw new Error("Nothing to delete, order not found");
//     await Order.destroy(
//       {
//         where: {
//           id,
//         },
//       },
//       { transaction }
//     );
//     await OrderHistory.destroy(
//       {
//         where: {
//           orderId: order.id,
//         },
//       },
//       { transaction }
//     );
//     await OrderFees.destroy(
//       {
//         where: {
//           orderId: id,
//         },
//       },
//       { transaction }
//     );
//     await OrderRoutes.destroy(
//       {
//         where: {
//           orderId: id,
//         },
//       },
//       { transaction }
//     );
//     transaction.commit();
//     res.json({ success: true, id });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in delete order as admin", { error: e.message });
//     return res.status(500).json({ error: e.message, success: false });
//   }
// };
// // superAdmin delete order
// export const suAdminDeleteOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const { id } = req.body;
//     let queryId = id;
//     let checkQuery =
//       "SELECT O.id, OH.status\n" +
//       "from `Order` O join OrderHistory OH\n" +
//       " on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//       " where O.id = $ids and OH.status = $status";
//     if (Array.isArray(id)) {
//       queryId = id.join(",");
//       checkQuery =
//         "SELECT O.id, OH.status\n" +
//         "from `Order` O join OrderHistory OH\n" +
//         " on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         " where O.id in ($ids)";
//     }
//     const checkOrders = await db.sequelize.query(checkQuery, {
//       bind: {
//         ids: queryId,
//       },
//       type: sequelize.QueryTypes.SELECT,
//     });
//     const toDelete = checkOrders.map((i) => i.id);
//     if (toDelete.length === 0) throw new Error("Nothing to delete");
//     await Order.destroy(
//       {
//         where: {
//           id: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     await OrderHistory.destroy(
//       {
//         where: {
//           orderId: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     await OrderFees.destroy(
//       {
//         where: {
//           orderId: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     await OrderRoutes.destroy(
//       {
//         where: {
//           orderId: {
//             [Op.in]: toDelete,
//           },
//         },
//       },
//       { transaction }
//     );
//     transaction.commit();
//     const failToDelete = Array.isArray(id)
//       ? id.filter((x) => !toDelete.includes(x))
//       : [];
//     res.json({
//       requested: Array.isArray(id) ? id.length : 1,
//       deleted: toDelete.length,
//       fail: failToDelete,
//       success: toDelete,
//     });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in delete order", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// // track curent vehicle of order
// export const getCurentVehicle = async (req, res) => {
//   try {
//     const order = await OrderHistory.findAll({
//       where: {
//         orderId: req.params.id,
//       },
//       order: [["createdAt", "DESC"]],
//     });
//     if (order.length) {
//       const vehicle = order[0];
//       res.json(vehicle);
//     } else {
//       res
//         .status(400)
//         .json({ error: "Order not found or does not have history track" });
//     }
//   } catch (e) {
//     req.log.error("error in getCurentVehicle", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// // get order with orderhistory
// export const getOrderWithHistory = async (req, res) => {
//   try {
//     const order = await OrderHistory.findAll({
//       where: {
//         orderId: req.params.id,
//       },
//     });
//     res.json(order);
//   } catch (e) {
//     req.log.error("error in getOrderWithHistory", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getOrders = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const order = await Order.findOne({
//       where: {
//         id,
//       },
//     });
//     res.json(order);
//   } catch (e) {
//     req.log.error("error in getOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getOneOrderAsAdmin = async (req, res) => {
//   const { code } = req.params;
//   try {
//     if (!isSystemAdmin(req.user.role)) throw new Error("Not Authorized!");
//     const order = await db.sequelize.query(
//       "SELECT O.*,\n" +
//         "       OH.comment    as commentStatus,\n" +
//         "       A.name        as companyName,\n" +
//         "       A.addressText as companyAddress,\n" +
//         "       A.phone       as companyPhone,\n" +
//         "       PT.name       as packageName,\n" +
//         "       CO.name       as orgCity,\n" +
//         "       CD.name       as destCity,\n" +
//         "       COO.name      as orgCountry,\n" +
//         "       COD.name      as destCountry\n" +
//         "from `Order` O\n" +
//         "         join OrderRoutes R on O.id = R.orderId\n" +
//         "         join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "         join Account A on O.company = A.id\n" +
//         "         join Cities CO on O.originCity = CO.id\n" +
//         "         join Cities CD on O.destinationCity = CD.id\n" +
//         "         join Countries COO on O.originCountry = COO.id\n" +
//         "         join Countries COD on O.destinationCountry = COD.id\n" +
//         "         join PackageTypes PT on O.packageType = PT.id\n" +
//         "where O.code = $code;",
//       {
//         bind: {
//           code,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     if (order.length === 0) throw new Error("Order not found!");
//     res.json(order[0]);
//   } catch (e) {
//     req.log.error("error in get one order as admin", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getOrdersByNameAsAdmin = async (req, res) => {
//   const { name } = req.body;
//   try {
//     if (!isSystemAdmin(req.user.role)) throw new Error("Not Authorized!");
//     const order = await Order.findAll({
//       where: {
//         name: {
//           [Op.like]: `%${name}%`,
//         },
//       },
//     });
//     if (order.length === 0) throw new Error("Order not found!");
//     res.json(order);
//   } catch (e) {
//     req.log.error("error in get one order as admin", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const pickUpOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user.branchId) throw new Error("Unauthorized");
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status, A.name as companyName,A.pickup as pickup, A.addressText as companyAddress, A.phone as companyPhone, A.cityId, CO.name as orgCity from `Order` O join OrderRoutes R on O.id = R.orderId join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1) join Account A on O.company = A.id join Cities CO on O.originCity = CO.id where O.deletedAt IS NULL and R.orgBranchId = $branch and OH.status IN ($created, $courier) order by createdAt asc",
//       {
//         bind: {
//           branch: user.branchId,
//           created: "Order Created",
//           courier: "Marre nga Korieri",
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const company = await db.sequelize.query(
//       "SELECT A.name as companyName, O.company ,COUNT(DISTINCT O.id) as count from `Order` O join OrderRoutes R on O.id = R.orderId join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1) join Account A on O.company = A.id join Cities CO on O.originCity = CO.id where R.orgBranchId = $branch and OH.status IN ($created, $courier) group by O.company",
//       {
//         bind: {
//           branch: user.branchId,
//           created: "Order Created",
//           courier: "Marre nga Korieri",
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json({ orders, company });
//   } catch (e) {
//     req.log.error("error in pickUpOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const pickUpFromPartner = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!user.branchId) throw new Error("Unauthorized");
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS(Select O.*  FROM `Order` O  WHERE OH.branchId = $branchId ), 1, 0) as kusht , O.*, OH.status,OH.comment as commentStatus, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "where O.deletedAt IS NULL and O.status = 'In Transit'  and (OT.orgBranchId != $branchId and OT.destBranchId = $branchId) ORDER BY O.id DESC ",
//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const newOrder = orders.filter(function (freelancer) {
//       return freelancer.kusht === 0;
//     });
//     res.json(newOrder);
//   } catch (e) {
//     req.log.error("error in pickUpFromPartner", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const suAdminpickUpOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!isSystemAdmin(user.role)) throw new Error("Unauthorized");
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status, A.name as companyName,A.pickup as pickup, A.addressText as companyAddress, A.phone as companyPhone, A.cityId, CO.name as orgCity from `Order` O join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1) join Account A on O.company = A.id join Cities CO on O.originCity = CO.id where O.deletedAt IS NULL and OH.status IN ($created, $courier) order by createdAt asc",
//       {
//         bind: {
//           created: "Order Created",
//           courier: "Marre nga Korieri",
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const company = await db.sequelize.query(
//       "SELECT A.name as companyName, O.company ,COUNT(DISTINCT O.id) as count  from `Order` O join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1) join Account A on O.company = A.id  where OH.status IN ($created, $courier) group by O.company",
//       {
//         bind: {
//           created: "Order Created",
//           courier: "Marre nga Korieri",
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json({ orders, company });
//   } catch (e) {
//     req.log.error("error in suAdminpickUpOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const orderScan = async (req, res) => {
//   try {
//     const user = req.user;
//     const { code } = req.params;
//     let status = "toCourier";
//     let name = null;
//     let branchCouriers = null;

//     const oHistory = await db.sequelize.query(
//       "Select OH.status,OH.branchId, O.id\n" +
//         "from OrderHistory OH\n" +
//         " join `Order` O on OH.orderId = O.id\n" +
//         "where O.deletedAt IS NULL and O.code = $code\n" +
//         "order by id DESC\n" +
//         "limit 1",
//       {
//         bind: {
//           code,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     let vehicle = null;
//     if (!user.branchId) throw new Error("Unauthorized");
//     if (isBranchAdmin(user.role)) {
//       const branch = await Branch.findByPk(user.branchId);
//       branchCouriers = await User.findAll({
//         where: { branchId: user.branchId, role: "courier" },
//       });
//       status = "Ne Magazine";
//       name = branch.name;
//     }
//     if (isCourier(user.role)) {
//       vehicle = await Vehicles.findOne({
//         where: {
//           courierId: user.id,
//         },
//       });
//       name = user.fullName;
//     }
//     if (
//       oHistory[0].branchId === user.branchId ||
//       oHistory[0].courierId === user.id
//     ) {
//       console.log(oHistory);
//       throw new Error("Already in that state");
//     }
//     const order = await Order.findOne({
//       where: {
//         code,
//       },
//     });
//     if (order.completedAt !== null) {
//       throw new Error("porosia eshte dorezuar njehere");
//     }

//     let orderHistory = await OrderHistory.create({
//       orderId: order.id,
//       vehicle: (vehicle && vehicle.id) || null,
//       status,
//       name,
//       courierId: isCourier(user.role) ? user.id : null,
//       branchId: !vehicle ? user.branchId : null,
//       createdBy: user.id,
//     });
//     if (
//       branchCouriers &&
//       branchCouriers.length === 1 &&
//       order.destinationCity === order.originCity
//     ) {
//       const vech = await Vehicles.findOne({
//         where: {
//           courierId: branchCouriers[0].id,
//         },
//       });
//       orderHistory = await OrderHistory.create({
//         orderId: order.id,
//         vehicle: vech ? vech.id : null,
//         status: "toCourier",
//         name,
//         courierId: branchCouriers[0].id,
//         branchId: user.branchId,
//         createdBy: user.id,
//       });
//     }
//     const data = { orderHistory, code };
//     res.json(data);
//   } catch (e) {
//     req.log.error("error in orderScan", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const rejectOrCompleteOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { id, status, comment } = req.body;
//     if (isBranchOrAAdminOrCourier(user.role)) {
//       const order = await Order.findOne({
//         where: {
//           id,
//         },
//       });
//       const rootes = await OrderRoutes.findOne({
//         where: {
//           orderId: id,
//         },
//       });
//       if (!order) throw new Error("No order found");
//       if (!rootes) throw new Error("No root found");
//       const oHistory = {
//         orderId: order.id,
//         vehicle: null,
//         status,
//         comment: comment || null,
//         name: null,
//         courierId: null,
//         branchId: null,
//         createdBy: user.id,
//       };
//       const switched = await SwitchOrder.findOne({
//         where: {
//           new: order.id,
//         },
//       });
//       if (isCourier(user.role)) {
//         const vehicle = await Vehicles.findOne({
//           where: {
//             courierId: user.id,
//           },
//         });
//         oHistory.vehicle = vehicle.id;
//         oHistory.courierId = user.id;
//         oHistory.name = user.fullName;
//       } else if (user.role === "branchManager") {
//         const branch = await Branch.findByPk(user.branchId);
//         oHistory.branchId = user.branchId;
//         oHistory.name = branch.name;
//       } else {
//         oHistory.branchId = null;
//         oHistory.name = "Admin";
//       }
//       const orderHistory = await OrderHistory.create(oHistory, { transaction });
//       const ordUpdate = { status, updatedAt: new Date() };
//       const rootUpdate = {
//         destBranchId: 1,
//         updatedAt: new Date(),
//       };

//       if (status === "Completed") {
//         ordUpdate.completedAt = new Date();
//       }
//       if (user.branchId === 1) {
//         await Order.update(ordUpdate, {
//           where: {
//             id: order.id,
//           },
//           transaction,
//         });

//         await OrderRoutes.update(rootUpdate, {
//           where: {
//             orderId: order.id,
//           },
//           transaction,
//         });

//         if (switched) {
//           await SwitchOrder.update(
//             { switched: true, updatedAt: new Date() },
//             {
//               where: {
//                 new: order.id,
//               },
//               transaction,
//             }
//           );
//           await transaction.commit();
//           res.json(orderHistory);
//         }
//         await transaction.commit();
//         res.json(orderHistory);
//       }
//       await Order.update(ordUpdate, {
//         where: {
//           id: order.id,
//         },
//         transaction,
//       });
//       if (switched) {
//         await SwitchOrder.update(
//           { switched: true, updatedAt: new Date() },
//           {
//             where: {
//               new: order.id,
//             },
//             transaction,
//           }
//         );
//         await transaction.commit();
//         res.json(orderHistory);
//       }

//       await transaction.commit();
//       res.json(orderHistory);
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in rejectOrCompleteOrder", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const bulkRejectOrCompleteOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, status } = req.body;
//     if (isBranchOrAAdminOrCourier(user.role)) {
//       const oHistory = {
//         orderId: null,
//         vehicle: null,
//         status,
//         name: null,
//         comment: null,
//         courierId: null,
//         branchId: null,
//         createdBy: user.id,
//       };
//       if (isCourier(user.role)) {
//         const vehicle = await Vehicles.findOne({
//           where: {
//             courierId: user.id,
//           },
//         });
//         oHistory.vehicle = vehicle.id;
//         oHistory.courierId = user.id;
//         oHistory.name = user.fullName;
//       } else if (user.role === "branchManager") {
//         const branch = await Branch.findByPk(user.branchId);
//         oHistory.branchId = user.branchId;
//         oHistory.name = branch.name;
//       } else {
//         oHistory.branchId = null;
//         oHistory.name = "Admin";
//       }
//       const orderHistoryBulk = selected.map((i) => {
//         return {
//           ...oHistory,
//           orderId: i,
//         };
//       });
//       const orderHistory = await OrderHistory.bulkCreate(orderHistoryBulk, {
//         transaction,
//       });
//       if (status === "Completed") {
//         await Order.update(
//           { status, updatedAt: new Date(), completedAt: new Date() },
//           {
//             where: {
//               id: {
//                 [Op.in]: selected,
//               },
//             },
//             transaction,
//           }
//         );
//         await SwitchOrder.update(
//           { switched: true, updatedAt: new Date() },
//           {
//             where: {
//               new: {
//                 [Op.in]: selected,
//               },
//             },
//             transaction,
//           }
//         );
//         await transaction.commit();
//         res.json(orderHistory);
//       } else {
//         await Order.update(
//           { status, updatedAt: new Date() },
//           {
//             where: {
//               id: {
//                 [Op.in]: selected,
//               },
//             },
//             transaction,
//           }
//         );
//         await transaction.commit();
//         res.json(orderHistory);
//       }
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in bulkRejectOrCompleteOrder", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };

// export const pickedCourierFromStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, status, courierId } = req.body;
//     const statusOrder = "In Transit";
//     const courier = await User.findByPk(courierId);
//     if (!courier) throw new Error("Nuk ka korier me kete Id");
//     const vehicle = await Vehicles.findOne({
//       where: {
//         courierId: courier.id,
//       },
//     });
//     if (isBranchAdmin(user.role)) {
//       const oHistory = {
//         orderId: null,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: null,
//         courierId: courier.id,
//         branchId: user.branchId,
//         createdBy: user.id,
//       };
//       let newSelected = [];
//       if (!Array.isArray(selected)) {
//         newSelected = [selected];
//       } else {
//         newSelected = selected;
//       }

//       const orderHistoryBulk = newSelected.map((i) => {
//         return {
//           ...oHistory,
//           orderId: i,
//         };
//       });
//       const orderHistory = await OrderHistory.bulkCreate(orderHistoryBulk, {
//         transaction,
//       });
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: newSelected,
//             },
//           },
//           transaction,
//         }
//       );
//       transaction.commit();
//       res.json(orderHistory);
//     } else if (isSystemAdmin(user.role)) {
//       const bran = await Branch.findByPk(courier.branchId);
//       if (!bran) throw new Error("Nuk ka branch me kete Id");

//       const oHistory = {
//         orderId: null,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: null,
//         courierId: courier.id,
//         branchId: bran.id,
//         createdBy: user.id,
//       };
//       const brHistory = {
//         orderId: null,
//         vehicle: null,
//         status: "Ne Magazine",
//         name: bran.name,
//         comment: "Magazinuar ",
//         courierId: null,
//         branchId: courier.branchId,
//         createdBy: user.id,
//       };
//       let newSelected = [];
//       if (!Array.isArray(selected)) {
//         newSelected = [selected];
//       } else {
//         newSelected = selected;
//       }

//       const orderHistoryBulk = newSelected.map((i) => {
//         return {
//           ...oHistory,
//           orderId: i,
//         };
//       });
//       const branchHistoryBulk = newSelected.map((i) => {
//         return {
//           ...brHistory,
//           orderId: i,
//         };
//       });
//       await OrderHistory.bulkCreate(branchHistoryBulk, {
//         transaction,
//       });
//       const orderHistory = await OrderHistory.bulkCreate(orderHistoryBulk, {
//         transaction,
//       });
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: newSelected,
//             },
//           },
//           transaction,
//         }
//       );
//       transaction.commit();
//       res.json(orderHistory);
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in pickedCourierFromStatus", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const pikedCourierFromScan = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { code, status, courierId } = req.body;
//     const statusOrder = "In Transit";
//     const courier = await User.findByPk(courierId);
//     if (!courier) throw new Error("Nuk ka korier me kete Id");
//     const vehicle = await Vehicles.findOne({
//       where: {
//         courierId: courier.id,
//       },
//     });
//     if (!vehicle) throw new Error("Nuk ka vehicle me kete Id");
//     const bran = await Branch.findByPk(courier.branchId);
//     if (!bran) throw new Error("Nuk ka branch me kete Id");
//     const oStory = await db.sequelize.query(
//       "Select OH.*\n" +
//         "from OrderHistory OH\n" +
//         " join `Order` O on OH.orderId = O.id\n" +
//         "where O.deletedAt IS NULL and O.code = $code\n" +
//         "order by id DESC\n" +
//         "limit 1",
//       {
//         bind: {
//           code,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     console.log(
//       "🚀 ~ file: orders.js ~ line 1336 ~ pikedCourierFromScan ~ oStory",
//       oStory
//     );

//     if (isBranchAdmin(user.role)) {
//       const orderScan = await Order.findOne({
//         where: {
//           code,
//         },
//       });

//       if (!orderScan) throw new Error("Nuk ka order me kete Id");
//       if (orderScan.completedAt !== null) {
//         throw new Error("porosia eshte dorezuar njehere");
//       }
//       if (
//         Number(oStory[0].branchId) === Number(bran.id) &&
//         Number(oStory[0].courierId) === Number(courierId) &&
//         oStory[0].status.toString() === "toCourier" &&
//         Number(oStory[0].orderId) === Number(orderScan.id) &&
//         Number(oStory[0].vehicle) === Number(vehicle.id)
//       ) {
//         throw new Error("Already in that courier");
//       }

//       const oHistory = {
//         orderId: orderScan.id,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: null,
//         courierId: courier.id,
//         branchId: user.branchId,
//         createdBy: user.id,
//       };
//       const orderHistory = await OrderHistory.create(oHistory, {
//         transaction,
//       });
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: orderScan.id,
//           },
//           transaction,
//         }
//       );
//       const data = { orderHistory, code };

//       transaction.commit();
//       res.json(data);
//     } else if (isSystemAdmin(user.role)) {
//       const orderScan = await Order.findOne({
//         where: {
//           code,
//         },
//       });

//       if (
//         Number(oStory[0].branchId) === Number(bran.id) &&
//         Number(oStory[0].courierId) === Number(courierId) &&
//         oStory[0].status.toString() === "toCourier" &&
//         Number(oStory[0].orderId) === Number(orderScan.id) &&
//         Number(oStory[0].vehicle) === Number(vehicle.id)
//       ) {
//         throw new Error("Already in that courier");
//       }

//       if (!orderScan) throw new Error("Nuk ka order me kete Id");
//       if (orderScan.completedAt !== null) {
//         throw new Error("porosia eshte dorezuar njehere");
//       }
//       const oHistory = {
//         orderId: orderScan.id,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: null,
//         courierId: courier.id,
//         branchId: bran.id,
//         createdBy: user.id,
//       };
//       const orderHistory = await OrderHistory.create(oHistory, {
//         transaction,
//       });
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: orderScan.id,
//           },
//           transaction,
//         }
//       );
//       const data = { orderHistory, code };

//       transaction.commit();
//       res.json(data);
//     } else res.status(500).json({ error: "Not Permited" });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in pickedCourierFromStatus", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const toPickedScan = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { code, status, courierId } = req.body;
//     const statusOrder = "In Transit";
//     const courier = await User.findByPk(courierId);
//     if (!courier) throw new Error("Nuk ka korier me kete Id");
//     const vehicle = await Vehicles.findOne({
//       where: {
//         courierId: courier.id,
//       },
//     });
//     if (!vehicle) throw new Error("Nuk ka vehicle me kete Id");
//     const bran = await Branch.findByPk(courier.branchId);
//     if (!bran) throw new Error("Nuk ka branch me kete Id");
//     const oStory = await db.sequelize.query(
//       "Select OH.*\n" +
//         "from OrderHistory OH\n" +
//         " join `Order` O on OH.orderId = O.id\n" +
//         "where O.deletedAt IS NULL and O.code = $code\n" +
//         "order by id DESC\n" +
//         "limit 1",
//       {
//         bind: {
//           code,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     if (isBranchAdmin(user.role)) {
//       const orderScan = await Order.findOne({
//         where: {
//           code,
//         },
//       });
//       if (!orderScan) throw new Error("Nuk ka order me kete Id");
//       if (
//         Number(oStory[0].branchId) === Number(bran.id) &&
//         Number(oStory[0].courierId) === Number(courierId) &&
//         oStory[0].status.toString() === "toPickUpFromCourier" &&
//         Number(oStory[0].orderId) === Number(orderScan.id) &&
//         Number(oStory[0].vehicle) === Number(vehicle.id)
//       ) {
//         throw new Error("Already in that courier");
//       }

//       const oHistory = {
//         orderId: orderScan.id,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: null,
//         courierId: courier.id,
//         branchId: user.branchId,
//         createdBy: user.id,
//       };
//       const orderHistory = await OrderHistory.create(oHistory, {
//         transaction,
//       });
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: orderScan.id,
//           },
//           transaction,
//         }
//       );
//       const data = { orderHistory, code };

//       transaction.commit();
//       res.json(data);
//     } else if (isSystemAdmin(user.role)) {
//       const orderScan = await Order.findOne({
//         where: {
//           code,
//         },
//       });
//       if (
//         Number(oStory[0].branchId) === Number(bran.id) &&
//         Number(oStory[0].courierId) === Number(courierId) &&
//         oStory[0].status.toString() === "toPickUpFromCourier" &&
//         Number(oStory[0].orderId) === Number(orderScan.id) &&
//         Number(oStory[0].vehicle) === Number(vehicle.id)
//       ) {
//         throw new Error("Already in that courier");
//       }

//       if (!orderScan) throw new Error("Nuk ka order me kete Id");

//       const oHistory = {
//         orderId: orderScan.id,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: null,
//         courierId: courier.id,
//         branchId: bran.id,
//         createdBy: user.id,
//       };
//       const orderHistory = await OrderHistory.create(oHistory, {
//         transaction,
//       });
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: orderScan.id,
//           },
//           transaction,
//         }
//       );
//       const data = { orderHistory, code };

//       transaction.commit();
//       res.json(data);
//     } else res.status(500).json({ error: "Not Permited" });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in pickedCourierFromStatus", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const toPickedFromCourier = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, status, courierId } = req.body;
//     const courier = await User.findByPk(courierId);
//     if (!courier) throw new Error("Nuk ka korier me kete Id");
//     const vehicle = await Vehicles.findOne({
//       where: {
//         courierId: courier.id,
//       },
//     });
//     if (isSystemAdmin(user.role)) {
//       const oHistory = {
//         orderId: null,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: "Per tu marr nga korieri",
//         courierId: courier.id,
//         branchId: null,
//         createdBy: user.id,
//       };

//       const orderHistoryBulk = selected.map((i) => {
//         return {
//           ...oHistory,
//           orderId: i,
//         };
//       });
//       const orderHistory = await OrderHistory.bulkCreate(orderHistoryBulk, {
//         transaction,
//       });
//       const statusOrder = "In Transit";
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: selected,
//             },
//           },
//           transaction,
//         }
//       );
//       // await OrderRoutes.update(
//       //   { picked: true, updatedAt: new Date() },
//       //   {
//       //     where: {
//       //       orderId: {
//       //         [Op.in]: selected
//       //       }
//       //     },
//       //     transaction
//       //   }
//       // )
//       transaction.commit();
//       res.json(orderHistory);
//     }
//     if (isBranchAdmin(user.role)) {
//       if (!user.branchId) throw new Error("Unauthorized");

//       const oHistory = {
//         orderId: null,
//         vehicle: vehicle.id,
//         status,
//         name: courier.fullName,
//         comment: "Per tu marr nga korieri",
//         courierId: courier.id,
//         branchId: user.branchId,
//         createdBy: user.id,
//       };

//       const orderHistoryBulk = selected.map((i) => {
//         return {
//           ...oHistory,
//           orderId: i,
//         };
//       });
//       const orderHistory = await OrderHistory.bulkCreate(orderHistoryBulk, {
//         transaction,
//       });
//       const statusOrder = "In Transit";
//       await Order.update(
//         { status: statusOrder, updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: selected,
//             },
//           },
//           transaction,
//         }
//       );
//       transaction.commit();
//       res.json(orderHistory);
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in toPickedFromCourier", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getOrdersByCompany = async (req, res) => {
//   try {
//     const user = req.user;
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id), 1, 0) as notis,O.*, OH.status,BR.name as magazine, CD.name  as destCity,COD.name as destCountry\n" +
//         "from `Order` O\n" +
//         "         join Cities CD on O.destinationCity = CD.id\n" +
//         "         join Countries COD on O.destinationCountry = COD.id\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         " left join Branch BR on OH.branchId = BR.id\n" +
//         "          left  join CommentOrder CO\n" +
//         "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         "where O.deletedAt IS NULL and  O.company = $accountId and O.status = 'In Transit'",

//       {
//         bind: {
//           accountId: user.accountId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getOrdersByCompany", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getInBranchOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (user.branchId === 1) {
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
//           "where O.deletedAt IS NULL and O.status = 'In Transit' and( OH.status != 'Order Created' and OH.branchId = $branchId) and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",
//         {
//           bind: {
//             branchId: user.branchId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "          left  join CommentOrder CO\n" +
//         "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         "where O.deletedAt IS NULL and O.status = 'In Transit' and( OH.status != 'Order Created' and OH.branchId = $branchId) and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",
//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getInBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getRejectBranchOrder = async (req, res) => {
//   try {
//     const user = req.user;
//     if (isSystemAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id\n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "where O.deletedAt IS NULL and  O.status = 'Rejected' ORDER BY O.id DESC",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     if (user.branchId === 1) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id\n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "where O.deletedAt IS NULL and  O.status = 'Rejected'  ORDER BY O.id DESC",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "where O.deletedAt IS NULL and  O.status = 'Rejected' and( OH.status != 'Order Created' and OH.branchId = $branchId) and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",
//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getInBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getNextBranchOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (user.branchId === 1) {
//       const orders = await db.sequelize.query(
//         "SELECT IF( EXISTS( SELECT * FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.branchId = 1  and  OrderHistory.orderId = O.id), 1, 0), O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id\n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "where O.deletedAt IS NULL and  O.status = 'In Transit' and  (OH.status != 'Order Created' and OH.branchId != $branchId) and (OT.orgBranchId = $branchId or OT.orgBranchId != $branchId) and OT.destBranchId != $branchId  ORDER BY O.id DESC",
//         {
//           bind: {
//             branchId: user.branchId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.branchId = $branchId  and  OrderHistory.orderId = O.id), 1, 0), O.*,OH.status,OH.comment as commentStatus,OH.name as branchName,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "where O.deletedAt IS NULL and O.status = 'In Transit'and  (OH.status != 'Order Created' and OH.branchId != $branchId) and  (OT.orgBranchId = $branchId and OT.destBranchId != $branchId)  ORDER BY O.id DESC",
//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getNextBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getTransitBranchOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (user.branchId !== 1) throw new Error("Forbiden 2");
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.branchId = 1  and  OrderHistory.orderId = O.id), 1, 0),  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "where O.deletedAt IS NULL and O.status = 'In Transit' and OH.status != 'Order Created' and  (OT.orgBranchId != 1 and OT.destBranchId != 1) ORDER BY O.id DESC",
//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getNextBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getInSuperAdminOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (user.role !== "superAdmin") throw new Error("Unauthorized");
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis, O.*,\n" +
//         "       OH.comment as commentStatus,\n" +
//         "       CO.name  as orgCity,\n" +
//         "       CD.name  as destCity,\n" +
//         "       COD.name as destCountry,\n" +
//         "       COO.name as orgCountry,\n" +
//         "       A.name   as CompanyName,\n" +
//         "       OH.name   as Carier,\n" +
//         "       OH.status   as History\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "          left  join CommentOrder CK\n" +
//         "              on CK.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         "         join Cities CO on O.originCity = CO.id\n" +
//         "         join Cities CD on O.destinationCity = CD.id\n" +
//         "         join Countries COD on O.destinationCountry = COD.id\n" +
//         "         join Countries COO on O.originCountry = COO.id\n" +
//         "         join Account A on O.company = A.id where O.deletedAt IS NULL and O.status = 'In Transit' and OH.status != 'Order Created'  ORDER BY O.id DESC",
//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getInSuperAdminOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getOrderByCourier = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "where O.deletedAt IS NULL and OH.courierId = $courierId",
//       {
//         bind: {
//           courierId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getOrderByCourier", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getCompletedCompanyOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id), 1, 0) as notis,O.*, OH.status,OH.comment as commentStatus, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "          left  join CommentOrder CO\n" +
//         "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         "  where O.deletedAt IS NULL and O.company = $companyId and (O.status = 'Completed' or O.status = 'OnLikuid')",
//       {
//         bind: {
//           companyId: user.accountId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCompletedCompanyOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getToSwitchOrder = async (req, res) => {
//   try {
//     const user = req.user;
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status, CD.name as destCity, CU.name as destCountry\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "  where O.deletedAt IS NULL and O.company = $companyId and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar' or O.status = 'Rejected' )",
//       {
//         bind: {
//           companyId: user.accountId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCompletedCompanyOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getLikuiduarCompanyOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id), 1, 0) as notis, O.*,OH.comment as commentStatus, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName,TS.createdAt as dateLikuid\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "        join TransactionOrders TR on O.id = TR.orderId\n" +
//         "        join Transactions TS on TR.transactionId = TS.id\n" +
//         "          left  join CommentOrder CO\n" +
//         "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         "  where O.deletedAt IS NULL and O.company = $companyId and O.status = 'Likuiduar'",
//       {
//         bind: {
//           companyId: user.accountId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCompletedCompanyOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getRejectedCompanyOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     const orders = await db.sequelize.query(
//       "SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id), 1, 0) as notis,O.*, OH.status,CD.name as destCity,CU.name as destCountry\n" +
//         "from `Order` O\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         "          left  join CommentOrder CO\n" +
//         "              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//         "where O.deletedAt IS NULL and  O.company = $accountId and (O.status = 'Rejected' or O.status = 'Kthyer' )",

//       {
//         bind: {
//           accountId: user.accountId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getOrdersByCompany", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getCompletedBranchOrders = async (req, res) => {
//   try {
//     const user = req.user;

//     if (user.branchId === 1) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           " where O.deletedAt IS NULL  and (O.status = 'Completed'  or O.status = 'OnLikuid' or O.status = 'Collected') and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",

//         {
//           bind: {
//             branchId: user.branchId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         " where O.deletedAt IS NULL and (O.status = 'Completed'  or O.status = 'OnLikuid' or O.status = 'Collected') and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",

//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCompletedBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getLikuiduarBranchOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (isSystemAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           " where O.deletedAt IS NULL and O.status = 'Likuiduar'  ORDER BY O.id DESC",

//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     if (user.branchId === 1) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           " where O.deletedAt IS NULL and O.status = 'Likuiduar' and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",

//         {
//           bind: {
//             branchId: user.branchId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       res.json(orders);
//     }
//     const orders = await db.sequelize.query(
//       "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         " where O.deletedAt IS NULL and O.status = 'Likuiduar' and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",

//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCompletedBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const getProblemOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     const date = new Date();

//     if (isSystemAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         "SELECT O.*,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName,DATEDIFF($date,OH.createdAt) AS diff,DATEDIFF($date,CO.createdAt) AS Codate,OH.status,CO.comment as lastComment\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "         left join CommentOrder CO\n" +
//           "               on CO.id = (SELECT id FROM CommentOrder WHERE CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           " where O.deletedAt IS NULL and O.status = 'In Transit' and OH.status !='Order Created'",

//         {
//           bind: {
//             date,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const result = await orders.filter((word) => word.diff > 1);

//       const other = await result.filter((word) => word.Codate > 1);
//       const other1 = await result.filter((word) => word.Codate === null);

//       res.json([...other, ...other1]);
//     }
//     throw new Error("Unauthorized");
//   } catch (e) {
//     req.log.error("error in getCompletedBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getReturnedBranchOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (isSystemAdmin(user.role)) {
//       const firstArray = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           " where O.deletedAt IS NULL and O.status = 'Kthyer' ORDER BY O.id DESC",

//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const vek = await db.sequelize.query(
//         "SELECT O.*\n" +
//           "from `SwitchOrder` O\n" +
//           "  where O.deletedAt IS NULL and O.switched IS NOT NULL and O.return IS NOT NULL  ",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       if (vek.length <= 0) {
//         res.json(firstArray);
//       }
//       const selected = await vek.map((item) => item.old);

//       const secondArray = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "  where O.deletedAt IS NULL and O.id IN (:ids)",
//         {
//           replacements: { ids: selected },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const orders = [...firstArray, ...secondArray];
//       res.json(orders);
//     }
//     if (user.branchId === 1) {
//       const firstArray = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join OrderRoutes OT on O.id = OT.orderId\n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           " where O.deletedAt IS NULL and O.status = 'Kthyer'  ORDER BY O.id DESC",

//         {
//           bind: {
//             branchId: user.branchId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const vek = await db.sequelize.query(
//         "SELECT O.*\n" +
//           "from `SwitchOrder` O\n" +
//           "  where O.deletedAt IS NULL and O.switched IS NOT NULL and O.return IS NOT NULL  ",
//         {
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       if (vek.length <= 0) {
//         res.json(firstArray);
//       }
//       const selected = await vek.map((item) => item.old);

//       const secondArray = await db.sequelize.query(
//         "SELECT O.*, OH.status,OH.comment as commentStatus, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//           "from `Order` O\n" +
//           "         join OrderHistory OH\n" +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           "        join Account A on O.company = A.id \n" +
//           "        join Cities CD on O.destinationCity = CD.id\n" +
//           "        join Countries CU on O.destinationCountry = CU.id\n" +
//           "        join Cities CA on O.originCity = CA.id\n" +
//           "  where O.deletedAt IS NULL and O.id IN (:ids)",
//         {
//           replacements: { ids: selected },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const orders = [...firstArray, ...secondArray];
//       res.json(orders);
//     }
//     const firstArray = await db.sequelize.query(
//       "SELECT O.*, OH.status,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         " where O.deletedAt IS NULL and O.status = 'Kthyer' and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) ORDER BY O.id DESC",

//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const vek = await db.sequelize.query(
//       "SELECT O.*\n" +
//         "from `SwitchOrder` O\n" +
//         "  where O.deletedAt IS NULL and O.switched IS NOT NULL and O.return IS NOT NULL  ",
//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     if (vek.length <= 0) {
//       res.json(firstArray);
//     }
//     const selected = await vek.map((item) => item.old);

//     const secondArray = await db.sequelize.query(
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
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const orders = [...firstArray, ...secondArray];
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCompletedBranchOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getCompletedSuperOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     const orders = await db.sequelize.query(
//       "SELECT O.*,OH.comment as commentStatus,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderHistory OH\n" +
//         "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "where O.deletedAt IS NULL and (O.status = 'Completed'  or O.status = 'OnLikuid') order by id desc",
//       {
//         bind: {
//           branchId: user.branchId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCompletedSuperOrders", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getCourierOrder = async (req, res) => {
//   try {
//     const orders = await db.sequelize.query(
//       " Select OH.status, O.id,OH.createdAt,OH.name\n" +
//         "        from OrderHistory OH\n" +
//         "             join `Order` O on OH.orderId = O.id        \n" +
//         "                      where O.deletedAt IS NULL and O.status = $status     \n" +
//         "order by Oh.createdAt desc",

//       {
//         bind: {
//           status: "In Transit",
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCourierOrder", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const reqForLikuid = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected } = req.body;
//     if (!user.accountId) throw new Error("Unauthorized");
//     const kusht = await TransactionOrders.findAll(
//       {
//         where: {
//           orderId: {
//             [Op.in]: selected,
//           },
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     if (kusht.length > 0) throw new Error("Denied");
//     if (isCompanyAdmin(user.role)) {
//       const details = await Order.findAll({
//         attributes: [
//           [sequelize.fn("sum", sequelize.col("total")), "total_total"],
//           [sequelize.fn("sum", sequelize.col("transport")), "total_transport"],
//         ],
//         where: {
//           id: {
//             [Op.in]: selected,
//           },
//         },
//       });
//       const total = details[0].dataValues.total_total;
//       const transport = details[0].dataValues.total_transport;

//       const trans = await Transactions.create(
//         {
//           total,
//           transportFees: transport,
//         },
//         {
//           transaction,
//         }
//       );

//       const trOrBody = {
//         transactionId: trans.id,
//         orderId: null,
//       };

//       const trOrBodyBulk = selected.map((i) => {
//         return {
//           ...trOrBody,
//           orderId: i,
//         };
//       });
//       await TransactionOrders.bulkCreate(trOrBodyBulk, {
//         transaction,
//       });

//       await transaction.commit();
//       res.json(trans);
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in reqForLikuid", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const getLikuidOrderByIdAcco = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const orders = await db.sequelize.query(
//       "SELECT O.*,FO.orderTotalFee as orderTotalFee,FO.senderCollect as senderCollect,FO.receiverPays as receiverPays, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "         join OrderFees FO\n" +
//         "              on FO.id = (SELECT id FROM OrderFees WHERE OrderFees.deletedAt IS NULL and  OrderFees.orderId = O.id)\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "  where O.deletedAt IS NULL and O.company = $companyId && O.completedAt IS NOT NULL && (O.status = 'Completed' or (O.status ='Rejected'and OT.rejected ='ForLikuid')) order by id DESC",
//       {
//         bind: {
//           companyId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getLikuidOrderByIdAcco", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const onLikuidStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, accountId } = req.body;
//     const account = await Account.findByPk(accountId);

//     if (!account) throw new Error("Unauthorized");

//     const kusht = await TransactionOrders.findAll(
//       {
//         where: {
//           orderId: {
//             [Op.in]: selected,
//           },
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     if (kusht.length > 0) throw new Error("Denied");
//     if (isFinance(user.role)) {
//       const details = await db.sequelize.query(
//         "SELECT  SUM(OS.receiverPays) as total_total,SUM(OS.orderTotalFee) as total_transport,SUM(OS.senderCollect) as total_likuidValue,OS.currency\n" +
//           "from `Order` O\n" +
//           "        join OrderFees OS on O.id = OS.orderId\n" +
//           "  where OS.deletedAt IS NULL and OS.orderId IN (:ids) group by OS.currency",
//         {
//           replacements: { ids: selected },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const rejectedId = await db.sequelize.query(
//         "SELECT  O.id\n" +
//           "from `Order` O\n" +
//           "  where O.deletedAt IS NULL and O.status ='Rejected' and O.id IN (:ids)",
//         {
//           replacements: { ids: selected },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const completedId = await db.sequelize.query(
//         "SELECT  O.id\n" +
//           "from `Order` O\n" +
//           "  where O.deletedAt IS NULL and O.status !='Rejected' and O.id IN (:ids)",
//         {
//           replacements: { ids: selected },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const ids = await completedId.map((items) => items.id);
//       const idsReject = await rejectedId.map((items) => items.id);

//       const order = await OrderFees.findAll(
//         {
//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//           },
//           include: [{ model: Order, attributes: ["code", "status"] }],
//           attributes: {
//             include: [
//               [sequelize.col("code"), "code"],
//               [sequelize.col("status"), "status"],
//               [sequelize.col("name"), "name"],
//               [sequelize.col("content"), "content"],
//               [sequelize.col("originCountry"), "originCountry"],
//             ],

//             exclude: ["updatedAt", "deletedAt"],
//           },

//           order: [["createdAt", "DESC"]],
//         },

//         {
//           transaction,
//         }
//       );
//       const all = await order.filter((item) => item.currency === "ALL");
//       const euro = await order.filter((item) => item.currency === "EUR");
//       const vektor = { all, euro };

//       const orgAll = details.find(({ currency }) => currency === "ALL");
//       const orgEUR = details.find(({ currency }) => currency === "EUR");

//       const totalAll = !orgAll ? 0 : orgAll.total_total;
//       const transportAll = !orgAll ? 0 : orgAll.total_transport;
//       const likuidimAll = !orgAll ? 0 : orgAll.total_likuidValue;
//       const totalEUR = !orgEUR ? 0 : orgEUR.total_total;
//       const transportEUR = !orgEUR ? 0 : orgEUR.total_transport;
//       const likuidimAEUR = !orgEUR ? 0 : orgEUR.total_likuidValue;

//       const code = await generateTransCode(account.cityId, account.id);
//       const trans = await Transactions.create(
//         {
//           total: totalAll,
//           transportFees: transportAll,
//           likuidValue: likuidimAll,
//           totalEUR,
//           transportFeesEUR: transportEUR,
//           likuidValueEUR: likuidimAEUR,
//           code,
//           accountId,
//           status: "OnLikuid",
//           cityId: account.cityId,
//         },
//         {
//           transaction,
//         }
//       );

//       const trOrBody = {
//         transactionId: trans.id,
//         orderId: null,
//       };

//       const trOrBodyBulk = selected.map((i) => {
//         return {
//           ...trOrBody,
//           orderId: i,
//         };
//       });
//       await TransactionOrders.bulkCreate(trOrBodyBulk, {
//         transaction,
//       });

//       await TransactionsHistory.create(
//         {
//           transactionsId: trans.id,
//           status: trans.status,
//           name: user.fullName,
//           createdBy: user.id,
//         },

//         {
//           transaction,
//         }
//       );
//       await Order.update(
//         { status: "OnLikuid", updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: ids,
//             },
//           },
//           transaction,
//         }
//       );
//       await OrderRoutes.update(
//         { rejected: "OnLikuid", updatedAt: new Date() },
//         {
//           where: {
//             orderId: {
//               [Op.in]: idsReject,
//             },
//           },
//           transaction,
//         }
//       );
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
//       const arkaAll = !mainArka ? 0 : mainArka[0].totalALL;
//       const arkaEur = !mainArka ? 0 : mainArka[0].totalEUR;

//       const client = await Zeri.create(
//         {
//           valueALL: likuidimAll,
//           valueEUR: likuidimAEUR,
//           arkaALL: arkaAll - likuidimAll,
//           arkaEUR: arkaEur - likuidimAEUR,
//           tipi: "biznes",
//           status: "Dalje",
//           comment: `Fature likuidimi me nr.${trans.id} - ${account.name} `,
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
//           totalALL: arkaAll - likuidimAll,
//           totalEUR: arkaEur - likuidimAEUR,
//           daljeALL: likuidimAll,
//           daljeEUR: likuidimAEUR,
//           createdBy: user.id,
//           createdAt: new Date(),
//         },
//         {
//           transaction,
//         }
//       );
//       await transaction.commit();
//       res.json({ trans, vektor, account });
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in onLikuidStatus", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const getLikuidStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected } = req.body;
//     if (!isBranchAdmin(user.role)) throw new Error("Unauthorized");
//     const trans = await Transactions.findByPk(selected[0]);
//     if (!trans) throw new Error("Not selected");

//     const translaction = await TransactionsHistory.create(
//       {
//         transactionsId: trans.id,
//         status: "GetLikuid",
//         name: user.fullName,
//         createdBy: user.id,
//       },

//       {
//         transaction,
//       }
//     );

//     await transaction.commit();
//     res.json(translaction);
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in getLikuidStatus", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const completetLikuidStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected } = req.body;
//     if (!isSystemCourierGetter(user.role)) throw new Error("Unauthorized");
//     const trans = await Transactions.findByPk(selected[0]);
//     if (!trans) throw new Error("Not selected");
//     const account = await Account.findByPk(trans.accountId);

//     if (!account) throw new Error("Account not found");

//     const translaction = await TransactionsHistory.create(
//       {
//         transactionsId: trans.id,
//         status: "Likuiduar",
//         name: user.fullName,
//         createdBy: user.id,
//       },

//       {
//         transaction,
//       }
//     );
//     await Transactions.update(
//       { status: "Likuiduar", updatedAt: new Date() },
//       {
//         where: {
//           id: trans.id,
//         },
//         transaction,
//       }
//     );
//     const orders = await TransactionOrders.findAll(
//       {
//         where: {
//           transactionId: trans.id,
//         },
//       },
//       {
//         transaction,
//       }
//     );

//     if (isSystemCourierGetter(user.role)) {
//       const ids = orders.map((item) => item.orderId);
//       const rejectedId = await db.sequelize.query(
//         "SELECT  O.id\n" +
//           "from `Order` O\n" +
//           "  where O.deletedAt IS NULL and O.status ='Rejected' and O.id IN (:ids)",
//         {
//           replacements: { ids: ids },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const completedId = await db.sequelize.query(
//         "SELECT  O.id\n" +
//           "from `Order` O\n" +
//           "  where O.deletedAt IS NULL and O.status !='Rejected' and O.id IN (:ids)",
//         {
//           replacements: { ids: ids },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const idsComple = await completedId.map((items) => items.id);
//       const idsReject = await rejectedId.map((items) => items.id);

//       const oHistory = {
//         orderId: null,
//         vehicle: null,
//         status: "Likuiduar",
//         name: null,
//         comment: null,
//         courierId: null,
//         branchId: null,
//         createdBy: user.id,
//       };
//       if (isCourier(user.role)) {
//         const vehicle = await Vehicles.findOne({
//           where: {
//             courierId: user.id,
//           },
//         });
//         oHistory.vehicle = vehicle.id;
//         oHistory.courierId = user.id;
//         oHistory.name = user.fullName;
//       } else if (isBranchAdmin(user.role)) {
//         const branch = await Branch.findByPk(user.branchId);
//         oHistory.branchId = user.branchId;
//         oHistory.name = branch.name;
//       } else {
//         oHistory.name = "SysAdmin";
//       }
//       const orderHistoryBulk = idsComple.map((i) => {
//         return {
//           ...oHistory,
//           orderId: i,
//         };
//       });
//       await OrderHistory.bulkCreate(orderHistoryBulk, {
//         transaction,
//       });
//       await Order.update(
//         { status: "Likuiduar", updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: idsComple,
//             },
//           },
//           transaction,
//         }
//       );
//       await OrderRoutes.update(
//         { rejected: "Likuiduar", updatedAt: new Date() },
//         {
//           where: {
//             orderId: {
//               [Op.in]: idsReject,
//             },
//           },
//           transaction,
//         }
//       );
//     }

//     await transaction.commit();
//     res.json(translaction);
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in completetLikuidStatus", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };

// export const getValuesCompany = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     if (!user.accountId) throw new Error("Unauthorized");

//     if (isCompanyAdmin(user.role)) {
//       const det3 = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` ,SUM(OS.receiverPays) as orgFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL and  O.status = 'In Transit' and O.company = $branch group by OS.currency",
//         {
//           bind: {
//             branch: user.accountId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const tranAll = det3.find(({ currency }) => currency === "ALL");
//       const tranEUR = det3.find(({ currency }) => currency === "EUR");

//       const inTransitLeke = !tranAll ? 0 : tranAll.orgFees;
//       const inTransitEuro = !tranEUR ? 0 : tranEUR.orgFees;

//       const det4 = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` ,SUM(OS.receiverPays) as orgFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL and  (O.status = 'Completed' or O.status = 'OnLikuid' ) and O.company = $branch group by OS.currency",
//         {
//           bind: {
//             branch: user.accountId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const dorAll = det4.find(({ currency }) => currency === "ALL");
//       const dorEUR = det4.find(({ currency }) => currency === "EUR");

//       const completedLeke = !dorAll ? 0 : dorAll.orgFees;
//       const completedEuro = !dorEUR ? 0 : dorEUR.orgFees;

//       const det5 = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` ,SUM(OS.receiverPays) as orgFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL and  (O.status = 'Rejected' or O.status = 'Kthyer') and O.company = $branch group by OS.currency",
//         {
//           bind: {
//             branch: user.accountId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const rejAll = det5.find(({ currency }) => currency === "ALL");
//       const rejEUR = det5.find(({ currency }) => currency === "EUR");

//       const rejectedLeke = !rejAll ? 0 : rejAll.orgFees;
//       const rejectedEuro = !rejEUR ? 0 : rejEUR.orgFees;
//       const det6 = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` ,SUM(OS.senderCollect) as orgFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL and  (O.status = 'Completed' or O.status = 'OnLikuid' ) and O.company = $branch group by OS.currency",
//         {
//           bind: {
//             branch: user.accountId,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const likAll = det6.find(({ currency }) => currency === "ALL");
//       const likEUR = det6.find(({ currency }) => currency === "EUR");

//       const likuidAll = !likAll ? 0 : likAll.orgFees;
//       const likuidEUR = !likEUR ? 0 : likEUR.orgFees;
//       await transaction.commit();
//       res.json({
//         inTransitLeke,
//         inTransitEuro,
//         completedLeke,
//         completedEuro,
//         rejectedLeke,
//         rejectedEuro,
//         likuidAll,
//         likuidEUR,
//       });
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in getValuesCompany", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const getCollectOrderByBrMa = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const collectOrders = await db.sequelize.query(
//       "SELECT O.*,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "  where O.deletedAt IS NULL and OT.destBranchId = $branchId and (O.status = 'Completed' or O.status = 'Likuiduar' or O.status = 'OnLikuid') and O.collected IS NULL  order by id DESC",
//       {
//         bind: {
//           branchId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const trans = await db.sequelize.query(
//       "SELECT CT.*\n" +
//         "from `CollectTransactions` CT\n" +
//         "  where CT.deletedAt IS NULL and CT.branchId = $branchId and (CT.status = 'OnCollect' or CT.status = 'BrConfirm')",
//       {
//         bind: {
//           branchId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const selected = await trans.map((item) => item.id);
//     const orderColl = await CollectOrders.findAll({
//       where: {
//         transactionId: {
//           [Op.in]: selected,
//         },
//       },
//     });
//     const ids = await orderColl.map((items) => items.orderId);
//     const transitOrders = await collectOrders.filter(
//       ({ id }) => !ids.includes(id)
//     );
//     const orders = await collectOrders.filter(({ id }) => ids.includes(id));

//     res.json({ transitOrders, orders });
//   } catch (e) {
//     req.log.error("error in getLikuidOrderByIdAcco", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const onCollectStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, branchId } = req.body;
//     const branch = await Branch.findByPk(branchId);

//     if (!branch) throw new Error("Branch not ofund");

//     const kusht = await CollectOrders.findAll(
//       {
//         where: {
//           orderId: {
//             [Op.in]: selected,
//           },
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     if (kusht.length > 0) throw new Error("Denied");
//     if (isFinance(user.role)) {
//       const vektor = await OrderFees.findAll(
//         {
//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//           },
//           order: [["createdAt", "ASC"]],
//           include: [{ model: Order, attributes: ["code"] }],
//           attributes: {
//             include: [
//               [sequelize.col("code"), "code"],
//               [sequelize.col("name"), "name"],
//             ],

//             exclude: ["updatedAt", "deletedAt"],
//           },
//         },

//         {
//           transaction,
//         }
//       );
//       const detailsALL = await OrderFees.findAll(
//         {
//           attributes: [
//             [sequelize.fn("sum", sequelize.col("receiverPays")), "total_ALL"],
//           ],

//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//             currency: "ALL",
//           },
//         },
//         {
//           transaction,
//         }
//       );
//       const detailsEUR = await OrderFees.findAll(
//         {
//           attributes: [
//             [sequelize.fn("sum", sequelize.col("receiverPays")), "total_EUR"],
//           ],

//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//             currency: "EUR",
//           },
//         },
//         {
//           transaction,
//         }
//       );

//       const totalALL = detailsALL[0].dataValues.total_ALL;
//       const totalEUR = detailsEUR[0].dataValues.total_EUR;
//       const code = await generateTransCode(branch.cityId, branch.id);

//       const trans = await CollectTransactions.create(
//         {
//           totalALL,
//           totalEUR,
//           branchId,
//           code,
//           status: "OnCollect",
//         },
//         {
//           transaction,
//         }
//       );

//       const trOrBody = {
//         transactionId: trans.id,
//         orderId: null,
//       };

//       const trOrBodyBulk = selected.map((i) => {
//         return {
//           ...trOrBody,
//           orderId: i,
//         };
//       });
//       await CollectOrders.bulkCreate(trOrBodyBulk, {
//         transaction,
//       });

//       await CollectHistory.create(
//         {
//           transactionsId: trans.id,
//           status: trans.status,
//           name: user.fullName,
//           createdBy: user.id,
//         },

//         {
//           transaction,
//         }
//       );

//       await transaction.commit();
//       res.json({ vektor, branch, trans });
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in onCollect", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const onRevertCollect = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, branchId } = req.body;
//     const branch = await Branch.findByPk(branchId);

//     if (!branch) throw new Error("Unauthorized");

//     const kusht = await CollectOrders.findAll(
//       {
//         where: {
//           orderId: {
//             [Op.in]: selected,
//           },
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     if (kusht.length > 0) throw new Error("Denied");
//     if (isFinance(user.role)) {
//       const vektor = await OrderFees.findAll(
//         {
//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//           },
//           include: [{ model: Order, attributes: ["code"] }],
//           attributes: {
//             include: [
//               [sequelize.col("code"), "code"],
//               [sequelize.col("name"), "name"],
//             ],

//             exclude: ["updatedAt", "deletedAt"],
//           },

//           order: [["currency", "DESC"]],
//         },

//         {
//           transaction,
//         }
//       );
//       const detailsALL = await OrderFees.findAll(
//         {
//           attributes: [
//             [sequelize.fn("sum", sequelize.col("receiverPays")), "total_ALL"],
//           ],

//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//             currency: "ALL",
//           },
//         },
//         {
//           transaction,
//         }
//       );
//       const detailsEUR = await OrderFees.findAll(
//         {
//           attributes: [
//             [sequelize.fn("sum", sequelize.col("receiverPays")), "total_EUR"],
//           ],

//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//             currency: "EUR",
//           },
//         },
//         {
//           transaction,
//         }
//       );

//       const totalALL = detailsALL[0].dataValues.total_ALL;
//       const totalEUR = detailsEUR[0].dataValues.total_EUR;
//       const code = await generateTransCode(branch.cityId, branch.id);

//       const trans = await CollectTransactions.create(
//         {
//           totalALL,
//           totalEUR,
//           branchId,
//           code,
//           status: "OnCollect",
//         },
//         {
//           transaction,
//         }
//       );

//       const trOrBody = {
//         transactionId: trans.id,
//         orderId: null,
//       };

//       const trOrBodyBulk = selected.map((i) => {
//         return {
//           ...trOrBody,
//           orderId: i,
//         };
//       });
//       await CollectOrders.bulkCreate(trOrBodyBulk, {
//         transaction,
//       });

//       await CollectHistory.create(
//         {
//           transactionsId: trans.id,
//           status: trans.status,
//           name: user.fullName,
//           createdBy: user.id,
//         },

//         {
//           transaction,
//         }
//       );

//       await transaction.commit();
//       res.json({ vektor, branch, trans });
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in onCollect", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const brConfirmCollectStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected } = req.body;
//     if (!isBranchAdmin(user.role)) throw new Error("Unauthorized");
//     const trans = await CollectTransactions.findByPk(selected[0]);
//     if (!trans) throw new Error("Not selected");
//     const branch = await Branch.findByPk(trans.branchId);

//     if (!branch) throw new Error("Branch not ofund");

//     await CollectOrders.findAll(
//       {
//         where: {
//           transactionId: trans.id,
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     const translaction = await CollectHistory.create(
//       {
//         transactionsId: trans.id,
//         status: "BrConfirm",
//         name: user.fullName,
//         createdBy: user.id,
//       },

//       {
//         transaction,
//       }
//     );
//     await CollectTransactions.update(
//       { status: "BrConfirm", updatedAt: new Date() },
//       {
//         where: {
//           id: trans.id,
//         },
//         transaction,
//       }
//     );

//     await transaction.commit();
//     res.json(translaction);
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in confirmCollected", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };

// export const financeConfirmCollectStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected } = req.body;
//     if (!isFinance(user.role)) throw new Error("Unauthorized");
//     const trans = await CollectTransactions.findByPk(selected[0]);
//     if (!trans) throw new Error("Not selected");
//     const branch = await Branch.findByPk(trans.branchId);

//     if (!branch) throw new Error("Branch not ofund");
//     if (branch.id === 1) {
//       const orders = await CollectOrders.findAll(
//         {
//           where: {
//             transactionId: trans.id,
//           },
//         },
//         {
//           transaction,
//         }
//       );
//       const translaction = await CollectHistory.create(
//         {
//           transactionsId: trans.id,
//           status: "Collected",
//           name: user.fullName,
//           createdBy: user.id,
//         },

//         {
//           transaction,
//         }
//       );
//       await CollectTransactions.update(
//         { status: "Collected", updatedAt: new Date() },
//         {
//           where: {
//             id: trans.id,
//           },
//           transaction,
//         }
//       );
//       const ids = orders.map((item) => item.orderId);

//       await Order.update(
//         { collected: true, updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: ids,
//             },
//           },
//           transaction,
//         }
//       );
//       await transaction.commit();
//       res.json(translaction);
//     }

//     const orders = await CollectOrders.findAll(
//       {
//         where: {
//           transactionId: trans.id,
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     const translaction = await CollectHistory.create(
//       {
//         transactionsId: trans.id,
//         status: "Collected",
//         name: user.fullName,
//         createdBy: user.id,
//       },

//       {
//         transaction,
//       }
//     );
//     await CollectTransactions.update(
//       { status: "Collected", updatedAt: new Date() },
//       {
//         where: {
//           id: trans.id,
//         },
//         transaction,
//       }
//     );
//     const ids = orders.map((item) => item.orderId);

//     await Order.update(
//       { collected: true, updatedAt: new Date() },
//       {
//         where: {
//           id: {
//             [Op.in]: ids,
//           },
//         },
//         transaction,
//       }
//     );
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
//     const totalALL = trans.totalALL || 0;
//     const totalEUR = trans.totalEUR || 0;
//     const client = await Zeri.create(
//       {
//         valueALL: totalALL || 0,
//         valueEUR: totalEUR || 0,
//         arkaALL: all + totalALL,
//         arkaEUR: eur + totalEUR,
//         tipi: "branch",
//         status: "Hyrje",
//         comment: `Fature mbledhje me nr.${trans.id} - ${branch.name} `,
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
//         totalALL: all + totalALL,
//         totalEUR: eur + totalEUR,
//         hyrjeALL: totalALL,
//         hyrjeEUR: totalEUR,
//         createdBy: user.id,
//         createdAt: new Date(),
//       },
//       {
//         transaction,
//       }
//     );
//     await transaction.commit();
//     res.json(translaction);
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in confirmCollected", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const getBilledOrderByBrMa = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const collectOrders = await db.sequelize.query(
//       "SELECT O.*,OS.originBranchFee,CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n" +
//         "from `Order` O\n" +
//         "        join OrderRoutes OT on O.id = OT.orderId\n" +
//         "        join Account A on O.company = A.id \n" +
//         "        join Cities CD on O.destinationCity = CD.id\n" +
//         "        join Countries CU on O.destinationCountry = CU.id\n" +
//         "        join Cities CA on O.originCity = CA.id\n" +
//         "        join OrderFees OS on O.id = OS.orderId\n" +
//         "  where O.deletedAt IS NULL and (OT.orgBranchId  = $branchId or OT.destBranchId = $branchId)  and OS.billed IS NULL order by id DESC",
//       {
//         bind: {
//           branchId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const trans = await db.sequelize.query(
//       "SELECT BT.*\n" +
//         "from `BilledTransactions` BT\n" +
//         "  where BT.deletedAt IS NULL and BT.branchId = $branchId and (BT.status = 'OnBilled' or BT.status = 'BrConfirm')",
//       {
//         bind: {
//           branchId: id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     const selected = await trans.map((item) => item.id);
//     const orderColl = await CollectOrders.findAll({
//       where: {
//         transactionId: {
//           [Op.in]: selected,
//         },
//       },
//     });
//     const ids = await orderColl.map((items) => items.orderId);
//     const transitOrders = await collectOrders.filter(
//       ({ id }) => !ids.includes(id)
//     );
//     const orders = await collectOrders.filter(({ id }) => ids.includes(id));

//     res.json({ transitOrders, orders });
//   } catch (e) {
//     req.log.error("error in getLikuidOrderByIdAcco", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const onBilledStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { id, month, year } = req.body.data;
//     const branch = await Branch.findByPk(id);
//     const dateObj = new Date();
//     const backMonth = dateObj.getUTCMonth() + 1;
//     const backYear = dateObj.getUTCFullYear();
//     if (
//       month.toString() === backMonth.toString() &&
//       year.toString() === backYear.toString()
//     ) {
//       throw new Error("You are in the same month of the year");
//     }
//     if (!branch) throw new Error("Not found");

//     const kusht = await BilledTransactions.findAll(
//       {
//         where: {
//           [Op.and]: [{ branchId: id }, { month }, { year }],
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     if (kusht.length > 0) throw new Error("Denied");

//     if (isFinanceOrAAdmin(user.role)) {
//       const org = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.orgBranchId = $branch group by OS.currency",
//         {
//           bind: {
//             branch: branch.id,
//             year,
//             month,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );

//       const dest = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` ,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL  and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.destBranchId = $branch group by OS.currency",
//         {
//           bind: {
//             branch: branch.id,
//             year,
//             month,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const countDest = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` \n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL  and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.destBranchId = $branch and OT.destBranchId != OT.orgBranchId  ",
//         {
//           bind: {
//             branch: branch.id,
//             year,
//             month,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const countOrg = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` \n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL  and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.orgBranchId = $branch ",
//         {
//           bind: {
//             branch: branch.id,
//             year,
//             month,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const orgAll = org.find(({ currency }) => currency === "ALL");
//       const orgEUR = org.find(({ currency }) => currency === "EUR");
//       const destAll = dest.find(({ currency }) => currency === "ALL");
//       const destEUR = dest.find(({ currency }) => currency === "EUR");

//       const xall = !orgAll ? 0 : orgAll.orgFees;
//       // const mxall = !orgAll ? 0 : orgAll.mainFees;

//       const Yall = !destAll ? 0 : destAll.destFees;
//       // const myall = !destAll ? 0 : destAll.mainFees;

//       const xeuro = !orgEUR ? 0 : orgEUR.orgFees;
//       // const mxeuro = !orgEUR ? 0 : orgEUR.mainFees;

//       const Yeuro = !destEUR ? 0 : destEUR.destFees;
//       // const myeuro = !destEUR ? 0 : destEUR.mainFees;
//       const countX = !countOrg ? 0 : countOrg[0].count;
//       const county = !countDest ? 0 : countDest[0].count;

//       const code = await generateTransCode(branch.cityId, branch.id);

//       const trans = await BilledTransactions.create(
//         {
//           totalALL: xall + Yall,
//           totalEUR: xeuro + Yeuro,
//           branchId: branch.id,
//           code,
//           ordersIn: county,
//           ordersOut: countX,
//           year,
//           month,
//           status: "OnBilled",
//         },
//         {
//           transaction,
//         }
//       );

//       await BilledHistory.create(
//         {
//           transactionsId: trans.id,
//           status: trans.status,
//           name: user.fullName,
//           createdBy: user.id,
//         },

//         {
//           transaction,
//         }
//       );
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
//           valueALL: xall + Yall,
//           valueEUR: xeuro + Yeuro,
//           arkaALL: all - xall - Yall,
//           arkaEUR: eur - xeuro - Yeuro,
//           tipi: "branch",
//           status: "Dalje",
//           comment: `Fature likuidimi me nr.${trans.id} - ${branch.name}`,
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
//           totalALL: all - xall - Yall,
//           totalEUR: eur - xeuro - Yeuro,
//           daljeALL: xall + Yall,
//           daljeEUR: xeuro + Yeuro,
//           createdBy: user.id,
//           createdAt: new Date(),
//         },
//         {
//           transaction,
//         }
//       );
//       await transaction.commit();
//       res.json({ branch, trans });
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in onCollect", { error: e.message });
//   }
// };

// export const getCourierPickup = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!isCourier(user.role)) throw new Error("Not Authorized");
//     const orders = await db.sequelize.query(
//       "SELECT O.*,\n" +
//         "       OH.comment    as commentStatus,\n" +
//         "       A.name        as companyName,\n" +
//         "       A.addressText as companyAddress,\n" +
//         "       A.phone       as companyPhone,\n" +
//         "       PT.name       as packageName,\n" +
//         "       CO.name       as orgCity,\n" +
//         "       CD.name       as destCity,\n" +
//         "       COO.name      as orgCountry,\n" +
//         "       COD.name      as destCountry\n" +
//         "from `Order` O\n" +
//         "         join OrderRoutes R on O.id = R.orderId\n" +
//         "         join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id AND OrderHistory.deletedAt IS NULL ORDER BY id DESC LIMIT 1)\n" +
//         "         join Account A on O.company = A.id\n" +
//         "         join Cities CO on O.originCity = CO.id\n" +
//         "         join Cities CD on O.destinationCity = CD.id\n" +
//         "         join Countries COO on O.originCountry = COO.id\n" +
//         "         join Countries COD on O.destinationCountry = COD.id\n" +
//         "         join PackageTypes PT on O.packageType = PT.id\n" +
//         "where O.status = 'In Transit' AND OH.status = 'toPickUpFromCourier' AND OH.courierId = $id AND O.deletedAt IS NULL",
//       {
//         bind: {
//           id: user.id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCourierPickup", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };

// export const getCourierDeliverOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!isCourier(user.role)) throw new Error("Not Authorized");
//     const orders = await db.sequelize.query(
//       "SELECT O.*,\n" +
//         "       OH.comment    as commentStatus,\n" +
//         "       A.name        as companyName,\n" +
//         "       A.addressText as companyAddress,\n" +
//         "       A.phone       as companyPhone,\n" +
//         "       PT.name       as packageName,\n" +
//         "       CO.name       as orgCity,\n" +
//         "       CD.name       as destCity,\n" +
//         "       COO.name      as orgCountry,\n" +
//         "       COD.name      as destCountry\n" +
//         "from `Order` O\n" +
//         "         join OrderRoutes R on O.id = R.orderId\n" +
//         "         join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id AND OrderHistory.deletedAt IS NULL ORDER BY id DESC LIMIT 1)\n" +
//         "         join Account A on O.company = A.id\n" +
//         "         join Cities CO on O.originCity = CO.id\n" +
//         "         join Cities CD on O.destinationCity = CD.id\n" +
//         "         join Countries COO on O.originCountry = COO.id\n" +
//         "         join Countries COD on O.destinationCountry = COD.id\n" +
//         "         join PackageTypes PT on O.packageType = PT.id\n" +
//         "where O.status = 'In Transit' AND OH.status = 'toCourier' AND OH.courierId = $id AND O.deletedAt IS NULL",
//       {
//         bind: {
//           id: user.id,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );
//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in getCourierDeliverOrders", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };

// export const getCourierScanOrder = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!isCourier(user.role)) throw new Error("Not Authorized");
//     const { code } = req.params;
//     const order = await Order.findOne({ where: { code } });
//     res.json(order);
//   } catch (e) {
//     req.log.error("error in getCourierScanOrder", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };

// export const courierChangeOrderStatus = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!isCourier(user.role)) throw new Error("Not Authorized");
//     const { code } = req.body;
//     const order = await Order.findOne({ where: { code } });

//     res.json(order);
//   } catch (e) {
//     req.log.error("error in getCourierScanOrder", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };

// export const brConfirmBilledStatus = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { id } = req.params;
//     if (!isBranchAdmin(user.role)) throw new Error("Unauthorized");
//     const trans = await BilledTransactions.findByPk(id);
//     if (!trans) throw new Error("Not selected");
//     await BilledTransactions.update(
//       { status: "Billed", updatedAt: new Date() },
//       {
//         where: {
//           id: trans.id,
//         },
//         transaction,
//       }
//     );
//     await BilledHistory.create(
//       {
//         transactionsId: trans.id,
//         status: "Billed",
//         name: user.fullName,
//         createdBy: user.id,
//       },

//       {
//         transaction,
//       }
//     );

//     await transaction.commit();
//     res.json("done");
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in confirmCollected", { error: e.message });
//     res.status(500).json({ error: e.message });
//   }
// };
// export const addCommentOrderById = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { id, comment } = req.body;
//     if (isBranchOrAAdminOrCourier(user.role)) {
//       const order = await Order.findOne({
//         where: {
//           id,
//         },
//       });
//       if (!order) throw new Error("No order found");
//       const oHistory = {
//         orderId: order.id,
//         comment,
//         name: null,
//         createdBy: user.id,
//         read: false,
//       };
//       if (isCourier(user.role)) {
//         oHistory.name = user.fullName;
//       } else if (isBranchAdmin(user.role)) {
//         const branch = await Branch.findByPk(user.branchId);

//         oHistory.name = branch.name;
//       } else {
//         oHistory.name = "Admini Bip";
//       }

//       const orderHistory = await CommentOrder.create(oHistory, { transaction });

//       await transaction.commit();
//       res.json(orderHistory);
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in rejectOrCompleteOrder", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const orderSumPickedFromCourier = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, courierId, sumALL, sumEUR } = req.body;
//     const courier = await User.findByPk(courierId);
//     if (!courier) throw new Error("Nuk ka korier me kete Id");
//     if (courier.branchId !== 1) {
//       if (isSystemCourierGetter(user.role)) {
//         const ids = selected.toString();
//         const code = new Date().getTime();

//         await OrderRoutes.update(
//           { picked: true, updatedAt: new Date() },
//           {
//             where: {
//               orderId: {
//                 [Op.in]: selected,
//               },
//             },
//             transaction,
//           }
//         );
//         const trans = await CourierTransactions.create(
//           {
//             ids,
//             courierId,
//             name: courier.fullName,
//             code,
//             totalALL: sumALL,
//             totalEUR: sumEUR,
//             createdBy: user.id,
//             branchId: courier.branchId,
//           },

//           {
//             transaction,
//           }
//         );
//         transaction.commit();
//         res.json(trans);
//       }
//       throw new Error("Not authorized 1");
//     }

//     if (isSystemCourierGetter(user.role)) {
//       const ids = selected.toString();
//       const code = new Date().getTime();

//       await OrderRoutes.update(
//         { picked: true, updatedAt: new Date() },
//         {
//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//           },
//           transaction,
//         }
//       );
//       const trans = await CourierTransactions.create(
//         {
//           ids,
//           courierId,
//           name: courier.fullName,
//           code,
//           totalALL: sumALL,
//           totalEUR: sumEUR,
//           createdBy: user.id,
//           branchId: courier.branchId,
//         },

//         {
//           transaction,
//         }
//       );
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
//           valueALL: sumALL || 0,
//           valueEUR: sumEUR || 0,
//           arkaALL: all + sumALL,
//           arkaEUR: eur + sumEUR,
//           tipi: "korier",
//           status: "Hyrje",
//           comment: `Fature mbledhje me nr.${trans.id} per korierin ${trans.name}  `,
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
//           totalALL: all + sumALL,
//           totalEUR: eur + sumEUR,
//           hyrjeALL: sumALL,
//           hyrjeEUR: sumEUR,
//           createdBy: user.id,
//           createdAt: new Date(),
//         },
//         {
//           transaction,
//         }
//       );
//       transaction.commit();
//       res.json(trans);
//     }
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in toPickedFromCourier", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const orderRejectedSumPickedFromCourier = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, courierId } = req.body;
//     const courier = await User.findByPk(courierId);
//     if (!courier) throw new Error("Nuk ka korier me kete Id");
//     if (isSystemCourierGetter(user.role)) {
//       await OrderRoutes.update(
//         { picked: true, updatedAt: new Date() },
//         {
//           where: {
//             orderId: {
//               [Op.in]: selected,
//             },
//           },
//           transaction,
//         }
//       );
//       transaction.commit();
//       res.json("done");
//     }
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in toPickedFromCourier", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const switchOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const createdBy = req.user.id;
//     const { id, posta, price, currency } = req.body;
//     const user = req.user;
//     let busines, fees, originCity, originCountry, sender;
//     sender = user.fullName || `${user.firstName} ${user.lastName}`;
//     if (!isCompanyAdminOrBranchManager(user.role)) {
//       throw new Error("Not Authorized");
//     }
//     const oldOrder = await Order.findByPk(id);
//     if (!oldOrder) throw new Error("Not a old order");
//     const {
//       name,
//       company,
//       contact,
//       code,
//       addressText,
//       content,
//       taxNr,
//       weight,
//       discount,
//       canOpen,
//       express,
//       fragile,
//       packageType,
//       destinationCity,
//       destinationCountry,
//     } = oldOrder;
//     const packed = await PackageTypes.findByPk(parseInt(packageType));

//     if (isCompanyAdmin(user.role)) {
//       busines = await Account.findByPk(user.accountId);
//       fees = await AccountFees.findOne({ where: { accountId: busines.id } });
//       if (packed.id === 1) {
//         packed.cost.in = fees.inCity;
//         packed.cost.out = fees.finalCost;
//       }
//       if (packed.id === 2) {
//         packed.cost.ks = fees.taxKs;
//         packed.cost.mn = fees.taxMq;
//         packed.cost.mq = fees.taxMn;
//       }
//       // 300
//       originCity = busines.cityId;
//       originCountry = busines.countryId;
//       // branch = await Branch.findOne({ where: { cityId: company.cityId } })
//       sender = busines.name;
//       // branchId = company.branchId || null
//     }
//     if (isBranchAdmin(user.role) && company) {
//       busines = await Account.findByPk(company);
//       fees = await AccountFees.findOne({ where: { accountId: busines.id } });
//       if (packed.id === 1) {
//         packed.cost.in = fees.inCity;
//         packed.cost.out = fees.finalCost;
//       }
//       if (packed.id === 2) {
//         packed.cost.ks = fees.taxKs;
//         packed.cost.mn = fees.taxMq;
//         packed.cost.mq = fees.taxMn;
//       }
//       // 300
//       originCity = busines.cityId;
//       originCountry = busines.countryId;
//       // branch = await Branch.findOne({ where: { cityId: company.cityId } })
//       sender = busines.name;
//       // branchId = company.branchId || null
//     }
//     const routes = await defineRoutes(
//       originCity,
//       destinationCity,
//       originCountry,
//       destinationCountry
//     );
//     const TODAY_START = new Date().setHours(0, 0, 0, 0);
//     const NOW = new Date();
//     const countOrders = await Order.count({
//       where: {
//         company: busines.id,
//         createdAt: {
//           [Op.gt]: TODAY_START,
//           [Op.lt]: NOW,
//         },
//       },
//     });
//     const newcode = `ND-${code}`;
//     const kusht = await SwitchOrder.findOne(
//       {
//         where: {
//           old: oldOrder.id,
//         },
//       },
//       {
//         transaction,
//       }
//     );
//     if (kusht) throw new Error("this order has been replaced");

//     const order = await Order.create(
//       {
//         nr: countOrders + 1,
//         code: newcode,
//         name,
//         packageType,
//         weight,
//         comment: "",
//         contact,
//         addressText,
//         content,
//         notes: `Ndërrohet me porosinë ${code}`,
//         transport:
//           destinationCity === originCity ? fees.inCity : fees.finalCost,
//         total: 0,
//         type: "Ndërrim",
//         price: parseFloat(parseFloat(price).toFixed(2)),
//         taxNr,
//         currency: currency || "LEKE",
//         discount,
//         company: busines.id || null,
//         canOpen,
//         express,
//         fragile,
//         originCity: originCity || 1,
//         destinationCity: destinationCity || 1,
//         originCountry: originCountry || 1,
//         destinationCountry: destinationCountry || 1,
//         createdBy,
//       },
//       { transaction }
//     );
//     const calculatedFees = await newFeeCalculation(
//       order,
//       packed,
//       destinationCountry !== originCountry,
//       routes.fromKS,
//       routes.fromMQ
//     );
//     let finaleFee = calculatedFees.total;
//     const postaNr =
//       posta === parseInt(posta)
//         ? parseInt(posta)
//         : parseFloat(parseFloat(posta).toFixed(2));
//     if (postaNr >= 0 && postaNr !== order.transport) {
//       finaleFee = postaNr;
//     }
//     order.transport = finaleFee;
//     order.total = finaleFee + order.price;
//     await order.save({ transaction });
//     await OrderFees.create(
//       {
//         orderId: order.id,
//         senderCollect: order.price + (finaleFee - calculatedFees.total),
//         receiverPays: order.price + finaleFee,
//         orderTotalFee: calculatedFees.total,
//         originBranchFee: calculatedFees.origin,
//         destinationBranchFee: calculatedFees.destination,
//         mainFee: calculatedFees.main,
//         currency,
//       },
//       { transaction }
//     );
//     await OrderRoutes.create(
//       {
//         orderId: order.id,
//         orgBranchId: routes.origin.id,
//         destBranchId: routes.destination.id,
//       },
//       { transaction }
//     );
//     await OrderHistory.create(
//       {
//         orderId: order.id,
//         vehicle: null,
//         status: "Order Created",
//         branchId: null,
//         name: user.fullName,
//         createdBy,
//       },
//       { transaction }
//     );
//     await SwitchOrder.create(
//       {
//         accountId: busines.id,
//         old: oldOrder.id,
//         new: order.id,
//         switched: null,
//         createdBy,
//       },
//       { transaction }
//     );
//     transaction.commit();
//     res.json({
//       ...order.toJSON(),
//       sender,
//     });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in create order", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const getSwitchedBranchOrders = async (req, res) => {
//   try {
//     const user = req.user;
//     if (!isSystemCourierGetter(user.role)) {
//       throw new Error("Unauthorized");
//     }
//     const vek = await db.sequelize.query(
//       "SELECT O.*\n" +
//         "from `SwitchOrder` O\n" +
//         "  where O.deletedAt IS NULL and O.switched IS NOT NULL and O.return IS NULL  ",
//       {
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     const selected = await vek.map((item) => item.old);

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
//         type: sequelize.QueryTypes.SELECT,
//       }
//     );

//     res.json(orders);
//   } catch (e) {
//     req.log.error("error in get business", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };

// export const generateMultipleTags = async (req, res) => {
//   try {
//     const { user } = req;
//     const { ids, format, height, width, singlePage } = req.body;
//     let company = null;
//     let findOrdersQuery =
//       "SELECT O.*, A.name as companyName \n" +
//       "from `Order` O join Account A\n" +
//       " on O.company = A.id\n" +
//       " where O.id IN (:ids)";
//     if (isCompanyAdmin(user.role)) {
//       company = await Account.findByPk(user.accountId);
//       findOrdersQuery += ` AND O.company = ${company.id}`;
//     }
//     const orders = await db.sequelize.query(findOrdersQuery, {
//       replacements: {
//         ids,
//       },
//       type: sequelize.QueryTypes.SELECT,
//     });
//     const result = [];
//     const countries = await Countries.findAll({
//       attributes: ["id", "code", "name"],
//       include: [{ model: Cities, as: "cities", attributes: ["id", "name"] }],
//     });
//     const addZero = (i) => {
//       if (i < 10) {
//         i = `0${i}`;
//       }
//       return i;
//     };
//     for (const order of orders) {
//       const orgCountry = countries.find((i) => i.id === order.originCountry);
//       const destCountry =
//         order.originCountry === order.destinationCountry
//           ? orgCountry
//           : countries.find((i) => i.id === order.destinationCountry);
//       // const orgCity = orgCountry.cities.find(i => i.id === order.originCity)
//       const destCity = destCountry.cities.find(
//         (i) => i.id === order.destinationCity
//       );
//       const barcode = await generateBarcode(order.code);
//       const created =
//         typeof createdAt === "object"
//           ? order.createdAt
//           : new Date(order.createdAt);
//       const h = addZero(created.getHours());
//       const m = addZero(created.getMinutes());
//       const d = addZero(created.getDate());
//       const mo = addZero(created.getMonth() + 1);
//       const y = addZero(created.getFullYear());
//       const createdDate = `${h}:${m} - ${d}/${mo}/${y}`;
//       const companyName =
//         company && company.name ? company.name : order.companyName;
//       const newOrderObject = {
//         receiver: order.name,
//         sender: [2, 3].includes(order.originCountry) ? null : companyName,
//         phone: order.contact,
//         notes: order.notes,
//         content: order.content,
//         addressText: order.addressText,
//         destCity: destCity.name,
//         destCountry: destCountry.name,
//         price: order.price,
//         transport: order.transport,
//         total: order.total,
//         currency: order.currency === "ALL" ? "Leke" : "Euro",
//         isExpress: order.express ? "PO" : "JO",
//         fragile: order.fragile,
//         canOpen: order.canOpen ? "PO" : "JO",
//         createdDate,
//         barcode,
//         type: order.type === "Ndërrim" ? "Ndërrim" : "",
//       };
//       result.push(newOrderObject);
//     }
//     let options = null;
//     let sPage = !!singlePage;
//     if (height && width) {
//       options = {
//         width,
//         height,
//         orientation: "portrait",
//       };
//     } else if (format && format !== "sp") {
//       options = {
//         format: "A4",
//         orientation: "portrait",
//         border: "10mm",
//       };
//     } else if (format && format === "sp") {
//       sPage = true;
//       options = {
//         width: 378,
//         height: 567,
//         orientation: "portrait",
//       };
//     }

//     const pdf = await generatePDFOrdersTags(result, options, sPage);
//     res.contentType("application/pdf");
//     res.send(pdf);
//   } catch (e) {
//     req.log.error("error in generateMultipleTags", { error: e.message, e });
//     return res.status(500).json({ error: e.message });
//   }
// };
// const createOrderFromKS = async (user, data, transaction, countOrders) => {
//   try {
//     const packageType = await PackageTypes.findByPk(2);
//     const parseCity = data.Qyteti.slice(0, -1);
//     console.log("parseCity :", parseCity);
//     const city = await Cities.findOne({
//       where: { name: { [Op.like]: `%${parseCity}%` } },
//     });
//     console.log("city :", city);
//     const originCity = 94; // Prishtina
//     const originCountry = 2; // Kosovo
//     const destinationCountry = 1;
//     const destinationCity = city.id;
//     const sender = "";
//     // Kodi Marresi Kontakt Adresa Qyteti Shenim Totali
//     const kodi = data.Kodi;
//     const fullName = data.Marresi;
//     const phone = data.Kontakt;
//     const address = data.Adresa;
//     const notes = data.Shenim;
//     const canOpen = ["po", "Po", "PO"].includes(data.Hapet);
//     const fragile = ["po", "Po", "PO"].includes(data.Delikate);
//     const total = data.Totali;
//     const routes = await defineRoutes(
//       originCity,
//       destinationCity,
//       originCountry,
//       destinationCountry
//     );
//     // console.log('routes :', routes)
//     // const TODAY_START = new Date().setHours(0, 0, 0, 0)
//     // const NOW = new Date()
//     // const countOrders = await Order.count({
//     //   where: {
//     //     company: user.accountId,
//     //     createdAt: {
//     //       [Op.gt]: TODAY_START,
//     //       [Op.lt]: NOW
//     //     }
//     //   }
//     // })
//     const code = await generateOrderCode(
//       originCity,
//       user.accountId,
//       countOrders + 1,
//       destinationCity
//     );
//     const order = await Order.create(
//       {
//         nr: countOrders + 1,
//         code,
//         name: fullName,
//         packageType: packageType.id,
//         weight: 1,
//         comment: kodi,
//         contact: phone,
//         addressText: address,
//         content: kodi,
//         notes,
//         transport: 0,
//         total,
//         type: "PAKO",
//         price: parseFloat(parseFloat(total).toFixed(2)),
//         taxNr: "",
//         currency: "EUR",
//         discount: 0,
//         company: user.accountId,
//         canOpen,
//         express: false,
//         fragile,
//         originCity: originCity || 1,
//         destinationCity: destinationCity || 1,
//         originCountry,
//         destinationCountry: destinationCountry || 1,
//         createdBy: user.id,
//       },
//       { transaction }
//     );
//     const calculatedFees = await newFeeCalculation(
//       order,
//       packageType,
//       true,
//       true
//     );
//     let finaleFee = 0;
//     const postaNr = 0;
//     if (postaNr >= 0 && postaNr !== order.transport) {
//       finaleFee = postaNr;
//     }
//     order.transport = finaleFee;
//     order.total = finaleFee + order.price;
//     await order.save({ transaction });
//     let senderCollect = order.price + (finaleFee - calculatedFees.total);
//     let receiverPays = order.price + finaleFee;
//     if (routes.fromKS) {
//       senderCollect = order.price + (finaleFee - calculatedFees.main);
//       receiverPays = order.price + finaleFee;
//     }
//     await OrderFees.create(
//       {
//         orderId: order.id,
//         senderCollect,
//         receiverPays,
//         orderTotalFee: calculatedFees.total,
//         originBranchFee: calculatedFees.origin,
//         destinationBranchFee: calculatedFees.destination,
//         mainFee: calculatedFees.main,
//         currency: "EUR",
//       },
//       { transaction }
//     );
//     console.log("order :", order);
//     await OrderRoutes.create(
//       {
//         orderId: order.id,
//         orgBranchId: routes.origin.id,
//         destBranchId: routes.destination.id,
//       },
//       { transaction }
//     );
//     await OrderHistory.create(
//       {
//         orderId: order.id,
//         vehicle: null,
//         status: "Order Created",
//         branchId: null,
//         name: user.fullName,
//         createdBy: user.id,
//       },
//       { transaction }
//     );

//     return {
//       ...order.toJSON(),
//       sender,
//     };
//   } catch (e) {
//     console.log("e.message() :", e.message);
//     throw new Error("error in createOrderFromKS, insert multiple orders");
//   }
// };
// export const uploadExcel = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const ordersFile = req.files.orders;
//     const excel = excelToJson({
//       source: ordersFile.data,
//       columnToKey: {
//         A: "Kodi",
//         B: "Marresi",
//         C: "Kontakt",
//         D: "Adresa",
//         E: "Qyteti",
//         F: "Shenim",
//         G: "Hapet",
//         H: "Delikate",
//         I: "Totali",
//       },
//     });
//     // Kodi Marresi Kontakt Adresa Qyteti Shenim Totali

//     const orders = excel.Sheet1;
//     const TODAY_START = new Date().setHours(0, 0, 0, 0);
//     const NOW = new Date();
//     let countOrders = await Order.count({
//       where: {
//         company: req.user.accountId,
//         createdAt: {
//           [Op.gt]: TODAY_START,
//           [Op.lt]: NOW,
//         },
//       },
//     });
//     for (const order of orders) {
//       if (order.Kodi === "Kodi") {
//         continue;
//       }
//       await createOrderFromKS(req.user, order, transaction, countOrders);
//       countOrders++;
//     }
//     transaction.commit();
//     res.json(true);
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in uploadExcel, insert multiple orders", {
//       error: e.message,
//       e,
//     });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const downloadExcel = async (req, res) => {
//   try {
//     res.download(
//       path.join(__dirname, "../templates/import.xls"),
//       function (err) {
//         console.log(err);
//       }
//     );
//   } catch (e) {
//     req.log.error("error in downloadExcel, download template", {
//       error: e.message,
//       e,
//     });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const transferOrderToBr = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { selected, courierId } = req.body;
//     const branch = await Branch.findByPk(courierId);

//     if (!branch) throw new Error("Nuk ka branch me kete Id");

//     if (isSystemAdmin(user.role)) {
//       const oHistory = {
//         orderId: null,
//         vehicle: null,
//         status: "Ne Magazine",
//         name: branch.name,
//         comment: null,
//         courierId: null,
//         branchId: branch.id,
//         createdBy: user.id,
//       };
//       let newSelected = [];
//       if (!Array.isArray(selected)) {
//         newSelected = [selected];
//       } else {
//         newSelected = selected;
//       }

//       const orderHistoryBulk = newSelected.map((i) => {
//         return {
//           ...oHistory,
//           orderId: i,
//         };
//       });
//       const orderHistory = await OrderHistory.bulkCreate(orderHistoryBulk, {
//         transaction,
//       });
//       await OrderRoutes.update(
//         { destBranchId: branch.id, updatedAt: new Date() },
//         {
//           where: {
//             orderId: {
//               [Op.in]: newSelected,
//             },
//           },
//           transaction,
//         }
//       );
//       transaction.commit();
//       res.json(orderHistory);
//     }
//     res.status(500).json({ error: "Not Permited" });
//   } catch (e) {
//     transaction.rollback();
//     req.log.error("error in transferOrder", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
// export const onBilledStatusBetweenDate = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const user = req.user;
//     const { date1, date2, id } = req.body.data;

//     const month = new Date(date1).getUTCMonth() + 1;

//     const year = new Date(date1).getUTCFullYear();

//     const branch = await Branch.findByPk(id);

//     if (!branch) throw new Error("Not found");

//     if (isFinanceOrAAdmin(user.role)) {
//       const org = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL and O.completedAt BETWEEN $date1 AND $date2  and OT.orgBranchId = $branch group by OS.currency",
//         {
//           bind: {
//             branch: branch.id,
//             date1,
//             date2,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );

//       const dest = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` ,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL  and O.completedAt BETWEEN $date1 AND $date2  and OT.destBranchId = $branch group by OS.currency",
//         {
//           bind: {
//             branch: branch.id,
//             date1,
//             date2,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const countDest = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` \n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL  and O.completedAt BETWEEN $date1 AND $date2  and OT.destBranchId = $branch and OT.destBranchId != OT.orgBranchId  ",
//         {
//           bind: {
//             branch: branch.id,
//             date1,
//             date2,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const countOrg = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OS.id) as `count` \n" +
//           "                       from `Order` O\n" +
//           "                       join OrderRoutes OT on O.id = OT.orderId\n" +
//           "                       join OrderFees OS on O.id = OS.orderId\n" +
//           "  where O.deletedAt IS NULL and O.completedAt BETWEEN $date1 AND $date2  and OT.orgBranchId = $branch ",
//         {
//           bind: {
//             branch: branch.id,
//             date1,
//             date2,
//           },
//           type: sequelize.QueryTypes.SELECT,
//         }
//       );
//       const orgAll = org.find(({ currency }) => currency === "ALL");
//       const orgEUR = org.find(({ currency }) => currency === "EUR");
//       const destAll = dest.find(({ currency }) => currency === "ALL");
//       const destEUR = dest.find(({ currency }) => currency === "EUR");

//       const xall = !orgAll ? 0 : orgAll.orgFees;
//       // const mxall = !orgAll ? 0 : orgAll.mainFees;

//       const Yall = !destAll ? 0 : destAll.destFees;
//       // const myall = !destAll ? 0 : destAll.mainFees;

//       const xeuro = !orgEUR ? 0 : orgEUR.orgFees;
//       // const mxeuro = !orgEUR ? 0 : orgEUR.mainFees;

//       const Yeuro = !destEUR ? 0 : destEUR.destFees;
//       // const myeuro = !destEUR ? 0 : destEUR.mainFees;
//       const countX = !countOrg ? 0 : countOrg[0].count;
//       const county = !countDest ? 0 : countDest[0].count;

//       const code = await generateTransCode(branch.cityId, branch.id);

//       const trans = await BilledTransactions.create(
//         {
//           totalALL: xall + Yall,
//           totalEUR: xeuro + Yeuro,
//           branchId: branch.id,
//           code,
//           ordersIn: county,
//           ordersOut: countX,
//           year,
//           month,
//           start: date1,
//           end: date2,
//           status: "OnBilled",
//         },
//         {
//           transaction,
//         }
//       );

//       await BilledHistory.create(
//         {
//           transactionsId: trans.id,
//           status: trans.status,
//           name: user.fullName,
//           createdBy: user.id,
//         },

//         {
//           transaction,
//         }
//       );
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
//           valueALL: xall + Yall,
//           valueEUR: xeuro + Yeuro,
//           arkaALL: all - xall - Yall,
//           arkaEUR: eur - xeuro - Yeuro,
//           tipi: "branch",
//           status: "Dalje",
//           comment: `Fature likuidimi me nr.${trans.id} - ${branch.name}`,
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
//           totalALL: all - xall - Yall,
//           totalEUR: eur - xeuro - Yeuro,
//           daljeALL: xall + Yall,
//           daljeEUR: xeuro + Yeuro,
//           createdBy: user.id,
//           createdAt: new Date(),
//         },
//         {
//           transaction,
//         }
//       );
//       await transaction.commit();
//       res.json({ branch, trans });
//     } else {
//       res.status(500).json({ error: "Not Permited" });
//     }
//   } catch (e) {
//     await transaction.rollback();
//     req.log.error("error in onCollect", { error: e.message });
//   }
// };
// export const getTransactionByOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction();

//   try {
//     const { id } = req.params;
//     const user = req.user;
//     if (!isSystemAdmin(user.role)) throw new Error("not allowed");

//     const order = await Order.findByPk(id);
//     if (!order) throw new Error("error in order id");

//     const procces = {
//       trans: null,
//       collected: null,
//     };
//     const transOrder = await TransactionOrders.findOne({
//       where: {
//         orderId: id,
//       },
//       transaction,
//     });

//     if (!transOrder) {
//       procces.trans = null;
//     }
//     const dest = await db.sequelize.query(
//       "SELECT O.code as code,O.createdAt as date ,OS.name as name\n" +
//         "from `Transactions` O \n" +
//         "                       join Account OS on O.accountId = OS.id\n" +
//         "  where O.deletedAt IS NULL and O.id = $id",
//       {
//         bind: {
//           id: transOrder.transactionId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       },
//       {
//         transaction,
//       }
//     );
//     const fat = {
//       code: dest[0].code,
//       date: dest[0].date,
//       name: dest[0].name,
//     };
//     procces.trans = fat;

//     const transColl = await CollectOrders.findOne({
//       where: {
//         orderId: id,
//       },
//       transaction,
//     });
//     if (!transColl) {
//       procces.collected = null;
//     }
//     const org = await db.sequelize.query(
//       "SELECT O.code as code,O.createdAt as date ,OS.name as name\n" +
//         "from `CollectTransactions` O \n" +
//         "                       join Account OS on O.branchId = OS.id\n" +
//         "  where O.deletedAt IS NULL and O.id = $id",
//       {
//         bind: {
//           id: transColl.transactionId,
//         },
//         type: sequelize.QueryTypes.SELECT,
//       },
//       {
//         transaction,
//       }
//     );
//     const fat1 = {
//       code: org[0].code,
//       date: org[0].date,
//       name: org[0].name,
//     };
//     procces.collected = fat1;

//     transaction.commit();
//     res.json(procces);
//   } catch (e) {
//     transaction.rollback();

//     req.log.error("error in get transactions", { error: e.message });
//     return res.status(500).json({ error: e.message });
//   }
// };
