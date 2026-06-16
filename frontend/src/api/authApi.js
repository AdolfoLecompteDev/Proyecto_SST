import axiosInstance from './axiosInstance.js'

export const login = (payload) => axiosInstance.post('/api/auth/login', payload)
export const cambiarPassword = (payload) => axiosInstance.post('/api/auth/cambiar-password', payload)
export const actualizarPerfil = (payload) => axiosInstance.put('/api/auth/perfil', payload)
export const fetchPerfilStats = () => axiosInstance.get('/api/auth/perfil/stats')
