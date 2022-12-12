// import sequelize, { Op } from 'sequelize'
// import db, {
//   Account,
//   AccountFees,
//   BranchOperations,
//   Currencies,
//   Order,
//   OrderFees,
//   OrderRoutes,
//   PackageTypes,
//   Zeri,
//   Arka
// } from '../models'
// import {
//   isBranchAdmin,
//   isCompanyAdmin,
//   isFinanceOrAAdmin,
//   isSystemUser
// } from '../services/user'
// import { defineRoutes, newFeeCalculation } from '../services/order'

// export const getSettings = async (req, res) => {
//   try {
//     const user = req.user
//     // this should be loaded on login or refresh page
//     const currency = await Currencies.findAll()
//     const packageType = await PackageTypes.findAll()
//     const company = isCompanyAdmin(user.role)
//       ? await Account.findByPk(user.accountId)
//       : null
//     // clean
//     if (company && company.countryId === 3) {
//       packageType[1].cost.int = packageType[1].cost.intMq
//     }
//     if (
//       !isSystemUser(user.role) &&
//       company &&
//       ![2, 3, 4].includes(company.countryId)
//     ) {
//       for (const pkg of packageType) {
//         delete pkg.cost.int
//         delete pkg.cost.intKs
//         delete pkg.cost.intMq
//         delete pkg.cost.intMn
//         delete pkg.cost.third
//       }
//     }
//     res.json({
//       currency,
//       packageType
//     })
//   } catch (e) {
//     req.log.error('error in getSettings', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const getAccountList = async (req, res) => {
//   try {
//     const user = req.user
//     let zoneIds = null
//     if (isBranchAdmin(user.role)) {
//       const zones = await BranchOperations.findAll({
//         where: {
//           branchId: user.branchId
//         }
//       })
//       zoneIds = zones.map((i) => i.cityId)
//     }
//     const whereClause = { active: 1 }
//     if (zoneIds) {
//       whereClause.cityId = { [Op.in]: zoneIds }
//     }
//     const accounts = await Account.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: AccountFees,
//           as: 'fees',
//           attributes: [
//             'inCity',
//             'taxKs',
//             'taxMn',
//             'taxMq',
//             'finalCost',
//             'cost'
//           ]
//         }
//       ],
//       attributes: {
//         include: ['id', 'name', 'cityId', 'countryId'],
//         exclude: [
//           'nipt',
//           'owner',
//           'ownerNID',
//           'email',
//           'phone',
//           'addressText',
//           'type',
//           'pickUp',
//           'active',
//           'accountId',
//           'createdBy',
//           'createdAt',
//           'updatedAt',
//           'deletedAt'
//         ]
//       }
//     })
//     res.json(accounts)
//   } catch (e) {
//     req.log.error('error in getSettings', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const seeeetOrders = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const { fjalekalimiBobe } = req.query
//     if (!fjalekalimiBobe || fjalekalimiBobe !== 'telikoqe') {
//       throw new Error('ik andej')
//     }
//     const orders = await Order.findAll()

