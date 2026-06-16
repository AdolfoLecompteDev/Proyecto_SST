import axiosInstance from './axiosInstance.js'

export const ejecutarVerificacion = (payload) => axiosInstance.post('/api/consultas/verificar', payload)
export const fetchHistorial = () => axiosInstance.get('/api/consultas/historial')
