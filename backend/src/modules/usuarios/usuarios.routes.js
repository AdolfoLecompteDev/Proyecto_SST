import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'
import { list, getOne, create, update, toggleEstado, stats } from './usuarios.controller.js'

const router = Router()
const adminOnly = role('ADMIN', 'SUPER_USUARIO')

router.use(auth)

router.get('/', list)
router.get('/stats', stats)
router.get('/:id', getOne)
router.post('/', adminOnly, create)
router.put('/:id', adminOnly, update)
router.patch('/:id/estado', adminOnly, toggleEstado)

export default router
