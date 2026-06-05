import { ok, fail } from '../../utils/response.js'
import * as svc from './evaluaciones.service.js'

export const byCapacitacion = async (req, res, next) => {
  try {
    const data = await svc.getByCapacitacion(Number(req.params.capacitacion_id), req.user.id)
    ok(res, data)
  } catch (e) { next(e) }
}

export const preguntas = async (req, res, next) => {
  try {
    const data = await svc.getPreguntas(Number(req.params.id), req.user.id)
    ok(res, data)
  } catch (e) { next(e) }
}

export const submit = async (req, res, next) => {
  try {
    const { respuestas } = req.body
    if (!Array.isArray(respuestas) || !respuestas.length)
      return fail(res, 'Se requiere un array de respuestas')
    const data = await svc.submitIntento(Number(req.params.id), req.user.id, respuestas)
    ok(res, data, data.aprobado ? '¡Aprobaste la evaluación!' : 'Evaluación completada')
  } catch (e) { next(e) }
}

export const misIntentos = async (req, res, next) => {
  try {
    const data = await svc.getMisIntentos(req.user.id)
    ok(res, data)
  } catch (e) { next(e) }
}
