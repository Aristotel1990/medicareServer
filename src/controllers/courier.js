// import db, {
//   Address,
//   User,
//   Vehicles,
//   CourierTransactions,
//   Order,
//   OrderRoutes,
//   Arka,
//   Zeri
// } from '../models/index'
// import sequelize, { Op } from 'sequelize'
// // id: 12,
// // courierId: 1,
// // name: "Tr456AA",
// // branch: "Suzuki",
// // model: "swift",
// // type: "furgon",
// // fuel: "benzine",
// // engine: 1.5,
// // startKm: 170000,
// // commission: new Date(),
// // createdAt: new Date(),
// // updatedAt: new Date(),
// import {
//   isSystemCourierGetter,
//   isFinanceOrAAdmin,
//   isBranchAdmin,
//   isSystemAdmin,
//   isBranchAdminOrFinance
// } from '../services/user'
// import bcrypt from 'bcryptjs'
// import { generate } from '../lib/password'
// import { sentInternalRegistrationsEmail } from '../services/emails'
// export const createCourier = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const {
//       firstName,
//       lastName,
//       nid,
//       phone,
//       email,
//       branchId,
//       address,
//       vehicleId
//     } = req.body
//     const salt = await bcrypt.genSalt(10)
//     const password = generate({
//       length: 14,
//       numbers: true
//     })
//     const usr = {
//       email,
//       password: await bcrypt.hash(password, salt),
//       role: 'courier',
//       salt
//     }
//     const courier = await User.create(
//       {
//         ...usr,
//         firstName: firstName || '',
//         lastName: lastName || '',
//         nid: nid || '',
//         phone: phone || '',
//         branchId,
//         createdAt: new Date()
//       },
//       { transaction }
//     )

//     await Address.create(
//       {
//         address: address || '',
//         userId: courier.id,
//         createdAt: new Date()
//       },
//       { transaction }
//     )

//     Vehicles.update({ courierId: courier.id }, { where: { id: vehicleId } })
//     if (courier) {
//       try {
//         await sentInternalRegistrationsEmail(email, email, password)
//       } catch (e) {
//         req.log.error(
//           'error in create courier - sentInternalRegistrationsEmail',
//           { error: e.message }
//         )
//       }
//     }
//     transaction.commit()
//     res.json(courier)
//   } catch (e) {
//     transaction.rollback()

//     req.log.error('error in create courier', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getCourier = async (req, res) => {
//   try {
//     const { user } = req
//     if (user.role === 'superAdmin') {
//       const account = await User.findAll({
//         where: {
//           role: {
//             [Op.like]: 'courier'
//           }
//         },
//         include: [
//           { model: Address, as: 'address', attributes: ['address'] },
//           { model: Vehicles, as: 'vehicle', attributes: ['name'] }
//         ],
//         attributes: {
//           include: [
//             [sequelize.col('address.address'), 'addressCourier'],
//             [sequelize.col('vehicle.name'), 'targa']
//           ],
//           exclude: ['updatedAt', 'deletedAt']
//         }
//       })

//       // await new Promise(resolve => setTimeout(resolve, 3000))
//       res.json(account)
//     } else if (user.role === 'branchManager') {
//       const accounts = await User.findAll({
//         where: {
//           role: {
//             [Op.like]: 'courier'
//           },
//           branchId: user.branchId
//         },

//         include: [
//           { model: Address, as: 'address', attributes: ['address'] },
//           { model: Vehicles, as: 'vehicle', attributes: ['name'] }
//         ],
//         attributes: {
//           include: [
//             [sequelize.col('address.address'), 'addressCourier'],
//             [sequelize.col('vehicle.name'), 'targa']
//           ],
//           exclude: ['updatedAt', 'deletedAt']
//         }
//       })

//       // await new Promise(resolve => setTimeout(resolve, 3000))
//       res.json(accounts)
//     } else if (user.role === 'finance') {
//       const account = await User.findAll({
//         where: {
//           role: {
//             [Op.like]: 'courier'
//           },
//           branchId: 1
//         },
//         include: [
//           { model: Address, as: 'address', attributes: ['address'] },
//           { model: Vehicles, as: 'vehicle', attributes: ['name'] }
//         ],
//         attributes: {
//           include: [
//             [sequelize.col('address.address'), 'addressCourier'],
//             [sequelize.col('vehicle.name'), 'targa']
//           ],
//           exclude: ['updatedAt', 'deletedAt']
//         }
//       })

