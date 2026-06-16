import { ok } from '../../utils/response.js'
import { getNotificaciones, marcarLeida, marcarTodas } from './notificaciones.service.js'

export const list = async (req, res, next) => {
  try {
    const data = await getNotificaciones(req.user.id)
    ok(res, data)
  } catch (e) { next(e) }
}

export const leerUna = async (req, res, next) => {
  try {
    await marcarLeida(req.user.id, req.params.id)
    ok(res, null)
  } catch (e) { next(e) }
}

export const leerTodas = async (req, res, next) => {
  try {
    const { ids } = req.body
    await marcarTodas(req.user.id, ids)
    ok(res, null)
  } catch (e) { next(e) }
}
