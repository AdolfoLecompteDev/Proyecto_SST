import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'
import { list, getOne, create, update, categorias, addRecurso, editRecurso, removeRecurso } from './capacitaciones.controller.js'

const router = Router()
const adminOnly = role('ADMIN', 'SUPER_USUARIO')

router.use(auth)

router.get('/categorias', categorias)
router.get('/', list)
router.get('/:id', getOne)
router.post('/', adminOnly, create)
router.put('/:id', adminOnly, update)

// Gestión de recursos (ruta de estudio)
router.post('/:id/recursos', adminOnly, addRecurso)
router.put('/:id/recursos/:rid', adminOnly, editRecurso)
router.delete('/:id/recursos/:rid', adminOnly, removeRecurso)

export default router
