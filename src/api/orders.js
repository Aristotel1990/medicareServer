// import { Router } from 'express'
// import {
//   createOrder,
//   editOrder,
//   switchOrder,
//   deleteOrder,
//   deleteOrderAsAdmin,
//   suAdminDeleteOrder,
//   getCurentVehicle,
//   getInBranchOrders,
//   getInSuperAdminOrders,
//   getOrders,
//   getOneOrderAsAdmin,
//   getOrdersByCompany,
//   rejectOrCompleteOrder,
//   orderScan,
//   pickUpOrders,
//   suAdminpickUpOrders,
//   bulkRejectOrCompleteOrder,
//   pickedCourierFromStatus,
//   toPickedFromCourier,
//   getOrderByCourier,
//   getCompletedCompanyOrders,
//   getCompletedBranchOrders,
//   getCourierOrder,
//   getCompletedSuperOrders,
//   reqForLikuid,
//   getLikuidOrderByIdAcco,
//   onLikuidStatus,
//   getLikuidStatus,
//   completetLikuidStatus,
//   getValuesCompany,
//   pickUpFromPartner,
//   getNextBranchOrders,
//   getLikuiduarBranchOrders,
//   getCollectOrderByBrMa,
//   onCollectStatus,
//   onRevertCollect,
//   brConfirmCollectStatus,
//   getTransitBranchOrders,
//   financeConfirmCollectStatus,
//   getRejectBranchOrder,
//   getReturnedBranchOrders,
//   getBilledOrderByBrMa,
//   onBilledStatus,
//   getCourierPickup,
//   getCourierDeliverOrders,
//   getCourierScanOrder,
//   courierChangeOrderStatus,
//   brConfirmBilledStatus,
//   addCommentOrderById,
//   orderSumPickedFromCourier,
//   getRejectedCompanyOrders,
//   getLikuiduarCompanyOrders,
//   getSwitchedBranchOrders,
//   generateMultipleTags,
//   getOrdersByNameAsAdmin,
//   getToSwitchOrder,
//   uploadExcel,
//   downloadExcel,
//   pikedCourierFromScan,
//   toPickedScan,
//   transferOrderToBr,
//   onBilledStatusBetweenDate,
//   getTransactionByOrder,
//   getProblemOrders,
//   orderRejectedSumPickedFromCourier
// } from '../controllers/orders'
// import { permit } from '../middleware/pemrissions'
// import { getOrderComments } from '../controllers/accounts'

// export const orders = () => {
//   const orders = Router()

//   // create order
//   orders.post('/', createOrder)
//   // create order switch
//   orders.post('/switch', switchOrder)

//   // edit order
//   orders.put('/', editOrder)
//   // delete order
//   orders.delete('/', deleteOrder)
//   orders.delete('/admin', permit('superAdmin'), deleteOrderAsAdmin)
//   orders.delete(
//     '/admin/delete/order',
//     permit('superAdmin:branchManager'),
//     suAdminDeleteOrder
//   )

//   // track curent vehicle of order
//   orders.get('/track/:id', getCurentVehicle)
//   orders.get('/:id(\\d+)', getOrders)
//   orders.get('/admin/:code', permit('superAdmin'), getOneOrderAsAdmin)
//   orders.post('/admin/name', permit('superAdmin'), getOrdersByNameAsAdmin)

//   orders.get('/pickup', permit('branchManager:superAdmin'), pickUpOrders)
//   orders.get(
//     '/pickup/partner',
//     permit('branchManager:superAdmin'),
//     pickUpFromPartner
//   )

//   orders.get(
//     '/scan/:code',
//     permit('superAdmin:branchManager:courier'),
//     orderScan
//   )
//   orders.get('/branch', permit('branchManager'), getInBranchOrders)
//   orders.get(
//     '/branch/rejected',
//     permit('branchManager:superAdmin'),
//     getRejectBranchOrder
//   )

//   orders.get('/branch/next', permit('branchManager'), getNextBranchOrders)
//   orders.get(
//     '/branch/transit',
//     permit('branchManager'),
//     getTransitBranchOrders
//   )

//   orders.get('/company', permit('companyAdmin'), getOrdersByCompany)
//   orders.get('/values/company', permit('companyAdmin'), getValuesCompany)

