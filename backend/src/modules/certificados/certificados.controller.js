import { ok } from '../../utils/response.js'
import * as svc from './certificados.service.js'

export const misCertificados = async (req, res, next) => {
  try {
    const data = await svc.getMisCertificados(req.user.id)
    ok(res, data)
  } catch (e) { next(e) }
}

export const list = async (req, res, next) => {
  try {
    const data = await svc.getAll(req.query)
    ok(res, data)
  } catch (e) { next(e) }
}

export const getOne = async (req, res, next) => {
  try {
    const data = await svc.getById(Number(req.params.id))
    ok(res, data)
  } catch (e) { next(e) }
}

export const verificar = async (req, res, next) => {
  try {
    const data = await svc.verificar(req.params.codigo)
    ok(res, data)
  } catch (e) { next(e) }
}
