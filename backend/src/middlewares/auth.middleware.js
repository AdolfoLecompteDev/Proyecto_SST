import { fail } from '../utils/response.js'
import { verifyToken } from '../utils/jwt.js'

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || ''
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    return fail(res, 'No autenticado', 401)
  }

  try {
    req.user = verifyToken(token)
    return next()
  } catch (error) {
    return fail(res, 'Token invalido o expirado', 401)
  }
}