//   orders.get('/super/pickup', permit('superAdmin'), suAdminpickUpOrders)
//   orders.get('/admin/', permit('superAdmin'), getInSuperAdminOrders)
//   orders.post(
//     '/status',
//     permit('branchManager:courier:superAdmin'),
//     rejectOrCompleteOrder
//   )
//   orders.post(
//     '/comment',
//     permit('branchManager:courier:superAdmin'),
//     addCommentOrderById
//   )
//   orders.get(
//     '/comment/:id(\\d+)',
//     permit('branchManager:courier:superAdmin'),
//     getOrderComments
//   )
//   orders.post(
//     '/status/seri',
//     permit('branchManager:courier:superAdmin'),
//     bulkRejectOrCompleteOrder
//   )
//   orders.post(
//     '/pickedto',
//     permit('branchManager:courier:superAdmin'),
//     pickedCourierFromStatus
//   )
//   orders.post(
//     '/transfer',
//     permit('branchManager:courier:superAdmin'),
//     transferOrderToBr
//   )
//   orders.post(
//     '/courier/scan',
//     permit('branchManager:courier:superAdmin'),
//     pikedCourierFromScan
//   )
//   orders.post(
//     '/topicked',
//     permit('branchManager:courier:superAdmin'),
//     toPickedFromCourier
//   )
//   orders.post(
//     '/courier/scan/topicked',
//     permit('branchManager:courier:superAdmin'),
//     toPickedScan
//   )
//   orders.post(
//     '/sum/picked',
//     permit('branchManager:courier:superAdmin:finance'),
//     orderSumPickedFromCourier
//   )
//   orders.post(
//     '/sum/picked/rejected',
//     permit('branchManager:courier:superAdmin:finance'),
//     orderRejectedSumPickedFromCourier
//   )
//   orders.get(
//     '/admin/order/:id',
//     permit('superAdmin:branchManager'),
//     getOrderByCourier
//   )
//   orders.get(
//     '/company/dorezuara',
//     permit('companyAdmin'),
//     getCompletedCompanyOrders
//   )
//   orders.get('/company/toSwitch', permit('companyAdmin'), getToSwitchOrder)
//   orders.get(
//     '/company/likuiduar',
//     permit('companyAdmin'),
//     getLikuiduarCompanyOrders
//   )
//   orders.get(
//     '/company/rejected',
//     permit('companyAdmin'),
//     getRejectedCompanyOrders
//   )
//   orders.get(
//     '/branch/dorezuara',
//     permit('companyAdmin:branchManager'),
//     getCompletedBranchOrders
//   )
//   orders.get(
//     '/branch/likuiduar',
//     permit('branchManager:superAdmin'),
//     getLikuiduarBranchOrders
//   )
//   orders.get('/overdate', permit('superAdmin:branchManager'), getProblemOrders)
//   orders.get(
//     '/branch/returned',
//     permit('companyAdmin:branchManager:superAdmin'),
//     getReturnedBranchOrders
//   )
//   orders.get(
//     '/branch/switched',
//     permit('branchManager:superAdmin'),
//     getSwitchedBranchOrders
//   )
//   orders.get(
//     '/superadmin/dorezuara',
//     permit('superAdmin:admin'),
//     getCompletedSuperOrders
//   )
//   orders.get(
//     '/courier/order',
//     permit('companyAdmin:branchManager'),
//     getCourierOrder
//   )
//   orders.post('/likuidim', permit('superAdmin'), reqForLikuid)
//   orders.post('/account/likuidim', permit('finance'), onLikuidStatus)
//   orders.post(
//     '/account/likuidim/get',
//     permit('branchManager'),
//     getLikuidStatus
//   )
//   orders.post(
//     '/account/likuidim/complete',
//     permit('branchManager:finance:superAdmin:courier'),
//     completetLikuidStatus
//   )

//   orders.get(
//     '/company/dorezuara/:id(\\d+)',
//     permit('finance'),
//     getLikuidOrderByIdAcco
//   )
//   orders.get(
//     '/branch/collect/:id(\\d+)',
//     permit('finance'),
//     getCollectOrderByBrMa
//   )
//   orders.post('/branch/collect', permit('finance'), onCollectStatus)
//   orders.post('/branch/revert/collect', permit('finance'), onRevertCollect)

//   orders.post(
//     '/branch/collect/confirm',
//     permit('branchManager'),
//     brConfirmCollectStatus
//   )
//   orders.post(
//     '/branch/finance/collect/confirm',
//     permit('finance'),
//     financeConfirmCollectStatus
//   )
//   orders.get(
//     '/branch/billed/:id(\\d+)',
//     permit('finance'),
//     getBilledOrderByBrMa
//   )
//   orders.post('/branch/billed', permit('finance:superAdmin'), onBilledStatus)
//   orders.post(
//     '/branch/billed/between',
//     permit('finance:superAdmin'),
//     onBilledStatusBetweenDate
//   )

//   orders.post(
//     '/branch/billed/confirm/:id(\\d+)',
//     permit('branchManager'),
//     brConfirmBilledStatus
//   )

//   orders.get('/courier/pickup', permit('courier'), getCourierPickup)
//   orders.get('/courier/deliver', permit('courier'), getCourierDeliverOrders)
//   orders.get('/courier/scan/:code', permit('courier'), getCourierScanOrder)
//   orders.post('/courier/status', permit('courier'), courierChangeOrderStatus)

//   orders.post(
//     '/generate-tags',
//     permit('superAdmin:admin:branchManager:companyAdmin'),
//     generateMultipleTags
//   )

//   orders.post('/upload-excel-ks', uploadExcel)
//   orders.get('/download-excel-ks', downloadExcel)
//   orders.get(
//     '/transactions/find/:id(\\d+)',
//     permit('superAdmin'),
//     getTransactionByOrder
//   )
//   return orders
// }
