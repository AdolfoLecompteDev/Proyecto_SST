import { ok } from '../../utils/response.js'
import * as svc from './seguimiento.service.js'

export const reporte = async (req, res, next) => {
  try {
    const data = await svc.getReporte({ search: req.query.search })
    ok(res, data)
  } catch (e) { next(e) }
}

export const refresh = async (req, res, next) => {
  try {
    const data = await svc.refreshView()
    ok(res, data, 'Vista actualizada')
  } catch (e) { next(e) }
}
