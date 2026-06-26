import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import {
  FileTextIcon, RefreshIcon, PlusIcon, ClipboardIcon, CertificateIcon,
  FlameIcon, HeartPulseIcon, WrenchIcon, BookOpenIcon, HardHatIcon,
  GraduationCapIcon, ClockIcon, AlertTriangleIcon,
} from '../../components/ui/Icons.jsx'
import { fetchCapacitaciones, fetchCategorias } from '../../api/capacitacionesApi.js'
import { useAuth } from '../../hooks/useAuth.js'

const catConfig = {
  'Emergencias y Evacuación':  { Icon: FlameIcon,      color: '#ea580c' },
  'Salud Ocupacional':         { Icon: HeartPulseIcon,  color: '#db2777' },
  'Manejo de Equipos':         { Icon: WrenchIcon,      color: '#475569' },
  'Normatividad SST':          { Icon: BookOpenIcon,    color: '#7c3aed' },
  'Seguridad en el Trabajo':   { Icon: HardHatIcon,     color: '#d97706' },
}
const defaultCat = { Icon: GraduationCapIcon, color: '#0d9488' }

function getCat(categoria) {
  return catConfig[categoria] || defaultCat
}

function Stat({ Icon, value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
      <Icon size={13} style={{ color: 'var(--color-on-surface-variant)', flexShrink: 0 }} />
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-on-surface)' }}>{value}</span>
      <span style={{ fontSize: 12, color: 'var(--color-on-surface-variant)' }}>{label}</span>
    </div>
  )
}

