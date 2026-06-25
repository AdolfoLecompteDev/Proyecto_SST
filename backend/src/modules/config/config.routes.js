import { Router } from 'express'
import { getUserConfig, updateUserConfig } from './config.controller.js'
import auth from '../../middlewares/auth.middleware.js'

const router = Router()

router.use(auth)
router.get('/', getUserConfig)
router.put('/', updateUserConfig)

export default router
