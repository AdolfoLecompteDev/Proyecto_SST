import axiosInstance from './axiosInstance.js'

export const fetchDashboardStats = () => axiosInstance.get('/api/dashboard')
export const fetchSinCertificar = () => axiosInstance.get('/api/dashboard/sin-certificar')
