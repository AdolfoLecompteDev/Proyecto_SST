import { ok } from '../../utils/response.js'
import { getModuleStatus } from './dashboard.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo dashboard activo')
}
