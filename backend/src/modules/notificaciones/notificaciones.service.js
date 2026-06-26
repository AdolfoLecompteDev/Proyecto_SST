import pool from '../../config/db.js'

// Create read-state table on first load
pool.query(`
  CREATE TABLE IF NOT EXISTS sst.notificaciones_leidas (
    usuario_id INT REFERENCES sst.usuarios(id) ON DELETE CASCADE,
    notif_id   TEXT,
    leida_at   TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (usuario_id, notif_id)
  )
`).catch(() => {})

export const getNotificaciones = async (usuario_id) => {
  const notifs = []

  // Certificados próximos a vencer (< 30 días)
  const { rows: porVencer } = await pool.query(
    `SELECT cert.id, c.titulo, c.fecha_vigencia,
            (c.fecha_vigencia - CURRENT_DATE)::int AS dias_restantes
     FROM sst.certificados cert
     JOIN sst.capacitaciones c ON c.id = cert.capacitacion_id
     WHERE cert.usuario_id = $1
       AND c.fecha_vigencia IS NOT NULL
       AND c.fecha_vigencia >= CURRENT_DATE
       AND (c.fecha_vigencia - CURRENT_DATE) <= 30
     ORDER BY c.fecha_vigencia`,
    [usuario_id],
  )
  for (const r of porVencer) {
    notifs.push({
      id: `venc-${r.id}`,
      tipo: 'warning',
      titulo: 'Certificado próximo a vencer',
      desc: `Tu certificado de "${r.titulo}" vence en ${r.dias_restantes} días. Programa tu renovación.`,
      fecha: new Date().toISOString(),
      leida: false,
    })
  }

  // Evaluaciones aprobadas recientes (últimos 7 días)
  const { rows: aprobadas } = await pool.query(
    `SELECT i.id, i.puntaje, i.fecha_fin, e.titulo AS evaluacion, c.titulo AS capacitacion
     FROM sst.intentos_evaluacion i
     JOIN sst.evaluaciones e ON e.id = i.evaluacion_id
     JOIN sst.capacitaciones c ON c.id = e.capacitacion_id
     WHERE i.usuario_id = $1 AND i.aprobado = true
       AND i.fecha_fin >= NOW() - INTERVAL '7 days'
     ORDER BY i.fecha_fin DESC`,
    [usuario_id],
  )
  for (const r of aprobadas) {
    notifs.push({
      id: `eval-${r.id}`,
      tipo: 'success',
      titulo: 'Evaluación aprobada',
      desc: `Aprobaste "${r.evaluacion}" con ${Math.round(r.puntaje)}%. Tu certificado está disponible.`,
      fecha: r.fecha_fin,
      leida: false,
    })
  }

  // Nuevas capacitaciones publicadas (últimos 14 días) que el usuario no ha completado
  const { rows: nuevas } = await pool.query(
    `SELECT c.id, c.titulo, c.created_at
     FROM sst.capacitaciones c
     WHERE c.estado = true AND c.created_at >= NOW() - INTERVAL '14 days'
       AND NOT EXISTS (
         SELECT 1 FROM sst.certificados cert
         WHERE cert.capacitacion_id = c.id AND cert.usuario_id = $1
       )
     ORDER BY c.created_at DESC LIMIT 3`,
    [usuario_id],
  )
  for (const r of nuevas) {
    notifs.push({
      id: `cap-${r.id}`,
      tipo: 'info',
      titulo: 'Nueva capacitación disponible',
      desc: `Se publicó el módulo "${r.titulo}". Ya está disponible en tu lista de capacitaciones.`,
      fecha: r.created_at,
      leida: false,
    })
  }

  // Marcar las que el usuario ya leyó
  if (notifs.length > 0) {
    const { rows: leidas } = await pool.query(
      `SELECT notif_id FROM sst.notificaciones_leidas WHERE usuario_id = $1`,
      [usuario_id],
    )
    const leidasSet = new Set(leidas.map((r) => r.notif_id))
    for (const n of notifs) {
      if (leidasSet.has(n.id)) n.leida = true
    }
  }

  notifs.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
  return notifs
}

export const marcarLeida = async (usuario_id, notif_id) => {
  await pool.query(
    `INSERT INTO sst.notificaciones_leidas (usuario_id, notif_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [usuario_id, notif_id],
  )
}

export const marcarTodas = async (usuario_id, ids) => {
  if (!ids?.length) return
  // Build multi-row insert
  const values = ids.map((_, i) => `($1, $${i + 2})`).join(', ')
  await pool.query(
    `INSERT INTO sst.notificaciones_leidas (usuario_id, notif_id)
     VALUES ${values} ON CONFLICT DO NOTHING`,
    [usuario_id, ...ids],
  )
}