//     for (const order of orders) {
//       const packageType = await PackageTypes.findByPk(
//         parseInt(order.packageType)
//       )
//       const originCity = parseInt(order.originCity)
//       const originCountry = parseInt(order.originCountry)
//       const destinationCity = parseInt(order.destinationCity)
//       const destinationCountry = parseInt(order.destinationCountry)
//       const routes = await defineRoutes(
//         originCity,
//         destinationCity,
//         originCountry,
//         destinationCountry
//       )
//       const calculatedFees = await newFeeCalculation(
//         order,
//         packageType,
//         destinationCountry !== originCountry,
//         routes.fromKS,
//         routes.fromMQ
//       )
//       let finaleFee = calculatedFees.total
//       const postaNr = order.transport
//       if (order.transport !== finaleFee) {
//         finaleFee = postaNr
//       }
//       await OrderFees.create(
//         {
//           orderId: order.id,
//           senderCollect: order.price + (finaleFee - calculatedFees.total),
//           receiverPays: order.price + finaleFee,
//           orderTotalFee: calculatedFees.total,
//           originBranchFee: calculatedFees.origin,
//           destinationBranchFee: calculatedFees.destination,
//           mainFee: calculatedFees.main,
//           currency: order.currency
//         },
//         { transaction }
//       )
//       await OrderRoutes.create(
//         {
//           orderId: order.id,
//           orgBranchId: routes.origin.id,
//           destBranchId: routes.destination.id
//         },
//         { transaction }
//       )
//     }
//     await transaction.commit()
//     res.json({
//       success: true
//     })
//   } catch (e) {
//     await transaction.rollback()
//     req.log.error('error in seeeetOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const reSeeeetOrdersFees = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     // const user = req.user;
//     const { fjalekalimiBobe } = req.query
//     if (!fjalekalimiBobe || fjalekalimiBobe !== 'telikoqe2') {
//       throw new Error('ik andej')
//     }
//     const orders = await Order.findAll({
//       where: {
//         status: { [Op.not]: 'Likuiduar' }
//       }
//     })
//     for (const order of orders) {
//       const packageType = await PackageTypes.findByPk(
//         parseInt(order.packageType)
//       )
//       // const originCity = parseInt(order.originCity)
//       const originCountry = parseInt(order.originCountry)
//       // const destinationCity = parseInt(order.destinationCity)
//       const destinationCountry = parseInt(order.destinationCountry)
//       const company = await Account.findByPk(order.company)
//       if (!company) {
//         continue
//       }
//       const fees = await AccountFees.findOne({
//         where: { accountId: company.id }
//       })
//       if (!fees) {
//         continue
//       }
//       if (packageType.id === 1) {
//         packageType.cost.in = fees.inCity
//         packageType.cost.out = fees.finalCost
//       }
//       if (packageType.id === 2) {
//         packageType.cost.ks = fees.taxKs
//         packageType.cost.mq = fees.taxMq
//         packageType.cost.mn = fees.taxMn
//       }
//       // const routes = await defineRoutes(
//       //   originCity,
//       //   destinationCity,
//       //   originCountry,
//       //   destinationCountry
//       // )
//       const calculatedFees = await newFeeCalculation(
//         order,
//         packageType,
//         destinationCountry !== originCountry
//       )
//       let finaleFee = calculatedFees.total
//       const postaNr = order.transport
//       if (order.transport !== finaleFee) {
//         finaleFee = postaNr
//       }
//       const orderFee = await OrderFees.findOne({
//         where: {
//           orderId: order.id
//         }
//       })
//       orderFee.senderCollect = order.price + (finaleFee - calculatedFees.total)
//       orderFee.receiverPays = order.price + finaleFee
//       orderFee.orderTotalFee = calculatedFees.total
//       orderFee.originBranchFee = calculatedFees.origin
//       orderFee.destinationBranchFee = calculatedFees.destination
//       orderFee.mainFee = calculatedFees.main
//       orderFee.currency = order.currency
//       await orderFee.save({ transaction })
//       // await OrderRoutes.create(
//       //   {
//       //     orderId: order.id,
//       //     orgBranchId: routes.origin.id,
//       //     destBranchId: routes.destination.id
//       //   },
//       //   { transaction }
//       // )
//     }
//     await transaction.commit()
//     res.json({
//       success: true
//     })
//   } catch (e) {
//     await transaction.rollback()
//     req.log.error('error in seeeetOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getAccountsMonthSales = async (req, res) => {
//   try {
//     const { year, month, id } = req.body.values
//     const user = req.user
//     const account = await Account.findByPk(id)

//     if (!isCompanyAdmin(user.role)) throw new Error('not allowed')

