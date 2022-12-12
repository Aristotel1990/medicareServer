
export const userRoles = ['superAdmin', 'admin', 'branchManager', 'courier', 'finance ', 'companyAdmin', 'companyBranch', 'PF', 'user']

export const orderStatus = [
  {
    code: 'created',
    status: 'Porosia U Krijua',
    type: 'Order Created'
  },
  {
    code: 'toPickUpFromCourier',
    status: 'Per tu marre nga korieri',
    type: 'To pick up from courier'
  },
  {
    code: 'pickedInClient',
    status: 'Mbartur nga Korieri per tek Magazina',
    type: 'Order picked from Courier'
  },
  {
    code: 'inOriginBranch',
    status: 'Ne depon fillestare',
    type: 'Order delivered to branch warehouse'
  },
  {
    code: 'pickedFromOrignWarehouse',
    status: 'Per ne depon kryesore',
    type: 'To main warehouse'
  },
  {
    code: 'inMainWarehouse',
    status: 'Ne depon kryesore',
    type: 'In main warehouse'
  },
  {
    code: 'pickedFromMainWarehouse',
    status: 'Rruges per ne depon e rradhes',
    type: 'To next warehouse'
  },
  {
    code: 'inDestWarehouse',
    status: 'Ne depon perfundimtare',
    type: 'In destination warehouse'
  },
  {
    code: 'toClient',
    status: 'Per te klienti fundor',
    type: 'In destination warehouse'
  },
  {
    code: 'delivered',
    status: 'Dorezuar',
    type: ''
  },
  {
    code: 'rejected',
    status: 'Refuzuar',
    type: 'Rejected'
  }
]

export const currencies = {
  ALL: {
    name: 'Leke',
    code: 'ALL',
    toEur: 121.8,
    toAll: 1,
    toUsd: 107.9
  },
  EUR: {
    name: 'Euro',
    code: 'EUR',
    toAll: 121.2,
    toEur: 1,
    toUsd: 1.14
  },
  USD: {
    name: 'Dollar',
    code: 'USD',
    toAll: 121.2,
    toEur: 0.89,
    toUsd: 1
  }
}
// 1. created (order created from client)
// // 1.1  clientToCourier (optional if branch assign to pickup from courier)
// // 1.2  pickedFromClient (optional if picked from courier)
// 2. inOriginWarehouse (first step, skip 1.1 and 1.2 id delivered to branch directly)
// // 2.1 originToCourier (if assigned for pickup to courier)
// // 2.2 pickedFromOrigin (picked from courier in branch)
// // 2.3 Delivered | Rejected
// 3. inDestinationBranch
// // 3.1 toCourier
// // 3.2 pickedFromCourier
// // 3.3 Delivered | Rejected
