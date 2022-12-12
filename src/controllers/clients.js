// import { Clients, Countries, Cities } from '../models/index'
// import sequelize, { Op } from 'sequelize'

// export const getClients = async (req, res) => {
//   try {
//     const { accountId } = req.body

//     const clients = await Clients.findAll({
//       where: {
//         companyId: {
//           [Op.eq]: accountId
//         }
//       },
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
//       }
//     })

//     res.json(clients)
//   } catch (e) {
//     req.log.error('error in get business', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }

// export const getOneClient = async (req, res) => {
//   try {
//     const id = req.params.id
//     const account = await Clients.findByPk(id)
//     res.json(account)
//   } catch (error) {
//     req.log.error('error in get one business', { error: error.message })
//     return res.status(500).json({ error: error.message })
//   }
// }

// export const editClient = async (req, res) => {
//   try {
//     const {
//       id,
//       name,
//       phone,
//       cityId,
//       addressText,
//       countryId,
//       companyId,
//       active,
//       email
//     } = req.body
//     const account = await Clients.update(
//       {
//         name,
//         email,
//         phone,
//         cityId,
//         addressText,
//         countryId,
//         companyId,
//         active: active || true,
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

// export const createClient = async (req, res) => {
//   try {
//     const {
//       name,
//       phone,
//       cityId,
//       addressText,
//       countryId,
//       companyId,
//       active,
//       email
//     } = req.body
//     const client = await Clients.create({
//       name: name || '',
//       phone: phone || '',
//       cityId: cityId || null,
//       email: email || null,
//       addressText: addressText || null,
//       countryId: countryId || null,
//       companyId: companyId || null,
//       active: active || true,
//       createdAt: new Date()
//     })

//     res.json(client)
//   } catch (e) {
//     req.log.error('error in create clients', { error: e.message })
//     return res.status(500).json({ error: e.message })
//   }
// }