//     const org = await db.sequelize.query(
//       'SELECT COUNT(DISTINCT O.id) as `count` ,O.createdAt as date\n' +
//         'from `Order` O\n' +
//         '  where O.deletedAt IS NULL and (YEAR(O.createdAt) = $year AND MONTH(O.createdAt) = $month) and O.company = $account   group by day(O.createdAt)',
//       {
//         bind: {
//           account: account.id,
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json({ org })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getAdminYearSales = async (req, res) => {
//   try {
//     const user = req.user
//     const { year } = req.params
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')
//     const comp = await db.sequelize.query(
//       'SELECT COUNT(DISTINCT O.id) as `count` ,Month(O.createdAt) as date\n' +
//         'from `Order` O\n' +
//         "where O.deletedAt IS NULL and YEAR(O.createdAt) = $year and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar')  group by date",
//       {
//         bind: {
//           year
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const rej = await db.sequelize.query(
//       'SELECT COUNT(DISTINCT O.id) as `count` ,Month(O.createdAt) as date\n' +
//         'from `Order` O\n' +
//         "where O.deletedAt IS NULL and YEAR(O.createdAt) = $year and (O.status = 'Rejected' or O.status = 'Kthyer')  group by date",
//       {
//         bind: {
//           year
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const completed = []
//     const rejected = []

//     for (let i = 0; i <= 12; i++) {
//       const Xresult = comp.find((word) => word.date === i)
//       const Yresult = rej.find((word) => word.date === i)

//       const x = !Xresult ? 0 : Xresult.count
//       const y = !Yresult ? 0 : Yresult.count

//       completed.push(x)
//       rejected.push(y)
//     }
//     res.json({ completed, rejected })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getNonDeliveredByBrabch = async (req, res) => {
//   try {
//     const user = req.user
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')

//     const orders = await db.sequelize.query(
//       'SELECT COUNT(DISTINCT O.id) as `count` ,OT.destBranchId\n' +
//         'from `Order` O\n' +
//         '         join OrderHistory OH\n' +
//         '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id and OrderHistory.branchId != 1 ORDER BY id DESC LIMIT 1)\n' +
//         '        join Account A on O.company = A.id\n' +
//         '        join Cities CD on O.destinationCity = CD.id\n' +
//         '        join Countries CU on O.destinationCountry = CU.id\n' +
//         '        join OrderRoutes OT on O.id = OT.orderId\n' +
//         '        join Cities CA on O.originCity = CA.id\n' +
//         "where O.deletedAt IS NULL and O.status = 'In Transit' and OH.status !='Order Created'  group by OT.destBranchId",
//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json(orders)
//   } catch (e) {
//     req.log.error('error in get business', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getCompanyYearSales = async (req, res) => {
//   try {
//     const user = req.user
//     const { year } = req.params
//     if (!isCompanyAdmin(user.role)) throw new Error('not allowed')
//     const comp = await db.sequelize.query(
//       'SELECT COUNT(DISTINCT O.id) as `count` ,Month(O.createdAt) as date\n' +
//         'from `Order` O\n' +
//         "where O.deletedAt IS NULL and O.company = $account and YEAR(O.createdAt) = $year and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar')  group by date",
//       {
//         bind: {
//           year,
//           account: user.accountId
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const rej = await db.sequelize.query(
//       'SELECT COUNT(DISTINCT O.id) as `count` ,Month(O.createdAt) as date\n' +
//         'from `Order` O\n' +
//         "where O.deletedAt IS NULL and O.company = $account and YEAR(O.createdAt) = $year and (O.status = 'Rejected' or O.status = 'Kthyer')  group by date",
//       {
//         bind: {
//           year,
//           account: user.accountId
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const completed = []
//     const rejected = []

//     for (let i = 1; i <= 12; i++) {
//       const Xresult = comp.find((word) => word.date === i)
//       const Yresult = rej.find((word) => word.date === i)

//       const x = !Xresult ? 0 : Xresult.count
//       const y = !Yresult ? 0 : Yresult.count

//       completed.push(x)
//       rejected.push(y)
//     }
//     res.json({ completed, rejected })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getEarnYearSales = async (req, res) => {
//   try {
//     const user = req.user
//     const { year } = req.params
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')
//     const compAll = await db.sequelize.query(
//       'SELECT SUM(OS.orderTotalFee) as total,Month(O.createdAt) as date\n' +
//         'from `Order` O\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         "where O.deletedAt IS NULL and O.currency = 'ALL' and YEAR(O.createdAt) = $year and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar')  group by date",
//       {
//         bind: {
//           year
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const compEur = await db.sequelize.query(
//       'SELECT SUM(OS.orderTotalFee) as total,Month(O.createdAt) as date\n' +
//         'from `Order` O\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         "where O.deletedAt IS NULL and O.currency = 'EUR' and YEAR(O.createdAt) = $year and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar')  group by date",
//       {
//         bind: {
//           year
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const completed = []
//     const completedEur = []

//     for (let i = 1; i <= 12; i++) {
//       const Xresult = compAll.find(
//         (word) => word.date.toString() === i.toString()
//       )
//       const Yresult = compEur.find(
//         (word) => word.date.toString() === i.toString()
//       )

//       const x = !Xresult ? 0 : Xresult.total
//       const y = !Yresult ? 0 : Yresult.total

//       completed.push(x)

//       completedEur.push(y)
//     }

//     res.json({ completed, completedEur })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getZeraByDate = async (req, res) => {
//   try {
//     const { year, month } = req.body.data
//     const user = req.user

//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')
//     const zeri = await db.sequelize.query(
//       'SELECT O.*\n' +
//         'from `Zeri` O\n' +
//         '  where O.deletedAt IS NULL and (YEAR(O.createdAt) = $year AND MONTH(O.createdAt) = $month) group by id',
//       {
//         bind: {
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json(zeri)
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const addZera = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { vleraAll, vleraEur, status, tipi, comment } = req.body
//     const user = req.user
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')

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
//     const all = !mainArka ? 0 : mainArka[0].totalALL
//     const eur = !mainArka ? 0 : mainArka[0].totalEUR
//     if (status === 'Hyrje') {
//       const client = await Zeri.create(
//         {
//           valueALL: vleraAll || 0,
//           valueEUR: vleraEur || 0,
//           arkaALL: all + vleraAll,
//           arkaEUR: eur + vleraEur,
//           tipi: tipi || null,
//           status: status || null,
//           comment: comment || null,
//           createdBy: user.id,
//           createdAt: new Date()
//         },
//         {
//           transaction
//         }
//       )
//       await Arka.create(
//         {
//           zeriId: client.id,
//           totalALL: all + vleraAll,
//           totalEUR: eur + vleraEur,
//           hyrjeALL: vleraAll,
//           hyrjeEUR: vleraEur,
//           createdBy: user.id,
//           createdAt: new Date()
//         },
//         {
//           transaction
//         }
//       )
//       await transaction.commit()
//       res.json(client)
//     } else if (status === 'Dalje') {
//       const client = await Zeri.create(
//         {
//           valueALL: vleraAll || 0,
//           valueEUR: vleraEur || 0,
//           arkaALL: all - vleraAll,
//           arkaEUR: eur - vleraEur,
//           tipi: tipi || null,
//           status: status || null,
//           comment: comment || null,
//           createdBy: user.id,
//           createdAt: new Date()
//         },
//         {
//           transaction
//         }
//       )
//       await Arka.create(
//         {
//           zeriId: client.id,
//           totalALL: all - vleraAll,
//           totalEUR: eur - vleraEur,
//           daljeALL: vleraAll,
//           daljeEUR: vleraEur,
//           createdBy: user.id,
//           createdAt: new Date()
//         },

//         {
//           transaction
//         }
//       )
//       await transaction.commit()
//       res.json(client)
//     }

//     await transaction.rollback()
//     throw new Error('gabim ne hyrje dalje')
//   } catch (e) {
//     await transaction.rollback()

//     req.log.error('error in create clients', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const deleteZera = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const { id } = req.params
//     const user = req.user
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')
//     const zeri = await Zeri.findByPk(id)
//     if (!zeri) throw new Error('Ska zera per kete id')
//     const lastZeri = await db.sequelize.query(
//       'Select A.*\n' +
//         'from Zeri A\n' +
//         'where A.deletedAt IS NULL ORDER BY id DESC LIMIT 1    ',
//       {
//         type: sequelize.QueryTypes.SELECT
//       },
//       {
//         transaction
//       }
//     )
//     if (lastZeri[0].id === zeri.id) {
//       if (zeri.status === 'Hyrje') {
//         await Arka.create(
//           {
//             zeriId: zeri.id,
//             totalALL: zeri.arkaALL - zeri.valueALL,
//             totalEUR: zeri.arkaEUR - zeri.valueEUR,
//             daljeALL: zeri.valueALL,
//             daljeEUR: zeri.valueEUR,
//             createdBy: user.id,
//             createdAt: new Date()
//           },
//           {
//             transaction
//           }
//         )
//         await Zeri.destroy(
//           {
//             where: {
//               id
//             }
//           },
//           { transaction }
//         )
//         transaction.commit()

//         res.json('done')
//       } else if (zeri.status === 'Dalje') {
//         await Arka.create(
//           {
//             zeriId: zeri.id,
//             totalALL: zeri.arkaALL + zeri.valueALL,
//             totalEUR: zeri.arkaEUR + zeri.valueEUR,
//             hyrjeALL: zeri.valueALL,
//             hyrjeEUR: zeri.valueEUR,
//             createdBy: user.id,
//             createdAt: new Date()
//           },
//           {
//             transaction
//           }
//         )
//         await Zeri.destroy(
//           {
//             where: {
//               id
//             }
//           },
//           { transaction }
//         )
//         transaction.commit()

//         res.json('done')
//       }
//       throw new Error('gabim ne zera')
//     }
//     throw new Error('nuk mund te kryhet veprimi')
//   } catch (e) {
//     transaction.rollback()
//     req.log.error('error in delete ze', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getAllTransAccounts = async (req, res) => {
//   try {
//     const user = req.user
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')

//     const trans = await db.sequelize.query(
//       'SELECT O.*,A.name\n' +
//         'from `Transactions` O\n' +
//         '  join Account A on O.accountId = A.id\n' +
//         '  where O.deletedAt IS NULL order by O.id desc',
//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(trans)
//   } catch (e) {
//     req.log.error('error in getCompletedCompanyOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
