import axiosInstance from './axiosInstance.js'

export const fetchMisCertificados = () => axiosInstance.get('/api/certificados/mis')
export const fetchAllCertificados = (params) => axiosInstance.get('/api/certificados', { params })
export const fetchCertificadoById = (id) => axiosInstance.get(`/api/certificados/${id}`)
export const verificarCertificado = (codigo) => axiosInstance.get(`/api/certificados/verificar/${codigo}`)

export const downloadCertificadoPDF = async (id, codigo) => {
  const response = await axiosInstance.get(`/api/certificados/${id}/pdf`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `certificado-${codigo}.pdf`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}
