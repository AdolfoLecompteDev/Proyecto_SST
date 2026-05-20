import { ok } from '../../utils/response.js'
import { getModuleStatus } from './certificados.service.js'

export const health = (req, res) => {
  ok(res, getModuleStatus(), 'Modulo certificados activo')
}
