import { fail } from '../utils/response.js'

export default function validateMiddleware(schema) {
  return (req, res, next) => {
    if (!schema || typeof schema.validate !== 'function') {
      return next()
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    })

    if (error) {
      return fail(res, error.details?.[0]?.message || 'Datos invalidos', 400)
    }

    req.body = value
    return next()
  }
}
