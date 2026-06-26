import pool from '../../config/db.js'

export const getAll = async ({ search = '', categoria_id = null, estado = null } = {}) => {
  const conditions = []
  const params = []
  const push = (v) => { params.push(v); return `$${params.length}` }

  if (search) { const p = push('%' + search + '%'); conditions.push(`(c.titulo ILIKE ${p} OR c.descripcion ILIKE ${p})`) }
  if (categoria_id) conditions.push(`c.categoria_id = ${push(Number(categoria_id))}`)
  if (estado !== null) conditions.push(`c.estado = ${push(estado)}`)

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  const { rows } = await pool.query(`
    SELECT c.id, c.titulo, c.descripcion, c.fecha_inicio, c.fecha_vigencia, c.estado,
           cat.nombre AS categoria,
           u.nombre || ' ' || u.apellido AS creado_por,
           (SELECT COUNT(*) FROM sst.evaluaciones e WHERE e.capacitacion_id = c.id)::int AS num_evaluaciones,
           (SELECT COUNT(*) FROM sst.archivos_capacitacion a WHERE a.capacitacion_id = c.id)::int AS num_recursos,
           (SELECT COUNT(*) FROM sst.certificados cert WHERE cert.capacitacion_id = c.id)::int AS num_certificados
    FROM sst.capacitaciones c
    LEFT JOIN sst.categorias cat ON cat.id = c.categoria_id
    LEFT JOIN sst.usuarios u ON u.id = c.creado_por
    ${where}
    ORDER BY c.created_at DESC
  `, params)
  return rows
}

export const getById = async (id) => {
  const { rows } = await pool.query(`
    SELECT c.id, c.titulo, c.descripcion, c.fecha_inicio, c.fecha_vigencia, c.estado,
           c.categoria_id,
           cat.nombre AS categoria,
           u.nombre || ' ' || u.apellido AS creado_por
    FROM sst.capacitaciones c
    LEFT JOIN sst.categorias cat ON cat.id = c.categoria_id
    LEFT JOIN sst.usuarios u ON u.id = c.creado_por
    WHERE c.id = $1
  `, [id])
  if (!rows.length) throw Object.assign(new Error('Capacitación no encontrada'), { status: 404 })

  const cap = rows[0]

  const { rows: archivos } = await pool.query(
    `SELECT id, tipo, nombre_original, url, orden, descripcion
     FROM sst.archivos_capacitacion WHERE capacitacion_id = $1
     ORDER BY orden ASC, id ASC`,
    [id],
  )
  const { rows: evals } = await pool.query(
    'SELECT id, titulo, puntaje_minimo, max_intentos, tipo FROM sst.evaluaciones WHERE capacitacion_id = $1 AND estado = true ORDER BY CASE tipo WHEN \'normal\' THEN 0 ELSE 1 END, id ASC',
    [id],
  )

  return { ...cap, archivos, evaluaciones: evals }
}

export const create = async ({ titulo, descripcion, categoria_id, creado_por, fecha_vigencia }) => {
  const { rows } = await pool.query(
    `INSERT INTO sst.capacitaciones (titulo, descripcion, categoria_id, creado_por, fecha_vigencia)
     VALUES ($1,$2,$3,$4,$5) RETURNING id`,
    [titulo, descripcion || null, categoria_id || null, creado_por, fecha_vigencia || null],
  )
  return getById(rows[0].id)
}

export const update = async (id, fields) => {
  const allowed = ['titulo', 'descripcion', 'categoria_id', 'fecha_vigencia', 'estado']
  const sets = []
  const params = []
  for (const k of allowed) {
    if (fields[k] !== undefined) {
      params.push(fields[k])
      sets.push(`${k} = $${params.length}`)
    }
  }
  if (!sets.length) return getById(id)
  params.push(id)
  await pool.query(`UPDATE sst.capacitaciones SET ${sets.join(', ')} WHERE id = $${params.length}`, params)
  return getById(id)
}

export const getCategorias = async () => {
  const { rows } = await pool.query('SELECT id, nombre FROM sst.categorias ORDER BY nombre')
  return rows
}

export const addRecurso = async (capacitacion_id, { tipo, nombre_original, url, descripcion, orden }) => {
  const TIPOS = ['video', 'pdf', 'video_url', 'docx', 'enlace']
  if (!TIPOS.includes(tipo)) throw Object.assign(new Error('Tipo de recurso inválido'), { status: 400 })
  if (!url) throw Object.assign(new Error('La URL o enlace es requerido'), { status: 400 })
  if (!nombre_original) throw Object.assign(new Error('El nombre es requerido'), { status: 400 })

  // Calcular orden automático si no se provee
  let ordenFinal = orden
  if (!ordenFinal) {
    const { rows } = await pool.query(
      'SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM sst.archivos_capacitacion WHERE capacitacion_id = $1',
      [capacitacion_id],
    )
    ordenFinal = rows[0].siguiente
  }

  const { rows } = await pool.query(
    `INSERT INTO sst.archivos_capacitacion
       (capacitacion_id, tipo, nombre_original, nombre_almacenado, url, orden, descripcion)
     VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id, tipo, nombre_original, url, orden, descripcion`,
    [capacitacion_id, tipo, nombre_original, null, url, ordenFinal, descripcion || null],
  )
  return rows[0]
}

export const updateRecurso = async (capacitacion_id, recurso_id, fields) => {
  const allowed = ['nombre_original', 'descripcion', 'orden', 'url']
  const sets = []
  const params = []
  for (const k of allowed) {
    if (fields[k] !== undefined) {
      params.push(fields[k])
      sets.push(`${k} = $${params.length}`)
    }
  }
  if (!sets.length) return
  params.push(recurso_id, capacitacion_id)
  const { rows } = await pool.query(
    `UPDATE sst.archivos_capacitacion SET ${sets.join(', ')}
     WHERE id = $${params.length - 1} AND capacitacion_id = $${params.length}
     RETURNING id, tipo, nombre_original, url, orden, descripcion`,
    params,
  )
  if (!rows.length) throw Object.assign(new Error('Recurso no encontrado'), { status: 404 })
  return rows[0]
}

export const deleteCapacitacion = async (id) => {
  const { rowCount } = await pool.query('DELETE FROM sst.capacitaciones WHERE id = $1', [id])
  if (!rowCount) throw Object.assign(new Error('Capacitación no encontrada'), { status: 404 })
}

export const deleteRecurso = async (capacitacion_id, recurso_id) => {
  const { rowCount } = await pool.query(
    'DELETE FROM sst.archivos_capacitacion WHERE id = $1 AND capacitacion_id = $2',
    [recurso_id, capacitacion_id],
  )
  if (!rowCount) throw Object.assign(new Error('Recurso no encontrado'), { status: 404 })
}

export const marcarVisto = async (usuario_id, recurso_id) => {
  await pool.query(
    `INSERT INTO sst.progreso_recursos (usuario_id, recurso_id)
     VALUES ($1, $2) ON CONFLICT DO NOTHING`,
    [usuario_id, recurso_id],
  )
}

export const getMiProgreso = async (capacitacion_id, usuario_id) => {
  const { rows } = await pool.query(
    `SELECT pr.recurso_id
     FROM sst.progreso_recursos pr
     JOIN sst.archivos_capacitacion ac ON ac.id = pr.recurso_id
     WHERE ac.capacitacion_id = $1 AND pr.usuario_id = $2`,
    [capacitacion_id, usuario_id],
  )
  return rows.map(r => r.recurso_id)
}
