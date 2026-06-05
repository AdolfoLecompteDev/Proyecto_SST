import axiosInstance from './axiosInstance.js'

export const fetchEvaluacionesByCapacitacion = (capacitacion_id) =>
  axiosInstance.get(`/api/evaluaciones/capacitacion/${capacitacion_id}`)

export const fetchPreguntas = (evaluacion_id) =>
  axiosInstance.get(`/api/evaluaciones/${evaluacion_id}/preguntas`)

export const submitEvaluacion = (evaluacion_id, respuestas) =>
  axiosInstance.post(`/api/evaluaciones/${evaluacion_id}/submit`, { respuestas })

export const fetchMisIntentos = () => axiosInstance.get('/api/evaluaciones/mis-intentos')
