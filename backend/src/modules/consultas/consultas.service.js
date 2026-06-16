import pool from '../../config/db.js'

function simularRespuesta(numero_doc) {
  const hash = numero_doc.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  const alertaDisciplinario = hash % 7 === 0
  return {
    registraduria: { coincidencia: true, descripcion: 'Nombre e ID verificados como activos.' },
    procuraduria: alertaDisciplinario
      ? { alerta: true, descripcion: 'Investigación activa registrada. Requiere revisión manual.' }
      : { alerta: false, descripcion: 'Sin sanciones disciplinarias registradas.' },
    contraloria: { alerta: false, descripcion: 'Sin responsabilidades fiscales.' },
    ponal: { pendiente: true, descripcion: 'Consulta en proceso con servidor externo.' },
  }
}

export const verificar = async (usuario_id, tipo_doc, numero_doc) => {
  const resultado = simularRespuesta(numero_doc)
  const entidades = [
    { entidad: 'Registraduría', exitosa: true, respuesta: resultado.registraduria },
    { entidad: 'Procuraduría', exitosa: !resultado.procuraduria.alerta, respuesta: resultado.procuraduria },
    { entidad: 'Contraloría', exitosa: true, respuesta: resultado.contraloria },
    { entidad: 'PONAL', exitosa: false, respuesta: resultado.ponal },
  ]

  for (const e of entidades) {
    await pool.query(
      `INSERT INTO sst.consultas_api (usuario_id, documento_consultado, entidad, respuesta, estado_http, exitosa)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [usuario_id, numero_doc, e.entidad, JSON.stringify(e.respuesta), e.exitosa ? 200 : 503, e.exitosa],
    )
  }

  const tieneAlerta = resultado.procuraduria.alerta
  return {
    documento: numero_doc,
    tipo_doc,
    estado_general: tieneAlerta ? 'Requiere Revisión' : 'Validado',
    fuentes: [
      { titulo: 'Identidad (Registraduría)', resultado: '100% Coincidencia', ok: true, detalle: resultado.registraduria.descripcion },
      { titulo: 'Disciplinario (Procuraduría)', resultado: tieneAlerta ? 'Alerta Encontrada' : 'Sin hallazgos', ok: !tieneAlerta, detalle: resultado.procuraduria.descripcion },
      { titulo: 'Fiscal (Contraloría)', resultado: 'Sin hallazgos', ok: true, detalle: resultado.contraloria.descripcion },
      { titulo: 'Antecedentes Policiales (PONAL)', resultado: 'API Pendiente', ok: null, detalle: resultado.ponal.descripcion },
    ],
  }
}

export const getHistorial = async (limit = 50) => {
  const { rows } = await pool.query(
    `SELECT DISTINCT ON (c.documento_consultado, date_trunc('minute', c.fecha))
            c.id, c.documento_consultado, c.entidad, c.exitosa, c.fecha,
            u.nombre || ' ' || u.apellido AS consultado_por
     FROM sst.consultas_api c
     LEFT JOIN sst.usuarios u ON u.id = c.usuario_id
     ORDER BY c.documento_consultado, date_trunc('minute', c.fecha) DESC, c.fecha DESC
     LIMIT $1`,
    [limit],
  )
  return rows
}
