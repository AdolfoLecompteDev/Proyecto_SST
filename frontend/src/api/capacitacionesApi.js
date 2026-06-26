import axiosInstance from './axiosInstance.js'

export const fetchCapacitaciones = (params) => axiosInstance.get('/api/capacitaciones', { params })
export const fetchCapacitacionById = (id) => axiosInstance.get(`/api/capacitaciones/${id}`)
export const fetchCategorias = () => axiosInstance.get('/api/capacitaciones/categorias')
export const createCapacitacion = (payload) => axiosInstance.post('/api/capacitaciones', payload)
export const updateCapacitacion = (id, payload) => axiosInstance.put(`/api/capacitaciones/${id}`, payload)
export const deleteCapacitacion = (id) => axiosInstance.delete(`/api/capacitaciones/${id}`)

// Recursos de la ruta de estudio
export const addRecurso = (id, payload) => axiosInstance.post(`/api/capacitaciones/${id}/recursos`, payload)
export const updateRecurso = (id, rid, payload) => axiosInstance.put(`/api/capacitaciones/${id}/recursos/${rid}`, payload)
export const deleteRecurso = (id, rid) => axiosInstance.delete(`/api/capacitaciones/${id}/recursos/${rid}`)

// Progreso de estudio
export const fetchMiProgreso = (id) => axiosInstance.get(`/api/capacitaciones/${id}/mi-progreso`)
export const marcarRecursoVisto = (id, rid) => axiosInstance.post(`/api/capacitaciones/${id}/recursos/${rid}/visto`)
