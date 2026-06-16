import { Router } from 'express'
import { health, ejecutarVerificacion, historial } from './consultas.controller.js'
import auth from '../../middlewares/auth.middleware.js'

const router = Router()

router.get('/health', health)

router.use(auth)
router.post('/verificar', ejecutarVerificacion)
router.get('/historial', historial)

export default router
