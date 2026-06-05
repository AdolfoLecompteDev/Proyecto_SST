import axiosInstance from './axiosInstance.js'

export const fetchCapacitaciones = (params) => axiosInstance.get('/api/capacitaciones', { params })
export const fetchCapacitacionById = (id) => axiosInstance.get(`/api/capacitaciones/${id}`)
export const fetchCategorias = () => axiosInstance.get('/api/capacitaciones/categorias')
export const createCapacitacion = (payload) => axiosInstance.post('/api/capacitaciones', payload)
export const updateCapacitacion = (id, payload) => axiosInstance.put(`/api/capacitaciones/${id}`, payload)
