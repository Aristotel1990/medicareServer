// import { Router } from 'express'
// import { permit } from '../middleware/pemrissions'
// import {
//   createBranch,
//   getBranches,
//   getOneBranch,
//   editBranch,
//   getAllBranches,
//   getBranchAccounts,
//   getAccountsOnLikuid,
//   getOnCollect,
//   getTransactionCollect,
//   getTransCollected,
//   getBranchesCollect,
//   getOnConfirmCollect,
//   getFinanceTransactionCollect,
//   deleteBranch,
//   deleteCollectTrans,
//   getBranchesSalary,
//   getBrSalaryById,
//   getFinanceStatistic,
//   getbrStatsById,
//   getProccesBilledByIdAndMonth,
//   getFinanceTransactionBilled,
//   deleteBilledTrans,
//   getTransBilled,
//   suAdminBrStatsXY,
//   getOrdersBilledByIdAndMonth,
//   changePassBr,
//   fixCollected,
//   onReturnOrdersPrint,
//   getReturnTrans,
//   getReturnTrasnForPrint,
//   getRaportByDate,
//   printBilledOrders,
//   deliveryByCity,
//   deliveryByBrListOrder,
//   addNewPassBr,
//   addNewPassCo,
//   getProccesBilledBetwwen,
//   brAdSearchQueryProccess,
//   brAdSearchQueryRejected,
//   brAdSearchQueryFinished,
//   brAdSearchQueryPickup
// } from '../controllers/branches'

// export const branches = () => {
//   const branches = Router()

//   branches.get('/', permit('superAdmin:admin'), getBranches)
//   branches.delete(
//     '/delete/:id(\\d+)',
//     permit('superAdmin:admin'),
//     deleteBranch
//   )
//   branches.get(
//     '/accounts',
//     permit('superAdmin:admin:branchManager'),
//     getBranchAccounts
//   )
//   branches.post('/', permit('superAdmin:admin'), createBranch)
//   branches.get(
//     '/:id(\\d+)',
//     permit('superAdmin:admin:branchManager'),
//     getOneBranch
//   )
//   branches.put('/:id(\\d+)', permit('superAdmin:admin'), editBranch)
//   branches.post('/hash', permit('superAdmin:admin'), changePassBr)
//   branches.post('/hash/new', permit('superAdmin:admin'), addNewPassCo)
//   branches.post('/hash/Brnew', permit('superAdmin:admin'), addNewPassBr)

//   branches.get(
//     '/all',
//     permit('superAdmin:admin:companyAdmin:finance'),
//     getAllBranches
//   )
//   branches.get('/collect', permit('finance:superAdmin'), getBranchesCollect)
//   branches.post('/salary', permit('finance:superAdmin'), getBranchesSalary)
//   branches.get('/own/salary', permit('branchManager'), getBrSalaryById)
//   branches.get(
//     '/:id(\\d+)/statistic',
//     permit('finance:superAdmin'),
//     getbrStatsById
//   )
//   branches.get('/:id(\\d+)/xyStats', permit('superAdmin'), suAdminBrStatsXY)
//   branches.post(
//     '/finace/stats',
//     permit('finance:superAdmin'),
//     getFinanceStatistic
//   )
//   branches.post(
//     '/finace/raport/date',
//     permit('finance:superAdmin'),
//     getRaportByDate
//   )
//   branches.get(
//     '/accounts/onLikuid',
//     permit('branchManager:finance:superAdmin'),
//     getAccountsOnLikuid
//   )
//   branches.get('/oncollect', permit('branchManager'), getOnCollect)
//   branches.get(
//     '/collectOnConfirm/:id(\\d+)',
//     permit('finance'),
//     getOnConfirmCollect
//   )

//   branches.get(
//     '/transaction/collect',
//     permit('branchManager'),
//     getTransactionCollect
//   )
//   branches.get(
//     '/transaction/:id(\\d+)/collect',
//     permit('superAdmin:finance'),
//     getFinanceTransactionCollect
//   )

//   branches.get(
//     '/print/collect/transactions/:id(\\d+)',
//     permit('branchManager:companyAdmin:finance:superAdmin'),
//     getTransCollected
//   )
//   branches.delete(
//     '/collect/transactions/:id(\\d+)',
//     permit('superAdmin'),
//     deleteCollectTrans
//   )
//   branches.post(
//     '/process/billed',
//     permit('finance:superAdmin:branchManager'),
//     getProccesBilledByIdAndMonth
//   )
//   branches.post(
//     '/process/billed/between',
//     permit('finance:superAdmin:branchManager'),
//     getProccesBilledBetwwen
//   )
//   branches.post(
//     '/orders/billed',
//     permit('branchManager'),
//     getOrdersBilledByIdAndMonth
//   )

//   branches.get(
//     '/transaction/:id(\\d+)/billed',
//     permit('superAdmin:finance:branchManager'),
//     getFinanceTransactionBilled
//   )
//   branches.delete(
//     '/billed/transactions/:id(\\d+)',
//     permit('superAdmin:finance'),
//     deleteBilledTrans
//   )
//   branches.get(
//     '/print/billed/transactions/:id(\\d+)',
//     permit('branchManager:finance:superAdmin'),
//     getTransBilled
//   )
//   branches.get('/fix/:id(\\d+)', permit('superAdmin'), fixCollected)
//   branches.post(
//     '/return/orders/print',
//     permit('branchManager:courier'),
//     onReturnOrdersPrint
//   )
//   branches.get(
//     '/return/trancactions/:id(\\d+)',
//     permit('branchManager'),
//     getReturnTrans
//   )
//   branches.get(
//     '/return/trans/print/:id(\\d+)',
//     permit('branchManager:superAdmin:companyAdmin'),
//     getReturnTrasnForPrint
//   )
//   branches.post(
//     '/print/billed/orders',
//     permit('branchManager:superAdmin:finance'),
//     printBilledOrders
//   )
//   branches.get(
//     '/delivery/branch',
//     permit('branchManager:superAdmin:finance'),
//     deliveryByCity
//   )
//   branches.get(
//     '/delivery/branch/orders/:id(\\d+)',
//     permit('branchManager:superAdmin:finance'),
//     deliveryByBrListOrder
//   )
//   branches.post(
//     '/order/search',
//     permit('branchManager:superAdmin'),
//     brAdSearchQueryProccess
//   )
//   branches.post(
//     '/order/search/rejected',
//     permit('branchManager:superAdmin'),
//     brAdSearchQueryRejected
//   )
//   branches.post(
//     '/order/search/finished',
//     permit('branchManager:superAdmin'),
//     brAdSearchQueryFinished
//   )
//   branches.post(
//     '/order/search/pickup',
//     permit('branchManager:superAdmin'),
//     brAdSearchQueryPickup
//   )
//   return branches
// }
