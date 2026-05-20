import { Router } from 'express'
import { health } from './evaluaciones.controller.js'

const router = Router()

router.get('/health', health)

export default router
