import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import {
  PlusIcon, XIcon, CheckCircleIcon, ZapIcon, GraduationCapIcon,
} from '../../components/ui/Icons.jsx'
import {
  createEvaluacion, fetchEvaluacionAdmin, addPregunta, deletePregunta, deleteEvaluacion,
} from '../../api/evaluacionesApi.js'
import { fetchCapacitacionById } from '../../api/capacitacionesApi.js'

// ─── Shared styles ─────────────────────────────────────────────────────────────
const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10,
  border: '1px solid var(--color-outline)', fontSize: 13, color: 'var(--color-on-surface)',
  background: 'var(--color-surface)', outline: 'none',
}
const labelStyle = {
  display: 'block', fontSize: 12, fontWeight: 600,
  color: 'var(--color-on-surface-variant)', marginBottom: 4,
}
const btnPrimaryStyle = {
  padding: '10px 22px', borderRadius: 10, background: 'var(--color-primary)',
  color: 'var(--color-on-primary)', border: 'none', fontSize: 13, fontWeight: 700,
  cursor: 'pointer', transition: 'opacity .15s',
}
const btnSecondaryStyle = {
  padding: '10px 22px', borderRadius: 10, background: 'transparent',
  color: 'var(--color-on-surface)', border: '1px solid var(--color-outline)',
  fontSize: 13, fontWeight: 600, cursor: 'pointer',
}
const btnDangerStyle = {
  padding: '8px 16px', borderRadius: 8, background: 'transparent',
  color: 'var(--color-error)', border: '1px solid var(--color-error)',
  fontSize: 12, fontWeight: 600, cursor: 'pointer',
}

// ─── Blank question template ───────────────────────────────────────────────────
const blankPregunta = () => ({
  enunciado: '',
  opciones: [
    { texto: '', es_correcta: true },
    { texto: '', es_correcta: false },
    { texto: '', es_correcta: false },
    { texto: '', es_correcta: false },
  ],
})

