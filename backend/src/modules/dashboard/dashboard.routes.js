import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'
import { stats, sinCertificar } from './dashboard.controller.js'

const router = Router()

router.use(auth)
router.get('/', stats)
router.get('/sin-certificar', role('ADMIN', 'SUPER_USUARIO'), sinCertificar)

export default router
