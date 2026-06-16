import { ok, fail } from '../../utils/response.js'
import { loginUser, cambiarPassword, actualizarPerfil, getPerfilStats } from './auth.service.js'

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

export const cambiarPass = async (req, res, next) => {
  try {
    const { actual, nueva } = req.body
    if (!actual || !nueva) return fail(res, 'Contraseña actual y nueva son requeridas', 400)
    if (nueva.length < 6) return fail(res, 'La nueva contraseña debe tener mínimo 6 caracteres', 400)
    await cambiarPassword(req.user.id, actual, nueva)
    ok(res, null, 'Contraseña actualizada')
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status)
    next(err)
  }
}

export const updatePerfil = async (req, res, next) => {
  try {
    const { nombre, apellido, email, documento } = req.body
    if (!nombre || !apellido || !email) return fail(res, 'Nombre, apellido y email son requeridos', 400)
    const data = await actualizarPerfil(req.user.id, { nombre, apellido, email, documento })
    ok(res, data, 'Perfil actualizado')
  } catch (err) {
    if (err.status) return fail(res, err.message, err.status)
    next(err)
  }
}

export const perfilStats = async (req, res, next) => {
  try {
    const data = await getPerfilStats(req.user.id)
    ok(res, data)
  } catch (err) {
    next(err)
  }
}
