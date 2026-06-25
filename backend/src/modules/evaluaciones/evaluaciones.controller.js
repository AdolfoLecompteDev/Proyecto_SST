import { ok, created, fail } from '../../utils/response.js'
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

// ─── Admin handlers ─────────────────────────────────────────────────────────────────────────

export const createEval = async (req, res, next) => {
  try {
    const { titulo, puntaje_minimo, max_intentos } = req.body
    const data = await svc.createEvaluacion(Number(req.params.capacitacion_id), { titulo, puntaje_minimo, max_intentos })
    created(res, data, 'Evaluación creada')
  } catch (e) { next(e) }
}

export const getEvalAdmin = async (req, res, next) => {
  try {
    const data = await svc.getEvaluacionAdmin(Number(req.params.id))
    ok(res, data)
  } catch (e) { next(e) }
}

export const addPreguntaHandler = async (req, res, next) => {
  try {
    const { enunciado, opciones } = req.body
    const data = await svc.addPregunta(Number(req.params.id), { enunciado, opciones })
    created(res, data, 'Pregunta agregada')
  } catch (e) { next(e) }
}

export const deletePreguntaHandler = async (req, res, next) => {
  try {
    await svc.deletePregunta(Number(req.params.pid))
    ok(res, null, 'Pregunta eliminada')
  } catch (e) { next(e) }
}

export const deleteEvalHandler = async (req, res, next) => {
  try {
    await svc.deleteEvaluacion(Number(req.params.id))
    ok(res, null, 'Evaluación eliminada')
  } catch (e) { next(e) }
}
