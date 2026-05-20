import { fail } from '../utils/response.js'

export default function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return fail(res, 'Sin permisos', 403)
    }
    return next()
  }
}
