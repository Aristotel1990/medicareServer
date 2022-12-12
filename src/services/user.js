// import { userRoles } from '../constants'

export const isSystemAdmin = (role) => {
  return ['superAdmin', 'admin'].includes(role)
}

export const isSystemUser = (role) => {
  return ['superAdmin', 'admin', 'courier', 'finance'].includes(role)
}

export const isBranchAdmin = (role) => {
  return ['branchManager'].includes(role)
}
export const isCompanyAdminOrCompanyBranch = (role) => {
  return ['companyAdmin', 'companyBranch'].includes(role)
}
export const isCompanyAdminOrBranchManager = (role) => {
  return ['companyAdmin', 'branchManager'].includes(role)
}
export const isFinanceOrCompanyAdminOrBranchManager = (role) => {
  return ['companyAdmin', 'branchManager', 'finance', 'superAdmin'].includes(
    role
  )
}
export const isSystemCourierGetter = (role) => {
  return [
    'courier',
    'branchManager',
    'finance',
    'superAdmin',
    'admin'
  ].includes(role)
}
export const isFinanceOrAAdmin = (role) => {
  return ['finance', 'superAdmin'].includes(role)
}
export const isBranchOrAAdminOrCourier = (role) => {
  return ['branchManager', 'superAdmin', 'courier'].includes(role)
}
export const isBranchAdminOrFinance = (role) => {
  return ['finance', 'branchManager', 'superAdmin'].includes(role)
}

export const isCourier = (role) => {
  return ['courier'].includes(role)
}

export const isCourierOrBranch = (role) => {
  return ['branchManager', 'courier'].includes(role)
}

export const isCompanyAdmin = (role) => {
  return ['companyAdmin', 'companyBranch'].includes(role)
}

export const isFinance = (role) => {
  return ['finance'].includes(role)
}

export const canEditOrder = (role) => {
  return [
    'companyAdmin',
    'companyBranch',
    'superAdmin',
    'admin',
    'branchManager'
  ].includes(role)
}
