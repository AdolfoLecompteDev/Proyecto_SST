import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'
import { reporte, refresh } from './seguimiento.controller.js'

const router = Router()
const adminOnly = role('ADMIN', 'SUPER_USUARIO')

router.use(auth)
router.get('/', adminOnly, reporte)
router.post('/refresh', adminOnly, refresh)

export default router
