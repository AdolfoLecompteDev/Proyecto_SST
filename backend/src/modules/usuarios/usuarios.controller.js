import { ok } from '../../utils/response.js'
import { getModuleStatus } from './usuarios.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo usuarios activo')
}