//       // await new Promise(resolve => setTimeout(resolve, 3000))
//       res.json(account)
//     }
//     // await new Promise(resolve => setTimeout(resolve, 3000))
//   } catch (e) {
//     req.log.error('error in get business', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const editCourier = async (req, res) => {
//   try {
//     const { id, lastName, firstName, branchId, nid, phone, email } = req.body
//     const account = await User.update(
//       {
//         firstName,
//         lastName,
//         phone: phone | '',
//         nid,
//         email,
//         branchId: branchId || null,
//         updatedAt: new Date()
//       },
//       {
//         where: {
//           id,
//           role: 'courier'
//         }
//       }
//     )
//     res.json(account)
//   } catch (error) {
//     req.log.error('error in edit courier', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const getOneCourier = async (req, res) => {
//   try {
//     const id = req.params.id
//     const account = await User.findByPk(id)
//     res.json(account)
//   } catch (error) {
//     req.log.error('error in get one courier', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const getCourierInTranistOrder = async (req, res) => {
//   try {
//     const { id } = req.params
//     const user = req.user

//     if (isFinanceOrAAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           "where O.deletedAt IS NULL and (OH.status = 'pickedFromCourier' or OH.status = 'pickedFromClient') and OH.courierId = $courier",
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     } else if (isBranchAdmin(user.role)) {
//       const courier = await User.findByPk(id)
//       if (courier.branchId !== user.branchId) throw new Error('Forbiden 1')
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           "where O.deletedAt IS NULL and (OH.status = 'pickedFromCourier' or OH.status = 'pickedFromClient') and OH.courierId = $courier",
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     }
//     throw new Error('Forbiden 2')
//   } catch (e) {
//     req.log.error('error in getNextBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getCourierCompletedOrder = async (req, res) => {
//   try {
//     const { id } = req.params
//     const user = req.user
//     if (isFinanceOrAAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.status = 'Completed' and OrderHistory.courierId =$courierId  and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           'where O.deletedAt IS NULL and OT.picked IS NULL ',

//         {
//           bind: {
//             courierId: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     } else if (isBranchAdmin(user.role)) {
//       const courier = await User.findByPk(id)
//       if (courier.branchId !== user.branchId) throw new Error('Forbiden 2')
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.status = 'Completed' and OrderHistory.courierId =$courierId  and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           'where O.deletedAt IS NULL and OT.picked IS NULL ',

//         {
//           bind: {
//             courierId: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     }
//     throw new Error('Forbiden 2')
//   } catch (e) {
//     req.log.error('error in getNextBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const getCourierRejectedOrder = async (req, res) => {
//   try {
//     const { id } = req.params
//     const user = req.user
//     if (isFinanceOrAAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.status = 'Rejected' and OrderHistory.courierId =$courierId  and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           'where O.deletedAt IS NULL and OT.picked IS NULL ',

//         {
//           bind: {
//             courierId: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     } else if (isBranchAdmin(user.role)) {
//       const courier = await User.findByPk(id)
//       if (courier.branchId !== user.branchId) throw new Error('Forbiden 2')
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           "              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.status = 'Rejected' and OrderHistory.courierId =$courierId  and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n" +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           'where O.deletedAt IS NULL and OT.picked IS NULL ',

//         {
//           bind: {
//             courierId: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     }
//     throw new Error('Forbiden 2')
//   } catch (e) {
//     req.log.error('error in getNextBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getCourierToPickedOrder = async (req, res) => {
//   try {
//     const { id } = req.params
//     const user = req.user

//     if (isFinanceOrAAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           "where O.deletedAt IS NULL and OH.status = 'toPickUpFromCourier' and OH.courierId =$courier",
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     } else if (isBranchAdmin(user.role)) {
//       const courier = await User.findByPk(id)
//       if (courier.branchId !== user.branchId) throw new Error('Forbiden 2')
//       const orders = await db.sequelize.query(
//         'SELECT  O.*,OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           "where O.deletedAt IS NULL and OH.status = 'toPickUpFromCourier' and OH.courierId =$courier",
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     }
//     throw new Error('Forbiden 2')
//   } catch (e) {
//     req.log.error('error in getNextBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getCourierOrderToCourier = async (req, res) => {
//   try {
//     const { id } = req.params
//     const user = req.user

//     if (isFinanceOrAAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           '          left  join CommentOrder CO\n' +
//           '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//           "where O.deletedAt IS NULL and OH.status = 'toCourier' and OH.courierId =$courier",
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     } else if (isBranchAdmin(user.role)) {
//       const courier = await User.findByPk(id)
//       if (courier.branchId !== user.branchId) throw new Error('Forbiden 2')
//       const orders = await db.sequelize.query(
//         'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '        join Account A on O.company = A.id\n' +
//           '        join OrderRoutes OT on O.id = OT.orderId\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           '        join Cities CA on O.originCity = CA.id\n' +
//           '          left  join CommentOrder CO\n' +
//           '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//           "where O.deletedAt IS NULL and OH.status = 'toCourier' and OH.courierId =$courier",
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orders)
//     }
//     throw new Error('Forbiden 2')
//   } catch (e) {
//     req.log.error('error in getNextBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getCourierLikuiduarOrder = async (req, res) => {
//   try {
//     const { id } = req.params
//     const user = req.user
//     if (!isSystemCourierGetter(user.role)) throw new Error('Forbiden 2')
//     const trans = await CourierTransactions.findByPk(id)
//     const array = trans.ids.split(',').map(Number)

