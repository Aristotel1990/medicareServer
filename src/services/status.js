// import { userRoles } from '../constants'

export const isInTrasit = (status) => {
  return [
    'In Transit',
    'pickedInClient',
    'toCourier',
    'branchToCourier',
    'Ne Magazine',
    'Order Created',
    'toPickUpFromCourier'
  ].includes(status)
}

export const isCompleted = (status) => {
  return ['Completed'].includes(status)
}
export const isRejected = (status) => {
  return ['Rejected'].includes(status)
}
export const isLikuiduar = (status) => {
  return ['Likuiduar'].includes(status)
}
export const isKthyer = (status) => {
  return ['Kthyer'].includes(status)
}
