import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'
import { list, getOne, create, update, categorias } from './capacitaciones.controller.js'

const router = Router()
const adminOnly = role('ADMIN', 'SUPER_USUARIO')

router.use(auth)

router.get('/categorias', categorias)
router.get('/', list)
router.get('/:id', getOne)
router.post('/', adminOnly, create)
router.put('/:id', adminOnly, update)

export default router
