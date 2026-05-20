import { ok } from '../../utils/response.js'
import { getModuleStatus } from './auth.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo auth activo')
}
