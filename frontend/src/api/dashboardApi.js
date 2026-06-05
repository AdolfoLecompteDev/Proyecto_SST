import axiosInstance from './axiosInstance.js'

export const fetchDashboardStats = () => axiosInstance.get('/api/dashboard')
