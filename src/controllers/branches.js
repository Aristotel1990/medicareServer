// import db, {
//   Order,
//   Branch,
//   BranchOperations,
//   Cities,
//   Countries,
//   User,
//   CollectOrders,
//   CollectTransactions,
//   OrderFees,
//   CollectHistory,
//   BilledTransactions,
//   BilledHistory,
//   Account,
//   ReturnOrdersTransactions,
//   Vehicles,
//   OrderHistory,
//   SwitchOrder,
//   Arka,
//   Zeri
// } from '../models'
// import { getPagination, getPagingData } from '../lib/util'
// import sequelize, { Op } from 'sequelize'
// import bcrypt from 'bcryptjs'
// import { generate } from '../lib/password'
// import { sentRegistrationsEmail } from '../services/emails'
// import {
//   isBranchAdmin,
//   isSystemAdmin,
//   isFinanceOrCompanyAdminOrBranchManager,
//   isFinanceOrAAdmin,
//   isBranchAdminOrFinance,
//   isCourierOrBranch,
//   isCourier
// } from '../services/user'
// import { generateTransCode } from '../services/order'

// export const createBranch = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const {
//       name,
//       nipt,
//       firstName,
//       lastName,
//       phone,
//       email,
//       nid,
//       active,
//       address,
//       city,
//       country,
//       zones
//     } = req.body
//     const uniqZones = [...new Set([...zones, city])]
//     const branch = await Branch.create(
//       {
//         name,
//         nipt: nipt || '',
//         administrator: firstName + ' ' + lastName,
//         adminNid: nid || '',
//         addressText: address || '',
//         address: null,
//         phone: phone || '',
//         email: email || '',
//         active: active || true,
//         cityId: city || 1,
//         countryId: country || 1,
//         createdBy: req.user.id,
//         createdAt: new Date()
//       },
//       { transaction }
//     )
//     if (uniqZones.length <= 0) {
//       await BranchOperations.destroy(
//         {
//           where: {
//             cityId: branch.cityId
//           },
//           force: true
//         },
//         { transaction }
//       )
//       await BranchOperations.create(
//         {
//           branchId: branch.id,
//           cityId: branch.cityId
//         },
//         {
//           transaction
//         }
//       )
//     } else {
//       await BranchOperations.destroy(
//         {
//           where: {
//             cityId: {
//               [Op.in]: uniqZones
//             }
//           },
//           force: true
//         },
//         { transaction }
//       )
//       const zoneBulk = uniqZones.map((zone) => {
//         return {
//           branchId: branch.id,
//           cityId: zone
//         }
//       })
//       await BranchOperations.bulkCreate(zoneBulk, {
//         transaction
//       })
//     }
//     const salt = await bcrypt.genSalt(10)
//     const password = generate({
//       length: 14,
//       numbers: true
//     })
//     const usr = {
//       email,
//       password: await bcrypt.hash(password, salt),
//       firstName,
//       lastName,
//       role: 'branchManager',
//       branchId: branch.id,
//       phone,
//       nid,
//       salt
//     }
//     const user = await User.create(usr, { transaction })
//     if (user) {
//       await sentRegistrationsEmail(email, email, password)
//     }
//     transaction.commit()
//     res.json(branch)
//   } catch (e) {
//     transaction.rollback()
//     req.log.error('error in create branch', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const deleteBranch = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const id = req.params.id
//     const acc = await Branch.findByPk(id)
//     if (!acc) throw new Error('Not Authorized')
//     await Branch.destroy(
//       {
//         where: {
//           id
//         }
//       },
//       { transaction }
//     )
//     await BranchOperations.destroy(
//       {
//         where: {
//           branchId: id
//         }
//       },
//       { transaction }
//     )
//     await User.destroy(
//       {
//         where: {
//           branchId: id
//         }
//       },
//       { transaction }
//     )
//     res.json(id)
//   } catch (error) {
//     req.log.error('error in get one business', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const getBranches = async (req, res) => {
//   try {
//     const { page, size, name } = req.query
//     const { limit, offset } = getPagination(page, size)
//     const condition = name ? { name: { [Op.like]: `%${name}%` } } : null
//     const branches = await Branch.findAndCountAll({
//       where: condition,
//       include: [
//         { model: Countries, as: 'country', attributes: ['name'] },
//         { model: Cities, as: 'city', attributes: ['name'] }
//       ],
//       attributes: {
//         include: [
//           [sequelize.col('country.name'), 'countryName'],
//           [sequelize.col('city.name'), 'cityName']
//         ],
//         exclude: ['updatedAt', 'deletedAt']
//       },
//       offset,
//       limit,
//       order: [['createdAt', 'DESC']]
//     })
//     const response = getPagingData(branches, page, limit)
//     // await new Promise(resolve => setTimeout(resolve, 3000))
//     res.json(response)
//   } catch (e) {
//     req.log.error('error in get branches', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getAllBranches = async (req, res) => {
//   try {
//     const branches = await Branch.findAll({
//       include: [
//         { model: Countries, as: 'country', attributes: ['name'] },
//         { model: Cities, as: 'city', attributes: ['name'] }
//       ],
//       attributes: {
//         include: [
//           [sequelize.col('country.name'), 'countryName'],
//           [sequelize.col('city.name'), 'cityName']
//         ],
//         exclude: ['updatedAt', 'deletedAt']
//       },
//       exclude: ['deletedAt'],
//       order: [['createdAt', 'DESC']]
//     })
//     res.json(branches)
//   } catch (e) {
//     req.log.error('error in get branches', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const getOneBranch = async (req, res) => {
//   try {
//     const id = req.params.id
//     const branch = await Branch.findByPk(id, {
//       include: [
//         {
//           model: BranchOperations,
//           as: 'cityOperate',
//           where: {
//             branchId: id
//           },
//           include: [{ model: Cities, as: 'city', attributes: ['id', 'name'] }]
//           // attributes: {
//           //   include: [
//           //     [sequelize.col('city.name'), 'cityName']
//           //   ]
//           // }
//         }
//       ]
//     })
//     const users = await db.sequelize.query(
//       'SELECT A.*\n' + ' from `User` A\n' + '  where A.branchId = $idAccount',
//       {
//         bind: {
//           idAccount: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json({ branch, users })
//   } catch (e) {
//     req.log.error('error in get one branch', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const changePassBr = async (req, res) => {
//   const { id, email, password } = req.body
//   const { user } = req
//   try {
//     const userNew = await User.findByPk(id)
//     if (!isSystemAdmin(user.role)) throw new Error('Not Authorized')
//     if (userNew) {
//       const salt = await bcrypt.genSalt(10)
//       userNew.password = await bcrypt.hash(password, salt)
//       userNew.email = email
//       await userNew.save({ fields: ['password', 'email'] })

//       res.status(200).json('passwordi u updatua')
//     } else {
//       req.log.error({ error: 'User not found' }, 'unable to login')
//       res.status(500).json({ error: 'Server error' })
//     }
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' })
//   }
// }
// export const addNewPassCo = async (req, res) => {
//   const { id, email, password, firstName, lastName } = req.body
//   const { user } = req
//   try {
//     const account = await Account.findByPk(id)
//     if (!account) throw new Error('Nuk ka Biznes me kete Id')
//     const oldUser = await User.findOne({
//       where: {
//         email
//       }
//     })
//     if (oldUser) throw new Error('Ka User me kete email')
//     if (!isSystemAdmin(user.role)) throw new Error('Not Authorized')
//     const salt = await bcrypt.genSalt(10)
//     const newPassword = await bcrypt.hash(password, salt)

//     await User.create({
//       email,
//       password: newPassword,
//       firstName,
//       lastName,
//       role: 'companyAdmin',
//       accountId: id
//     })

//     res.status(200).json('passwordi u shtua')
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' })
//   }
// }
// export const addNewPassBr = async (req, res) => {
//   const { id, email, password, firstName, lastName } = req.body
//   const { user } = req
//   try {
//     const account = await Branch.findByPk(id)
//     if (!account) throw new Error('Nuk ka Biznes me kete Id')
//     const oldUser = await User.findOne({
//       where: {
//         email
//       }
//     })
//     if (oldUser) throw new Error('Ka User me kete email')
//     if (!isSystemAdmin(user.role)) throw new Error('Not Authorized')
//     const salt = await bcrypt.genSalt(10)
//     const newPassword = await bcrypt.hash(password, salt)

//     await User.create({
//       email,
//       password: newPassword,
//       firstName,
//       lastName,
//       role: 'branchManager',
//       branchId: id
//     })

//     res.status(200).json('passwordi u shtua')
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' })
//   }
// }
// export const editBranch = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const {
//       id,
//       name,
//       nipt,
//       firstName,
//       lastName,
//       nid,
//       active,
//       address,
//       phone,
//       email,
//       city,
//       country,
//       zones
//     } = req.body
//     const uniqZones = [...new Set([...zones, city])]
//     const branch = await Branch.update(
//       {
//         name,
//         nipt: nipt || '',
//         administrator: firstName + ' ' + lastName,
//         adminNid: nid || '',
//         addressText: address || '',
//         phone: phone || '',
//         email: email || '',
//         active,
//         cityId: city || 1,
//         countryId: country || 1,
//         updatedAt: new Date()
//       },
//       {
//         where: {
//           id
//         }
//       },
//       { transaction }
//     )
//     await BranchOperations.destroy(
//       {
//         where: {
//           branchId: id
//         },
//         force: true
//       },
//       { transaction }
//     )
//     await BranchOperations.destroy(
//       {
//         where: {
//           cityId: city
//         },
//         force: true
//       },
//       { transaction }
//     )
//     if (uniqZones.length > 0) {
//       await BranchOperations.destroy(
//         {
//           where: {
//             cityId: {
//               [Op.in]: uniqZones
//             }
//           },
//           force: true
//         },
//         { transaction }
//       )
//     }
//     const range = uniqZones.filter((e) => e !== city)
//     const zoneBulk = range.map((zone) => {
//       return {
//         branchId: id,
//         cityId: zone
//       }
//     })
//     await BranchOperations.create(
//       {
//         branchId: id,
//         cityId: city
//       },
//       {
//         transaction
//       }
//     )
//     await BranchOperations.bulkCreate(zoneBulk, {
//       transaction
//     })
//     transaction.commit()

