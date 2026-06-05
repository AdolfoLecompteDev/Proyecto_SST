import axiosInstance from './axiosInstance.js'

export const fetchMisCertificados = () => axiosInstance.get('/api/certificados/mis')
export const fetchAllCertificados = (params) => axiosInstance.get('/api/certificados', { params })
export const fetchCertificadoById = (id) => axiosInstance.get(`/api/certificados/${id}`)
export const verificarCertificado = (codigo) => axiosInstance.get(`/api/certificados/verificar/${codigo}`)
