import pool from '../../config/db.js'

export const getStats = async () => {
  const { rows: usuariosStats } = await pool.query(`
    SELECT COUNT(*)::int AS total_usuarios,
           SUM(CASE WHEN estado THEN 1 ELSE 0 END)::int AS usuarios_activos
    FROM sst.usuarios
  `)

  const { rows: capStats } = await pool.query(`
    SELECT COUNT(*)::int AS total_capacitaciones,
           SUM(CASE WHEN estado THEN 1 ELSE 0 END)::int AS capacitaciones_activas
    FROM sst.capacitaciones
  `)

  const { rows: certStats } = await pool.query(`
    SELECT COUNT(*)::int AS total_certificados,
           SUM(CASE WHEN c.fecha_vigencia IS NULL OR c.fecha_vigencia >= CURRENT_DATE THEN 1 ELSE 0 END)::int AS vigentes
    FROM sst.certificados cert
    JOIN sst.capacitaciones c ON c.id = cert.capacitacion_id
  `)

  const { rows: evalStats } = await pool.query(`
    SELECT COUNT(*)::int AS total_intentos,
           SUM(CASE WHEN aprobado THEN 1 ELSE 0 END)::int AS aprobados
    FROM sst.intentos_evaluacion
  `)

  const { rows: porCategoria } = await pool.query(`
    SELECT cat.nombre, COUNT(cert.id)::int AS certificados
    FROM sst.categorias cat
    LEFT JOIN sst.capacitaciones c ON c.categoria_id = cat.id
    LEFT JOIN sst.certificados cert ON cert.capacitacion_id = c.id
    GROUP BY cat.nombre
    ORDER BY certificados DESC
  `)

  const { rows: actividadReciente } = await pool.query(`
    (SELECT 'certificado' AS tipo,
            u.nombre || ' ' || u.apellido AS usuario,
            cap.titulo AS detalle,
            cert.fecha_emision AS fecha
     FROM sst.certificados cert
     JOIN sst.usuarios u ON u.id = cert.usuario_id
     JOIN sst.capacitaciones cap ON cap.id = cert.capacitacion_id
     ORDER BY cert.fecha_emision DESC LIMIT 5)
    UNION ALL
    (SELECT 'login' AS tipo,
            u.nombre || ' ' || u.apellido AS usuario,
            'Inicio de sesión' AS detalle,
            u.ultimo_login AS fecha
     FROM sst.usuarios u
     WHERE u.ultimo_login IS NOT NULL
     ORDER BY u.ultimo_login DESC LIMIT 5)
    ORDER BY fecha DESC NULLS LAST LIMIT 10
  `)

  const u = usuariosStats[0]
  const c = capStats[0]
  const cert = certStats[0]
  const ev = evalStats[0]

  const tasaAprobacion = ev.total_intentos > 0
    ? Math.round((ev.aprobados / ev.total_intentos) * 100)
    : 0

  return {
    usuarios: { total: u.total_usuarios, activos: u.usuarios_activos },
    capacitaciones: { total: c.total_capacitaciones, activas: c.capacitaciones_activas },
    certificados: { total: cert.total_certificados, vigentes: cert.vigentes },
    evaluaciones: { total: ev.total_intentos, aprobados: ev.aprobados, tasa_aprobacion: tasaAprobacion },
    por_categoria: porCategoria,
    actividad_reciente: actividadReciente,
  }
}
