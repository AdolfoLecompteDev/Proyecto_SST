import axiosInstance from './axiosInstance.js'

export const fetchUsers = (params) => axiosInstance.get('/api/usuarios', { params })
export const fetchUserById = (id) => axiosInstance.get(`/api/usuarios/${id}`)
export const createUser = (payload) => axiosInstance.post('/api/usuarios', payload)
export const updateUser = (id, payload) => axiosInstance.put(`/api/usuarios/${id}`, payload)
export const toggleUserEstado = (id) => axiosInstance.patch(`/api/usuarios/${id}/estado`)
export const fetchUserStats = () => axiosInstance.get('/api/usuarios/stats')
