import jwt from 'jsonwebtoken'
import logger from '../lib/logger'

import { JWT_EXPIRE, JWT_SECRET, JWT_EXPIRE_REF, JWT_SECRET_REF } from '../config/env'
import { User } from '../models'

export const createTokenFromPayload = (payload) => {
  const options = {
    expiresIn: JWT_EXPIRE
  }
  const optionsRef = {
    expiresIn: JWT_EXPIRE_REF
  }
  // Create token
  const accessToken = jwt.sign(payload, JWT_SECRET, options)
  const refreshToken = jwt.sign(payload, JWT_SECRET_REF, optionsRef)

  return ({ accessToken, refreshToken })
}

export const isValidToken = async (jwtToken) => {
  try {
    const payload = jwt.verify(jwtToken, JWT_SECRET)
    const user = await User.findByPk(payload.id)
    return user
  } catch (err) {
    logger.error('error in isValidToken --', { error: err.message })
    throw new Error('INVALID_TOKEN')
  }
}

export const getTokenPayload = (token) => {
  try {
    const payload = jwt.decode(token)
    return payload
  } catch (err) {
    logger.error('error in getTokenPayload --', { error: err.message })
    throw new Error('INVALID_TOKEN')
  }
}
