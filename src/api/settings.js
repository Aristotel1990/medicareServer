// import { Router } from 'express'
// import {
//   getSettings,
//   getAccountList,
//   seeeetOrders,
//   reSeeeetOrdersFees,
//   getAccountsMonthSales,
//   getAdminYearSales,
//   getNonDeliveredByBrabch,
//   getCompanyYearSales,
//   getEarnYearSales,
//   getZeraByDate,
//   addZera,
//   deleteZera,
//   getAllTransAccounts
// } from '../controllers/settings'
// import { permit } from '../middleware/pemrissions'

// export const settings = () => {
//   const settings = Router()

//   settings.get('/', getSettings)
//   settings.get(
//     '/accounts',
//     permit('superAdmin:admin:branchManager'),
//     getAccountList
//   )
//   settings.get('/seeetgod', permit('superAdmin'), seeeetOrders)
//   settings.get('/seeetgodFees', permit('superAdmin'), reSeeeetOrdersFees)
//   settings.get(
//     '/accounts/month/sales',
//     permit('superAdmin:branchManager:companyAdmin'),
//     getAccountsMonthSales
//   )
//   settings.get(
//     '/admin/:year(\\d+)/sales',
//     permit('superAdmin:finance'),
//     getAdminYearSales
//   )
//   settings.get(
//     '/chart/nondelivered',
//     permit('superAdmin:finance'),
//     getNonDeliveredByBrabch
//   )
//   settings.get(
//     '/account/:year(\\d+)/sales',
//     permit('companyAdmin'),
//     getCompanyYearSales
//   )
//   settings.get(
//     '/earn/:year(\\d+)/sales',
//     permit('superAdmin:finance'),
//     getEarnYearSales
//   )
//   settings.post('/arka/date', permit('finance:superAdmin'), getZeraByDate)
//   settings.post('/zera/add', permit('finance:superAdmin'), addZera)
//   settings.delete('/zera/:id(\\d+)', permit('superAdmin:finance'), deleteZera)
//   settings.get(
//     '/transactions/accounts',
//     permit('superAdmin:finance'),
//     getAllTransAccounts
//   )
//   return settings
// }
