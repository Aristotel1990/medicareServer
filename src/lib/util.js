/* eslint-disable no-tabs */
import { NODE_ENV } from '../config/env'
/**	Creates a callback that proxies node callback style arguments to an Express Response object.
 *	@param {express.Response} res	Express HTTP Response
 *	@param {number} [status=200]	Status code to send on success
 *
 *	@example
 *		list(req, res) {
 *			collection.find({}, toRes(res));
 *		}
 */
export const toRes = (res, status = 200) => {
  return (err, thing) => {
    if (err) return res.status(500).send(err)

    if (thing && typeof thing.toObject === 'function') {
      thing = thing.toObject()
    }
    res.status(status).json(thing)
  }
}

export const isProd = () => {
  return ['prod', 'production'].includes(NODE_ENV)
}

export const getPagination = (page, size) => {
  const limit = size ? +size : 3
  const offset = page ? page * limit : 0

  return { limit, offset }
}

export const getPagingData = (data, page, limit) => {
  const { count, rows } = data
  const currentPage = page ? +page : 0
  const totalPages = Math.ceil(count / limit)

  return { count, data: rows, totalPages, currentPage }
}
