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
           (SELECT COUNT(*) FROM sst.evaluaciones e WHERE e.capacitacion_id = c.id)::int AS num_evaluaciones
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
    'SELECT id, tipo, nombre_original, url FROM sst.archivos_capacitacion WHERE capacitacion_id = $1',
    [id],
  )
  const { rows: evals } = await pool.query(
    'SELECT id, titulo, puntaje_minimo, max_intentos FROM sst.evaluaciones WHERE capacitacion_id = $1 AND estado = true',
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
