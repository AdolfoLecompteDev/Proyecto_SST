import { fail } from '../utils/response.js'

export default function errorMiddleware(error, req, res, next) {
  if (res.headersSent) {
    return next(error)
  }

  const status = error.statusCode || 500
  const message = error.message || 'Error interno del servidor'
  return fail(res, message, status)
}
