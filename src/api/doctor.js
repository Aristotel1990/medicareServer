// import { Router } from 'express'
// import { permit } from '../middleware/pemrissions'
// import {
//   createAccount,
//   getBusiness,
//   getOneBusiness,
//   editBusiness,
//   getTransportFees,
//   getUserCompany,
//   deleteAccount,
//   getAccountByCityId,
//   getTransactionById,
//   getTransOrdersById,
//   stepBackOrderHistory,
//   stepBackOrderHisSave,
//   deleteTransactions,
//   getAccountTotalLikuid,
//   getOrderCommentbyId,
//   changePassAccoun,
//   getLikuidCompByIdAndMonth,
//   testCollected,
//   getLikuidValueCompany,
//   getAccountPickUp,
//   getExportOrders,
//   getAccountAllStats,
//   getMonthAccountChart,
//   getProvinceChart,
//   accOrderSearchQuery,
//   accSearchQueryProccess
// } from '../controllers/accounts'

// import { getOrdersByCompany } from '../controllers/orders'

// export const accounts = () => {
//   const accounts = Router()

//   accounts.get(
//     '/',
//     permit('superAdmin:admin:branchManager:finance'),
//     getBusiness
//   )

//   accounts.post('/', permit('superAdmin:admin'), createAccount)

//   accounts.get(
//     '/:id(\\d+)',
//     permit('superAdmin:admin:branchManager'),
//     getOneBusiness
//   )
//   // accounts.get(
//   //   "/branch/:id(\\d+)",
//   //   permit("superAdmin:admin:branchManager"),
//   //   getBussinesById
//   // );
//   accounts.delete(
//     '/delete/:id(\\d+)',
//     permit('superAdmin:admin'),
//     deleteAccount
//   )
//   accounts.post('/hash', permit('superAdmin:admin'), changePassAccoun)

//   accounts.post('/:id(\\d+)', permit('superAdmin:admin'), editBusiness)
//   accounts.get('/orders', permit('companyAdmin'), getOrdersByCompany)
//   accounts.get('/fees', permit('companyAdmin'), getTransportFees)
//   accounts.get('/my', permit('companyAdmin'), getUserCompany)
//   accounts.get('/city/:id(\\d+)', permit('finance'), getAccountByCityId)
//   accounts.get(
//     '/transaction/:id(\\d+)',
//     permit('branchManager:companyAdmin:finance:superAdmin'),
//     getTransactionById
//   )
//   accounts.delete(
//     '/transactions/:id(\\d+)',
//     permit('superAdmin'),
//     deleteTransactions
//   )
//   accounts.get(
//     '/print/translaction/:id(\\d+)',
//     permit('branchManager:companyAdmin:finance:superAdmin'),
//     getTransOrdersById
//   )
//   accounts.get(
//     '/orderHistory/back/:id(\\d+)',
//     permit('superAdmin'),
//     stepBackOrderHistory
//   )
//   accounts.get(
//     '/orderHistory/save/:id(\\d+)',
//     permit('superAdmin'),
//     stepBackOrderHisSave
//   )
//   accounts.get(
//     '/total/likuid',
//     permit('superAdmin:finance'),
//     getAccountTotalLikuid
//   )
//   accounts.get(
//     '/comments/order/:id(\\d+)',
//     permit('superAdmin:companyAdmin:branchManager'),
//     getOrderCommentbyId
//   )
//   accounts.post(
//     '/month/likuid',
//     permit('finance:superAdmin'),
//     getLikuidCompByIdAndMonth
//   )
//   accounts.post('/fix', permit('superAdmin'), testCollected)
//   accounts.get('/likuid/value', permit('finance'), getLikuidValueCompany)
//   accounts.get(
//     '/pickUp/:id(\\d+)',
//     permit('superAdmin:branchManager'),
//     getAccountPickUp
//   )
//   accounts.post('/exports/orders', permit('companyAdmin'), getExportOrders)
//   accounts.get(
//     '/all/stats',
//     permit('companyAdmin:superAdmin:finance'),
//     getAccountAllStats
//   )
//   accounts.post(
//     '/chart/month/sales',
//     permit('companyAdmin:superAdmin'),
//     getMonthAccountChart
//   )
//   accounts.get('/province', permit('companyAdmin'), getProvinceChart)
//   accounts.post(
//     '/order/search',
//     permit('companyAdmin:superAdmin:branchManager'),
//     accOrderSearchQuery
//   )
//   accounts.post(
//     '/order/search/proccess',
//     permit('companyAdmin'),
//     accSearchQueryProccess
//   )
//   return accounts
// }
