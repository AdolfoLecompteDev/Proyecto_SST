import pool from '../../config/db.js'
import { hashPassword } from '../../utils/password.js'

const BASE_SELECT = `
  SELECT u.id, u.nombre, u.apellido, u.email, u.documento,
         u.estado, u.ultimo_login, u.created_at,
         r.nombre AS rol
  FROM sst.usuarios u
  JOIN sst.roles r ON r.id = u.rol_id
`

export const getAll = async ({ search = '', estado = null } = {}) => {
  const conditions = []
  const params = []

  if (search) {
    params.push(`%${search}%`)
    conditions.push(`(u.nombre ILIKE $${params.length} OR u.apellido ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.documento ILIKE $${params.length})`)
  }
  if (estado !== null) {
    params.push(estado)
    conditions.push(`u.estado = $${params.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''
  const { rows } = await pool.query(`${BASE_SELECT} ${where} ORDER BY u.created_at DESC`, params)
  return rows
}

export const getById = async (id) => {
  const { rows } = await pool.query(`${BASE_SELECT} WHERE u.id = $1`, [id])
  if (!rows.length) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })
  return rows[0]
}

export const create = async ({ nombre, apellido, email, password, documento, rol }) => {
  const { rows: rolRows } = await pool.query('SELECT id FROM sst.roles WHERE nombre = $1', [rol])
  if (!rolRows.length) throw Object.assign(new Error('Rol inválido'), { status: 400 })

  const hash = await hashPassword(password)
  const { rows } = await pool.query(
    `INSERT INTO sst.usuarios (nombre, apellido, email, password_hash, documento, rol_id)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING id`,
    [nombre, apellido, email, hash, documento || null, rolRows[0].id],
  )
  return getById(rows[0].id)
}

export const update = async (id, { nombre, apellido, email, documento, rol, estado }) => {
  const sets = []
  const params = []

  const push = (val) => { params.push(val); return `$${params.length}` }

  if (nombre !== undefined) sets.push(`nombre = ${push(nombre)}`)
  if (apellido !== undefined) sets.push(`apellido = ${push(apellido)}`)
  if (email !== undefined) sets.push(`email = ${push(email)}`)
  if (documento !== undefined) sets.push(`documento = ${push(documento)}`)
  if (estado !== undefined) sets.push(`estado = ${push(estado)}`)
  if (rol !== undefined) {
    const { rows: rolRows } = await pool.query('SELECT id FROM sst.roles WHERE nombre = $1', [rol])
    if (!rolRows.length) throw Object.assign(new Error('Rol inválido'), { status: 400 })
    sets.push(`rol_id = ${push(rolRows[0].id)}`)
  }

  if (!sets.length) return getById(id)

  params.push(id)
  await pool.query(`UPDATE sst.usuarios SET ${sets.join(', ')} WHERE id = $${params.length}`, params)
  return getById(id)
}

export const toggleEstado = async (id) => {
  const { rows } = await pool.query(
    'UPDATE sst.usuarios SET estado = NOT estado WHERE id = $1 RETURNING estado',
    [id],
  )
  if (!rows.length) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })
  return rows[0]
}

export const getStats = async () => {
  const { rows } = await pool.query(`
    SELECT r.nombre AS rol, COUNT(u.id)::int AS total, SUM(CASE WHEN u.estado THEN 1 ELSE 0 END)::int AS activos
    FROM sst.roles r
    LEFT JOIN sst.usuarios u ON u.rol_id = r.id
    GROUP BY r.nombre
  `)
  return rows
}
