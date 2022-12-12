// import { Router } from 'express'
// import { permit } from '../middleware/pemrissions'
// import {
//   getVehicles,
//   createVehicle,
//   editVehicleByCourier,
//   editVehicle,
//   getOneVehicle,
//   deleteVehicle
// } from '../controllers/vehicles'

// export const vehicles = () => {
//   const vehicles = Router()

//   vehicles.get('/', permit('superAdmin:admin:branchManager'), getVehicles)

//   vehicles.post('/', permit('superAdmin:admin:branchManager'), createVehicle)
//   vehicles.patch(
//     '/edit',
//     permit('superAdmin:admin:branchManager'),
//     editVehicleByCourier
//   )
//   vehicles.get('/:id(\\d+)', permit('superAdmin:admin'), getOneVehicle)
//   vehicles.put('/:id(\\d+)', permit('superAdmin:admin'), editVehicle)
//   vehicles.delete(
//     '/delete/:id(\\d+)',
//     permit('superAdmin:admin'),
//     deleteVehicle
//   )
//   return vehicles
// }
