export const sendResponse = (res, { success, data = null, message = '' }, status) =>
  res.status(status).json({ success, data, message })

export const ok = (res, data = null, message = 'Operacion exitosa') =>
  sendResponse(res, { success: true, data, message }, 200)

export const created = (res, data = null, message = 'Recurso creado') =>
  sendResponse(res, { success: true, data, message }, 201)

export const fail = (res, message = 'Error en la solicitud', status = 400, data = null) =>
  sendResponse(res, { success: false, data, message }, status)
