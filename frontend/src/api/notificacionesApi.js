import axiosInstance from './axiosInstance.js'

export const fetchNotificaciones = () => axiosInstance.get('/api/notificaciones')
export const marcarLeida = (id) => axiosInstance.patch(`/api/notificaciones/${encodeURIComponent(id)}/leer`)
export const marcarTodas = (ids) => axiosInstance.post('/api/notificaciones/leer-todas', { ids })
