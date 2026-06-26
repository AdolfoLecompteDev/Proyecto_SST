import { Router } from 'express'
import { getUserConfig, updateUserConfig, getPublicConfig, updateSistema } from './config.controller.js'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'

const router = Router()

// Public — no auth required
router.get('/public', getPublicConfig)

router.use(auth)
router.get('/', getUserConfig)
router.put('/', updateUserConfig)
router.put('/sistema', role('ADMIN', 'SUPER_USUARIO'), updateSistema)

export default router