// ─── Main component ────────────────────────────────────────────────────────────
export default function GestionQuiz() {
  const { id } = useParams()   // capacitacion_id
  const navigate = useNavigate()

  const [capacitacion, setCapacitacion] = useState(null)
  const [evaluacion, setEvaluacion] = useState(null)  // null = no existe aún
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Formulario de nueva evaluacion
  const [evalForm, setEvalForm] = useState({ titulo: '', puntaje_minimo: 70, max_intentos: 3 })
  const [creatingEval, setCreatingEval] = useState(false)
  const [evalError, setEvalError] = useState('')

  // Nueva pregunta
  const [nuevaPregunta, setNuevaPregunta] = useState(blankPregunta())
  const [addingPregunta, setAddingPregunta] = useState(false)
  const [preguntaError, setPreguntaError] = useState('')
  const [showForm, setShowForm] = useState(false)

  // Eliminar pregunta
  const [deletingPId, setDeletingPId] = useState(null)

  // ── Load ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const capRes = await fetchCapacitacionById(id)
        const cap = capRes.data.data
        setCapacitacion(cap)

        const firstEval = cap.evaluaciones?.[0]
        if (firstEval) {
          const evalRes = await fetchEvaluacionAdmin(firstEval.id)
          setEvaluacion(evalRes.data.data)
          setEvalForm({
            titulo: evalRes.data.data.titulo,
            puntaje_minimo: evalRes.data.data.puntaje_minimo,
            max_intentos: evalRes.data.data.max_intentos,
          })
        }
      } catch (e) {
        setError(e?.response?.data?.message || 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // ── Create evaluacion ─────────────────────────────────────────────────────────
  const handleCreateEval = async (e) => {
    e.preventDefault()
    if (!evalForm.titulo.trim()) { setEvalError('El título es requerido'); return }
    setCreatingEval(true); setEvalError('')
    try {
      const res = await createEvaluacion(id, evalForm)
      const newEval = res.data.data
      setEvaluacion({ ...newEval, preguntas: [] })
    } catch (err) {
      setEvalError(err?.response?.data?.message || 'Error al crear evaluación')
    } finally { setCreatingEval(false) }
  }

  // ── Delete evaluacion ─────────────────────────────────────────────────────────
  const handleDeleteEval = async () => {
    if (!confirm('¿Eliminar toda la evaluación? Esta acción no se puede deshacer.')) return
    try {
      await deleteEvaluacion(evaluacion.id)
      setEvaluacion(null)
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al eliminar evaluación')
    }
  }

  // ── Add pregunta ──────────────────────────────────────────────────────────────
  const handleAddPregunta = async (e) => {
    e.preventDefault()
    if (!nuevaPregunta.enunciado.trim()) { setPreguntaError('El enunciado es requerido'); return }
    const opcionesValidas = nuevaPregunta.opciones.filter(o => o.texto.trim())
    if (opcionesValidas.length < 2) { setPreguntaError('Al menos 2 opciones con texto'); return }
    if (!opcionesValidas.some(o => o.es_correcta)) { setPreguntaError('Marca al menos una opción como correcta'); return }

    setAddingPregunta(true); setPreguntaError('')
    try {
      const res = await addPregunta(evaluacion.id, {
        enunciado: nuevaPregunta.enunciado.trim(),
        opciones: opcionesValidas,
      })
      setEvaluacion(res.data.data)
      setNuevaPregunta(blankPregunta())
      setShowForm(false)
    } catch (err) {
      setPreguntaError(err?.response?.data?.message || 'Error al agregar pregunta')
    } finally { setAddingPregunta(false) }
  }

  // ── Delete pregunta ───────────────────────────────────────────────────────────
  const handleDeletePregunta = async (pid) => {
    if (!confirm('¿Eliminar esta pregunta?')) return
    setDeletingPId(pid)
    try {
      await deletePregunta(pid)
      setEvaluacion(prev => ({ ...prev, preguntas: prev.preguntas.filter(p => p.id !== pid) }))
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al eliminar pregunta')
    } finally { setDeletingPId(null) }
  }

  // ── Opcion toggles ────────────────────────────────────────────────────────────
  const setOpcionCorrecta = (idx) => {
    setNuevaPregunta(prev => ({
      ...prev,
      opciones: prev.opciones.map((o, i) => ({ ...o, es_correcta: i === idx })),
    }))
  }

  const setOpcionTexto = (idx, texto) => {
    setNuevaPregunta(prev => ({
      ...prev,
      opciones: prev.opciones.map((o, i) => i === idx ? { ...o, texto } : o),
    }))
  }

  // ── Renders ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper title="Gestión de Quiz" subtitle="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => <div key={i} style={{ height: 100, borderRadius: 16, background: 'var(--color-surface-container-high)' }} />)}
        </div>
      </PageWrapper>
    )
  }

  if (error) {
    return (
      <PageWrapper title="Error" subtitle="">
        <div style={{ borderRadius: 16, background: 'var(--color-error-container)', padding: 24, color: 'var(--color-error)' }}>{error}</div>
      </PageWrapper>
    )
  }

  const LETRAS = ['A', 'B', 'C', 'D', 'E']

  return (
    <PageWrapper
      title={`Quiz — ${capacitacion?.titulo ?? ''}`}
      subtitle="Crea y administra las preguntas de la evaluación"
      actions={
        <button onClick={() => navigate(`/capacitaciones/${id}`)} style={btnSecondaryStyle}>
          ← Volver al detalle
        </button>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        {/* ── Left: preguntas ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Si no hay evaluación → formulario de creación */}
          {!evaluacion && (
            <div style={{
              borderRadius: 16, border: '2px dashed var(--color-outline-variant)',
              padding: 32, textAlign: 'center', background: 'var(--color-surface-container-lowest)',
            }}>
              <ZapIcon size={36} style={{ color: 'var(--color-primary)', display: 'block', margin: '0 auto 12px' }} />
              <h2 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)' }}>
                Crear evaluación
              </h2>
              <p style={{ margin: '0 0 24px', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
                Define los parámetros del quiz para esta capacitación.
              </p>
              {evalError && <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>{evalError}</p>}
              <form onSubmit={handleCreateEval} style={{ textAlign: 'left', maxWidth: 480, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={labelStyle}>Título del quiz *</label>
                  <input value={evalForm.titulo} onChange={e => setEvalForm(p => ({ ...p, titulo: e.target.value }))}
                    placeholder="Ej. Evaluación Final de Seguridad" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={labelStyle}>Puntaje mínimo (%)</label>
                    <input type="number" min={1} max={100} value={evalForm.puntaje_minimo}
                      onChange={e => setEvalForm(p => ({ ...p, puntaje_minimo: Number(e.target.value) }))} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Máx. intentos</label>
                    <input type="number" min={1} max={10} value={evalForm.max_intentos}
                      onChange={e => setEvalForm(p => ({ ...p, max_intentos: Number(e.target.value) }))} style={inputStyle} />
                  </div>
                </div>
                <button type="submit" disabled={creatingEval} style={{ ...btnPrimaryStyle, alignSelf: 'flex-end' }}>
                  {creatingEval ? 'Creando...' : 'Crear evaluación'}
                </button>
              </form>
            </div>
          )}

          {/* Lista de preguntas existentes */}
          {evaluacion && evaluacion.preguntas?.map((p, idx) => (
            <div key={p.id} style={{
              borderRadius: 16, border: '1px solid var(--color-outline-variant)',
              background: 'var(--color-surface-container-lowest)', overflow: 'hidden',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px 20px' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 8, background: 'var(--color-primary-container, rgba(59,130,246,.1))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  fontSize: 13, fontWeight: 800, color: 'var(--color-primary)',
                }}>{idx + 1}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ margin: '0 0 12px', fontSize: 14, fontWeight: 600, color: 'var(--color-on-surface)', lineHeight: 1.4 }}>
                    {p.enunciado}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    {(p.opciones ?? []).map((op, oi) => (
                      <div key={op.id} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px',
                        borderRadius: 8, border: `1px solid ${op.es_correcta ? 'var(--color-secondary, #22c55e)' : 'var(--color-outline-variant)'}`,
                        background: op.es_correcta ? 'rgba(34,197,94,.07)' : 'transparent',
                      }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: 4, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: op.es_correcta ? 'var(--color-secondary, #22c55e)' : 'var(--color-outline-variant)',
                          color: op.es_correcta ? '#fff' : 'var(--color-on-surface-variant)', fontSize: 10, fontWeight: 700,
                        }}>{LETRAS[oi]}</span>
                        <span style={{ fontSize: 12, color: 'var(--color-on-surface)', flex: 1 }}>{op.texto}</span>
                        {op.es_correcta && <CheckCircleIcon size={12} style={{ color: 'var(--color-secondary, #22c55e)', flexShrink: 0 }} />}
                      </div>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDeletePregunta(p.id)}
                  disabled={deletingPId === p.id}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 4, opacity: deletingPId === p.id ? 0.4 : 1 }}
                  title="Eliminar pregunta"
                >
                  <XIcon size={16} />
                </button>
              </div>
            </div>
          ))}

          {/* Formulario nueva pregunta */}
          {evaluacion && (
            <>
              {!showForm ? (
                <button onClick={() => setShowForm(true)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
                  border: '2px dashed var(--color-outline-variant)', borderRadius: 16,
                  background: 'none', cursor: 'pointer', color: 'var(--color-primary)',
                  fontSize: 13, fontWeight: 600, width: '100%', transition: 'border-color .15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
                >
                  <PlusIcon size={16} /> Agregar nueva pregunta
                </button>
              ) : (
                <div style={{
                  borderRadius: 16, border: '2px solid var(--color-primary)',
                  background: 'var(--color-surface-container-lowest)', padding: 24,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--color-on-surface)' }}>Nueva pregunta</p>
                    <button onClick={() => { setShowForm(false); setNuevaPregunta(blankPregunta()) }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                      <XIcon size={16} />
                    </button>
                  </div>

                  {preguntaError && <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12, margin: '0 0 12px' }}>{preguntaError}</p>}

                  <form onSubmit={handleAddPregunta} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={labelStyle}>Enunciado *</label>
                      <textarea
                        value={nuevaPregunta.enunciado}
                        onChange={e => setNuevaPregunta(p => ({ ...p, enunciado: e.target.value }))}
                        rows={3}
                        placeholder="¿Cuál es la distancia mínima de seguridad al trabajar en alturas?"
                        style={{ ...inputStyle, resize: 'vertical' }}
                      />
                    </div>

                    <div>
                      <label style={labelStyle}>Opciones de respuesta — marca la correcta</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {nuevaPregunta.opciones.map((op, oi) => (
                          <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            {/* Radio correcta */}
                            <button type="button" onClick={() => setOpcionCorrecta(oi)}
                              title="Marcar como correcta"
                              style={{
                                width: 24, height: 24, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                                border: op.es_correcta ? 'none' : '2px solid var(--color-outline)',
                                background: op.es_correcta ? 'var(--color-secondary, #22c55e)' : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}>
                              {op.es_correcta && <CheckCircleIcon size={12} style={{ color: '#fff' }} />}
                            </button>
                            <span style={{ width: 20, fontSize: 11, fontWeight: 700, color: 'var(--color-on-surface-variant)', flexShrink: 0 }}>
                              {LETRAS[oi]}
                            </span>
                            <input
                              value={op.texto}
                              onChange={e => setOpcionTexto(oi, e.target.value)}
                              placeholder={`Opción ${LETRAS[oi]}`}
                              style={{ ...inputStyle, flex: 1 }}
                            />
                          </div>
                        ))}
                      </div>
                      <p style={{ margin: '6px 0 0', fontSize: 11, color: 'var(--color-on-surface-variant)' }}>
                        Haz clic en el círculo para marcar la respuesta correcta.
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => { setShowForm(false); setNuevaPregunta(blankPregunta()) }} style={btnSecondaryStyle}>
                        Cancelar
                      </button>
                      <button type="submit" disabled={addingPregunta} style={btnPrimaryStyle}>
                        {addingPregunta ? 'Guardando...' : 'Guardar pregunta'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Right: sidebar ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'sticky', top: 24 }}>
          {/* Quiz info card */}
          {evaluacion && (
            <div style={{
              borderRadius: 16, border: '1px solid var(--color-outline-variant)',
              background: 'var(--color-surface-container-lowest)', padding: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <GraduationCapIcon size={16} style={{ color: 'var(--color-primary)' }} />
                <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--color-on-surface)' }}>
                  {evaluacion.titulo}
                </p>
              </div>
              <dl style={{ margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  ['Preguntas', evaluacion.preguntas?.length ?? 0],
                  ['Puntaje mínimo', `${evaluacion.puntaje_minimo}%`],
                  ['Máx. intentos', evaluacion.max_intentos],
                ].map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <dt style={{ fontSize: 12, color: 'var(--color-on-surface-variant)', margin: 0 }}>{k}</dt>
                    <dd style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>{v}</dd>
                  </div>
                ))}
              </dl>
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--color-outline-variant)', display: 'flex', gap: 8, flexDirection: 'column' }}>
                <button
                  onClick={() => navigate(`/evaluaciones/${evaluacion.id}/preguntas`)}
                  style={{ ...btnPrimaryStyle, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, width: '100%' }}
                >
                  <ZapIcon size={13} /> Vista previa del quiz
                </button>
                <button onClick={handleDeleteEval} style={{ ...btnDangerStyle, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <XIcon size={12} /> Eliminar evaluación
                </button>
              </div>
            </div>
          )}

          {/* Tips */}
          <div style={{
            borderRadius: 16, border: '1px solid var(--color-outline-variant)',
            background: 'var(--color-surface-container-lowest)', padding: 20,
          }}>
            <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)' }}>
              Consejos
            </p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Agrega al menos 5 preguntas para una buena cobertura',
                'Solo una opción por pregunta es marcada como correcta',
                'Las preguntas vacías no se guardan',
                'El quiz se activa automáticamente al crear',
              ].map(tip => (
                <li key={tip} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                  <span style={{ color: 'var(--color-primary)', fontWeight: 800, flexShrink: 0 }}>•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
