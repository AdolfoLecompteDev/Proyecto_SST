import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import { misCertificados, list, getOne, verificar } from './certificados.controller.js'

const router = Router()

router.get('/verificar/:codigo', verificar)

router.use(auth)

router.get('/mis', misCertificados)
router.get('/', list)
router.get('/:id', getOne)

export default router
