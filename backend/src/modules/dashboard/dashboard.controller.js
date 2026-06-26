import { ok } from '../../utils/response.js'
import { getStats, getSinCertificar } from './dashboard.service.js'

export const stats = async (req, res, next) => {
  try {
    const data = await getStats()
    ok(res, data)
  } catch (e) { next(e) }
}

export const sinCertificar = async (req, res, next) => {
  try {
    const data = await getSinCertificar()
    ok(res, data)
  } catch (e) { next(e) }
}
