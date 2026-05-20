import axiosInstance from './axiosInstance.js'

export const fetchUsers = () => axiosInstance.get('/api/usuarios')
export const fetchUserById = (id) => axiosInstance.get(`/api/usuarios/${id}`)
export const createUser = (payload) => axiosInstance.post('/api/usuarios', payload)
export const updateUser = (id, payload) =>
  axiosInstance.put(`/api/usuarios/${id}`, payload)
