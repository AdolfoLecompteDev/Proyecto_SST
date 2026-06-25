import { useEffect, useState, useContext } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import {
  PlayIcon, FileTextIcon, DownloadIcon, CheckCircleIcon,
  ClockIcon, PlusIcon, XIcon, BookOpenIcon, ChevronRightIcon,
  GraduationCapIcon, PencilIcon, ZapIcon, ClipboardIcon,
} from '../../components/ui/Icons.jsx'
import { fetchCapacitacionById } from '../../api/capacitacionesApi.js'
import { addRecurso, deleteRecurso, updateRecurso } from '../../api/capacitacionesApi.js'
import { AuthContext } from '../../context/AuthContext.jsx'

// ─── Icon & label per resource type ───────────────────────────────────────────
const TIPO_META = {
  video: { label: 'Video', color: '#e74c3c', bg: 'rgba(231,76,60,.1)', Icon: PlayIcon },
  video_url: { label: 'Video URL', color: '#e74c3c', bg: 'rgba(231,76,60,.1)', Icon: PlayIcon },
  pdf: { label: 'PDF', color: '#e67e22', bg: 'rgba(230,126,34,.1)', Icon: FileTextIcon },
  docx: { label: 'DOCX', color: '#2980b9', bg: 'rgba(41,128,185,.1)', Icon: FileTextIcon },
  enlace: { label: 'Enlace', color: '#8e44ad', bg: 'rgba(142,68,173,.1)', Icon: BookOpenIcon },
}

// ─── Extract YouTube / Vimeo embed URL ────────────────────────────────────────
function getYouTubeId(url = '') {
  const match = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([^&?\s]{11})/)
  return match ? match[1] : null
}

function getEmbedUrl(url = '') {
  const ytId = getYouTubeId(url)
  if (ytId) return `https://www.youtube.com/embed/${ytId}`
  // Vimeo
  const vmMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/)
  if (vmMatch) return `https://player.vimeo.com/video/${vmMatch[1]}`
  return null
}

