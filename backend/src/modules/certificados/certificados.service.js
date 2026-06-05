import pool from '../../config/db.js'

export const getMisCertificados = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT cert.id, cert.codigo_certificado, cert.fecha_emision,
            c.titulo AS capacitacion, c.fecha_vigencia,
            cat.nombre AS categoria,
            CASE
              WHEN c.fecha_vigencia IS NULL THEN 'vigente'
              WHEN c.fecha_vigencia < CURRENT_DATE THEN 'expirado'
              ELSE 'vigente'
            END AS estado
     FROM sst.certificados cert
     JOIN sst.capacitaciones c ON c.id = cert.capacitacion_id
     LEFT JOIN sst.categorias cat ON cat.id = c.categoria_id
     WHERE cert.usuario_id = $1
     ORDER BY cert.fecha_emision DESC`,
    [usuario_id],
  )
  return rows
}

export const getAll = async ({ search = '', estado = null } = {}) => {
  const conditions = []
  const params = []
  const push = (v) => { params.push(v); return `$${params.length}` }

  if (search) {
    conditions.push(`(u.nombre ILIKE ${push('%' + search + '%')} OR u.apellido ILIKE $${params.length} OR c.titulo ILIKE $${params.length} OR cert.codigo_certificado ILIKE $${params.length})`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(`
    SELECT cert.id, cert.codigo_certificado, cert.fecha_emision,
           u.nombre || ' ' || u.apellido AS empleado,
           c.titulo AS capacitacion,
           c.fecha_vigencia,
           CASE
             WHEN c.fecha_vigencia IS NULL THEN 'vigente'
             WHEN c.fecha_vigencia < CURRENT_DATE THEN 'expirado'
             ELSE 'vigente'
           END AS estado
    FROM sst.certificados cert
    JOIN sst.usuarios u ON u.id = cert.usuario_id
    JOIN sst.capacitaciones c ON c.id = cert.capacitacion_id
    ${where}
    ORDER BY cert.fecha_emision DESC
  `, params)
  return rows
}

export const getById = async (id) => {
  const { rows } = await pool.query(
    `SELECT cert.*, u.nombre || ' ' || u.apellido AS empleado, u.documento,
            c.titulo AS capacitacion
     FROM sst.certificados cert
     JOIN sst.usuarios u ON u.id = cert.usuario_id
     JOIN sst.capacitaciones c ON c.id = cert.capacitacion_id
     WHERE cert.id = $1`,
    [id],
  )
  if (!rows.length) throw Object.assign(new Error('Certificado no encontrado'), { status: 404 })
  return rows[0]
}

export const verificar = async (codigo) => {
  const { rows } = await pool.query(
    `SELECT cert.codigo_certificado, cert.fecha_emision,
            u.nombre || ' ' || u.apellido AS empleado,
            c.titulo AS capacitacion, c.fecha_vigencia
     FROM sst.certificados cert
     JOIN sst.usuarios u ON u.id = cert.usuario_id
     JOIN sst.capacitaciones c ON c.id = cert.capacitacion_id
     WHERE UPPER(cert.codigo_certificado) = UPPER($1)`,
    [codigo],
  )
  if (!rows.length) return { valido: false }
  return { valido: true, certificado: rows[0] }
}
