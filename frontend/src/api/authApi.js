import axiosInstance from './axiosInstance.js'

export const login = (payload) => axiosInstance.post('/api/auth/login', payload)
export const logout = () => axiosInstance.post('/api/auth/logout')
export const requestPasswordReset = (payload) =>
  axiosInstance.post('/api/auth/recuperar', payload)
