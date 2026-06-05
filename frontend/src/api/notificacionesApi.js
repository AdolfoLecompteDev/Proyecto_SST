import axiosInstance from './axiosInstance.js'

export const fetchNotificaciones = () => axiosInstance.get('/api/notificaciones')
