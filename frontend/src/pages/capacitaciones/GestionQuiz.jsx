import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import {
  PlusIcon, XIcon, CheckCircleIcon, ZapIcon, GraduationCapIcon, LockIcon,
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

// ─── Quiz type config ──────────────────────────────────────────────────────────
const TIPO_CONFIG = {
  normal: {
    label: 'Quiz Normal',
    badge: 'PRÁCTICA',
    color: '#000000', // var(--color-primary)
    bg: 'rgba(0,0,0,0.08)',
    borderColor: '#000000',
  },
  final: {
    label: 'Quiz Final',
    badge: 'FINAL',
    color: '#006c49', // var(--color-secondary)
    bg: 'rgba(0,108,73,0.08)',
    borderColor: '#006c49',
  },
}

// ─── Single Evaluacion Panel ───────────────────────────────────────────────────
function EvaluacionPanel({ evaluacion, onDelete, onUpdated }) {
  const navigate = useNavigate()
  const [nuevaPregunta, setNuevaPregunta] = useState(blankPregunta())
  const [addingPregunta, setAddingPregunta] = useState(false)
  const [preguntaError, setPreguntaError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [deletingPId, setDeletingPId] = useState(null)
  const LETRAS = ['A', 'B', 'C', 'D', 'E']
  const cfg = TIPO_CONFIG[evaluacion.tipo] ?? TIPO_CONFIG.normal

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
      onUpdated(evaluacion.id, res.data.data)
      setNuevaPregunta(blankPregunta())
      setShowForm(false)
    } catch (err) {
      setPreguntaError(err?.response?.data?.message || 'Error al agregar pregunta')
    } finally { setAddingPregunta(false) }
  }

  const handleDeletePregunta = async (pid) => {
    if (!confirm('¿Eliminar esta pregunta?')) return
    setDeletingPId(pid)
    try {
      await deletePregunta(pid)
      onUpdated(evaluacion.id, {
        ...evaluacion,
        preguntas: evaluacion.preguntas.filter(p => p.id !== pid),
      })
    } catch (err) {
      alert(err?.response?.data?.message || 'Error al eliminar pregunta')
    } finally { setDeletingPId(null) }
  }

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

  return (
    <div style={{
      borderRadius: 16, border: `2px solid ${cfg.borderColor}`,
      background: 'var(--color-surface-container-lowest)', overflow: 'hidden',
    }}>
      {/* Header */}
      <div style={{
        padding: '14px 20px', background: cfg.bg,
        display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${cfg.borderColor}30`,
      }}>
        {evaluacion.tipo === 'final'
          ? <GraduationCapIcon size={18} style={{ color: cfg.color, flexShrink: 0 }} />
          : <ZapIcon size={18} style={{ color: cfg.color, flexShrink: 0 }} />}
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase',
              color: cfg.color, background: `${cfg.color}20`, borderRadius: 6, padding: '2px 8px',
            }}>{cfg.badge}</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-on-surface)' }}>
              {evaluacion.titulo}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
              {evaluacion.preguntas?.length ?? 0} preguntas
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
              Mín. {evaluacion.puntaje_minimo}%
            </span>
            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
              {evaluacion.max_intentos} intentos
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => navigate(`/evaluaciones/${evaluacion.id}/preguntas`)}
            style={{ ...btnSecondaryStyle, padding: '6px 14px', fontSize: 12 }}
          >
            Vista previa
          </button>
          <button
            onClick={async () => {
              if (!confirm('¿Eliminar este quiz? Esta acción no se puede deshacer.')) return
              try { await deleteEvaluacion(evaluacion.id); onDelete(evaluacion.id) }
              catch (err) { alert(err?.response?.data?.message || 'Error al eliminar') }
            }}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-error)', padding: 6 }}
            title="Eliminar quiz"
          >
            <XIcon size={16} />
          </button>
        </div>
      </div>

      {/* Preguntas */}
      <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {(evaluacion.preguntas ?? []).map((p, idx) => (
          <div key={p.id} style={{
            borderRadius: 12, border: '1px solid var(--color-outline-variant)',
            background: 'var(--color-surface)', overflow: 'hidden',
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px' }}>
              <div style={{
                width: 28, height: 28, borderRadius: 7, background: `${cfg.color}15`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                fontSize: 12, fontWeight: 800, color: cfg.color,
              }}>{idx + 1}</div>
              <div style={{ flex: 1 }}>
                <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)', lineHeight: 1.4 }}>
                  {p.enunciado}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {(p.opciones ?? []).map((op, oi) => (
                    <div key={op.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px',
                      borderRadius: 8, border: `1px solid ${op.es_correcta ? '#22c55e' : 'var(--color-outline-variant)'}`,
                      background: op.es_correcta ? 'rgba(34,197,94,.07)' : 'transparent',
                    }}>
                      <span style={{
                        width: 18, height: 18, borderRadius: 4, flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        background: op.es_correcta ? '#22c55e' : 'var(--color-outline-variant)',
                        color: op.es_correcta ? '#fff' : 'var(--color-on-surface-variant)',
                        fontSize: 9, fontWeight: 700,
                      }}>{LETRAS[oi]}</span>
                      <span style={{ fontSize: 12, color: 'var(--color-on-surface)', flex: 1 }}>{op.texto}</span>
                      {op.es_correcta && <CheckCircleIcon size={11} style={{ color: '#22c55e', flexShrink: 0 }} />}
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
                <XIcon size={14} />
              </button>
            </div>
          </div>
        ))}

        {/* Formulario nueva pregunta */}
        {!showForm ? (
          <button onClick={() => setShowForm(true)} style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px',
            border: `2px dashed ${cfg.borderColor}60`, borderRadius: 12,
            background: 'none', cursor: 'pointer', color: cfg.color,
            fontSize: 13, fontWeight: 600, width: '100%', transition: 'border-color .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = cfg.borderColor}
            onMouseLeave={e => e.currentTarget.style.borderColor = `${cfg.borderColor}60`}
          >
            <PlusIcon size={14} /> Agregar pregunta
          </button>
        ) : (
          <div style={{
            borderRadius: 12, border: `2px solid ${cfg.borderColor}`,
            background: 'var(--color-surface)', padding: 20,
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <p style={{ margin: 0, fontWeight: 700, fontSize: 13, color: 'var(--color-on-surface)' }}>Nueva pregunta</p>
              <button onClick={() => { setShowForm(false); setNuevaPregunta(blankPregunta()) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
                <XIcon size={14} />
              </button>
            </div>

            {preguntaError && <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 12 }}>{preguntaError}</p>}

            <form onSubmit={handleAddPregunta} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
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
                <label style={labelStyle}>Opciones — marca la correcta</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {nuevaPregunta.opciones.map((op, oi) => (
                    <div key={oi} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <button type="button" onClick={() => setOpcionCorrecta(oi)}
                        title="Marcar como correcta"
                        style={{
                          width: 22, height: 22, borderRadius: '50%', flexShrink: 0, cursor: 'pointer',
                          border: op.es_correcta ? 'none' : '2px solid var(--color-outline)',
                          background: op.es_correcta ? '#22c55e' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                        {op.es_correcta && <CheckCircleIcon size={11} style={{ color: '#fff' }} />}
                      </button>
                      <span style={{ width: 18, fontSize: 10, fontWeight: 700, color: 'var(--color-on-surface-variant)', flexShrink: 0 }}>
                        {['A', 'B', 'C', 'D'][oi]}
                      </span>
                      <input
                        value={op.texto}
                        onChange={e => setOpcionTexto(oi, e.target.value)}
                        placeholder={`Opción ${['A', 'B', 'C', 'D'][oi]}`}
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
                <button type="submit" disabled={addingPregunta} style={{ ...btnPrimaryStyle, background: cfg.color }}>
                  {addingPregunta ? 'Guardando...' : 'Guardar pregunta'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Create evaluacion form ────────────────────────────────────────────────────
function CrearEvaluacionForm({ capacitacionId, tieneFinal, onCreated }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ titulo: '', puntaje_minimo: 70, max_intentos: 3, tipo: 'normal' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.titulo.trim()) { setError('El título es requerido'); return }
    setLoading(true); setError('')
    try {
      const res = await createEvaluacion(capacitacionId, form)
      onCreated({ ...res.data.data, preguntas: [] })
      setForm({ titulo: '', puntaje_minimo: 70, max_intentos: 3, tipo: 'normal' })
      setOpen(false)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al crear evaluación')
    } finally { setLoading(false) }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '14px 20px',
        border: '2px dashed var(--color-outline-variant)', borderRadius: 16,
        background: 'none', cursor: 'pointer', color: 'var(--color-primary)',
        fontSize: 13, fontWeight: 600, width: '100%', transition: 'border-color .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
      >
        <PlusIcon size={16} /> Agregar nuevo quiz
      </button>
    )
  }

  return (
    <div style={{
      borderRadius: 16, border: '2px solid var(--color-primary)',
      background: 'var(--color-surface-container-lowest)', padding: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'var(--color-on-surface)' }}>
          Nuevo Quiz
        </p>
        <button onClick={() => { setOpen(false); setError('') }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
          <XIcon size={16} />
        </button>
      </div>

      {error && <p style={{ color: 'var(--color-error)', fontSize: 13, marginBottom: 14 }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Tipo selector */}
        <div>
          <label style={labelStyle}>Tipo de quiz *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { value: 'normal', label: '⚡ Quiz Normal', desc: 'De práctica o módulo. Pueden ser varios.', color: '#000000', bgActive: 'rgba(0,0,0,0.08)' },
              { value: 'final', label: '🎓 Quiz Final', desc: 'Único. Requiere aprobar los normales.', color: '#006c49', bgActive: 'rgba(0,108,73,0.08)', disabled: tieneFinal },
            ].map(opt => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => setForm(p => ({ ...p, tipo: opt.value }))}
                style={{
                  padding: '12px 16px', borderRadius: 12, textAlign: 'left', cursor: opt.disabled ? 'not-allowed' : 'pointer',
                  border: `2px solid ${form.tipo === opt.value ? opt.color : 'var(--color-outline-variant)'}`,
                  background: form.tipo === opt.value ? opt.bgActive : 'transparent',
                  transition: 'all .15s', opacity: opt.disabled ? 0.5 : 1,
                }}
              >
                <div style={{ fontSize: 13, fontWeight: 700, color: form.tipo === opt.value ? opt.color : 'var(--color-on-surface)', marginBottom: 2 }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', lineHeight: 1.4 }}>
                  {opt.disabled ? 'Ya existe un quiz final' : opt.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Título del quiz *</label>
          <input value={form.titulo} onChange={e => setForm(p => ({ ...p, titulo: e.target.value }))}
            placeholder={form.tipo === 'final' ? 'Ej. Evaluación Final de Seguridad' : 'Ej. Quiz Módulo 1 — Fundamentos'}
            style={inputStyle} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Puntaje mínimo (%)</label>
            <input type="number" min={1} max={100} value={form.puntaje_minimo}
              onChange={e => setForm(p => ({ ...p, puntaje_minimo: Number(e.target.value) }))} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Máx. intentos</label>
            <input type="number" min={1} max={10} value={form.max_intentos}
              onChange={e => setForm(p => ({ ...p, max_intentos: Number(e.target.value) }))} style={inputStyle} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => { setOpen(false); setError('') }} style={btnSecondaryStyle}>
            Cancelar
          </button>
          <button type="submit" disabled={loading} style={btnPrimaryStyle}>
            {loading ? 'Creando...' : 'Crear quiz'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function GestionQuiz() {
  const { id } = useParams()   // capacitacion_id
  const navigate = useNavigate()

  const [capacitacion, setCapacitacion] = useState(null)
  const [evaluaciones, setEvaluaciones] = useState([])   // lista de todas las evaluaciones cargadas con preguntas
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // ── Load ──────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const capRes = await fetchCapacitacionById(id)
        const cap = capRes.data.data
        setCapacitacion(cap)

        // Cargar detalle de cada evaluación (con preguntas)
        const evalList = cap.evaluaciones ?? []
        const detailResults = await Promise.all(
          evalList.map(e => fetchEvaluacionAdmin(e.id).then(r => r.data.data))
        )
        setEvaluaciones(detailResults)
      } catch (e) {
        setError(e?.response?.data?.message || 'Error al cargar')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleCreated = (newEval) => {
    setEvaluaciones(prev => {
      const list = [...prev, newEval]
      // normales primero, final al último
      return list.sort((a, b) => {
        if (a.tipo === b.tipo) return a.id - b.id
        return a.tipo === 'normal' ? -1 : 1
      })
    })
  }

  const handleDelete = (evalId) => {
    setEvaluaciones(prev => prev.filter(e => e.id !== evalId))
  }

  const handleUpdated = (evalId, updated) => {
    setEvaluaciones(prev => prev.map(e => e.id === evalId ? updated : e))
  }

  // ── Renders ───────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <PageWrapper title="Gestión de Quizzes" subtitle="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2].map(i => <div key={i} style={{ height: 120, borderRadius: 16, background: 'var(--color-surface-container-high)' }} />)}
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

  const normales = evaluaciones.filter(e => !e.tipo || e.tipo === 'normal')
  const finalEval = evaluaciones.find(e => e.tipo === 'final')
  const tieneFinal = !!finalEval

  return (
    <PageWrapper
      title={`Quizzes — ${capacitacion?.titulo ?? ''}`}
      subtitle="Gestiona los quizzes de práctica y el quiz final de certificación"
      actions={
        <button onClick={() => navigate(`/capacitaciones/${id}`)} style={btnSecondaryStyle}>
          ← Volver al detalle
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

        {/* ── Info banner si no hay quizzes ── */}
        {evaluaciones.length === 0 && (
          <div style={{
            borderRadius: 16, border: '2px dashed var(--color-outline-variant)',
            padding: 40, textAlign: 'center', background: 'var(--color-surface-container-lowest)',
          }}>
            <ZapIcon size={36} style={{ color: 'var(--color-primary)', display: 'block', margin: '0 auto 12px' }} />
            <h2 style={{ margin: '0 0 6px', fontSize: 16, fontWeight: 700, color: 'var(--color-on-surface)' }}>
              Sin quizzes aún
            </h2>
            <p style={{ margin: '0 0 4px', fontSize: 13, color: 'var(--color-on-surface-variant)' }}>
              Crea quizzes de práctica (normales) y al final un quiz de certificación.
            </p>
          </div>
        )}

        {/* ── Quizzes normales ── */}
        {normales.length > 0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <ZapIcon size={14} style={{ color: 'var(--color-primary)' }} />
              <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>
                Quizzes de Práctica ({normales.length})
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {normales.map(ev => (
                <EvaluacionPanel key={ev.id} evaluacion={ev} onDelete={handleDelete} onUpdated={handleUpdated} />
              ))}
            </div>
          </div>
        )}

        {/* ── Separador visual si hay ambos tipos ── */}
        {normales.length > 0 && tieneFinal && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
            <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)', whiteSpace: 'nowrap' }}>
              Quiz Final
            </span>
            <div style={{ flex: 1, height: 1, background: 'var(--color-outline-variant)' }} />
          </div>
        )}

        {/* ── Quiz final ── */}
        {finalEval && (
          <div>
            {normales.length === 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <GraduationCapIcon size={14} style={{ color: '#006c49' }} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--color-on-surface-variant)' }}>
                  Quiz Final
                </span>
              </div>
            )}

            {/* Info: sin quizzes normales, el final se desbloquea directo */}
            {normales.length === 0 && (
              <div style={{
                marginBottom: 12, padding: '10px 14px', borderRadius: 10,
                background: 'rgba(0,108,73,.08)', border: '1px solid rgba(0,108,73,.3)',
                fontSize: 12, color: '#006c49',
              }}>
                ⚠️ No hay quizzes de práctica — el quiz final estará desbloqueado directamente para los funcionarios.
              </div>
            )}

            <EvaluacionPanel evaluacion={finalEval} onDelete={handleDelete} onUpdated={handleUpdated} />
          </div>
        )}

        {/* ── Agregar nuevo quiz ── */}
        <CrearEvaluacionForm
          capacitacionId={id}
          tieneFinal={tieneFinal}
          onCreated={handleCreated}
        />

        {/* ── Tips ── */}
        <div style={{
          borderRadius: 16, border: '1px solid var(--color-outline-variant)',
          background: 'var(--color-surface-container-lowest)', padding: 20,
        }}>
          <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)' }}>
            Cómo funciona
          </p>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              '⚡ Quizzes normales: el funcionario puede presentarlos en cualquier momento.',
              '🎓 Quiz final: solo accesible tras aprobar TODOS los quizzes normales.',
              '📜 El certificado se genera al aprobar el quiz final (o cualquiera si no hay final).',
              'Puedes tener múltiples quizzes normales (ej. uno por módulo).',
              'Solo puede existir UN quiz final por capacitación.',
            ].map(tip => (
              <li key={tip} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                <span style={{ flexShrink: 0 }}>•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </PageWrapper>
  )
}
