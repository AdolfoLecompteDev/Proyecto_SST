import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import { byCapacitacion, preguntas, submit, misIntentos } from './evaluaciones.controller.js'

const router = Router()

router.use(auth)

router.get('/mis-intentos', misIntentos)
router.get('/capacitacion/:capacitacion_id', byCapacitacion)
router.get('/:id/preguntas', preguntas)
router.post('/:id/submit', submit)

export default router
