import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import { stats } from './dashboard.controller.js'

const router = Router()

router.use(auth)
router.get('/', stats)

export default router
