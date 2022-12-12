// import { Router } from 'express'
// import { permit } from '../middleware/pemrissions'
// import {
//   getCourier,
//   createCourier,
//   editCourier,
//   getOneCourier,
//   deleteCourier,
//   getCourierInTranistOrder,
//   getCourierCompletedOrder,
//   getCourierToPickedOrder,
//   getCourierOrderToCourier,
//   getCourierLikuiduarOrder,
//   getCourierTransactions,
//   deleteCourierTrans,
//   getCourierRejectedOrder
// } from '../controllers/courier'

// export const couriers = () => {
//   const couriers = Router()

//   couriers.get(
//     '/',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourier
//   )

//   couriers.post('/', permit('superAdmin:admin:branchManager'), createCourier)
//   couriers.put('/:id(\\d+)', permit('superAdmin:admin'), editCourier)
//   couriers.get('/:id(\\d+)', permit('superAdmin:admin'), getOneCourier)
//   couriers.delete(
//     '/delete/:id(\\d+)',
//     permit('superAdmin:admin'),
//     deleteCourier
//   )
//   couriers.get(
//     '/:id(\\d+)/admin',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourierInTranistOrder
//   )
//   couriers.get(
//     '/:id(\\d+)/completed/admin',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourierCompletedOrder
//   )
//   couriers.get(
//     '/:id(\\d+)/rejected/admin',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourierRejectedOrder
//   )
//   couriers.get(
//     '/:id(\\d+)/toPicked/admin',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourierToPickedOrder
//   )
//   couriers.get(
//     '/:id(\\d+)/toCourier/admin',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourierOrderToCourier
//   )
//   couriers.get(
//     '/:id(\\d+)/likuiduar/admin',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourierLikuiduarOrder
//   )
//   couriers.get(
//     '/trancactions/:id(\\d+)',
//     permit('superAdmin:admin:branchManager:finance'),
//     getCourierTransactions
//   )
//   couriers.delete(
//     '/trancactions/:id(\\d+)',
//     permit('superAdmin:finance'),
//     deleteCourierTrans
//   )
//   return couriers
// }
