import { Router } from 'express'
import { health } from './dashboard.controller.js'

const router = Router()

router.get('/health', health)

export default router