//     res.json(branch)
//   } catch (e) {
//     transaction.rollback()

//     req.log.error('error in edit branch', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const getBranchAccounts = async (req, res) => {
//   try {
//     const user = req.user
//     const branch = await Branch.findByPk(user.branchId)
//     const accounts = await db.sequelize.query(
//       'Select A.id, A.name as name, AF.inCity as localFee, AF.cost as fee, AF.finalCost as final, AF.discount,AF.taxKs,AF.taxMq,AF.taxMn\n' +
//         'from Account A\n' +
//         '         join AccountFees AF on A.id = AF.accountId\n' +
//         'where A.cityId = $city',
//       {
//         bind: {
//           city: branch.cityId
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(accounts)
//   } catch (e) {
//     req.log.error('error in getBranchAccounts', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getAccountsOnLikuid = async (req, res) => {
//   try {
//     const user = req.user
//     const branch = await Branch.findByPk(user.branchId)
//     if (isFinanceOrAAdmin(user.role)) {
//       const accounts = await db.sequelize.query(
//         '        Select T.*,A.name as accountName,A.owner as owner,A.ownerNID as ownerNID,TH.status as statusHistory \n' +
//           '        from Transactions T \n' +
//           '         join Account A on T.accountId = A.id\n' +
//           '         join TransactionsHistory TH\n' +
//           '              on TH.id = (SELECT id FROM TransactionsHistory WHERE TransactionsHistory.transactionsId = T.id ORDER BY id DESC LIMIT 1)\n' +
//           " where T.deletedAt IS NULL and T.status ='OnLikuid' order by id DESC",

//         {
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       res.json(accounts)
//     } else {
//       const accounts = await db.sequelize.query(
//         '        Select T.*,A.name as accountName,A.owner as owner,A.ownerNID as ownerNID,TH.status as statusHistory \n' +
//           '        from Transactions T \n' +
//           '         join Account A on T.accountId = A.id\n' +
//           '         join TransactionsHistory TH\n' +
//           '              on TH.id = (SELECT id FROM TransactionsHistory WHERE TransactionsHistory.transactionsId = T.id ORDER BY id DESC LIMIT 1)\n' +
//           " where T.deletedAt IS NULL and T.cityId = $city and T.status ='OnLikuid' order by id DESC",

//         {
//           bind: {
//             city: branch.cityId
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       res.json(accounts)
//     }
//   } catch (e) {
//     req.log.error('error in getBranchAccounts', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getOnCollect = async (req, res) => {
//   try {
//     const user = req.user
//     const branch = await Branch.findByPk(user.branchId)
//     const accounts = await db.sequelize.query(
//       '        Select T.*,TH.status as statusHistory \n' +
//         '        from CollectTransactions T \n' +
//         '         join Branch A on T.branchId = A.id\n' +
//         '         join CollectHistory TH\n' +
//         '              on TH.id = (SELECT id FROM CollectHistory WHERE CollectHistory.transactionsId = T.id ORDER BY id DESC LIMIT 1)\n' +
//         " where T.deletedAt IS NULL and T.branchId = $branchId and T.status ='OnCollect' order by id DESC",

//       {
//         bind: {
//           branchId: branch.id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(accounts)
//   } catch (e) {
//     req.log.error('error in getBranchAccounts', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getOnConfirmCollect = async (req, res) => {
//   try {
//     const { id } = req.params
//     const branch = await Branch.findByPk(id)
//     const accounts = await db.sequelize.query(
//       '        Select T.*,TH.status as statusHistory \n' +
//         '        from CollectTransactions T \n' +
//         '         join Branch A on T.branchId = A.id\n' +
//         '         join CollectHistory TH\n' +
//         '              on TH.id = (SELECT id FROM CollectHistory WHERE CollectHistory.transactionsId = T.id ORDER BY id DESC LIMIT 1)\n' +
//         " where T.deletedAt IS NULL and  T.branchId = $branchId and (T.status ='BrConfirm' or T.status ='OnCollect') order by id DESC",

//       {
//         bind: {
//           branchId: branch.id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(accounts)
//   } catch (e) {
//     req.log.error('error in getBranchAccounts', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getBranchesSalary = async (req, res) => {
//   try {
//     const { year, month } = req.body.data

//     const orgALL = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , OT.orgBranchId as orgBranchId,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         "  where OS.deletedAt IS NULL and (YEAR(OS.createdAt) = $year AND MONTH(OS.createdAt) = $month) AND OS.currency = 'ALL'   group by OT.orgBranchId",
//       {
//         bind: {
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const destALL = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , OT.destBranchId as destBranchId,SUM(OS.destinationBranchFee) as destFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         "  where OS.deletedAt IS NULL and (YEAR(OS.createdAt) = $year AND MONTH(OS.createdAt) = $month) AND OS.currency = 'ALL'   group by OT.destBranchId",
//       {
//         bind: {
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const orgEUR = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , OT.orgBranchId as orgBranchId,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         "  where OS.deletedAt IS NULL and (YEAR(OS.createdAt) = $year AND MONTH(OS.createdAt) = $month) AND OS.currency = 'EUR'   group by OT.orgBranchId",

//       {
//         bind: {
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const destEUR = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , OT.destBranchId as destBranchId,SUM(OS.destinationBranchFee) as destFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         "  where OS.deletedAt IS NULL and (YEAR(OS.createdAt) = $year AND MONTH(OS.createdAt) = $month) AND OS.currency = 'EUR'   group by OT.destBranchId",

//       {
//         bind: {
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const branch = await Branch.findAll()

//     const orgArray = await branch.map((e) => {
//       const resultAll = orgALL.find(({ orgBranchId }) => orgBranchId === e.id)
//       const resultEUR = orgEUR.find(({ orgBranchId }) => orgBranchId === e.id)

//       if (!resultAll || !resultEUR) {
//         return {
//           id: e.id,
//           branchName: e.name,
//           owner: e.administrator,
//           orgALL: !resultAll
//             ? 0
//             : resultAll.orgFees === null
//               ? 0
//               : resultAll.orgFees,
//           orgEuro: !resultEUR
//             ? 0
//             : resultEUR.orgFees === null
//               ? 0
//               : resultEUR.orgFees,
//           mainALL: !resultAll
//             ? 0
//             : resultAll.mainFees === null
//               ? 0
//               : resultAll.mainFees,
//           mainEuro: !resultEUR
//             ? 0
//             : resultEUR.mainFees === null
//               ? 0
//               : resultEUR.mainFees,
//           countAll: !resultAll
//             ? 0
//             : resultAll.count === null
//               ? 0
//               : resultAll.count,
//           countEuro: !resultEUR
//             ? 0
//             : resultEUR.count === null
//               ? 0
//               : resultEUR.count
//         }
//       }

//       return {
//         id: e.id,
//         branchName: e.name,
//         owner: e.administrator,
//         orgALL: resultAll.orgFees === null ? 0 : resultAll.orgFees,
//         orgEuro: resultEUR.orgFees === null ? 0 : resultEUR.orgFees,
//         mainALL: resultAll.mainFees === null ? 0 : resultAll.mainFees,
//         mainEuro: resultEUR.mainFees === null ? 0 : resultEUR.mainFees,
//         countAll: resultAll.count === null ? 0 : resultAll.count,
//         countEuro: resultEUR.count === null ? 0 : resultEUR.count
//       }
//     })
//     const destArray = await branch.map((e) => {
//       const resultAll = destALL.find(
//         ({ destBranchId }) => destBranchId === e.id
//       )
//       const resultEUR = destEUR.find(
//         ({ destBranchId }) => destBranchId === e.id
//       )

//       if (!resultAll || !resultEUR) {
//         return {
//           id: e.id,
//           branchName: e.name,
//           owner: e.administrator,
//           destALL: !resultAll
//             ? 0
//             : resultAll.destFees === null
//               ? 0
//               : resultAll.destFees,
//           destEuro: !resultEUR
//             ? 0
//             : resultEUR.destFees === null
//               ? 0
//               : resultEUR.destFees,
//           countAll: !resultAll
//             ? 0
//             : resultAll.count === null
//               ? 0
//               : resultAll.count,
//           countEuro: !resultEUR
//             ? 0
//             : resultEUR.count === null
//               ? 0
//               : resultEUR.count
//         }
//       }

//       return {
//         id: e.id,
//         branchName: e.name,
//         owner: e.administrator,
//         destALL: resultAll.destFees === null ? 0 : resultAll.destFees,
//         destEuro: resultEUR.destFees === null ? 0 : resultEUR.destFees,
//         countAll: resultAll.count === null ? 0 : resultAll.count,
//         countEuro: resultEUR.count === null ? 0 : resultEUR.count
//       }
//     })
//     const total = await orgArray.map((e) => {
//       const resultAll = destArray.find(({ id }) => id === e.id)

//       if (!resultAll) throw new Error('Not kongruent')

//       return {
//         id: e.id,
//         branchName: e.branchName,
//         owner: e.owner,
//         totalALL: e.orgALL + resultAll.destALL,
//         totalEuro: e.orgEuro + resultAll.destEuro,
//         totalMainALL: e.mainALL,
//         totaMainEuro: e.mainEuro,
//         countAll: e.countAll + resultAll.countAll,
//         countEuro: e.countEuro + resultAll.countEuro
//       }
//     })
//     const sumall = await total
//       .map((item) => item.totalMainALL)
//       .reduce((prev, curr) => prev + curr, 0)
//     const tr = total.find(({ id }) => id === 1)
//     const branchtr = sumall + tr.totalALL
//     const sumaEUR = await total
//       .map((item) => item.totaMainEuro)
//       .reduce((prev, curr) => prev + curr, 0)
//     const br = total.find(({ id }) => id === 1)
//     const eurBranch = sumaEUR + br.totalEuro
//     res.json({ total, branchtr, eurBranch })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// // get branch salary by id

// export const getBrSalaryById = async (req, res) => {
//   try {
//     const user = req.user
//     const branch = await Branch.findByPk(user.branchId)

//     if (!isBranchAdmin(user.role)) throw new Error('not allowed')

