import { ok } from '../../utils/response.js'
import { getModuleStatus } from './auditoria.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo auditoria activo')
}
