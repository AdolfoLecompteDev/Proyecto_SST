import axiosInstance from './axiosInstance.js'

export const fetchDashboard = () => axiosInstance.get('/api/dashboard')
