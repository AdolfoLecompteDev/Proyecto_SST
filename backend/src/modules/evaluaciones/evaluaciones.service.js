import pool from '../../config/db.js'

export const getByCapacitacion = async (capacitacion_id, usuario_id) => {
  // Obtener todas las evaluaciones con progreso del usuario
  const { rows } = await pool.query(
    `SELECT e.id, e.titulo, e.puntaje_minimo, e.max_intentos, e.tipo,
            COUNT(DISTINCT i.id)::int AS intentos_realizados,
            BOOL_OR(i.aprobado) AS aprobado
     FROM sst.evaluaciones e
     LEFT JOIN sst.intentos_evaluacion i ON i.evaluacion_id = e.id AND i.usuario_id = $2
     WHERE e.capacitacion_id = $1 AND e.estado = true
     GROUP BY e.id
     ORDER BY CASE e.tipo WHEN 'normal' THEN 0 ELSE 1 END, e.id`,
    [capacitacion_id, usuario_id],
  )

  // Calcular si el quiz final está desbloqueado
  const normales = rows.filter(e => e.tipo === 'normal')
  const todosNormalesAprobados = normales.length === 0 || normales.every(e => e.aprobado === true)

  return rows.map(e => ({
    ...e,
    bloqueado: e.tipo === 'final' ? !todosNormalesAprobados : false,
  }))
}

export const getPreguntas = async (evaluacion_id, usuario_id) => {
  const { rows: ev } = await pool.query(
    'SELECT id, titulo, puntaje_minimo, max_intentos, capacitacion_id, tipo FROM sst.evaluaciones WHERE id = $1 AND estado = true',
    [evaluacion_id],
  )
  if (!ev.length) throw Object.assign(new Error('Evaluación no encontrada'), { status: 404 })

  // Si es quiz final, verificar que el usuario aprobó todos los normales
  if (ev[0].tipo === 'final') {
    const { rows: normales } = await pool.query(
      `SELECT e.id,
              BOOL_OR(i.aprobado) AS aprobado
       FROM sst.evaluaciones e
       LEFT JOIN sst.intentos_evaluacion i ON i.evaluacion_id = e.id AND i.usuario_id = $2
       WHERE e.capacitacion_id = $1 AND e.tipo = 'normal' AND e.estado = true
       GROUP BY e.id`,
      [ev[0].capacitacion_id, usuario_id],
    )
    const bloqueado = normales.length > 0 && normales.some(n => !n.aprobado)
    if (bloqueado) {
      throw Object.assign(
        new Error('Debes aprobar todos los quizzes de práctica antes de presentar el quiz final'),
        { status: 403 },
      )
    }
  }

  const { rows: intentosRows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM sst.intentos_evaluacion WHERE evaluacion_id = $1 AND usuario_id = $2',
    [evaluacion_id, usuario_id],
  )
  const intentosUsados = intentosRows[0].total
  if (intentosUsados >= ev[0].max_intentos) {
    throw Object.assign(new Error(`Alcanzaste el máximo de ${ev[0].max_intentos} intentos`), { status: 403 })
  }

  const { rows: preguntas } = await pool.query(
    `SELECT p.id, p.enunciado, p.orden,
            json_agg(json_build_object('id', o.id, 'texto', o.texto, 'orden', o.orden) ORDER BY o.orden) AS opciones
     FROM sst.preguntas p
     JOIN sst.opciones_respuesta o ON o.pregunta_id = p.id
     WHERE p.evaluacion_id = $1
     GROUP BY p.id, p.enunciado, p.orden
     ORDER BY p.orden`,
    [evaluacion_id],
  )

  return { evaluacion: ev[0], preguntas, intentos_usados: intentosUsados }
}

