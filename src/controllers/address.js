// import db, {
//   Address,
//   Cities,
//   Countries,
//   Order,
//   OrderRoutes,
//   OrderFees,
//   Currencies
// } from '../models'
// import sequelize from 'sequelize'

// // get all addreses
// export const getAllAddress = async (req, res) => {
//   try {
//     const address = await Address.findAll()

//     res.json(address)
//   } catch (e) {
//     req.log.error('error on find all addresses', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }
// // create address
// export const createAddress = async (req, res) => {
//   try {
//     const body = req.body
//     const address = await Address.create({
//       name: body.name,
//       cityId: body.cityId,
//       isPrimary: body.isPrimary,
//       zip: body.zip,
//       address: body.address,
//       address2: body.address2,
//       note: body.note,
//       lat: body.lat,
//       lng: body.lng,
//       userId: body.userId,
//       deletedAt: body.deletedAt,
//       countries_code: body.countries_code,
//       cities_id: body.cities_id
//     })

//     res.json(address)
//   } catch (e) {
//     req.log.error('error in create address', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }
// // get address by id
// export const getAddressById = async (req, res) => {
//   try {
//     const address = await Address.findOne({
//       where: {
//         id: req.params.id
//       }
//     })
//     res.json(address)
//   } catch (e) {
//     req.log.error('error in get addres by id', { error: e.message })
//     return res.status(500).json({ error: 'ERROR' })
//   }
// }

// export const getCountries = async (req, res) => {
//   try {
//     const countries = await Countries.findAll({
//       attributes: ['id', 'code', 'name'],
//       include: [{ model: Cities, as: 'cities', attributes: ['id', 'name'] }]
//     })
//     res.json(countries)
//   } catch (error) {
//     req.log.error('error in get countries ', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }

// export const getFreeZones = async (req, res) => {
//   try {
//     const cities = await db.sequelize.query(
//       'Select C.id, C.name, C.code\n' +
//         'from Cities C\n' +
//         '         Left JOIN BranchOperations BO on C.id = BO.cityId\n' +
//         'where C.country = 1 and BO.cityId is NULL',
//       {
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(cities)
//   } catch (error) {
//     req.log.error('error in get countries ', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const getCurrentZones = async (req, res) => {
//   try {
//     const { id } = req.params
//     const cities = await db.sequelize.query(
//       'Select C.id, C.name, C.code\n' +
//         '      from Cities C      \n' +
//         '    Left JOIN BranchOperations BO on C.id = BO.cityId\n' +
//         'where BO.deletedAt IS NULL and BO.branchId = $branchId',

//       {
//         bind: {
//           branchId: id
//         },
//         type: sequelize.QueryTypes.SELECT
//       }
//     )
//     res.json(cities)
//   } catch (error) {
//     req.log.error('error in get countries ', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const getOrderRoot = async (req, res) => {
//   const { id } = req.params
//   try {
//     const order = await Order.findByPk(id)
//     if (!order) throw new Error('Not Order')
//     const root = await OrderRoutes.findOne({
//       where: {
//         orderId: id
//       }
//     })

//     res.json(root)
//   } catch (e) {
//     req.log.error('error in getOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getOrderFee = async (req, res) => {
//   const { id } = req.params
//   try {
//     const order = await Order.findByPk(id)
//     if (!order) throw new Error('Not Order')
//     const root = await OrderFees.findOne({
//       where: {
//         orderId: id
//       }
//     })

//     res.json(root)
//   } catch (e) {
//     req.log.error('error in getOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const setOrderRoots = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   const { org, dest, id } = req.body
//   try {
//     const order = await Order.findByPk(id)

//     if (!order) throw new Error('Not Order')

//     await OrderRoutes.update(
//       { orgBranchId: org, destBranchId: dest, updatedAt: new Date() },
//       {
//         where: {
//           orderId: id
//         },
//         transaction
//       }
//     )
//     res.json('done')
//     transaction.commit()
//   } catch (e) {
//     transaction.rollback()

//     req.log.error('error in getOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const setOrderFees = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   const {
//     id,
//     senderCollect,
//     receiverPays,
//     orderTotalFee,
//     originBranchFee,
//     destinationBranchFee,
//     mainFee,
//     currency
//   } = req.body
//   try {
//     const order = await Order.findByPk(id)
//     if (!order) throw new Error('Not Order')

//     const cu = await Currencies.findOne({
//       where: {
//         code: currency
//       }
//     })
//     if (!cu) throw new Error('Not this Currency in db')

//     await OrderFees.update(
//       {
//         senderCollect,
//         receiverPays,
//         orderTotalFee,
//         originBranchFee: !originBranchFee ? null : originBranchFee,
//         destinationBranchFee: !destinationBranchFee
//           ? null
//           : destinationBranchFee,
//         mainFee: !mainFee ? null : mainFee,
//         currency,
//         updatedAt: new Date()
//       },
//       {
//         where: {
//           orderId: id
//         },
//         transaction
//       }
//     )
//     res.json('done')
//     transaction.commit()
//   } catch (e) {
//     transaction.rollback()

//     req.log.error('error in getOrders', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
