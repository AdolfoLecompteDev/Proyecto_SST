import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import authRoutes from './modules/auth/auth.routes.js'
import usuariosRoutes from './modules/usuarios/usuarios.routes.js'
import capacitacionesRoutes from './modules/capacitaciones/capacitaciones.routes.js'
import evaluacionesRoutes from './modules/evaluaciones/evaluaciones.routes.js'
import certificadosRoutes from './modules/certificados/certificados.routes.js'
import seguimientoRoutes from './modules/seguimiento/seguimiento.routes.js'
import consultasRoutes from './modules/consultas/consultas.routes.js'
import dashboardRoutes from './modules/dashboard/dashboard.routes.js'
import auditoriaRoutes from './modules/auditoria/auditoria.routes.js'
import notificacionesRoutes from './modules/notificaciones/notificaciones.routes.js'
import errorHandler from './middlewares/error.middleware.js'

dotenv.config()

const app = express()
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors({
    origin: (origin, cb) => {
      // allow requests with no origin (mobile apps, curl)
      if (!origin) return cb(null, true)
      // allow any localhost port in dev
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return cb(null, true)
      }
      if (allowedOrigins.includes(origin)) return cb(null, true)
      cb(new Error(`CORS blocked: ${origin}`))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    data: { status: 'ok' },
    message: 'Servicio activo',
  })
})

app.use('/api/auth', authRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/capacitaciones', capacitacionesRoutes)
app.use('/api/evaluaciones', evaluacionesRoutes)
app.use('/api/certificados', certificadosRoutes)
app.use('/api/seguimiento', seguimientoRoutes)
app.use('/api/consultas', consultasRoutes)
app.use('/api/dashboard', dashboardRoutes)
app.use('/api/auditoria', auditoriaRoutes)
app.use('/api/notificaciones', notificacionesRoutes)

app.use(errorHandler)

export default app
