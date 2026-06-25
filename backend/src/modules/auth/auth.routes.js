import { Router } from 'express'
import { health, login, cambiarPass, updatePerfil, perfilStats, solicitarRecuperacion, restablecerPassword } from './auth.controller.js'
import auth from '../../middlewares/auth.middleware.js'

const router = Router()

router.get('/health', health)
router.post('/login', login)
router.post('/forgot-password', solicitarRecuperacion)
router.post('/reset-password/:token', restablecerPassword)

router.use(auth)
router.post('/cambiar-password', cambiarPass)
router.put('/perfil', updatePerfil)
router.get('/perfil/stats', perfilStats)

export default router
