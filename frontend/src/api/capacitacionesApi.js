import axiosInstance from './axiosInstance.js'

export const fetchCapacitaciones = () => axiosInstance.get('/api/capacitaciones')
export const fetchCapacitacionById = (id) =>
  axiosInstance.get(`/api/capacitaciones/${id}`)
export const createCapacitacion = (payload) =>
  axiosInstance.post('/api/capacitaciones', payload)
