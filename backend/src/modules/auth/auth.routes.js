import { Router } from 'express'
import { health, login } from './auth.controller.js'

const router = Router()

router.get('/health', health)
router.post('/login', login)

export default router
