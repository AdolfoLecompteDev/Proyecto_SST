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

export const forgotPassword = async (email) => {
  const { rows } = await pool.query('SELECT id, nombre FROM usuarios WHERE email = $1', [email])
  if (!rows.length) return // Don't leak if email exists

  const user = rows[0]
  const crypto = await import('crypto')
  const token = crypto.randomUUID()
  
  // Expiración 30 min
  const expiraEn = new Date()
  expiraEn.setMinutes(expiraEn.getMinutes() + 30)

  await pool.query(
    `INSERT INTO sst.tokens_recuperacion (usuario_id, token, expira_en) VALUES ($1, $2, $3)`,
    [user.id, token, expiraEn]
  )

  const resetUrl = `http://localhost:5173/reset-password/${token}`

  try {
    const { default: transporter } = await import('../../config/mailer.js')
    await transporter.sendMail({
      from: process.env.MAIL_USER || '"SST Support" <no-reply@sst.local>',
      to: email,
      subject: 'Recuperación de Contraseña - SST',
      html: `
        <h2>Hola ${user.nombre},</h2>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>El enlace expirará en 30 minutos.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
      `
    })
    console.log('Correo de recuperación enviado a:', email)
  } catch (error) {
    console.error('Error enviando correo, el token generado es:', token, error.message)
    // In dev, we just log the token so we can test it without mailer
  }
}

export const resetPassword = async (token, newPassword) => {
  const { rows } = await pool.query(
    `SELECT id, usuario_id, expira_en, usado 
     FROM sst.tokens_recuperacion 
     WHERE token = $1`,
    [token]
  )

  if (!rows.length) throw Object.assign(new Error('Token inválido'), { status: 400 })
  const record = rows[0]

  if (record.usado) throw Object.assign(new Error('El token ya fue utilizado'), { status: 400 })
  if (new Date() > new Date(record.expira_en)) throw Object.assign(new Error('El token ha expirado'), { status: 400 })

  const hash = await hashPassword(newPassword)

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query('UPDATE sst.usuarios SET password_hash = $1 WHERE id = $2', [hash, record.usuario_id])
    await client.query('UPDATE sst.tokens_recuperacion SET usado = TRUE WHERE id = $1', [record.id])
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