export const submitIntento = async (evaluacion_id, usuario_id, respuestas) => {
  const { rows: ev } = await pool.query(
    'SELECT id, puntaje_minimo, max_intentos FROM sst.evaluaciones WHERE id = $1',
    [evaluacion_id],
  )
  if (!ev.length) throw Object.assign(new Error('Evaluación no encontrada'), { status: 404 })

  const { rows: intentosRows } = await pool.query(
    'SELECT COUNT(*)::int AS total FROM sst.intentos_evaluacion WHERE evaluacion_id = $1 AND usuario_id = $2',
    [evaluacion_id, usuario_id],
  )
  const numeroIntento = intentosRows[0].total + 1

  let correctas = 0
  const detalles = []
  for (const r of respuestas) {
    const { rows: opRows } = await pool.query(
      'SELECT es_correcta FROM sst.opciones_respuesta WHERE id = $1 AND pregunta_id = $2',
      [r.opcion_id, r.pregunta_id],
    )
    const esCorrecta = opRows.length > 0 && opRows[0].es_correcta
    if (esCorrecta) correctas++
    detalles.push({ pregunta_id: r.pregunta_id, opcion_id: r.opcion_id, es_correcta: esCorrecta })
  }

  const total = respuestas.length
  const puntaje = total > 0 ? (correctas / total) * 100 : 0
  const aprobado = puntaje >= ev[0].puntaje_minimo

  const { rows: intentoRow } = await pool.query(
    `INSERT INTO sst.intentos_evaluacion (usuario_id, evaluacion_id, puntaje, aprobado, numero_intento, fecha_inicio, fecha_fin)
     VALUES ($1,$2,$3,$4,$5,NOW(),NOW()) RETURNING id`,
    [usuario_id, evaluacion_id, puntaje.toFixed(2), aprobado, numeroIntento],
  )
  const intento_id = intentoRow[0].id

  for (const d of detalles) {
    await pool.query(
      'INSERT INTO sst.detalle_intentos (intento_id, pregunta_id, opcion_id, es_correcta) VALUES ($1,$2,$3,$4)',
      [intento_id, d.pregunta_id, d.opcion_id, d.es_correcta],
    )
  }

  let certificado = null
  if (aprobado) {
    const { rows: capRow } = await pool.query(
      'SELECT capacitacion_id, tipo FROM sst.evaluaciones WHERE id = $1',
      [evaluacion_id],
    )
    if (capRow.length) {
      const { capacitacion_id, tipo } = capRow[0]

      // El certificado se emite al aprobar el quiz final.
      // Si no existe ningún quiz final para esta capacitación, se emite en cualquier aprobación.
      const { rows: hayFinal } = await pool.query(
        `SELECT id FROM sst.evaluaciones WHERE capacitacion_id = $1 AND tipo = 'final' AND estado = true LIMIT 1`,
        [capacitacion_id],
      )
      const debeCertificar = tipo === 'final' || hayFinal.length === 0

      if (debeCertificar) {
        const { rows: certRow } = await pool.query(
          `INSERT INTO sst.certificados (usuario_id, capacitacion_id, intento_id)
           VALUES ($1,$2,$3)
           ON CONFLICT (usuario_id, capacitacion_id) DO UPDATE SET intento_id = EXCLUDED.intento_id, fecha_emision = NOW()
           RETURNING codigo_certificado`,
          [usuario_id, capacitacion_id, intento_id],
        )
        certificado = certRow[0]?.codigo_certificado
      }
    }
  }

  return { puntaje: Number(puntaje.toFixed(2)), aprobado, correctas, total, certificado }
}

export const getMisIntentos = async (usuario_id) => {
  const { rows } = await pool.query(
    `SELECT i.id, i.puntaje, i.aprobado, i.numero_intento, i.fecha_inicio,
            e.titulo AS evaluacion, c.titulo AS capacitacion
     FROM sst.intentos_evaluacion i
     JOIN sst.evaluaciones e ON e.id = i.evaluacion_id
     JOIN sst.capacitaciones c ON c.id = e.capacitacion_id
     WHERE i.usuario_id = $1
     ORDER BY i.fecha_inicio DESC`,
    [usuario_id],
  )
  return rows
}

// ─── Admin: gestión de evaluaciones y preguntas ───────────────────────────────