//     const orders = await Order.findAll({
//       where: {
//         id: {
//           [Op.in]: array
//         }
//       }
//     })
//     res.json(orders)
//   } catch (e) {
//     req.log.error('error in getNextBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getCourierTransactions = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { id } = req.params
//     const user = req.user

//     if (isFinanceOrAAdmin(user.role)) {
//       const trans = await db.sequelize.query(
//         'Select T.*\n' +
//           'from CourierTransactions T\n' +
//           'where T.deletedAt IS NULL and T.courierId = $courier  order by id DESC',
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       if (!trans) throw new Error('Error in ')

//       res.json(trans)
//       await transaction.commit()
//     } else if (isBranchAdmin(user.role)) {
//       const courier = await User.findByPk(id)
//       if (courier.branchId !== user.branchId) throw new Error('Forbiden 2')
//       const trans = await db.sequelize.query(
//         'Select T.*\n' +
//           'from CourierTransactions T\n' +
//           'where T.deletedAt IS NULL and T.courierId = $courier  order by id DESC',
//         {
//           bind: {
//             courier: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       if (!trans) throw new Error('Error in ')

//       res.json(trans)
//       await transaction.commit()
//     }
//     throw new Error('Forbiden 2')
//   } catch (e) {
//     await transaction.rollback()

//     req.log.error('error in getTrans', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const deleteCourier = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const id = req.params.id
//     const user = req.user
//     if (!isSystemAdmin(user.role)) throw new Error('Forbiden 2')

//     const acc = await User.findByPk(id)
//     if (!acc) throw new Error('Not Authorized')
//     if (acc.role !== 'courier') throw new Error('Not Courier')
//     await Vehicles.update(
//       {
//         courierId: null
//       },
//       {
//         where: {
//           courierId: id
//         }
//       }
//     )
//     await User.destroy(
//       {
//         where: {
//           id
//         }
//       },
//       { transaction }
//     )
//     res.json(id)
//   } catch (error) {
//     req.log.error('error in get one courier', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const deleteCourierTrans = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const { id } = req.params
//     const user = req.user
//     if (!id) throw new Error('Nothing to delete')
//     if (!isBranchAdminOrFinance(user.role)) {
//       throw new Error('Unauthorized')
//     }
//     const trans = await CourierTransactions.findByPk(id)
//     if (!trans) throw new Error('Nothing to delete')

//     const array = trans.ids.split(',').map(Number)

//     await OrderRoutes.update(
//       { picked: null, updatedAt: new Date() },
//       {
//         where: {
//           orderId: {
//             [Op.in]: array
//           }
//         },
//         transaction
//       }
//     )
//     await CourierTransactions.destroy({
//       where: {
//         id
//       },
//       transaction
//     })
//     const mainArka = await db.sequelize.query(
//       'Select A.*\n' +
//         'from Arka A\n' +
//         'where A.deletedAt IS NULL ORDER BY id DESC LIMIT 1    ',
//       {
//         type: sequelize.QueryTypes.SELECT
//       },
//       {
//         transaction
//       }
//     )
//     const totalALL = trans.totalALL || 0
//     const totalEur = trans.totalEUR || 0
//     const all = !mainArka ? 0 : mainArka[0].totalALL
//     const eur = !mainArka ? 0 : mainArka[0].totalEUR
//     const client = await Zeri.create(
//       {
//         valueALL: totalALL || 0,
//         valueEUR: totalEur || 0,
//         arkaALL: all - totalALL,
//         arkaEUR: eur - totalEur,
//         tipi: 'korier',
//         status: 'Dalje',
//         comment: `Fshirje fature mbledhje nga korieri me nr.${trans.id} per korierin: ${trans.name} `,
//         createdBy: user.id,
//         createdAt: new Date()
//       },
//       {
//         transaction
//       }
//     )
//     await Arka.create(
//       {
//         zeriId: client.id,
//         totalALL: all - totalALL,
//         totalEUR: eur - totalEur,
//         hyrjeALL: totalALL,
//         hyrjeEUR: totalEur,
//         createdBy: user.id,
//         createdAt: new Date()
//       },
//       {
//         transaction
//       }
//     )
//     transaction.commit()

//     res.json('done')
//   } catch (e) {
//     transaction.rollback()
//     req.log.error('error in delete order', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
