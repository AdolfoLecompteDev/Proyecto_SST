import axiosInstance from './axiosInstance.js'

export const fetchEvaluaciones = () => axiosInstance.get('/api/evaluaciones')
export const submitEvaluacion = (payload) =>
  axiosInstance.post('/api/evaluaciones', payload)