//     const org = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , OT.orgBranchId as orgBranchId,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         '  where OS.deletedAt IS NULL and OT.orgBranchId = $branch group by OS.currency',
//       {
//         bind: {
//           branch: branch.id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const dest = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , OT.destBranchId as destBranchId,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         '  where OS.deletedAt IS NULL and OT.destBranchId = $branch group by OS.currency',
//       {
//         bind: {
//           branch: branch.id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const countDest = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` \n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         '  where OS.deletedAt IS NULL and OT.destBranchId = $branch and OT.destBranchId != OT.orgBranchId  ',
//       {
//         bind: {
//           branch: branch.id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const countOrg = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` \n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         '  where OS.deletedAt IS NULL and OT.orgBranchId = $branch ',
//       {
//         bind: {
//           branch: branch.id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const orgAll = org.find(({ currency }) => currency === 'ALL')
//     const orgEUR = org.find(({ currency }) => currency === 'EUR')
//     const destAll = dest.find(({ currency }) => currency === 'ALL')
//     const destEUR = dest.find(({ currency }) => currency === 'EUR')

//     const xall = !orgAll ? 0 : orgAll.orgFees
//     // const mxall = !orgAll ? 0 : orgAll.mainFees;

//     const Yall = !destAll ? 0 : destAll.destFees
//     // const myall = !destAll ? 0 : destAll.mainFees;

//     const xeuro = !orgEUR ? 0 : orgEUR.orgFees
//     // const mxeuro = !orgEUR ? 0 : orgEUR.mainFees;

//     const Yeuro = !destEUR ? 0 : destEUR.destFees
//     // const myeuro = !destEUR ? 0 : destEUR.mainFees;
//     const countX = !countOrg ? 0 : countOrg[0].count
//     const county = !countDest ? 0 : countDest[0].count

