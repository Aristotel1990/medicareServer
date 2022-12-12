// import { Router } from 'express'
// import {
//   createAddress,
//   getAddressById,
//   getAllAddress,
//   getCountries,
//   getFreeZones,
//   getCurrentZones,
//   getOrderRoot,
//   setOrderRoots,
//   getOrderFee,
//   setOrderFees
// } from '../controllers/address'
// import { permit } from '../middleware/pemrissions'

// export const address = () => {
//   const addressRoute = Router()
//   // get all addreses
//   addressRoute.get('/', getAllAddress)
//   // create address
//   addressRoute.post('/add', createAddress)
//   // get address by id
//   addressRoute.get('/:id(\\d+)', getAddressById)
//   // get all countries
//   addressRoute.get('/countries', getCountries)
//   // get available cities
//   addressRoute.get('/free-zones', permit('superAdmin:admin'), getFreeZones)
//   addressRoute.get(
//     '/current-zones/:id(\\d+)',
//     permit('superAdmin:admin'),
//     getCurrentZones
//   )
//   addressRoute.get(
//     '/orderRoots/:id(\\d+)',
//     permit('superAdmin:admin'),
//     getOrderRoot
//   )
//   addressRoute.get(
//     '/orderFee/:id(\\d+)',
//     permit('superAdmin:admin'),
//     getOrderFee
//   )

//   addressRoute.post('/changeRoot', permit('superAdmin:admin'), setOrderRoots)
//   addressRoute.post('/changeFee', permit('superAdmin:admin'), setOrderFees)

//   return addressRoute
// }
