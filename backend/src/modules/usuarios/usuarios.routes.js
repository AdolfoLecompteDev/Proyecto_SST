import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import { list, getOne, create, update, toggleEstado, stats } from './usuarios.controller.js'

const router = Router()

router.use(auth)

router.get('/', list)
router.get('/stats', stats)
router.get('/:id', getOne)
router.post('/', create)
router.put('/:id', update)
router.patch('/:id/estado', toggleEstado)

export default router
