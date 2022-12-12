// import logger from '../lib/logger'
// import db, { Branch, BranchOperations, Cities, Currencies } from '../models'
// import sequelize from 'sequelize'

// const orderCountLength = 5
// const countryToKey = {
//   2: 'ks',
//   3: 'mq',
//   4: 'mn'
// }

// const fillZero = (nr, pad = orderCountLength) => {
//   let nrStr = nr.toString()
//   if (nrStr.length <= pad) {
//     while (nrStr.length < pad) {
//       nrStr = '0' + nrStr
//     }
//   }
//   return nrStr
// }

// export const generateOrderCode = async (cityId, client, count, destCity) => {
//   const originCity = await Cities.findByPk(cityId)
//   const destinationCity =
//     cityId === destCity ? originCity : await Cities.findByPk(destCity)
//   const date = new Date()
//   const day = fillZero(date.getDate(), 2)
//   const month = fillZero(1 + date.getMonth(), 2)
//   const year = fillZero(date.getFullYear().toString().substr(-2), 2)
//   const head = originCity.code + day + month + year
//   const body = client + '-'
//   const footer = count + destinationCity.code
//   // heat - body - footer
//   return head + body + footer
// }
// export const generateTransCode = async (cityId, client) => {
//   const date = new Date()
//   const day = date.getDate().toString()
//   const month = date.getMonth().toString()
//   const year = date.getFullYear().toString()
//   const min = date.getMinutes().toString()
//   const sec = date.getSeconds().toString()
//   const code = year + month + day + min + sec
//   // heat - body - footer
//   return cityId + client + code
// }

// export const calculateFees = (order, accountFee, currency = 'LEKE') => {
//   let totalFee = accountFee.finalCost
//   let destination = true
//   let dividend = 3
//   if (order.destinationCountry !== order.originCountry) return false
//   if (order.destinationCity === order.originCity) {
//     totalFee = accountFee.inCity
//     destination = false
//     dividend = 2
//   }
//   if (order.weight > accountFee.maxKg) {
//     const diff = Math.ceil(order.weight - accountFee.maxKg)
//     totalFee += diff * accountFee.perKg
//   }
//   if (order.express) {
//     totalFee += totalFee / 2
//   }
//   const slice = Math.round(totalFee / dividend)
//   return {
//     main: totalFee - slice * (dividend - 1),
//     origin: slice,
//     destination: destination ? slice : null,
//     total: totalFee
//   }
// }

// export const newFeeCalculation = async (order, packageType, international = false, fromKS = false, fromMQ = false) => {
//   const inCity = order.destinationCity === order.originCity
//   const isEur = order.currency === 'EUR'
//   let totalFee = 0
//   const currencies = await Currencies.findAll()
//   const { rates } = currencies.find((i) => i.symbol === 'All')
//   let rate = !isEur ? rates.toAll : rates.toEur
//   const destination = !inCity
//   const dividend = 3
//   if (!international) {
//     totalFee = inCity ? packageType.cost.in : packageType.cost.out
//   } else {
//     const hasDestinationBranch = order.destinationCity !== 1
//     // logic here for different currency
//     rate = 1
//     if (fromKS) {
//       const defaultFee = packageType.cost.ks
//       const internalFee = packageType.cost.intKs || packageType.cost.int
//       const slice = parseFloat((internalFee / dividend).toFixed(2))
//       return {
//         main: internalFee - slice,
//         origin: 0,
//         destination: hasDestinationBranch ? slice : null,
//         total: defaultFee
//       }
//     }
//     if (fromMQ) {
//       const defaultFee = packageType.cost.mq
//       const internalFee = packageType.cost.intMq || packageType.cost.int
//       const slice = parseFloat((internalFee / dividend).toFixed(2))
//       return {
//         main: internalFee - slice,
//         origin: 0,
//         destination: hasDestinationBranch ? slice : null,
//         total: defaultFee
//       }
//     }
//     const defaultFee = packageType.cost[countryToKey[order.destinationCountry]]
//     const internalFee = parseFloat((packageType.cost.out / rates.toEur).toFixed(2))
//     const slice = parseFloat((internalFee / dividend).toFixed(2))
//     return {
//       main: defaultFee - slice,
//       origin: slice,
//       destination: null,
//       total: defaultFee
//     }
//   }

//   if (order.express) {
//     totalFee += totalFee / 2
//   }

//   const afterRateFee = parseFloat((totalFee / rate).toFixed(2))

