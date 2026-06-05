import { ok, fail } from '../../utils/response.js'
import { loginUser } from './auth.service.js'

export const health = (_req, res) => ok(res, { module: 'auth' }, 'Modulo auth activo')

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return fail(res, 'Email y contraseña son requeridos', 400)
    const data = await loginUser(email, password)
    ok(res, data, 'Sesión iniciada')
  } catch (err) {
    if (err.status === 401 || err.status === 403) return fail(res, err.message, err.status)
    next(err)
  }
}
