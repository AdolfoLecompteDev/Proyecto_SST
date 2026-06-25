import { ok, fail } from '../../utils/response.js'
import { getConfig, setConfig } from './config.service.js'

export const getUserConfig = async (req, res, next) => {
  try {
    const data = await getConfig(req.user.id)
    ok(res, data, 'Configuración cargada')
  } catch (err) {
    next(err)
  }
}

export const updateUserConfig = async (req, res, next) => {
  try {
    const config = req.body
    if (!config || typeof config !== 'object') {
      return fail(res, 'Formato de configuración inválido', 400)
    }
    const data = await setConfig(req.user.id, config)
    ok(res, data, 'Configuración guardada')
  } catch (err) {
    next(err)
  }
}