//     const total = {
//       totalAll: xall + Yall,
//       totalEUR: xeuro + Yeuro,
//       countOrg: countX,
//       countDest: county
//     }
//     res.json(total)
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getTransactionCollect = async (req, res) => {
//   try {
//     const user = req.user

//     const accounts = await db.sequelize.query(
//       'Select T.*\n' +
//         'from CollectTransactions T\n' +
//         "where T.deletedAt IS NULL and T.branchId = $branchId and (T.status = 'BrConfirm' or T.status = 'Collected' ) order by id DESC",
//       {
//         bind: {
//           branchId: user.branchId
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(accounts)
//   } catch (e) {
//     req.log.error('error in getBranchAccounts', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getFinanceTransactionCollect = async (req, res) => {
//   try {
//     const user = req.user
//     const { id } = req.params
//     if (isSystemAdmin(user.role)) {
//       const accounts = await db.sequelize.query(
//         'Select T.*\n' +
//           'from CollectTransactions T\n' +
//           'where T.deletedAt IS NULL and T.branchId = $branchId order by id DESC',
//         {
//           bind: {
//             branchId: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       res.json(accounts)
//     }
//     const accounts = await db.sequelize.query(
//       'Select T.*\n' +
//         'from CollectTransactions T\n' +
//         "where T.deletedAt IS NULL and T.branchId = $branchId and  T.status = 'Collected' order by id DESC",
//       {
//         bind: {
//           branchId: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(accounts)
//   } catch (e) {
//     req.log.error('error in getBranchAccounts', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getFinanceTransactionBilled = async (req, res) => {
//   try {
//     const user = req.user
//     const { id } = req.params
//     if (isSystemAdmin(user.role)) {
//       const accounts = await db.sequelize.query(
//         'Select T.*\n' +
//           'from BilledTransactions T\n' +
//           "where T.deletedAt IS NULL and T.branchId = $branchId and (T.status = 'OnBilled' or T.status = 'Billed') order by id DESC",
//         {
//           bind: {
//             branchId: id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       res.json(accounts)
//     }
//     if (isBranchAdmin(user.role)) {
//       const accounts = await db.sequelize.query(
//         'Select T.*\n' +
//           'from BilledTransactions T\n' +
//           "where T.deletedAt IS NULL and T.branchId = $branchId and (T.status = 'OnBilled' or T.status = 'Billed') order by id DESC",
//         {
//           bind: {
//             branchId: user.branchId
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       res.json(accounts)
//     }
//     const accounts = await db.sequelize.query(
//       'Select T.*\n' +
//         'from BilledTransactions T\n' +
//         "where T.deletedAt IS NULL and T.branchId = $branchId and  (T.status = 'OnBilled' or T.status = 'Billed') order by id DESC",
//       {
//         bind: {
//           branchId: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(accounts)
//   } catch (e) {
//     req.log.error('error in getBranchAccounts', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getTransCollected = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { id } = req.params
//     const user = req.user
//     if (!isFinanceOrCompanyAdminOrBranchManager(user.role)) {
//       throw new Error('Unauthorized')
//     }
//     const trans = await CollectTransactions.findByPk(id)
//     if (!trans) throw new Error('Error in ')
//     const transOrders = await CollectOrders.findAll(
//       {
//         where: { transactionId: id }
//       },

//       {
//         transaction
//       }
//     )
//     if (transOrders.length <= 0) throw new Error('NotFound')

//     const ids = await transOrders.map((item) => item.orderId)
//     const vektor = await OrderFees.findAll(
//       {
//         where: {
//           orderId: {
//             [Op.in]: ids
//           }
//         },
//         order: [['createdAt', 'ASC']],
//         include: [{ model: Order, attributes: ['code'] }],
//         attributes: {
//           include: [
//             [sequelize.col('code'), 'code'],
//             [sequelize.col('name'), 'name']
//           ],
//           exclude: ['updatedAt', 'deletedAt']
//         }
//       },

//       {
//         transaction
//       }
//     )
//     const account = await Branch.findByPk(trans.branchId)

//     res.json({ trans, vektor, account })
//     await transaction.commit()
//   } catch (e) {
//     await transaction.rollback()

//     req.log.error('error in getTrans', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// // superAdmin delete order
// export const deleteCollectTrans = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const user = req.user
//     const { id } = req.params
//     if (!id) throw new Error('Nothing to delete')
//     const trans = await CollectTransactions.findByPk(id)
//     if (!trans) throw new Error('Error in ')
//     const branch = await Branch.findByPk(trans.branchId)

//     if (!branch) throw new Error('Branch not ofund')
//     if (branch.id === 1 || trans.status !== 'Collected') {
//       const transHistory = await CollectHistory.findAll({
//         where: { transactionsId: id },
//         transaction
//       })
//       if (transHistory.length <= 0) throw new Error('NotFound')

//       await CollectHistory.destroy({
//         where: {
//           transactionsId: id
//         },
//         transaction
//       })

//       const transOrders = await CollectOrders.findAll({
//         where: { transactionId: id },
//         transaction
//       })
//       if (transOrders.length <= 0) {
//         await CollectTransactions.destroy({
//           where: {
//             id
//           },
//           transaction
//         })

//         transaction.commit()

//         res.json('done')
//       }
//       const ids = await transOrders.map((item) => item.orderId)

//       await CollectOrders.destroy({
//         where: {
//           transactionId: id
//         },
//         transaction
//       })
//       await CollectTransactions.destroy({
//         where: {
//           id
//         },
//         transaction
//       })

//       await Order.update(
//         { collected: null, updatedAt: new Date() },
//         {
//           where: {
//             id: {
//               [Op.in]: ids
//             }
//           },
//           transaction
//         }
//       )
//       transaction.commit()
//       res.json('done')
//     }

//     const totalALL = trans.totalALL || 0
//     const totalEur = trans.totalEUR || 0
//     const transHistory = await CollectHistory.findAll({
//       where: { transactionsId: id },
//       transaction
//     })
//     if (transHistory.length <= 0) throw new Error('NotFound')

//     await CollectHistory.destroy({
//       where: {
//         transactionsId: id
//       },
//       transaction
//     })

//     const transOrders = await CollectOrders.findAll({
//       where: { transactionId: id },
//       transaction
//     })
//     if (transOrders.length <= 0) {
//       await CollectTransactions.destroy({
//         where: {
//           id
//         },
//         transaction
//       })

//       transaction.commit()

//       res.json('done')
//     }
//     const ids = await transOrders.map((item) => item.orderId)

//     await CollectOrders.destroy({
//       where: {
//         transactionId: id
//       },
//       transaction
//     })
//     await CollectTransactions.destroy({
//       where: {
//         id
//       },
//       transaction
//     })

//     await Order.update(
//       { collected: null, updatedAt: new Date() },
//       {
//         where: {
//           id: {
//             [Op.in]: ids
//           }
//         },
//         transaction
//       }
//     )
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
//     const client = await Zeri.create(
//       {
//         valueALL: totalALL || 0,
//         valueEUR: totalEur || 0,
//         arkaALL: all - totalALL,
//         arkaEUR: eur - totalEur,
//         tipi: 'branch',
//         status: 'Dalje',
//         comment: `Fshirje fature mbledhje me nr.${trans.id} per zyren:${branch.name}  `,
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
//         daljeALL: totalALL,
//         daljeEUR: totalEur,
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
// export const getBranchesCollect = async (req, res) => {
//   try {
//     const ordersALL = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT O.id) as `count` , OT.destBranchId as destBranchId,SUM(O.total) as total\n' +
//         '        from `Order` O\n' +
//         '                       join OrderHistory OH\n' +
//         '                                on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//         '        join OrderRoutes OT on O.id = OT.orderId\n' +
//         '        join Countries CU on O.destinationCountry = CU.id\n' +
//         "  where O.deletedAt IS NULL and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar') and O.currency = 'ALL'  and O.collected IS NULL group by OT.destBranchId",

//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const ordersEUR = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT O.id) as `count` , OT.destBranchId as destBranchId,SUM(O.total) as total\n' +
//         '        from `Order` O\n' +
//         '                       join OrderHistory OH\n' +
//         '                                on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//         '                               join OrderRoutes OT on O.id = OT.orderId\n' +
//         '        join Countries CU on O.destinationCountry = CU.id\n' +
//         "  where O.deletedAt IS NULL and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar')and O.currency = 'EUR' and O.collected IS NULL group by OT.destBranchId",

//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const orderTotal = await db.sequelize.query(
//       '        SELECT O.currency,SUM(O.total) as total\n' +
//         '        from `Order` O\n' +
//         '        join OrderRoutes OT on O.id = OT.orderId\n' +
//         "  where O.deletedAt IS NULL and (O.status = 'Completed' or O.status = 'OnLikuid' or O.status = 'Likuiduar') and O.collected IS NULL  group by O.currency",

//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const branch = await Branch.findAll()

//     const newArray = await branch.map((e) => {
//       const resultAll = ordersALL.find(
//         ({ destBranchId }) => destBranchId === e.id
//       )
//       const resultEUR = ordersEUR.find(
//         ({ destBranchId }) => destBranchId === e.id
//       )

//       if (!resultAll || !resultEUR) {
//         return {
//           id: e.id,
//           branchName: e.name,
//           owner: e.administrator,
//           totalAll: !resultAll ? 0 : resultAll.total,
//           totalEuro: !resultEUR ? 0 : resultEUR.total,
//           countAll: !resultAll ? 0 : resultAll.count,
//           countEuro: !resultEUR ? 0 : resultEUR.count
//         }
//       }

//       return {
//         id: e.id,
//         branchName: e.name,
//         owner: e.administrator,
//         totalAll: resultAll.total,
//         totalEuro: resultEUR.total,
//         countAll: resultAll.count,
//         countEuro: resultEUR.count
//       }
//     })
//     const totalAll = orderTotal.find(({ currency }) => currency === 'ALL')
//     const totalEuro = orderTotal.find(({ currency }) => currency === 'EUR')
//     const total = {
//       totalAll: !totalAll ? 0 : totalAll.total,
//       totalEuro: !totalEuro ? 0 : totalEuro.total
//     }
//     res.json({ newArray, total })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getFinanceStatistic = async (req, res) => {
//   try {
//     const { year, month } = req.body.data
//     const user = req.user

//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')

//     const mainArka = await db.sequelize.query(
//       'Select A.*\n' +
//         'from Arka A\n' +
//         'where A.deletedAt IS NULL ORDER BY id DESC LIMIT 1    ',
//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     // const orgAll = org.find(({ currency }) => currency === 'ALL')
//     // const orgEUR = org.find(({ currency }) => currency === 'EUR')

//     // const trOrgAll = trOrg.find(({ currency }) => currency === 'ALL')
//     // const trOrgEUR = trOrg.find(({ currency }) => currency === 'EUR')
//     // const trDestAll = trDest.find(({ currency }) => currency === 'ALL')
//     // const trDestEUR = trDest.find(({ currency }) => currency === 'EUR')

//     // const allAll = !orgAll ? 0 : orgAll.totattransport
//     // const euroAll = !orgEUR ? 0 : orgEUR.totattransport

//     // const mainAllFee = !orgAll ? 0 : orgAll.mainFees
//     // const mainEuroFee = !orgEUR ? 0 : orgEUR.mainFees

//     // const branchAllFee = orgAll.orgFees + orgAll.destFees
//     // const branchEuroFee = orgEUR.orgFees + orgEUR.destFees
//     // const count = orgAll.count + orgEUR.count
//     // const totalTrAll = trOrgAll.orgFees + trDestAll.destFees + mainAllFee
//     // const totalTrEuro = trOrgEUR.orgFees + trDestEUR.destFees + mainEuroFee
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
//     const all = !mainArka ? 0 : mainArka[0].totalALL
//     const eur = !mainArka ? 0 : mainArka[0].totalEUR
//     const total = {
//       mainAll: all,
//       mainEur: eur
//     }
//     res.json({ total, zeri })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const getbrStatsById = async (req, res) => {
//   try {
//     const user = req.user
//     const { id } = req.params
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')

//     const org = await db.sequelize.query(
//       '       SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.orderTotalFee) as totattransport,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         '  where OS.deletedAt IS NULL and OT.orgBranchId = $branchId  group by OS.currency',

//       {
//         bind: {
//           branchId: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const dest = await db.sequelize.query(
//       '       SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.orderTotalFee) as totattransport,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         '  where OS.deletedAt IS NULL and OT.destBranchId = $branchId  group by OS.currency',

//       {
//         bind: {
//           branchId: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const collect = await db.sequelize.query(
//       'SELECT SUM(O.total) as collect,O.currency as currency\n' +
//         'from `Order` O\n' +
//         '        join OrderRoutes OT on O.id = OT.orderId\n' +
//         "  where O.deletedAt IS NULL and OT.destBranchId = $branchId and (O.status = 'Completed' or O.status = 'Likuiduar' or O.status = 'OnLikuid') and (O.collected IS NULL or O.collected = 0) group by O.currency",
//       {
//         bind: {
//           branchId: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const orgAll = org.find(({ currency }) => currency === 'ALL')
//     const orgEUR = org.find(({ currency }) => currency === 'EUR')

//     const destAll = dest.find(({ currency }) => currency === 'ALL')
//     const destEUR = dest.find(({ currency }) => currency === 'EUR')

//     const collAll = collect.find(({ currency }) => currency === 'ALL')
//     const collEuro = collect.find(({ currency }) => currency === 'EUR')
//     // const trOrgAll = trOrg.find(({ currency }) => currency === "ALL");
//     // const trOrgEUR = trOrg.find(({ currency }) => currency === "EUR");
//     // const trDestAll = trDest.find(({ currency }) => currency === "ALL");
//     // const trDestEUR = trDest.find(({ currency }) => currency === "EUR");

//     const orgAllAll = !orgAll ? 0 : orgAll.orgFees
//     const orgEuroAll = !orgEUR ? 0 : orgEUR.orgFees
//     const destAllAll = !destAll ? 0 : destAll.destFees
//     const destEuroAll = !destEUR ? 0 : destEUR.destFees
//     const orgcount1 = !orgAll ? 0 : orgAll.count
//     const orgcount2 = !orgEUR ? 0 : orgEUR.count
//     const destcount1 = !destAll ? 0 : destAll.count
//     const destcount2 = !destEUR ? 0 : destEUR.count

//     // const mainAllFee = !orgAll ? 0 : orgAll.mainFees;
//     // const mainEuroFee = !orgEUR ? 0 : orgEUR.mainFees;

//     const branchAllFee = orgAllAll + destAllAll
//     const branchEuroFee = orgEuroAll + destEuroAll
//     const mainAllFee = !orgAll ? 0 : orgAll.mainFees
//     const mainEuroFee = !orgEUR ? 0 : orgEUR.mainFees
//     const orgCount = orgcount1 + orgcount2
//     const destCount = destcount1 + destcount2
//     const collectAll = !collAll ? 0 : collAll.collect
//     const collectEuro = !collEuro ? 0 : collEuro.collect

//     // const branchEuroFee = orgEUR.orgFees + orgEUR.destFees;
//     // const count = orgAll.count + orgEUR.count;
//     // const totalTrAll = trOrgAll.orgFees + trDestAll.destFees + mainAllFee;
//     // const totalTrEuro = trOrgEUR.orgFees + trDestEUR.destFees + mainEuroFee;

//     const total = {
//       branchAllFee,
//       branchEuroFee,
//       mainAllFee,
//       mainEuroFee,
//       orgCount,
//       destCount,
//       collectAll,
//       collectEuro
//     }
//     res.json(total)
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const suAdminBrStatsXY = async (req, res) => {
//   try {
//     const user = req.user
//     if (!isSystemAdmin(user.role)) throw new Error('not allowed')

//     const org = await db.sequelize.query(
//       '       SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.orderTotalFee) as orderTotalFee,OS.currency as currency\n' +
//         '                      from `OrderFees` OS\n' +
//         '                       join OrderRoutes OT on OS.orderid = OT.orderId\n' +
//         '  where OS.deletedAt IS NULL group by OS.currency',

//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const orgAll = org.find(({ currency }) => currency === 'ALL')
//     const orgEUR = org.find(({ currency }) => currency === 'EUR')

//     const mainAllFee = !orgAll ? 0 : orgAll.orderTotalFee
//     const maiEnuroFee = !orgEUR ? 0 : orgEUR.orderTotalFee
//     const orgcount1 = !orgAll ? 0 : orgAll.count
//     const orgcount2 = !orgEUR ? 0 : orgEUR.count
//     const orgCount = orgcount1 + orgcount2

//     const total = {
//       mainAllFee,
//       maiEnuroFee,
//       orgCount
//     }
//     res.json(total)
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getProccesBilledByIdAndMonth = async (req, res) => {
//   try {
//     const { year, month, id } = req.body.data
//     const user = req.user
//     const branch = await Branch.findByPk(id)

//     if (!isBranchAdminOrFinance(user.role)) throw new Error('not allowed')
//     if (!branch) throw new Error('not found')

//     const org = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.orgBranchId = $branch group by OS.currency',
//       {
//         bind: {
//           branch: branch.id,
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const dest = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and  (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.destBranchId = $branch group by OS.currency',
//       {
//         bind: {
//           branch: branch.id,
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const countDest = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` \n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.destBranchId = $branch and OT.destBranchId != OT.orgBranchId  ',
//       {
//         bind: {
//           branch: branch.id,
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const countOrg = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` \n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.orgBranchId = $branch ',
//       {
//         bind: {
//           branch: branch.id,
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const orgAll = org.find(({ currency }) => currency === 'ALL')
//     const orgEUR = org.find(({ currency }) => currency === 'EUR')
//     const destAll = dest.find(({ currency }) => currency === 'ALL')
//     const destEUR = dest.find(({ currency }) => currency === 'EUR')

//     const xall = !orgAll ? 0 : orgAll.orgFees
//     // const mxall = !orgAll ? 0 : orgAll.mainFees;

//     const Yall = !destAll ? 0 : destAll.destFees
//     // const myall = !destAll ? 0 : destAll.mainFees;

//     const xeuro = !orgEUR ? 0 : orgEUR.orgFees
//     // const mxeuro = !orgEUR ? 0 : orgEUR.mainFees;

//     const Yeuro = !destEUR ? 0 : destEUR.destFees
//     // const myeuro = !destEUR ? 0 : destEUR.mainFees;
//     const countX = !countOrg ? 0 : countOrg[0].count
//     const county = !countDest ? 0 : countDest[0].count

//     const total = {
//       branchName: branch.name,
//       totalAll: xall + Yall,
//       totalEUR: xeuro + Yeuro,
//       countOrg: countX,
//       countDest: county
//     }
//     res.json(total)
//     console.log(total)
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// // superAdmin delete order
// export const deleteBilledTrans = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const { id } = req.params
//     const user = req.user
//     if (!id) throw new Error('Nothing to delete')
//     const trans = await BilledTransactions.findByPk(id)
//     const totalALL = trans.totalALL || 0
//     const totalEur = trans.totalEUR || 0
//     if (!trans) throw new Error('Error in ')
//     const transHistory = await BilledHistory.findAll({
//       where: { transactionsId: id },
//       transaction
//     })
//     if (transHistory.length <= 0) throw new Error('NotFound')

//     await BilledHistory.destroy({
//       where: {
//         transactionsId: id
//       },
//       transaction
//     })

//     await BilledTransactions.destroy({
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
//     const all = !mainArka ? 0 : mainArka[0].totalALL
//     const eur = !mainArka ? 0 : mainArka[0].totalEUR
//     const client = await Zeri.create(
//       {
//         valueALL: totalALL || 0,
//         valueEUR: totalEur || 0,
//         arkaALL: all + totalALL,
//         arkaEUR: eur + totalEur,
//         tipi: 'branch',
//         status: 'Hyrje',
//         comment: `Fshirje fature likuidimi me nr.${trans.id} per zyren me nr.${trans.branchId} `,
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
//         totalALL: all + totalALL,
//         totalEUR: eur + totalEur,
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
// export const getTransBilled = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { id } = req.params
//     const user = req.user
//     if (!isBranchAdminOrFinance(user.role)) {
//       throw new Error('Unauthorized')
//     }
//     const trans = await BilledTransactions.findByPk(id)
//     if (!trans) throw new Error('Error in ')

//     const account = await Branch.findByPk(trans.branchId)

//     res.json({ trans, account })
//     await transaction.commit()
//   } catch (e) {
//     await transaction.rollback()

//     req.log.error('error in getTrans', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getOrdersBilledByIdAndMonth = async (req, res) => {
//   try {
//     const { year, month, id } = req.body.data
//     const user = req.user
//     const branch = await Branch.findByPk(id)

//     if (!isBranchAdmin(user.role)) throw new Error('not allowed')
//     if (!branch) throw new Error('not found')

//     const org = await db.sequelize.query(
//       'SELECT O.*,OS.originBranchFee as orgFees,OS.orderTotalFee as totalFee,OS.currency as currency\n' +
//         'from `Order` O\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.orgBranchId = $branch ',
//       {
//         bind: {
//           branch: branch.id,
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const dest = await db.sequelize.query(
//       'SELECT O.*,OS.destinationBranchFee as orgFees,OS.orderTotalFee as totalFee,OS.currency as currency\n' +
//         'from `Order` O\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.destBranchId = $branch and OT.destBranchId !=OT.orgBranchId  order by id ASC ',
//       {
//         bind: {
//           branch: branch.id,
//           year,
//           month
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     res.json({ org, dest })
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const fixCollected = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const user = req.user
//     const { id } = req.params
//     const branch = await Branch.findByPk(id)

//     if (!branch) throw new Error('Not found')

//     const lek = await db.sequelize.query(
//       ' SELECT  SUM(O.total) as total,O.currency as currency\n' +
//         'from `Order` O\n' +
//         'join OrderRoutes OT on O.id = OT.orderId\n' +
//         " where O.deletedAt IS NULL and OT.destBranchId = $branch and (O.status != 'Rejected' and O.status !='Kthyer')  and O.collected IS NOT NULL   group by O.currency  ",

//       {
//         bind: {
//           branch: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const orderTotal = await db.sequelize.query(
//       ' SELECT O.*\n' +
//         'from `Order` O\n' +
//         'join OrderRoutes OT on O.id = OT.orderId\n' +
//         " where O.deletedAt IS NULL and OT.destBranchId = $branch and (O.status != 'Rejected' and O.status !='Kthyer') and O.collected IS NOT NULL  order by id DESC",

//       {
//         bind: {
//           branch: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const selected = await orderTotal.map((src, index) => {
//       return src.id
//     })
//     const orgAll = lek.find(({ currency }) => currency === 'ALL')
//     const orgEUR = lek.find(({ currency }) => currency === 'EUR')

//     const totalALL = !orgAll ? 0 : orgAll.total
//     const totalEUR = !orgEUR ? 0 : orgEUR.total

//     const code = await generateTransCode(branch.cityId, branch.id)

//     const trans = await CollectTransactions.create(
//       {
//         totalALL,
//         totalEUR,
//         branchId: id,
//         code,
//         status: 'Collected'
//       },
//       {
//         transaction
//       }
//     )

//     const trOrBody = {
//       transactionId: trans.id,
//       orderId: null
//     }

//     const trOrBodyBulk = selected.map((i) => {
//       return {
//         ...trOrBody,
//         orderId: i
//       }
//     })
//     await CollectOrders.bulkCreate(trOrBodyBulk, {
//       transaction
//     })

//     await CollectHistory.create(
//       {
//         transactionsId: trans.id,
//         status: trans.status,
//         name: user.fullName,
//         createdBy: user.id
//       },

//       {
//         transaction
//       }
//     )

//     await transaction.commit()
//     res.json('done')
//   } catch (e) {
//     await transaction.rollback()
//     req.log.error('error in onCollect', { error: e.message })
//     res.status(500).json({ error: e.message })
//   }
// }

// export const onReturnOrdersPrint = async (req, res) => {
//   const transaction = await db.sequelize.transaction()
//   try {
//     const user = req.user
//     const { selected, status } = req.body
//     const ids = selected.toString()
//     const code = new Date().getTime()
//     const comment = 'Kthyer biznesit'

//     const vektor = await Order.findAll(
//       {
//         where: {
//           id: {
//             [Op.in]: selected
//           }
//         },

//         order: [['createdAt', 'ASC']]
//       },

//       {
//         transaction
//       }
//     )
//     if (vektor.length < 1) throw new Error('Not found order')

//     const curre = await vektor.map((src, index) => {
//       return src.company
//     })
//     const allEqual = (arr) => arr.every((v) => v === arr[0])
//     if (allEqual(curre) === false) throw new Error('not same')

//     const account = await Account.findByPk(vektor[0].company)
//     if (!account) throw new Error('Not found account')
//     if (!user.branchId) throw new Error('Unauthorized')
//     if (status === 'Rejected') {
//       if (isCourierOrBranch(user.role)) {
//         const oHistory = {
//           orderId: null,
//           vehicle: null,
//           status: 'Kthyer',
//           name: null,
//           comment,
//           courierId: null,
//           branchId: null,
//           createdBy: user.id
//         }
//         if (isCourier(user.role)) {
//           const vehicle = await Vehicles.findOne({
//             where: {
//               courierId: user.id
//             }
//           })
//           oHistory.vehicle = vehicle.id
//           oHistory.courierId = user.id
//           oHistory.name = user.fullName
//         } else {
//           const branch = await Branch.findByPk(user.branchId)
//           oHistory.branchId = user.branchId
//           oHistory.name = branch.name
//         }
//         const orderHistoryBulk = selected.map((i) => {
//           return {
//             ...oHistory,
//             orderId: i
//           }
//         })
//         await OrderHistory.bulkCreate(orderHistoryBulk, {
//           transaction
//         })
//         await Order.update(
//           { status: 'Kthyer', updatedAt: new Date() },
//           {
//             where: {
//               id: {
//                 [Op.in]: selected
//               }
//             },
//             transaction
//           }
//         )
//       }
//       const trans = await ReturnOrdersTransactions.create(
//         {
//           ids,
//           branchId: user.branchId,
//           accountId: account.id,
//           accountName: account.name,
//           code,
//           status: 'Rejected',
//           createdBy: user.id
//         },

//         {
//           transaction
//         }
//       )

//       await transaction.commit()
//       res.json({ vektor, trans, account })
//     } else if (status === 'Switched') {
//       await SwitchOrder.update(
//         { return: true, updatedAt: new Date() },
//         {
//           where: {
//             old: {
//               [Op.in]: selected
//             }
//           },
//           transaction
//         }
//       )
//       const trans = await ReturnOrdersTransactions.create(
//         {
//           ids,
//           branchId: user.branchId,
//           accountId: account.id,
//           accountName: account.name,
//           code,
//           status: 'Switched',
//           createdBy: user.id
//         },

//         {
//           transaction
//         }
//       )

//       await transaction.commit()
//       res.json({ vektor, trans, account })
//     } else if (status === 'Completed') {
//       if (isCourierOrBranch(user.role)) {
//         const oHistory = {
//           orderId: null,
//           vehicle: null,
//           status: 'Kthyer',
//           name: null,
//           comment,
//           courierId: null,
//           branchId: null,
//           createdBy: user.id
//         }
//         if (isCourier(user.role)) {
//           const vehicle = await Vehicles.findOne({
//             where: {
//               courierId: user.id
//             }
//           })
//           oHistory.vehicle = vehicle.id
//           oHistory.courierId = user.id
//           oHistory.name = user.fullName
//         } else {
//           const branch = await Branch.findByPk(user.branchId)
//           oHistory.branchId = user.branchId
//           oHistory.name = branch.name
//         }
//         const orderHistoryBulk = selected.map((i) => {
//           return {
//             ...oHistory,
//             orderId: i
//           }
//         })
//         await OrderHistory.bulkCreate(orderHistoryBulk, {
//           transaction
//         })
//       }
//       const trans = await ReturnOrdersTransactions.create(
//         {
//           ids,
//           branchId: user.branchId,
//           accountId: account.id,
//           accountName: account.name,
//           code,
//           status: 'Switched',
//           createdBy: user.id
//         },

//         {
//           transaction
//         }
//       )
//       await transaction.commit()
//       res.json({ vektor, trans, account })
//     } else {
//       await transaction.commit()

//       res.json('status not specified')
//     }
//   } catch (e) {
//     await transaction.rollback()
//     req.log.error('error in onLikuidStatus', { error: e.message })
//     res.status(500).json({ error: e.message })
//   }
// }
// export const getReturnTrans = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { id } = req.params
//     const user = req.user

//     if (isFinanceOrAAdmin(user.role)) {
//       const trans = await db.sequelize.query(
//         'Select T.*\n' +
//           'from ReturnOrdersTransactions T\n' +
//           'where T.deletedAt IS NULL  order by id DESC',
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
//       const trans = await db.sequelize.query(
//         'Select T.*\n' +
//           'from ReturnOrdersTransactions T\n' +
//           'where T.deletedAt IS NULL and T.branchId = $branch  order by id DESC',
//         {
//           bind: {
//             branch: id
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
// export const getReturnTrasnForPrint = async (req, res) => {
//   try {
//     const { id } = req.params
//     const user = req.user
//     if (!isFinanceOrCompanyAdminOrBranchManager(user.role)) {
//       throw new Error('Forbiden 2')
//     }
//     const trans = await ReturnOrdersTransactions.findByPk(id)
//     const array = trans.ids.split(',').map(Number)
//     const account = await Account.findByPk(trans.accountId)

//     const vektor = await Order.findAll({
//       where: {
//         id: {
//           [Op.in]: array
//         }
//       }
//     })
//     res.json({ trans, vektor, account })
//   } catch (e) {
//     req.log.error('error in getNextBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getRaportByDate = async (req, res) => {
//   try {
//     const user = req.user
//     const { date1, date2 } = req.body.data
//     if (!isFinanceOrAAdmin(user.role)) throw new Error('not allowed')

//     const org = await db.sequelize.query(
//       '   SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.orderTotalFee) as totattransport,SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and (O.status = "Completed" or O.status = "OnLikuid" or O.status = "Likuiduar")  and O.completedAt BETWEEN $date1 AND $date2 group by OS.currency',

//       {
//         bind: {
//           date1,
//           date2
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const trOrg = await db.sequelize.query(
//       '        SELECT SUM(OS.originBranchFee) as orgFees,OS.currency as currency\n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and (O.status = "Completed" or O.status = "OnLikuid" or O.status = "Likuiduar")  and O.completedAt BETWEEN $date1 AND $date2 and OT.orgBranchId = 1   group by OS.currency',
//       {
//         bind: {
//           date1,
//           date2
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const trDest = await db.sequelize.query(
//       '        SELECT SUM(OS.destinationBranchFee) as destFees,OS.currency as currency\n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and (O.status = "Completed" or O.status = "OnLikuid" or O.status = "Likuiduar")  and O.completedAt BETWEEN $date1 AND $date2 and OT.destBranchId = 1  group by OS.currency',
//       {
//         bind: {
//           date1,
//           date2
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const orgAll = org.find(({ currency }) => currency === 'ALL')
//     const orgEUR = org.find(({ currency }) => currency === 'EUR')

//     const trOrgAll = trOrg.find(({ currency }) => currency === 'ALL')
//     const trOrgEUR = trOrg.find(({ currency }) => currency === 'EUR')
//     const trDestAll = trDest.find(({ currency }) => currency === 'ALL')
//     const trDestEUR = trDest.find(({ currency }) => currency === 'EUR')

//     const OrgAllTr = !trOrgAll ? 0 : trOrgAll.orgFees
//     const OrgEurTr = !trOrgEUR ? 0 : trOrgEUR.orgFees

//     const DestAllTr = !trDestAll ? 0 : trDestAll.destFees
//     const DestEurTr = !trDestEUR ? 0 : trDestEUR.destFees

//     const allAll = !orgAll ? 0 : orgAll.totattransport
//     const euroAll = !orgEUR ? 0 : orgEUR.totattransport

//     const mainAllFee = !orgAll ? 0 : orgAll.mainFees
//     const mainEuroFee = !orgEUR ? 0 : orgEUR.mainFees
//     const coutAll = !orgAll ? 0 : orgAll.count
//     const countEur = !orgEUR ? 0 : orgEUR.count
//     // const branchAllFee = !orgAll
//     //   ? 0
//     //   : orgAll.orgFees + !orgAll
//     //   ? 0
//     //   : orgAll.destFees;
//     // const branchEuroFee = !orgEUR
//     //   ? 0
//     //   : orgEUR.orgFees + !orgEUR
//     //   ? 0
//     //   : orgEUR.destFees;

//     const totalTrAll = OrgAllTr + DestAllTr + mainAllFee
//     const totalTrEuro = OrgEurTr + DestEurTr + mainEuroFee

//     const total = {
//       allAll,
//       euroAll,

//       totalTrAll,
//       totalTrEuro,
//       coutAll,
//       countEur
//     }
//     res.json(total)
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const printBilledOrders = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { year, month, id } = req.body.data
//     const user = req.user
//     if (!isFinanceOrCompanyAdminOrBranchManager(user.role)) {
//       throw new Error('Unauthorized')
//     }
//     const trans = await BilledTransactions.findByPk(id)
//     if (!trans) throw new Error('not found trans')

//     const branch = await Branch.findByPk(trans.branchId)
//     if (!branch) throw new Error('not found branch of trans')
//     if (trans.start === null && trans.end === null) {
//       const org = await db.sequelize.query(
//         'SELECT O.*,OS.originBranchFee as orgFees,OS.orderTotalFee as totalFee,OS.currency as currency\n' +
//           'from `Order` O\n' +
//           '                       join OrderFees OS on O.id = OS.orderId\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.orgBranchId = $branch ',
//         {
//           bind: {
//             branch: branch.id,
//             year,
//             month
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       const dest = await db.sequelize.query(
//         'SELECT O.*,OS.destinationBranchFee as orgFees,OS.orderTotalFee as totalFee,OS.currency as currency\n' +
//           'from `Order` O\n' +
//           '                       join OrderFees OS on O.id = OS.orderId\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '  where O.deletedAt IS NULL and (YEAR(O.completedAt) = $year AND MONTH(O.completedAt) = $month) and OT.destBranchId = $branch and OT.destBranchId !=OT.orgBranchId ',
//         {
//           bind: {
//             branch: branch.id,
//             year,
//             month
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       const activities = [...org, ...dest]
//       const vektor = activities.sort((a, b) => a.createdAt - b.createdAt)

//       res.json({ trans, vektor, branch })
//       await transaction.commit()
//     } else {
//       const date1 = trans.start

//       const date2 = trans.end
//       const org = await db.sequelize.query(
//         'SELECT O.*,OS.originBranchFee as orgFees,OS.orderTotalFee as totalFee,OS.currency as currency\n' +
//           'from `Order` O\n' +
//           '                       join OrderFees OS on O.id = OS.orderId\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '  where O.deletedAt IS NULL and O.completedAt BETWEEN $date1 AND $date2 and OT.orgBranchId = $branch ',
//         {
//           bind: {
//             branch: branch.id,
//             date1,
//             date2
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       const dest = await db.sequelize.query(
//         'SELECT O.*,OS.destinationBranchFee as orgFees,OS.orderTotalFee as totalFee,OS.currency as currency\n' +
//           'from `Order` O\n' +
//           '                       join OrderFees OS on O.id = OS.orderId\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '  where O.deletedAt IS NULL  and O.completedAt BETWEEN $date1 AND $date2 and OT.destBranchId = $branch and OT.destBranchId !=OT.orgBranchId',
//         {
//           bind: {
//             branch: branch.id,
//             date1,
//             date2
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       const activities = [...org, ...dest]
//       const vektor = activities.sort((a, b) => a.createdAt - b.createdAt)

//       res.json({ trans, vektor, branch })
//       await transaction.commit()
//     }

//     await transaction.commit()
//   } catch (e) {
//     await transaction.rollback()

//     req.log.error('error in getTrans', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const deliveryByCity = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const user = req.user
//     if (isFinanceOrAAdmin(user.role)) {
//       const orgALL = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OT.id) as `count` , B.name, B.id as 'brId'\n" +
//           '                      from `Order` O\n' +
//           '                       join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id AND OrderHistory.deletedAt IS NULL  ORDER BY id DESC LIMIT 1)\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '                        join Branch B on OT.destBranchId = B.id\n' +
//           " where O.deletedAt IS NULL and  O.status = 'In Transit' and OH.branchId =1 and OH.status ='Ne Magazine'  group by OT.destBranchId",
//         {
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orgALL)
//       await transaction.commit()
//     } else {
//       const branch = await Branch.findByPk(user.branchId)
//       if (!branch) throw new Error('not found trans')

//       const orgALL = await db.sequelize.query(
//         "        SELECT COUNT(DISTINCT OT.id) as `count` , B.name, B.id as 'brId'\n" +
//           '                      from `Order` O\n' +
//           '                       join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id AND OrderHistory.deletedAt IS NULL  ORDER BY id DESC LIMIT 1)\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '                        join Branch B on OT.destBranchId = B.id\n' +
//           " where O.deletedAt IS NULL and  O.status = 'In Transit' and OH.branchId =$branch and OH.status ='Ne Magazine'  group by OT.destBranchId",
//         {
//           bind: {
//             branch: branch.id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orgALL)
//       await transaction.commit()
//     }
//   } catch (e) {
//     await transaction.rollback()

//     req.log.error('error in get sum by branch', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const deliveryByBrListOrder = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { id } = req.params

//     const user = req.user
//     if (isFinanceOrAAdmin(user.role)) {
//       const orgALL = await db.sequelize.query(
//         '        SELECT O.*,CD.name as destCity,CU.name as destCountry\n' +
//           '                      from `Order` O\n' +
//           '                       join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id AND OrderHistory.deletedAt IS NULL  ORDER BY id DESC LIMIT 1)\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '                        join Branch B on OT.destBranchId = B.id\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           " where O.deletedAt IS NULL and  O.status = 'In Transit' and OH.branchId =1 and OH.status ='Ne Magazine' and  OT.destBranchId =$id",
//         {
//           bind: {
//             id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orgALL)
//       await transaction.commit()
//     } else {
//       const branch = await Branch.findByPk(user.branchId)
//       if (!branch) throw new Error('not found trans')

//       const orgALL = await db.sequelize.query(
//         '        SELECT O.* ,CD.name as destCity,CU.name as destCountry\n' +
//           '                      from `Order` O\n' +
//           '                       join OrderHistory OH on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.orderId = O.id AND OrderHistory.deletedAt IS NULL  ORDER BY id DESC LIMIT 1)\n' +
//           '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//           '                        join Branch B on OT.destBranchId = B.id\n' +
//           '        join Cities CD on O.destinationCity = CD.id\n' +
//           '        join Countries CU on O.destinationCountry = CU.id\n' +
//           " where O.deletedAt IS NULL and  O.status = 'In Transit' and OH.branchId =$branch and OH.status ='Ne Magazine'  and OT.destBranchId =$id",
//         {
//           bind: {
//             branch: branch.id,
//             id
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )

//       res.json(orgALL)
//       await transaction.commit()
//     }
//   } catch (e) {
//     await transaction.rollback()

//     req.log.error('error in get sum by branch', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getProccesBilledBetwwen = async (req, res) => {
//   try {
//     const { date1, date2, id } = req.body.data
//     const user = req.user
//     const branch = await Branch.findByPk(id)

//     if (!isBranchAdminOrFinance(user.role)) throw new Error('not allowed')
//     if (!branch) throw new Error('not found')

//     const org = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and O.completedAt BETWEEN $date1 AND $date2  and OT.orgBranchId = $branch group by OS.currency',
//       {
//         bind: {
//           branch: branch.id,
//           date1,
//           date2
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )

//     const dest = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` , SUM(OS.originBranchFee) as orgFees,SUM(OS.destinationBranchFee) as destFees,SUM(OS.mainFee) as mainFees,OS.currency as currency\n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and O.completedAt BETWEEN $date1 AND $date2  and OT.destBranchId = $branch group by OS.currency',
//       {
//         bind: {
//           branch: branch.id,
//           date1,
//           date2
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const countDest = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` \n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and O.completedAt BETWEEN $date1 AND $date2  and OT.destBranchId = $branch and OT.destBranchId != OT.orgBranchId  ',
//       {
//         bind: {
//           branch: branch.id,
//           date1,
//           date2
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const countOrg = await db.sequelize.query(
//       '        SELECT COUNT(DISTINCT OS.id) as `count` \n' +
//         '                       from `Order` O\n' +
//         '                       join OrderRoutes OT on O.id = OT.orderId\n' +
//         '                       join OrderFees OS on O.id = OS.orderId\n' +
//         '  where O.deletedAt IS NULL and O.completedAt BETWEEN $date1 AND $date2  and OT.orgBranchId = $branch ',
//       {
//         bind: {
//           branch: branch.id,
//           date1,
//           date2
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     const orgAll = org.find(({ currency }) => currency === 'ALL')
//     const orgEUR = org.find(({ currency }) => currency === 'EUR')
//     const destAll = dest.find(({ currency }) => currency === 'ALL')
//     const destEUR = dest.find(({ currency }) => currency === 'EUR')

//     const xall = !orgAll ? 0 : orgAll.orgFees
//     // const mxall = !orgAll ? 0 : orgAll.mainFees;

//     const Yall = !destAll ? 0 : destAll.destFees
//     // const myall = !destAll ? 0 : destAll.mainFees;

//     const xeuro = !orgEUR ? 0 : orgEUR.orgFees
//     // const mxeuro = !orgEUR ? 0 : orgEUR.mainFees;

//     const Yeuro = !destEUR ? 0 : destEUR.destFees
//     // const myeuro = !destEUR ? 0 : destEUR.mainFees;
//     const countX = !countOrg ? 0 : countOrg[0].count
//     const county = !countDest ? 0 : countDest[0].count

//     const total = {
//       branchName: branch.name,
//       totalAll: xall + Yall,
//       totalEUR: xeuro + Yeuro,
//       countOrg: countX,
//       countDest: county
//     }
//     res.json(total)
//     console.log(total)
//   } catch (e) {
//     req.log.error('error in getCompletedBranchOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const brAdSearchQueryProccess = async (req, res) => {
//   const { name, condition } = req.body
//   const user = req.user
//   if (condition === 'proccess') {
//     try {
//       if (isSystemAdmin(user.role)) {
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis, O.*,\n' +
//             '       OH.comment as commentStatus,\n' +
//             '       CO.name  as orgCity,\n' +
//             '       CD.name  as destCity,\n' +
//             '       COD.name as destCountry,\n' +
//             '       COO.name as orgCountry,\n' +
//             '       A.name   as CompanyName,\n' +
//             '       OH.name   as Carier,\n' +
//             '       OH.status   as History\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '          left  join CommentOrder CK\n' +
//             '              on CK.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             '         join Cities CO on O.originCity = CO.id\n' +
//             '         join Cities CD on O.destinationCity = CD.id\n' +
//             '         join Countries COD on O.destinationCountry = COD.id\n' +
//             '         join Countries COO on O.originCountry = COO.id\n' +
//             '        join Account A on O.company = A.id\n' +
//             " where O.deletedAt IS NULL and O.status = 'In Transit' and OH.status != 'Order Created' and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or COD.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC ",

//           {
//             bind: {
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')

//         res.json(orders)
//       }
//       if (isBranchAdmin(user.role)) {
//         if (user.branchId === 1) {
//           const orders = await db.sequelize.query(
//             'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//               'from `Order` O\n' +
//               '         join OrderHistory OH\n' +
//               '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//               '        join Account A on O.company = A.id\n' +
//               '        join OrderRoutes OT on O.id = OT.orderId\n' +
//               '        join Cities CD on O.destinationCity = CD.id\n' +
//               '        join Countries CU on O.destinationCountry = CU.id\n' +
//               '        join Cities CA on O.originCity = CA.id\n' +
//               '          left  join CommentOrder CO\n' +
//               '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//               "where O.deletedAt IS NULL and O.status = 'In Transit' and( OH.status != 'Order Created' and OH.branchId = $branchId) and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//             {
//               bind: {
//                 branchId: user.branchId,
//                 text: name
//               },
//               type: sequelize.QueryTypes.SELECT
//             }
//           )
//           if (orders.length === 0) throw new Error('Order not found!')
//           res.json(orders)
//         }
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '        join Account A on O.company = A.id\n' +
//             '        join OrderRoutes OT on O.id = OT.orderId\n' +
//             '        join Cities CD on O.destinationCity = CD.id\n' +
//             '        join Countries CU on O.destinationCountry = CU.id\n' +
//             '        join Cities CA on O.originCity = CA.id\n' +
//             '          left  join CommentOrder CO\n' +
//             '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             "where O.deletedAt IS NULL and O.status = 'In Transit' and( OH.status != 'Order Created' and OH.branchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               branchId: user.branchId,
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')
//         res.json(orders)
//       }
//       throw new Error('Not allowed!')
//     } catch (e) {
//       req.log.error('error in get one order as admin', { error: e.message })
//       return res.status(500).json({ error: e.message })
//     }
//   }
//   if (condition === 'nextpartner') {
//     try {
//       if (isBranchAdmin(user.role)) {
//         if (user.branchId === 1) {
//           const orders = await db.sequelize.query(
//             'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//               'from `Order` O\n' +
//               '         join OrderHistory OH\n' +
//               '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//               '        join Account A on O.company = A.id\n' +
//               '        join OrderRoutes OT on O.id = OT.orderId\n' +
//               '        join Cities CD on O.destinationCity = CD.id\n' +
//               '        join Countries CU on O.destinationCountry = CU.id\n' +
//               '        join Cities CA on O.originCity = CA.id\n' +
//               '          left  join CommentOrder CO\n' +
//               '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//               "where O.deletedAt IS NULL and  O.status = 'In Transit' and  (OH.status != 'Order Created' and OH.branchId != $branchId) and (OT.orgBranchId = $branchId or OT.orgBranchId != $branchId) and OT.destBranchId != $branchId and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//             {
//               bind: {
//                 branchId: user.branchId,
//                 text: name
//               },
//               type: sequelize.QueryTypes.SELECT
//             }
//           )
//           if (orders.length === 0) throw new Error('Order not found!')
//           res.json(orders)
//         }
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '        join Account A on O.company = A.id\n' +
//             '        join OrderRoutes OT on O.id = OT.orderId\n' +
//             '        join Cities CD on O.destinationCity = CD.id\n' +
//             '        join Countries CU on O.destinationCountry = CU.id\n' +
//             '        join Cities CA on O.originCity = CA.id\n' +
//             '          left  join CommentOrder CO\n' +
//             '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             "where O.deletedAt IS NULL and O.status = 'In Transit'and  (OH.status != 'Order Created' and OH.branchId != $branchId) and  (OT.orgBranchId = $branchId and OT.destBranchId != $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               branchId: user.branchId,
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')
//         res.json(orders)
//       }
//       throw new Error('Not allowed!')
//     } catch (e) {
//       req.log.error('error in get one order as admin', { error: e.message })
//       return res.status(500).json({ error: e.message })
//     }
//   }
//   if (condition === 'tranzit') {
//     try {
//       if (!isBranchAdmin(user.role)) throw new Error('Not allowed!')
//       if (user.branchId !== 1) throw new Error('Forbiden 2')
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
//           "where O.deletedAt IS NULL  and O.status = 'In Transit' and OH.status != 'Order Created' and  (OT.orgBranchId != 1 and OT.destBranchId != 1) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//         {
//           bind: {
//             branchId: user.branchId,
//             text: name
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       if (orders.length === 0) throw new Error('Order not found!')
//       res.json(orders)
//     } catch (e) {
//       req.log.error('error in get one order as admin', { error: e.message })
//       return res.status(500).json({ error: e.message })
//     }
//   }
//   throw new Error('Not allowed end!')
// }
// export const brAdSearchQueryRejected = async (req, res) => {
//   const { name } = req.body
//   const user = req.user

//   try {
//     if (isSystemAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis, O.*,\n' +
//           '       OH.comment as commentStatus,\n' +
//           '       CO.name  as orgCity,\n' +
//           '       CD.name  as destCity,\n' +
//           '       COD.name as destCountry,\n' +
//           '       COO.name as orgCountry,\n' +
//           '       A.name   as CompanyName,\n' +
//           '       OH.name   as Carier,\n' +
//           '       OH.status   as History\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '          left  join CommentOrder CK\n' +
//           '              on CK.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//           '         join Cities CO on O.originCity = CO.id\n' +
//           '         join Cities CD on O.destinationCity = CD.id\n' +
//           '         join Countries COD on O.destinationCountry = COD.id\n' +
//           '         join Countries COO on O.originCountry = COO.id\n' +
//           '        join Account A on O.company = A.id\n' +
//           " where O.deletedAt IS NULL and O.status = 'Rejected' and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or COD.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC ",

//         {
//           bind: {
//             text: name
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       if (orders.length === 0) throw new Error('Order not found!')

//       res.json(orders)
//     }
//     if (isBranchAdmin(user.role)) {
//       if (user.branchId === 1) {
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '        join Account A on O.company = A.id\n' +
//             '        join OrderRoutes OT on O.id = OT.orderId\n' +
//             '        join Cities CD on O.destinationCity = CD.id\n' +
//             '        join Countries CU on O.destinationCountry = CU.id\n' +
//             '        join Cities CA on O.originCity = CA.id\n' +
//             '          left  join CommentOrder CO\n' +
//             '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             "where O.deletedAt IS NULL and  O.status = 'Rejected' and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')
//         res.json(orders)
//       }
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
//           "where O.deletedAt IS NULL and O.status = 'Rejected' and( OH.status != 'Order Created' and OH.branchId = $branchId) and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//         {
//           bind: {
//             branchId: user.branchId,
//             text: name
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       if (orders.length === 0) throw new Error('Order not found!')
//       res.json(orders)
//     }
//     throw new Error('Not allowed!')
//   } catch (e) {
//     req.log.error('error in get one order as admin', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const brAdSearchQueryFinished = async (req, res) => {
//   const { name, condition } = req.body
//   const user = req.user
//   if (condition === 'completed') {
//     try {
//       if (isSystemAdmin(user.role)) {
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis, O.*,\n' +
//             '       OH.comment as commentStatus,\n' +
//             '       CO.name  as orgCity,\n' +
//             '       CD.name  as destCity,\n' +
//             '       COD.name as destCountry,\n' +
//             '       COO.name as orgCountry,\n' +
//             '       A.name   as CompanyName,\n' +
//             '       OH.name   as Carier,\n' +
//             '       OH.status   as History\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '          left  join CommentOrder CK\n' +
//             '              on CK.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             '         join Cities CO on O.originCity = CO.id\n' +
//             '         join Cities CD on O.destinationCity = CD.id\n' +
//             '         join Countries COD on O.destinationCountry = COD.id\n' +
//             '         join Countries COO on O.originCountry = COO.id\n' +
//             '        join Account A on O.company = A.id\n' +
//             " where O.deletedAt IS NULL and (O.status = 'Completed'  or O.status = 'OnLikuid') and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or COD.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC ",

//           {
//             bind: {
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')

//         res.json(orders)
//       }
//       if (isBranchAdmin(user.role)) {
//         if (user.branchId === 1) {
//           const orders = await db.sequelize.query(
//             'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//               'from `Order` O\n' +
//               '         join OrderHistory OH\n' +
//               '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//               '        join Account A on O.company = A.id\n' +
//               '        join OrderRoutes OT on O.id = OT.orderId\n' +
//               '        join Cities CD on O.destinationCity = CD.id\n' +
//               '        join Countries CU on O.destinationCountry = CU.id\n' +
//               '        join Cities CA on O.originCity = CA.id\n' +
//               '          left  join CommentOrder CO\n' +
//               '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//               "where O.deletedAt IS NULL and (O.status = 'Completed'  or O.status = 'OnLikuid' or O.status = 'Collected') and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//             {
//               bind: {
//                 branchId: user.branchId,
//                 text: name
//               },
//               type: sequelize.QueryTypes.SELECT
//             }
//           )
//           if (orders.length === 0) throw new Error('Order not found!')
//           res.json(orders)
//         }
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '        join Account A on O.company = A.id\n' +
//             '        join OrderRoutes OT on O.id = OT.orderId\n' +
//             '        join Cities CD on O.destinationCity = CD.id\n' +
//             '        join Countries CU on O.destinationCountry = CU.id\n' +
//             '        join Cities CA on O.originCity = CA.id\n' +
//             '          left  join CommentOrder CO\n' +
//             '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             "where O.deletedAt IS NULL and (O.status = 'Completed'  or O.status = 'OnLikuid' or O.status = 'Collected') and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               branchId: user.branchId,
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')
//         res.json(orders)
//       }
//       throw new Error('Not allowed!')
//     } catch (e) {
//       req.log.error('error in get one order as admin', { error: e.message })
//       return res.status(500).json({ error: e.message })
//     }
//   }
//   if (condition === 'likuid') {
//     try {
//       if (isSystemAdmin(user.role)) {
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis, O.*,\n' +
//             '       OH.comment as commentStatus,\n' +
//             '       CO.name  as orgCity,\n' +
//             '       CD.name  as destCity,\n' +
//             '       COD.name as destCountry,\n' +
//             '       COO.name as orgCountry,\n' +
//             '       A.name   as CompanyName,\n' +
//             '       OH.name   as Carier,\n' +
//             '       OH.status   as History\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '          left  join CommentOrder CK\n' +
//             '              on CK.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             '         join Cities CO on O.originCity = CO.id\n' +
//             '         join Cities CD on O.destinationCity = CD.id\n' +
//             '         join Countries COD on O.destinationCountry = COD.id\n' +
//             '         join Countries COO on O.originCountry = COO.id\n' +
//             '        join Account A on O.company = A.id\n' +
//             " where O.deletedAt IS NULL and O.status = 'Likuiduar' and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or COD.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC ",

//           {
//             bind: {
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')

//         res.json(orders)
//       }
//       if (isBranchAdmin(user.role)) {
//         if (user.branchId === 1) {
//           const orders = await db.sequelize.query(
//             'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//               'from `Order` O\n' +
//               '         join OrderHistory OH\n' +
//               '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//               '        join Account A on O.company = A.id\n' +
//               '        join OrderRoutes OT on O.id = OT.orderId\n' +
//               '        join Cities CD on O.destinationCity = CD.id\n' +
//               '        join Countries CU on O.destinationCountry = CU.id\n' +
//               '        join Cities CA on O.originCity = CA.id\n' +
//               '          left  join CommentOrder CO\n' +
//               '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//               "where O.deletedAt IS NULL and O.status = 'Likuiduar' and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//             {
//               bind: {
//                 branchId: user.branchId,
//                 text: name
//               },
//               type: sequelize.QueryTypes.SELECT
//             }
//           )
//           if (orders.length === 0) throw new Error('Order not found!')
//           res.json(orders)
//         }
//         const orders = await db.sequelize.query(
//           'SELECT IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and CommentOrder.read = 0 and  CommentOrder.orderId = O.id limit 1), 1, 0) as notis,IF( EXISTS( SELECT * FROM CommentOrder WHERE CommentOrder.deletedAt IS NULL and  CommentOrder.orderId = O.id ), 1, 0) as sumNotis,O.*, OH.status,OH.comment as commentStatus,OH.name as branchName, CD.name as destCity, CA.name as orgCity,CU.name as destCountry, A.name as companyName\n' +
//             'from `Order` O\n' +
//             '         join OrderHistory OH\n' +
//             '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and  OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//             '        join Account A on O.company = A.id\n' +
//             '        join OrderRoutes OT on O.id = OT.orderId\n' +
//             '        join Cities CD on O.destinationCity = CD.id\n' +
//             '        join Countries CU on O.destinationCountry = CU.id\n' +
//             '        join Cities CA on O.originCity = CA.id\n' +
//             '          left  join CommentOrder CO\n' +
//             '              on CO.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//             "where O.deletedAt IS NULL and O.status = 'Likuiduar' and (OT.orgBranchId = $branchId OR OT.destBranchId = $branchId) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC",
//           {
//             bind: {
//               branchId: user.branchId,
//               text: name
//             },
//             type: sequelize.QueryTypes.SELECT
//           }
//         )
//         if (orders.length === 0) throw new Error('Order not found!')
//         res.json(orders)
//       }
//       throw new Error('Not allowed!')
//     } catch (e) {
//       req.log.error('error in get one order as admin', { error: e.message })
//       return res.status(500).json({ error: e.message })
//     }
//   }

//   throw new Error('Not allowed end!')
// }
// export const brAdSearchQueryPickup = async (req, res) => {
//   const { name } = req.body
//   const user = req.user
//   try {
//     if (isSystemAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT O.*, OH.status, A.name as companyName,A.pickup as pickup, A.addressText as companyAddress, A.phone as companyPhone, A.cityId, CO.name as orgCity\n' +
//           'from `Order` O\n' +
//           '         join OrderHistory OH\n' +
//           '              on OH.id = (SELECT id FROM OrderHistory WHERE OrderHistory.deletedAt IS NULL and OrderHistory.orderId = O.id ORDER BY id DESC LIMIT 1)\n' +
//           '          left  join CommentOrder CK\n' +
//           '              on CK.id = (SELECT id FROM CommentOrder WHERE  CommentOrder.orderId = O.id  ORDER BY id DESC LIMIT 1)\n' +
//           '         join Cities CO on O.originCity = CO.id\n' +
//           '         join Cities CD on O.destinationCity = CD.id\n' +
//           '         join Countries COD on O.destinationCountry = COD.id\n' +
//           '         join Countries COO on O.originCountry = COO.id\n' +
//           '        join Account A on O.company = A.id\n' +
//           ' where O.deletedAt IS NULL and OH.status IN ($created, $courier) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or COD.name REGEXP $text or A.name REGEXP $text) ORDER BY id DESC ',

//         {
//           bind: {
//             text: name,
//             created: 'Order Created',
//             courier: 'Marre nga Korieri'
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       if (orders.length === 0) throw new Error('Order not found!')

//       res.json(orders)
//     }
//     if (isBranchAdmin(user.role)) {
//       const orders = await db.sequelize.query(
//         'SELECT O.*, OH.status, A.name as companyName,A.pickup as pickup, A.addressText as companyAddress, A.phone as companyPhone, A.cityId, CO.name as orgCity\n' +
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
//           'where O.deletedAt IS NULL and OT.orgBranchId = $branch and OH.status IN ($created, $courier) and (O.type REGEXP $text or O.name REGEXP $text or O.code REGEXP $text or O.contact REGEXP $text  or CD.name REGEXP $text or CU.name REGEXP $text or A.name REGEXP $text ) ORDER BY O.id DESC',
//         {
//           bind: {
//             branch: user.branchId,
//             created: 'Order Created',
//             courier: 'Marre nga Korieri',
//             text: name
//           },
//           type: sequelize.QueryTypes.SELECT
//         }
//       )
//       if (orders.length === 0) throw new Error('Order not found!')
//       res.json(orders)
//     }
//     throw new Error('Not allowed!')
//   } catch (e) {
//     req.log.error('error in get one order as admin', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
