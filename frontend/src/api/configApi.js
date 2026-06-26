import axiosInstance from './axiosInstance.js'

export const fetchConfig = () => axiosInstance.get('/api/config')
export const saveConfig = (config) => axiosInstance.put('/api/config', config)
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'
export const fetchPublicConfig = () => fetch(`${API_BASE}/api/config/public`).then(r => r.json())
export const saveSistemaConfig = (config) => axiosInstance.put('/api/config/sistema', config)
