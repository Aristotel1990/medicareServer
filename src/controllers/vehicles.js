// import db, { Vehicles } from '../models/index'
// import { isSystemAdmin } from '../services/user'

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
// export const createVehicle = async (req, res) => {
//   try {
//     const {
//       name,
//       courierId,
//       branchId,
//       branch,
//       model,
//       type,
//       fuel,
//       engine,
//       startKm,
//       commission,
//       terminal
//     } = req.body
//     const vehicle = await Vehicles.create({
//       name: name,
//       courierId: courierId,
//       branch: branch,
//       model: model,
//       type: type,
//       fuel: fuel,
//       terminal: terminal,
//       engine: engine,
//       startKm: startKm,
//       branchId: branchId,
//       commission: commission,
//       createdAt: new Date()
//     })
//     res.json(vehicle)
//   } catch (e) {
//     req.log.error('error in create vehicles', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const getVehicles = async (req, res) => {
//   try {
//     const { user } = req
//     if (user.role === 'superAdmin') {
//       const vehicles = await Vehicles.findAll()
//       res.json(vehicles)
//     } else if (user.role === 'branchManager') {
//       const vehicle = await Vehicles.findAll({
//         where: {
//           branchId: user.branchId
//         }
//       })
//       res.json(vehicle)
//     }
//     // await new Promise(resolve => setTimeout(resolve, 3000))
//   } catch (e) {
//     req.log.error('error in get business', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const getVehiclesAll = async (req, res) => {
//   try {
//     const vehicles = await Vehicles.findAll()

//     // await new Promise(resolve => setTimeout(resolve, 3000))
//     res.json(vehicles)
//   } catch (e) {
//     req.log.error('error in get business', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
// export const editVehicleByCourier = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const { id, courierId } = req.body
//     await Vehicles.update(
//       { courierId: null },
//       {
//         where: {
//           courierId: courierId
//         }
//       },
//       { transaction }
//     )
//     await Vehicles.update(
//       { courierId: courierId },
//       {
//         where: {
//           id: id
//         }
//       },
//       { transaction }
//     )
//     transaction.commit()
//     res.json(true)
//   } catch (error) {
//     transaction.rollBack()
//     req.log.error('error in get editVehicleByCourier', {
//       error: error.message
//     })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const getOneVehicle = async (req, res) => {
//   try {
//     const id = req.params.id
//     const account = await Vehicles.findByPk(id)
//     res.json(account)
//   } catch (error) {
//     req.log.error('error in get one business', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }

// export const editVehicle = async (req, res) => {
//   try {
//     const {
//       id,
//       name,
//       courierId,
//       branch,
//       model,
//       fuel,
//       engine,
//       startKm,
//       commission,
//       terminal,
//       type
//     } = req.body
//     const account = await Vehicles.update(
//       {
//         name: name,
//         courierId: courierId || null,
//         branch: branch,
//         model: model,
//         fuel: fuel,
//         engine: engine,
//         startKm: startKm,
//         commission: commission,
//         type: type,
//         terminal: terminal,
//         updatedAt: new Date()
//       },
//       {
//         where: {
//           id
//         }
//       }
//     )
//     res.json(account)
//   } catch (error) {
//     req.log.error('error in edit business', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }
// export const deleteVehicle = async (req, res) => {
//   const transaction = await db.sequelize.transaction()

//   try {
//     const id = req.params.id
//     const user = req.user
//     if (!isSystemAdmin(user.role)) throw new Error('Forbiden 2')
//     const acc = await Vehicles.findByPk(id)
//     if (!acc) throw new Error('Not Authorized')

//     await Vehicles.destroy(
//       {
//         where: {
//           id: id
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
