import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import { list } from './notificaciones.controller.js'

const router = Router()

router.use(auth)
router.get('/', list)

export default router
