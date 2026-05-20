import { Router } from 'express'
import { health } from './usuarios.controller.js'

const router = Router()

router.get('/health', health)

export default router
