export const buildCertificatePayload = (certificado) => ({
  codigo: certificado.codigo_certificado,
  nombre: certificado.nombre,
  fechaEmision: certificado.fecha_emision,
})
