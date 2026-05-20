import { ok } from '../../utils/response.js'
import { getModuleStatus } from './consultas.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo consultas activo')
}
