import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import { list, getOne, create, update, categorias } from './capacitaciones.controller.js'

const router = Router()

router.use(auth)

router.get('/categorias', categorias)
router.get('/', list)
router.get('/:id', getOne)
router.post('/', create)
router.put('/:id', update)

export default router
