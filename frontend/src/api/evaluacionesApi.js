import axiosInstance from './axiosInstance.js'

export const fetchEvaluacionesByCapacitacion = (capacitacion_id) =>
  axiosInstance.get(`/api/evaluaciones/capacitacion/${capacitacion_id}`)

export const fetchPreguntas = (evaluacion_id) =>
  axiosInstance.get(`/api/evaluaciones/${evaluacion_id}/preguntas`)

export const submitEvaluacion = (evaluacion_id, respuestas) =>
  axiosInstance.post(`/api/evaluaciones/${evaluacion_id}/submit`, { respuestas })

export const fetchMisIntentos = () => axiosInstance.get('/api/evaluaciones/mis-intentos')

// Admin — gestión de quizzes
export const createEvaluacion = (capacitacion_id, payload) =>
  axiosInstance.post(`/api/evaluaciones/capacitacion/${capacitacion_id}`, payload)

export const fetchEvaluacionAdmin = (evaluacion_id) =>
  axiosInstance.get(`/api/evaluaciones/${evaluacion_id}/admin`)

export const addPregunta = (evaluacion_id, payload) =>
  axiosInstance.post(`/api/evaluaciones/${evaluacion_id}/preguntas/nueva`, payload)

export const deletePregunta = (pregunta_id) =>
  axiosInstance.delete(`/api/evaluaciones/preguntas/${pregunta_id}`)

export const deleteEvaluacion = (evaluacion_id) =>
  axiosInstance.delete(`/api/evaluaciones/${evaluacion_id}`)
