import { ok } from '../../utils/response.js'
import * as svc from './certificados.service.js'

export const misCertificados = async (req, res, next) => {
  try {
    const data = await svc.getMisCertificados(req.user.id)
    ok(res, data)
  } catch (e) { next(e) }
}

export const list = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query)
    ok(res, data)
  } catch (e) { next(e) }
}

export const getOne = async (req, res, next) => {
  try {
    const data = await svc.getById(Number(req.params.id))
    ok(res, data)
  } catch (e) { next(e) }
}

export const verificar = async (req, res, next) => {
  try {
    const data = await svc.verificar(req.params.codigo)
    ok(res, data)
  } catch (e) { next(e) }
}

export const descargarPDF = async (req, res, next) => {
  try {
    const cert = await svc.getById(Number(req.params.id))
    
    // Si es funcionario, validar que sea su propio certificado
    if (req.user.rol === 'FUNCIONARIO' && cert.usuario_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' })
    }

    const { default: PDFDocument } = await import('pdfkit')
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape',
      margin: 50
    })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${cert.codigo_certificado}.pdf"`)
    
    doc.pipe(res)
    
    // Diseño básico del certificado
    doc.rect(20, 20, doc.page.width - 40, doc.page.height - 40).stroke()
    doc.rect(25, 25, doc.page.width - 50, doc.page.height - 50).stroke()
    
    doc.moveDown(2)
    doc.fontSize(30).text('CERTIFICADO DE CAPACITACIÓN', { align: 'center' })
    doc.moveDown(2)
    
    doc.fontSize(16).text('Se otorga el presente certificado a:', { align: 'center' })
    doc.moveDown(1)
    
    doc.fontSize(24).text(cert.empleado, { align: 'center', underline: true })
    if (cert.documento) {
      doc.fontSize(14).text(`Documento: ${cert.documento}`, { align: 'center' })
    }
    doc.moveDown(2)
    
    doc.fontSize(16).text('Por haber aprobado satisfactoriamente la capacitación:', { align: 'center' })
    doc.moveDown(1)
    
    doc.fontSize(20).text(cert.capacitacion, { align: 'center' })
    doc.moveDown(3)
    
    doc.fontSize(12).text(`Fecha de Emisión: ${new Date(cert.fecha_emision).toLocaleDateString()}`, 50, doc.page.height - 100)
    doc.text(`Código de Verificación: ${cert.codigo_certificado}`)
    
    if (cert.fecha_vigencia) {
      doc.text(`Válido hasta: ${new Date(cert.fecha_vigencia).toLocaleDateString()}`)
    }

    doc.end()
  } catch (e) {
    next(e)
  }
}