function getThumbnailUrl(url = '') {
  const ytId = getYouTubeId(url)
  // Use hqdefault.jpg for better quality, it usually always exists. mqdefault.jpg sometimes fails on certain videos.
  if (ytId) return `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
  return null
}

// ─── Single resource card ──────────────────────────────────────────────────────
function RecursoCard({ recurso, index, isAdmin, onDelete, loading }) {
  const [deleting, setDeleting] = useState(false)
  const meta = TIPO_META[recurso.tipo] ?? TIPO_META.enlace
  const { Icon } = meta
  const embedUrl = (recurso.tipo === 'video_url' || recurso.tipo === 'video') ? getEmbedUrl(recurso.url) : null

  const handleDelete = async () => {
    setDeleting(true)
    await onDelete(recurso.id)
    setDeleting(false)
  }

  return (
    <div style={{ border: '1px solid var(--color-outline-variant)', borderRadius: 16, overflow: 'hidden', background: 'var(--color-surface-container-lowest)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 20px' }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={18} style={{ color: meta.color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
              color: meta.color, background: meta.bg, borderRadius: 6, padding: '2px 8px',
            }}>{meta.label}</span>
            <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>Paso {index + 1}</span>
          </div>
          <p style={{ margin: '4px 0 0', fontWeight: 600, fontSize: 14, color: 'var(--color-on-surface)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {recurso.nombre_original}
          </p>
          {recurso.descripcion && (
            <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{recurso.descripcion}</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          {isAdmin && (
            <button onClick={handleDelete} disabled={deleting || loading}
              title="Eliminar recurso"
              style={{
                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--color-outline-variant)',
                background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--color-error)', opacity: deleting ? 0.5 : 1, transition: 'background .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(231,76,60,.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <XIcon size={14} />
            </button>
          )}
          {recurso.tipo !== 'video' && recurso.tipo !== 'video_url' && (
            <a href={recurso.url} target="_blank" rel="noreferrer"
              style={{
                height: 32, padding: '0 14px', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 6,
                background: meta.color, color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none',
                transition: 'opacity .15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {recurso.tipo === 'pdf' || recurso.tipo === 'docx' ? <DownloadIcon size={12} /> : <ChevronRightIcon size={12} />}
              {recurso.tipo === 'pdf' || recurso.tipo === 'docx' ? 'Descargar' : 'Abrir'}
            </a>
          )}
        </div>
      </div>

      {/* Embed para videos de YouTube/Vimeo */}
      {embedUrl && (
        <div style={{ borderTop: '1px solid var(--color-outline-variant)', background: '#000' }}>
          <iframe
            src={embedUrl}
            title={recurso.nombre_original}
            style={{ width: '100%', aspectRatio: '16/9', display: 'block', border: 'none' }}
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        </div>
      )}

      {/* Embed para video nativo */}
      {recurso.tipo === 'video' && !embedUrl && recurso.url && (
        <div style={{ borderTop: '1px solid var(--color-outline-variant)', background: '#000' }}>
          <video controls style={{ width: '100%', display: 'block' }} src={recurso.url}>
            Tu navegador no soporta video HTML5.
          </video>
        </div>
      )}
    </div>
  )
}

// ─── Add resource form ─────────────────────────────────────────────────────────
function FormAgregarRecurso({ capacitacionId, onAdded }) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ tipo: 'video_url', nombre_original: '', url: '', descripcion: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.url.trim() || !form.nombre_original.trim()) { setError('URL y nombre son requeridos'); return }
    setLoading(true); setError('')
    try {
      const res = await addRecurso(capacitacionId, form)
      onAdded(res.data.data)
      setForm({ tipo: 'video_url', nombre_original: '', url: '', descripcion: '' })
      setOpen(false)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al agregar recurso')
    } finally { setLoading(false) }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{
        display: 'flex', alignItems: 'center', gap: 8, width: '100%',
        padding: '14px 20px', border: '2px dashed var(--color-outline-variant)',
        borderRadius: 16, background: 'transparent', cursor: 'pointer',
        color: 'var(--color-primary)', fontSize: 14, fontWeight: 600, transition: 'border-color .15s',
      }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--color-outline-variant)'}
      >
        <PlusIcon size={16} /> Agregar recurso de estudio
      </button>
    )
  }

  return (
    <div style={{ border: '2px solid var(--color-primary)', borderRadius: 16, padding: 20, background: 'var(--color-surface-container-lowest)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: 'var(--color-on-surface)' }}>Nuevo recurso</p>
        <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-on-surface-variant)' }}>
          <XIcon size={16} />
        </button>
      </div>
      {error && <p style={{ margin: '0 0 12px', fontSize: 13, color: 'var(--color-error)' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div>
            <label style={labelStyle}>Tipo</label>
            <select value={form.tipo} onChange={e => setForm(p => ({ ...p, tipo: e.target.value }))} style={inputStyle}>
              <option value="video_url">🎬 Video (YouTube / URL)</option>
              <option value="video">🎥 Video (archivo directo)</option>
              <option value="pdf">📄 PDF</option>
              <option value="docx">📝 DOCX / Word</option>
              <option value="enlace">🔗 Enlace externo</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>Nombre del recurso *</label>
            <input value={form.nombre_original} onChange={e => setForm(p => ({ ...p, nombre_original: e.target.value }))}
              placeholder="Ej. Clase 1 — Introducción" style={inputStyle} />
          </div>
        </div>
        <div>
          <label style={labelStyle}>URL *</label>
          <input value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))}
            placeholder="https://..." style={inputStyle} />
        </div>
        <div>
          <label style={labelStyle}>Descripción (opcional)</label>
          <input value={form.descripcion} onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
            placeholder="Breve descripción del contenido" style={inputStyle} />
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => setOpen(false)} style={btnSecondaryStyle}>Cancelar</button>
          <button type="submit" disabled={loading} style={btnPrimaryStyle}>
            {loading ? 'Agregando...' : 'Agregar recurso'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─── Shared styles ─────────────────────────────────────────────────────────────
const labelStyle = { display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-on-surface-variant)', marginBottom: 4 }
const inputStyle = {
  width: '100%', boxSizing: 'border-box', padding: '10px 14px', borderRadius: 10,
  border: '1px solid var(--color-outline)', fontSize: 13, color: 'var(--color-on-surface)',
  background: 'var(--color-surface)', outline: 'none',
}
const btnPrimaryStyle = {
  padding: '9px 20px', borderRadius: 10, background: 'var(--color-primary)', color: 'var(--color-on-primary)',
  border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: 1, transition: 'opacity .15s',
}
const btnSecondaryStyle = {
  padding: '9px 20px', borderRadius: 10, background: 'transparent', color: 'var(--color-on-surface)',
  border: '1px solid var(--color-outline)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function DetalleCapacitacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useContext(AuthContext)
  const isAdmin = user?.rol === 'ADMIN' || user?.rol === 'SUPER_USUARIO'

  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tab, setTab] = useState('ruta') // 'ruta' | 'info'
  const [deletingId, setDeletingId] = useState(null)
  const [activeRecursoId, setActiveRecursoId] = useState(null)

  const reload = async () => {
    try {
      const res = await fetchCapacitacionById(id)
      setCurso(res.data.data)
    } catch {
      setError('No se pudo cargar la capacitación')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [id])

  const handleDeleteRecurso = async (rid) => {
    setDeletingId(rid)
    try {
      await deleteRecurso(id, rid)
      setCurso(prev => ({ ...prev, archivos: prev.archivos.filter(a => a.id !== rid) }))
    } catch { /* silencioso */ } finally {
      setDeletingId(null)
    }
  }

  const handleAddedRecurso = (nuevo) => {
    setCurso(prev => ({
      ...prev,
      archivos: [...(prev.archivos ?? []), nuevo].sort((a, b) => a.orden - b.orden),
    }))
  }

  if (loading) {
    return (
      <PageWrapper title="Cargando..." subtitle="">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map(i => (
            <div key={i} style={{ height: 88, borderRadius: 16, background: 'var(--color-surface-container-high)', animation: 'pulse 1.5s infinite' }} />
          ))}
        </div>
      </PageWrapper>
    )
  }

  if (error || !curso) {
    return (
      <PageWrapper title="Error" subtitle="">
        <div style={{ borderRadius: 16, background: 'var(--color-error-container)', padding: 24, color: 'var(--color-error)' }}>
          {error || 'Capacitación no encontrada'}
        </div>
      </PageWrapper>
    )
  }

  const primerEval = curso.evaluaciones?.[0]
  const archivos = curso.archivos ?? []
  const activeRecurso = archivos.find(a => a.id === activeRecursoId) || archivos[0]

  return (
    <PageWrapper
      title={curso.titulo}
      subtitle={curso.categoria}
      actions={
        <div style={{ display: 'flex', gap: 10 }}>
          {isAdmin && (
            <button
              onClick={() => navigate(`/capacitaciones/${id}/quiz`)}
              style={{ ...btnSecondaryStyle, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <ZapIcon size={14} /> Gestionar Quiz
            </button>
          )}
          {primerEval && (
            <button
              onClick={() => navigate(`/evaluaciones/${primerEval.id}/preguntas`)}
              style={{ ...btnPrimaryStyle, display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <GraduationCapIcon size={14} /> Presentar Evaluación
            </button>
          )}
        </div>
      }
    >
      {/* ── Tab bar ── */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 16, marginTop: -16, borderBottom: '1px solid var(--color-outline-variant)', paddingBottom: 0 }}>
        {[
          { key: 'ruta', label: 'Ruta de Estudio', Icon: BookOpenIcon },
          { key: 'info', label: 'Información', Icon: ClipboardIcon },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', border: 'none', background: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: tab === t.key ? 700 : 500,
            color: tab === t.key ? 'var(--color-primary)' : 'var(--color-on-surface-variant)',
            borderBottom: tab === t.key ? '2px solid var(--color-primary)' : '2px solid transparent',
            marginBottom: -1, transition: 'color .15s',
          }}>
            <t.Icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Ruta de Estudio ── */}
      {tab === 'ruta' && (
        <div style={{ display: 'grid', gap: 24, gridTemplateColumns: archivos.length > 0 || isAdmin ? '1fr 300px' : '1fr' }}>
          {/* Resource list */}
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {archivos.length === 0 && !isAdmin && (
                <div style={{
                  borderRadius: 16, border: '1px dashed var(--color-outline-variant)',
                  padding: 48, textAlign: 'center', color: 'var(--color-on-surface-variant)',
                }}>
                  <BookOpenIcon size={40} style={{ opacity: 0.3, display: 'block', margin: '0 auto 12px' }} />
                  <p style={{ margin: 0, fontSize: 14 }}>Esta capacitación aún no tiene recursos de estudio.</p>
                </div>
              )}

              {activeRecurso && (
                <RecursoCard
                  key={activeRecurso.id}
                  recurso={activeRecurso}
                  index={archivos.findIndex(a => a.id === activeRecurso.id)}
                  isAdmin={isAdmin}
                  onDelete={handleDeleteRecurso}
                  loading={deletingId === activeRecurso.id}
                />
              )}

              {/* Admin: add resource form */}
              {isAdmin && (
                <FormAgregarRecurso
                  capacitacionId={id}
                  onAdded={handleAddedRecurso}
                />
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Progress */}
            <div style={{
              borderRadius: 16, border: '1px solid var(--color-outline-variant)',
              background: 'var(--color-surface-container-lowest)', padding: 20,
            }}>
              <p style={{ margin: '0 0 12px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--color-on-surface-variant)' }}>
                Contenido
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {archivos.length === 0 ? (
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--color-on-surface-variant)' }}>Sin recursos aún</p>
                ) : archivos.map((a, i) => {
                  const meta = TIPO_META[a.tipo] ?? TIPO_META.enlace
                  const isActive = activeRecurso && activeRecurso.id === a.id
                  const thumbUrl = (a.tipo === 'video_url' || a.tipo === 'video') ? getThumbnailUrl(a.url) : null
                  const isVideo = a.tipo === 'video' || a.tipo === 'video_url'

                  return (
                    <div 
                      key={a.id}
                      onClick={() => setActiveRecursoId(a.id)}
                      style={{ 
                        display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                        padding: '10px 12px', borderRadius: 12, margin: '0 -12px',
                        background: isActive ? 'var(--color-surface-variant)' : 'transparent',
                        transition: 'background .15s'
                      }}
                      onMouseEnter={e => !isActive && (e.currentTarget.style.background = 'rgba(0,0,0,0.03)')}
                      onMouseLeave={e => !isActive && (e.currentTarget.style.background = 'transparent')}
                    >
                      {thumbUrl ? (
                        <div style={{
                          width: 100, height: 56, borderRadius: 8, flexShrink: 0,
                          backgroundImage: `url(${thumbUrl})`, backgroundSize: 'cover', backgroundPosition: 'center',
                          position: 'relative', overflow: 'hidden', border: '1px solid var(--color-outline-variant)'
                        }}>
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                             <PlayIcon size={18} style={{ color: '#fff', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))' }} />
                          </div>
                        </div>
                      ) : (
                        <div style={{
                          width: isVideo ? 100 : 32, 
                          height: isVideo ? 56 : 32, 
                          borderRadius: 8, background: meta.bg,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                          marginTop: isVideo ? 0 : 2
                        }}>
                          <meta.Icon size={isVideo ? 24 : 14} style={{ color: meta.color }} />
                        </div>
                      )}
                      
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, paddingTop: 2 }}>
                        <span style={{ fontSize: 13, color: isActive ? 'var(--color-primary)' : 'var(--color-on-surface)', fontWeight: isActive ? 600 : 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: '1.4' }}>
                          {i + 1}. {a.nombre_original}
                        </span>
                        {a.descripcion ? (
                          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 4, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {a.descripcion}
                          </span>
                        ) : (
                          <span style={{ fontSize: 11, color: 'var(--color-on-surface-variant)', marginTop: 4 }}>
                            {meta.label}
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Quiz CTA */}
            {primerEval ? (
              <div style={{
                borderRadius: 16, border: '1px solid rgba(var(--color-secondary-rgb, 59,130,246),.3)',
                background: 'rgba(var(--color-secondary-rgb, 59,130,246),.06)', padding: 20,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <CheckCircleIcon size={16} style={{ color: 'var(--color-secondary)' }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-on-surface)' }}>Evaluación disponible</span>
                </div>
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>
                  Puntaje mínimo: <strong>{primerEval.puntaje_minimo}%</strong> · Intentos: <strong>{primerEval.max_intentos}</strong>
                </p>
                <button onClick={() => navigate(`/evaluaciones/${primerEval.id}/preguntas`)}
                  style={{ ...btnPrimaryStyle, width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <GraduationCapIcon size={14} /> Presentar evaluación
                </button>
              </div>
            ) : isAdmin ? (
              <div style={{
                borderRadius: 16, border: '1px dashed var(--color-outline-variant)',
                padding: 20, textAlign: 'center',
              }}>
                <ZapIcon size={28} style={{ color: 'var(--color-on-surface-variant)', opacity: 0.4, display: 'block', margin: '0 auto 8px' }} />
                <p style={{ margin: '0 0 12px', fontSize: 12, color: 'var(--color-on-surface-variant)' }}>No hay quiz todavía</p>
                <button onClick={() => navigate(`/capacitaciones/${id}/quiz`)}
                  style={{ ...btnPrimaryStyle, width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                  <PlusIcon size={14} /> Crear Quiz
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Información ── */}
      {tab === 'info' && (
        <div style={{ display: 'grid', gap: 16, maxWidth: 700 }}>
          <div style={{ borderRadius: 16, border: '1px solid var(--color-outline-variant)', background: 'var(--color-surface-container-lowest)', padding: 24 }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-on-surface-variant)' }}>
              Detalles
            </h3>
            <dl style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 24px', margin: 0 }}>
              {[
                ['Categoría', curso.categoria || '—'],
                ['Fecha de inicio', curso.fecha_inicio ? new Date(curso.fecha_inicio).toLocaleDateString('es-CO') : '—'],
                ['Vigente hasta', curso.fecha_vigencia ? new Date(curso.fecha_vigencia).toLocaleDateString('es-CO') : '—'],
                ['Creado por', curso.creado_por || '—'],
                ['Recursos', `${archivos.length} recurso(s)`],
                ['Evaluación', primerEval ? primerEval.titulo : 'Sin evaluación'],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{k}</dt>
                  <dd style={{ margin: 0, fontSize: 14, color: 'var(--color-on-surface)', fontWeight: 500 }}>{v}</dd>
                </div>
              ))}
            </dl>
            {curso.descripcion && (
              <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--color-outline-variant)' }}>
                <dt style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 6 }}>Descripción</dt>
                <p style={{ margin: 0, fontSize: 14, color: 'var(--color-on-surface-variant)', lineHeight: 1.6 }}>{curso.descripcion}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  )
}
