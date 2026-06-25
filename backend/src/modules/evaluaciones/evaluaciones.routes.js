import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'
import {
  byCapacitacion, preguntas, submit, misIntentos,
  createEval, getEvalAdmin, addPreguntaHandler, deletePreguntaHandler, deleteEvalHandler,
} from './evaluaciones.controller.js'

const router = Router()
const adminOnly = role('ADMIN', 'SUPER_USUARIO')

router.use(auth)

// Rutas de usuario/funcionario
router.get('/mis-intentos', misIntentos)
router.get('/capacitacion/:capacitacion_id', byCapacitacion)
router.get('/:id/preguntas', preguntas)
router.post('/:id/submit', submit)

// Rutas admin — gestión de quiz
router.post('/capacitacion/:capacitacion_id', adminOnly, createEval)
router.get('/:id/admin', adminOnly, getEvalAdmin)
router.post('/:id/preguntas/nueva', adminOnly, addPreguntaHandler)
router.delete('/preguntas/:pid', adminOnly, deletePreguntaHandler)
router.delete('/:id', adminOnly, deleteEvalHandler)

export default router
