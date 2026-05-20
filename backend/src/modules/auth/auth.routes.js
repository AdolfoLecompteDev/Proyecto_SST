import { Router } from 'express'
import { health } from './auth.controller.js'

const router = Router()

router.get('/health', health)

export default router
