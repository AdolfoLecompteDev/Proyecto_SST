import { ok, created, fail } from '../../utils/response.js'
import * as svc from './capacitaciones.service.js'

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

export const create = async (req, res, next) => {
  try {
    const { titulo, descripcion, categoria_id, fecha_vigencia } = req.body
    if (!titulo) return fail(res, 'El título es requerido')
    const data = await svc.create({ titulo, descripcion, categoria_id, creado_por: req.user.id, fecha_vigencia })
    created(res, data, 'Capacitación creada')
  } catch (e) { next(e) }
}

export const update = async (req, res, next) => {
  try {
    const data = await svc.update(Number(req.params.id), req.body)
    ok(res, data, 'Capacitación actualizada')
  } catch (e) { next(e) }
}

export const categorias = async (req, res, next) => {
  try {
    const data = await svc.getCategorias()
    ok(res, data)
  } catch (e) { next(e) }
}
