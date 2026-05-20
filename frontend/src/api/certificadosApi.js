import axiosInstance from './axiosInstance.js'

export const fetchCertificados = () => axiosInstance.get('/api/certificados')
export const downloadCertificado = (id) =>
  axiosInstance.get(`/api/certificados/${id}`)