export const createEvaluacion = async (capacitacion_id, { titulo, puntaje_minimo, max_intentos, tipo = 'normal' }) => {
  if (!titulo) throw Object.assign(new Error('El título es requerido'), { status: 400 })
  if (!['normal', 'final'].includes(tipo)) throw Object.assign(new Error('Tipo de evaluación inválido'), { status: 400 })

  // Si es quiz final, solo puede haber uno por capacitación (garantizado también por índice único en BD)
  if (tipo === 'final') {
    const { rows: existing } = await pool.query(
      `SELECT id FROM sst.evaluaciones WHERE capacitacion_id = $1 AND tipo = 'final' AND estado = true`,
      [capacitacion_id],
    )
    if (existing.length) throw Object.assign(new Error('Ya existe un quiz final para esta capacitación'), { status: 409 })
  }

  const { rows } = await pool.query(
    `INSERT INTO sst.evaluaciones (capacitacion_id, titulo, puntaje_minimo, max_intentos, tipo)
     VALUES ($1,$2,$3,$4,$5) RETURNING id, titulo, puntaje_minimo, max_intentos, tipo`,
    [capacitacion_id, titulo, puntaje_minimo ?? 70, max_intentos ?? 3, tipo],
  )
  return rows[0]
}

export const getEvaluacionAdmin = async (evaluacion_id) => {
  const { rows: ev } = await pool.query(
    'SELECT id, titulo, puntaje_minimo, max_intentos, tipo FROM sst.evaluaciones WHERE id = $1',
    [evaluacion_id],
  )
  if (!ev.length) throw Object.assign(new Error('Evaluación no encontrada'), { status: 404 })

  const { rows: preguntas } = await pool.query(
    `SELECT p.id, p.enunciado, p.orden,
            json_agg(json_build_object('id',o.id,'texto',o.texto,'es_correcta',o.es_correcta,'orden',o.orden) ORDER BY o.orden) AS opciones
     FROM sst.preguntas p
     JOIN sst.opciones_respuesta o ON o.pregunta_id = p.id
     WHERE p.evaluacion_id = $1
     GROUP BY p.id, p.enunciado, p.orden
     ORDER BY p.orden`,
    [evaluacion_id],
  )
  return { ...ev[0], preguntas }
}

export const addPregunta = async (evaluacion_id, { enunciado, opciones }) => {
  if (!enunciado?.trim()) throw Object.assign(new Error('El enunciado es requerido'), { status: 400 })
  if (!Array.isArray(opciones) || opciones.length < 2)
    throw Object.assign(new Error('Se requieren al menos 2 opciones'), { status: 400 })
  const tieneCorrecta = opciones.some((o) => o.es_correcta)
  if (!tieneCorrecta) throw Object.assign(new Error('Debe haber al menos una opción correcta'), { status: 400 })

  // Calcular orden
  const { rows: ord } = await pool.query(
    'SELECT COALESCE(MAX(orden), 0) + 1 AS siguiente FROM sst.preguntas WHERE evaluacion_id = $1',
    [evaluacion_id],
  )
  const orden = ord[0].siguiente

  const { rows: pRows } = await pool.query(
    'INSERT INTO sst.preguntas (evaluacion_id, enunciado, orden) VALUES ($1,$2,$3) RETURNING id',
    [evaluacion_id, enunciado.trim(), orden],
  )
  const pregunta_id = pRows[0].id

  for (let i = 0; i < opciones.length; i++) {
    const op = opciones[i]
    await pool.query(
      'INSERT INTO sst.opciones_respuesta (pregunta_id, texto, es_correcta, orden) VALUES ($1,$2,$3,$4)',
      [pregunta_id, op.texto, op.es_correcta ?? false, i + 1],
    )
  }

  return getEvaluacionAdmin(evaluacion_id)
}

export const deletePregunta = async (pregunta_id) => {
  const { rowCount } = await pool.query('DELETE FROM sst.preguntas WHERE id = $1', [pregunta_id])
  if (!rowCount) throw Object.assign(new Error('Pregunta no encontrada'), { status: 404 })
}

export const deleteEvaluacion = async (evaluacion_id) => {
  const { rowCount } = await pool.query('DELETE FROM sst.evaluaciones WHERE id = $1', [evaluacion_id])
  if (!rowCount) throw Object.assign(new Error('Evaluación no encontrada'), { status: 404 })
}
