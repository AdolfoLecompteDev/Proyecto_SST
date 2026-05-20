import { ok } from '../../utils/response.js'
import { getModuleStatus } from './seguimiento.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo seguimiento activo')
}
