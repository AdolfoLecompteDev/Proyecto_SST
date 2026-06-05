import { ok, created, fail } from '../../utils/response.js'
import * as svc from './usuarios.service.js'

export const list = async (req, res, next) => {
  try {
    const data = await svc.getAll({ search: req.query.search, estado: req.query.estado !== undefined ? req.query.estado === 'true' : null })
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
    const { nombre, apellido, email, password, documento, rol } = req.body
    if (!nombre || !apellido || !email || !password || !rol)
      return fail(res, 'Campos requeridos: nombre, apellido, email, password, rol')
    const data = await svc.create({ nombre, apellido, email, password, documento, rol })
    created(res, data, 'Usuario creado exitosamente')
  } catch (e) {
    if (e.code === '23505') return fail(res, 'El email o documento ya está registrado')
    next(e)
  }
}

export const update = async (req, res, next) => {
  try {
    const data = await svc.update(Number(req.params.id), req.body)
    ok(res, data, 'Usuario actualizado')
  } catch (e) {
    if (e.code === '23505') return fail(res, 'El email o documento ya está registrado')
    next(e)
  }
}

export const toggleEstado = async (req, res, next) => {
  try {
    const data = await svc.toggleEstado(Number(req.params.id))
    ok(res, data, data.estado ? 'Usuario activado' : 'Usuario desactivado')
  } catch (e) { next(e) }
}

export const stats = async (req, res, next) => {
  try {
    const data = await svc.getStats()
    ok(res, data)
  } catch (e) { next(e) }
}
