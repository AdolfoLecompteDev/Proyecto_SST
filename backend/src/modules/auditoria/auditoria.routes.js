import { Router } from 'express'
import { health } from './auditoria.controller.js'

const router = Router()

router.get('/health', health)

export default router
