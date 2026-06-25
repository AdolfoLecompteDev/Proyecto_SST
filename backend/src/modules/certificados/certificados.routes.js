import { Router } from 'express'
import auth from '../../middlewares/auth.middleware.js'
import role from '../../middlewares/role.middleware.js'
import { misCertificados, list, getOne, verificar, descargarPDF } from './certificados.controller.js'

const router = Router()
const adminOnly = role('ADMIN', 'SUPER_USUARIO')

// Público — verificar por código
router.get('/verificar/:codigo', verificar)

router.use(auth)

router.get('/mis', misCertificados)
router.get('/', adminOnly, list)
router.get('/:id', getOne)
router.get('/:id/pdf', descargarPDF)

export default router
