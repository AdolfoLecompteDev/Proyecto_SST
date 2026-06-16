import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import { list, leerUna, leerTodas } from './notificaciones.controller.js'

const router = Router()

router.use(auth)
router.get('/', list)
router.patch('/:id/leer', leerUna)
router.post('/leer-todas', leerTodas)

export default router
