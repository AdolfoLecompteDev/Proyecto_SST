import pool from '../../config/db.js'
import { comparePassword, hashPassword } from '../../utils/password.js'
import { signToken } from '../../utils/jwt.js'

export const loginUser = async (email, password) => {
  const { rows } = await pool.query(
    `SELECT u.id, u.nombre, u.apellido, u.email, u.password_hash, u.estado, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.email = $1`,
    [email],
  )

  if (!rows.length) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 })

  const user = rows[0]

  if (!user.estado) throw Object.assign(new Error('Cuenta inactiva'), { status: 403 })

  const valid = await comparePassword(password, user.password_hash)
  if (!valid) throw Object.assign(new Error('Credenciales inválidas'), { status: 401 })

  await pool.query('UPDATE usuarios SET ultimo_login = NOW() WHERE id = $1', [user.id])

  const payload = { id: user.id, email: user.email, rol: user.rol }
  const token = signToken(payload)

  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      email: user.email,
      rol: user.rol,
    },
  }
}

export const cambiarPassword = async (usuario_id, actual, nueva) => {
  const { rows } = await pool.query(
    'SELECT password_hash FROM usuarios WHERE id = $1',
    [usuario_id],
  )
  if (!rows.length) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })

  const valid = await comparePassword(actual, rows[0].password_hash)
  if (!valid) throw Object.assign(new Error('Contraseña actual incorrecta'), { status: 400 })

  const hash = await hashPassword(nueva)
  await pool.query('UPDATE usuarios SET password_hash = $1 WHERE id = $2', [hash, usuario_id])
}

export const actualizarPerfil = async (usuario_id, { nombre, apellido, email, documento }) => {
  const { rows } = await pool.query(
    `UPDATE usuarios
     SET nombre = $1, apellido = $2, email = $3, documento = $4
     WHERE id = $5
     RETURNING id, nombre, apellido, email, documento`,
    [nombre, apellido, email, documento, usuario_id],
  )
  if (!rows.length) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })
  return rows[0]
}

export const getPerfilStats = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT
       u.ultimo_login,
       (SELECT COUNT(*) FROM sst.certificados WHERE usuario_id = u.id) AS certificados_total,
       (SELECT COUNT(*) FROM sst.intentos_evaluacion WHERE usuario_id = u.id AND aprobado = true) AS evaluaciones_aprobadas
     FROM usuarios u
     WHERE u.id = $1`,
    [usuario_id],
  )
  if (!rows.length) throw Object.assign(new Error('Usuario no encontrado'), { status: 404 })
  return rows[0]
}
