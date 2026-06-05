import pool from '../../config/db.js'
import { comparePassword } from '../../utils/password.js'
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
