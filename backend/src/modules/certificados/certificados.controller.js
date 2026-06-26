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

    if (req.user.rol === 'FUNCIONARIO' && cert.usuario_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'No autorizado' })
    }

    const [{ default: PDFDocument }, { getSistema }] = await Promise.all([
      import('pdfkit'),
      import('../config/config.service.js'),
    ])

    const sistema = await getSistema()
    const colorSec = sistema.color_secundario || '#006c49'
    const colorPrim = sistema.color_primario || '#111111'
    const empresa = (sistema.nombre_empresa || 'SST Enterprise').toUpperCase()

    const doc = new PDFDocument({ size: 'LETTER', layout: 'landscape', margin: 0 })

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="certificado-${cert.codigo_certificado}.pdf"`)
    doc.pipe(res)

    const W = doc.page.width   // 792
    const H = doc.page.height  // 612
    const BAND_TOP = 78
    const BAND_BOT = 44
    const STRIPE = 8
    const PAD = 18

    // ── Watermark ────────────────────────────────────────────
    doc.save()
    doc.rotate(-32, { origin: [W / 2, H / 2] })
    doc.fillColor(colorSec).opacity(0.055)
    doc.font('Helvetica-Bold').fontSize(88)
    doc.text(empresa, 0, H / 2 - 55, { width: W, align: 'center', lineBreak: false })
    doc.restore()

    // ── Top band ─────────────────────────────────────────────
    doc.save()
    doc.rect(0, 0, W, BAND_TOP).fillColor(colorSec).fill()
    doc.restore()

    // ── Bottom band ──────────────────────────────────────────
    doc.save()
    doc.rect(0, H - BAND_BOT, W, BAND_BOT).fillColor(colorSec).fill()
    doc.restore()

    // ── Left accent stripe ────────────────────────────────────
    doc.save()
    doc.rect(0, BAND_TOP, STRIPE, H - BAND_TOP - BAND_BOT).fillColor(colorSec).fill()
    doc.restore()

    // ── Outer border ─────────────────────────────────────────
    doc.save()
    doc.rect(PAD, PAD, W - PAD * 2, H - PAD * 2)
      .strokeColor(colorSec).lineWidth(1.2).stroke()
    doc.restore()

    // ── Top band text ─────────────────────────────────────────
    doc.fillColor('#ffffff').opacity(1)
    doc.font('Helvetica').fontSize(9)
    doc.text(empresa, 28, 14, { width: W - 56, align: 'left' })
    doc.font('Helvetica-Bold').fontSize(23)
    doc.text('CERTIFICADO DE CAPACITACIÓN SST', 28, 30, { width: W - 56, align: 'center' })

    // ── Body ─────────────────────────────────────────────────
    const BX = STRIPE + 24   // body left (after stripe)
    const BW = W - BX - 24   // body width

    let y = BAND_TOP + 26

    doc.fillColor('#555555').font('Helvetica').fontSize(12)
    doc.text('Se otorga el presente certificado a:', BX, y, { width: BW, align: 'center' })
    y += 26

    doc.fillColor(colorPrim).font('Helvetica-Bold').fontSize(27)
    doc.text(cert.empleado, BX, y, { width: BW, align: 'center' })
    y += 34

    if (cert.documento) {
      doc.fillColor('#777777').font('Helvetica').fontSize(10)
      doc.text(`Cédula / Documento: ${cert.documento}`, BX, y, { width: BW, align: 'center' })
      y += 18
    }

    // divider
    y += 8
    doc.save()
    doc.strokeColor(colorSec).lineWidth(0.8).opacity(0.45)
    doc.moveTo(BX + 100, y).lineTo(W - 48, y).stroke()
    doc.restore()
    y += 14

    doc.fillColor('#555555').font('Helvetica').fontSize(12)
    doc.text('Por haber aprobado satisfactoriamente la capacitación:', BX, y, { width: BW, align: 'center' })
    y += 24

    doc.fillColor(colorSec).font('Helvetica-Bold').fontSize(19)
    doc.text(cert.capacitacion, BX, y, { width: BW, align: 'center' })

    // ── Bottom band text ──────────────────────────────────────
    const fmt = (d) => new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })
    const botY = H - BAND_BOT + 13

    doc.fillColor('#ffffff').font('Helvetica').fontSize(8.5)
    doc.text(`Código: ${cert.codigo_certificado}`, 24, botY, { width: W / 3 - 24, align: 'left' })
    doc.text(`Fecha de emisión: ${fmt(cert.fecha_emision)}`, W / 3, botY, { width: W / 3, align: 'center' })
    if (cert.fecha_vigencia) {
      doc.text(`Válido hasta: ${fmt(cert.fecha_vigencia)}`, W * 2 / 3, botY, { width: W / 3 - 24, align: 'right' })
    }

    doc.end()
  } catch (e) {
    next(e)
  }
}

