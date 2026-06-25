import axiosInstance from './axiosInstance.js'

export const fetchConfig = () => axiosInstance.get('/api/config')
export const saveConfig = (config) => axiosInstance.put('/api/config', config)
