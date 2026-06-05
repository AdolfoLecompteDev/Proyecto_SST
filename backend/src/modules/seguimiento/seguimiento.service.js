import pool from '../../config/db.js'

export const getReporte = async ({ search = '' } = {}) => {
  const conditions = search
    ? [`(ms.nombre_completo ILIKE $1 OR ms.email ILIKE $1)`]
    : []
  const params = search ? [`%${search}%`] : []
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(`
    SELECT ms.usuario_id, ms.nombre_completo, ms.email,
           ms.capacitacion_id, ms.capacitacion,
           ms.fecha_vigencia, ms.mejor_puntaje,
           ms.total_intentos, ms.aprobado,
           ms.fecha_certificado
    FROM sst.mv_seguimiento_capacitacion ms
    ${where}
    ORDER BY ms.nombre_completo, ms.capacitacion
  `, params)

  const byUser = {}
  for (const row of rows) {
    if (!byUser[row.usuario_id]) {
      byUser[row.usuario_id] = {
        usuario_id: row.usuario_id,
        nombre_completo: row.nombre_completo,
        email: row.email,
        capacitaciones: [],
        total: 0,
        completadas: 0,
      }
    }
    byUser[row.usuario_id].capacitaciones.push({
      id: row.capacitacion_id,
      nombre: row.capacitacion,
      fecha_vigencia: row.fecha_vigencia,
      mejor_puntaje: row.mejor_puntaje,
      total_intentos: row.total_intentos,
      aprobado: row.aprobado,
      fecha_certificado: row.fecha_certificado,
    })
    byUser[row.usuario_id].total++
    if (row.aprobado) byUser[row.usuario_id].completadas++
  }

  return Object.values(byUser).map((u) => ({
    ...u,
    porcentaje: u.total > 0 ? Math.round((u.completadas / u.total) * 100) : 0,
  }))
}

export const refreshView = async () => {
  await pool.query('REFRESH MATERIALIZED VIEW CONCURRENTLY sst.mv_seguimiento_capacitacion')
  return { refreshed: true }
}
