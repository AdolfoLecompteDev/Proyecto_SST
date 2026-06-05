import { ok } from '../../utils/response.js'
import { getNotificaciones } from './notificaciones.service.js'

export const list = async (req, res, next) => {
  try {
    const data = await getNotificaciones(req.user.id)
    ok(res, data)
  } catch (e) { next(e) }
}
