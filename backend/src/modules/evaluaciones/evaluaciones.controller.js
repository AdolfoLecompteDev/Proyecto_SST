import { ok } from '../../utils/response.js'
import { getModuleStatus } from './evaluaciones.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo evaluaciones activo')
}