//   // const slice = Math.round(afterRateFee / dividend)
//   const slice = parseFloat((afterRateFee / dividend).toFixed(2))
//   return {
//     main: afterRateFee - slice * (destination ? 2 : 1),
//     origin: slice,
//     destination: destination ? slice : null,
//     total: afterRateFee
//   }
// }

// export const defineBranch = async (city, country, branchId = null) => {
//   try {
//     let origin
//     if (!branchId) {
//       origin = await Branch.findOne({
//         where: {
//           cityId: city,
//           countryId: country
//         }
//       })
//       if (!origin) {
//         origin = await Branch.findOne({
//           // where: {
//           //   '$cityOperate.cityId$': city
//           // },
//           include: [
//             {
//               model: BranchOperations,
//               as: 'cityOperate',
//               where: {
//                 cityId: city
//               }
//             }
//           ]
//         })
//       }
//     } else {
//       origin = await Branch.findByPk(branchId)
//     }
//     return origin
//   } catch (e) {
//     logger.error('error in get order history', { error: e.message })
//     throw new Error(e.message)
//   }
// }

// export const defineRoutes = async (origin, destination, originCountry, destinationCountry) => {
//   try {
//     const fromKS = parseInt(originCountry) === 2
//     const fromMQ = parseInt(originCountry) === 3
//     const foreignOrigin = fromKS || fromMQ
//     if (!origin && !destination) {
//       throw new Error('invalid input for origin or destination')
//     }
//     const internationalShip = destinationCountry !== originCountry
//     let dest = destination
//     if (internationalShip && !foreignOrigin) {
//       dest = 177 // default for Kosovo - Kukes City ID
//       if (destinationCountry === 3) {
//         dest = 178 // default for North Macedonia - Korce City ID
//       } else if (destinationCountry === 4) {
//         dest = 5 // default for Montenegro - Shkoder City ID
//       }
//     }
//     const findQuery = 'Select B.id, B.name, B.email, C.id as cityId, CO.id as countryId, C.name as City, CO.name as Country ' +
//       'from Branch B ' +
//       'join BranchOperations BO on B.id = BO.branchId ' +
//       'join Cities C on BO.cityId = C.id ' +
//       'join Countries CO on CO.id = C.country ' +
//       'where B.active = 1 AND (BO.cityId = $city OR B.cityId = $city)'
//     const orgBranch = await db.sequelize.query(findQuery, {
//       bind: { city: !foreignOrigin ? origin : 1 },
//       type: sequelize.QueryTypes.SELECT
//     })
//     const destBranch = await db.sequelize.query(findQuery, {
//       bind: { city: dest },
//       type: sequelize.QueryTypes.SELECT
//     })
//     const sameCity = !foreignOrigin
//       ? orgBranch[0].cityId === destBranch[0].cityId
//       : false
//     return {
//       origin: orgBranch[0],
//       destination: destBranch[0],
//       sameCity,
//       international: internationalShip,
//       fromKS,
//       fromMQ
//     }
//   } catch (e) {
//     logger.error('error in get define routes', { error: e.message })
//     throw new Error(e.message)
//   }
// }

// export const defineOrderFees = async (order, packageType) => {
//   const international = order.originCountry === order.destinationCountry
//   const inCity = order.destinationCity === order.originCity
//   const isEur = order.currency === 'EUR'
//   let totalFee = 0
//   const currencies = await Currencies.findAll()
//   const { rates } = currencies.find((i) => i.symbol === 'All')
//   const rate = !isEur ? rates.toAll : rates.toEur
//   const destination = !inCity
//   const dividend = 3
//   if (!international) {
//     totalFee = inCity ? packageType.cost.in : packageType.cost.out
//   } else {
//     // logic here for different currency
//     const defaultFee = packageType.cost[countryToKey[order.destinationCountry]]
//     const internalFee = parseFloat((packageType.cost.out / rates.toEur).toFixed(2))
//     const slice = parseFloat((internalFee / dividend).toFixed(2))
//     return {
//       main: defaultFee - slice,
//       origin: slice,
//       destination: null,
//       total: defaultFee
//     }
//   }

//   if (order.express) {
//     totalFee += totalFee / 2
//   }

//   const afterRateFee = parseFloat((totalFee / rate).toFixed(2))

//   // const slice = Math.round(afterRateFee / dividend)
//   const slice = parseFloat((afterRateFee / dividend).toFixed(2))
//   return {
//     main: afterRateFee - slice * (destination ? 2 : 1),
//     origin: slice,
//     destination: destination ? slice : null,
//     total: afterRateFee
//   }
// }
