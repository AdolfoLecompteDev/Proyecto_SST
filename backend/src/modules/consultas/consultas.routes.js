import { Router } from 'express'
import { health } from './consultas.controller.js'

const router = Router()

router.get('/health', health)

export default router
