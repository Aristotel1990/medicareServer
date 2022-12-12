
/**
 * Accept permission a string with roles concatenated with `:`
 * example : "admin:user:manager:super_admin"
 * @param permission
 * @returns {(function(*, *, *): void)|*}
 */
export const permit = (permission) => {
  return (req, res, next) => {
    const { user } = req
    const roles = permission.split(':')

    if (user && roles.includes(user.role)) {
      return next()
    } else {
      res.status(403).json({ error: 'Forbidden' })
    }
  }
}