function CapacitacionCard({ curso, onClick }) {
  const { Icon, color } = getCat(curso.categoria)
  const isVencido = curso.fecha_vigencia && new Date(curso.fecha_vigencia) < new Date()
  const diasRestantes = curso.fecha_vigencia
    ? Math.ceil((new Date(curso.fecha_vigencia) - new Date()) / 86400000)
    : null
  const proxVencer = !isVencido && diasRestantes !== null && diasRestantes <= 30

  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff', borderRadius: 12, cursor: 'pointer',
        border: '1px solid var(--color-outline-variant)',
        borderLeft: `4px solid ${color}`,
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        transition: 'box-shadow .15s, transform .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,.1)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,.06)'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ padding: '18px 20px', flex: 1 }}>
        {/* Categoría + badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon size={14} style={{ color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {curso.categoria || 'General'}
            </span>
          </div>
          {!curso.estado && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-on-surface-variant)', background: 'var(--color-surface-container-high)', borderRadius: 4, padding: '2px 6px' }}>
              INACTIVO
            </span>
          )}
          {isVencido && curso.estado && (
            <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--color-error)', background: 'var(--color-error-container)', borderRadius: 4, padding: '2px 6px' }}>
              VENCIDO
            </span>
          )}
          {proxVencer && curso.estado && (
            <span style={{ fontSize: 10, fontWeight: 700, color: '#92400e', background: '#fef3c7', borderRadius: 4, padding: '2px 6px' }}>
              {diasRestantes}d restantes
            </span>
          )}
        </div>

        {/* Título */}
        <h3 style={{ margin: '0 0 6px', fontSize: 15, fontWeight: 700, color: 'var(--color-on-surface)', lineHeight: 1.35 }}>
          {curso.titulo}
        </h3>

        {/* Descripción */}
        <p style={{
          margin: 0, fontSize: 13, color: 'var(--color-on-surface-variant)', lineHeight: 1.5,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          minHeight: 39,
        }}>
          {curso.descripcion || 'Sin descripción'}
        </p>
      </div>

      {/* Stats + fecha */}
      <div style={{
        padding: '12px 20px',
        borderTop: '1px solid var(--color-outline-variant)',
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Stat Icon={FileTextIcon}  value={curso.num_recursos      ?? 0} label="recursos" />
          <Stat Icon={ClipboardIcon} value={curso.num_evaluaciones  ?? 0} label="evaluaciones" />
          <Stat Icon={CertificateIcon} value={curso.num_certificados ?? 0} label="certificados" />
        </div>

        {curso.fecha_vigencia && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            {isVencido
              ? <AlertTriangleIcon size={12} style={{ color: 'var(--color-error)' }} />
              : <ClockIcon size={12} style={{ color: 'var(--color-on-surface-variant)' }} />
            }
            <span style={{ fontSize: 12, color: isVencido ? 'var(--color-error)' : 'var(--color-on-surface-variant)' }}>
              {isVencido ? 'Expiró el ' : 'Hasta '}
              {new Date(curso.fecha_vigencia).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ListaCapacitaciones() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const esAdmin = user?.rol === 'ADMIN' || user?.rol === 'SUPER_USUARIO'

  const [cursos, setCursos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [catActiva, setCatActiva] = useState('Todos')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const [capRes, catRes] = await Promise.all([fetchCapacitaciones(), fetchCategorias()])
      setCursos(capRes.data.data)
      setCategorias(['Todos', ...catRes.data.data.map((c) => c.nombre)])
      setError(null)
    } catch {
      setError('No se pudieron cargar las capacitaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtrados = catActiva === 'Todos'
    ? cursos
    : cursos.filter((c) => c.categoria === catActiva)

  return (
    <PageWrapper
      title="Gestión de Capacitaciones"
      subtitle="Administra y monitorea los cursos de seguridad requeridos."
      actions={
        esAdmin && (
          <button
            onClick={() => navigate('/capacitaciones/nueva')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85"
          >
            <PlusIcon size={15} /> Nueva Capacitación
          </button>
        )
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-error-container px-4 py-3 text-body-sm text-error flex items-center justify-between">
          {error}
          <button onClick={load} className="flex items-center gap-1 text-error hover:underline text-label-sm">
            <RefreshIcon size={12} /> Reintentar
          </button>
        </div>
      )}

      <div className="flex gap-6">
        {/* Sidebar filtros */}
        <aside className="w-48 flex-shrink-0">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Categorías
            </p>
            <div className="space-y-0.5">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-lg bg-surface-container-high" />
                  ))
                : categorias.map((cat) => {
                    const cfg = cat === 'Todos' ? null : getCat(cat)
                    const isActive = catActiva === cat
                    const count = cat === 'Todos' ? cursos.length : cursos.filter((c) => c.categoria === cat).length
                    return (
                      <button key={cat} onClick={() => setCatActiva(cat)}
                        style={isActive && cfg ? { borderLeft: `3px solid ${cfg.color}` } : { borderLeft: '3px solid transparent' }}
                        className={`flex w-full items-center gap-2 rounded-r-lg px-3 py-2 text-body-sm transition-colors ${
                          isActive
                            ? 'bg-surface-container font-semibold text-on-surface'
                            : 'text-on-surface-variant hover:bg-surface-container-low'
                        }`}
                      >
                        {cfg && <cfg.Icon size={13} style={{ color: isActive ? cfg.color : undefined, flexShrink: 0 }} />}
                        <span className="truncate flex-1 text-left">{cat}</span>
                        <span className="text-label-sm text-on-surface-variant">{count}</span>
                      </button>
                    )
                  })
              }
            </div>
          </div>
        </aside>

        {/* Cards grid */}
        <div className="grid flex-1 auto-rows-max grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{ height: 180 }} className="animate-pulse rounded-xl bg-surface-container-high" />
              ))
            : filtrados.length === 0
              ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-on-surface-variant">
                    <FileTextIcon size={36} className="mb-3 opacity-30" />
                    <p className="text-body-md">Sin capacitaciones disponibles</p>
                    {catActiva !== 'Todos' && (
                      <button onClick={() => setCatActiva('Todos')} className="mt-2 text-body-sm text-primary hover:underline">
                        Ver todas
                      </button>
                    )}
                  </div>
                )
              : filtrados.map((curso) => (
                  <CapacitacionCard
                    key={curso.id}
                    curso={curso}
                    onClick={() => navigate(`/capacitaciones/${curso.id}`)}
                  />
                ))
          }
        </div>
      </div>
    </PageWrapper>
  )
}
