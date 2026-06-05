import axiosInstance from './axiosInstance.js'

export const fetchSeguimiento = (params) => axiosInstance.get('/api/seguimiento', { params })
export const refreshSeguimiento = () => axiosInstance.post('/api/seguimiento/refresh')
