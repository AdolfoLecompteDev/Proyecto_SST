import { ok, fail } from '../../utils/response.js'
import { verificar, getHistorial } from './consultas.service.js'

export const health = (_req, res) => ok(res, { module: 'consultas' }, 'Modulo consultas activo')

export const ejecutarVerificacion = async (req, res, next) => {
  try {
    const { tipo_doc, numero_doc } = req.body
    if (!numero_doc?.trim()) return fail(res, 'Número de documento requerido', 400)
    const data = await verificar(req.user.id, tipo_doc || 'CC', numero_doc.trim())
    ok(res, data)
  } catch (err) {
    next(err)
  }
}

export const historial = async (req, res, next) => {
  try {
    const data = await getHistorial(50)
    ok(res, data)
  } catch (err) {
    next(err)
  }
}
