import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import {
  FileTextIcon, RefreshIcon, PlusIcon,
  FlameIcon, HeartPulseIcon, WrenchIcon, BookOpenIcon, HardHatIcon,
  ZapIcon, GraduationCapIcon, ShieldIcon,
} from '../../components/ui/Icons.jsx'
import { fetchCapacitaciones, fetchCategorias } from '../../api/capacitacionesApi.js'
import { useAuth } from '../../hooks/useAuth.js'

// Category → icon + gradient
const catConfig = {
  'Emergencias y Evacuación': {
    Icon: FlameIcon,
    gradient: 'from-orange-500 to-red-500',
    light: 'bg-orange-50',
    text: 'text-orange-600',
  },
  'Salud Ocupacional': {
    Icon: HeartPulseIcon,
    gradient: 'from-pink-500 to-rose-500',
    light: 'bg-pink-50',
    text: 'text-pink-600',
  },
  'Manejo de Equipos': {
    Icon: WrenchIcon,
    gradient: 'from-slate-500 to-gray-600',
    light: 'bg-slate-50',
    text: 'text-slate-600',
  },
  'Normatividad SST': {
    Icon: BookOpenIcon,
    gradient: 'from-violet-500 to-purple-600',
    light: 'bg-violet-50',
    text: 'text-violet-600',
  },
  'Seguridad en el Trabajo': {
    Icon: HardHatIcon,
    gradient: 'from-amber-400 to-yellow-500',
    light: 'bg-amber-50',
    text: 'text-amber-600',
  },
}

const defaultConfig = {
  Icon: GraduationCapIcon,
  gradient: 'from-teal-500 to-emerald-600',
  light: 'bg-teal-50',
  text: 'text-teal-600',
}

function getConfig(categoria) {
  return catConfig[categoria] || defaultConfig
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
        <aside className="w-52 flex-shrink-0">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Categorías
            </p>
            <div className="space-y-1">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-8 animate-pulse rounded-lg bg-surface-container-high" />
                  ))
                : categorias.map((cat) => {
                    const cfg = cat === 'Todos' ? null : getConfig(cat)
                    const isActive = catActiva === cat
                    return (
                      <button
                        key={cat}
                        onClick={() => setCatActiva(cat)}
                        className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-body-sm transition-colors ${
                          isActive
                            ? 'bg-primary/10 font-semibold text-primary'
                            : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                        }`}
                      >
                        {cfg && (
                          <span className={`flex h-5 w-5 items-center justify-center rounded ${isActive ? 'text-primary' : cfg.text}`}>
                            <cfg.Icon size={14} />
                          </span>
                        )}
                        <span className="truncate">{cat}</span>
                        {!loading && (
                          <span className="ml-auto text-label-sm text-on-surface-variant">
                            {cat === 'Todos' ? cursos.length : cursos.filter((c) => c.categoria === cat).length}
                          </span>
                        )}
                      </button>
                    )
                  })
              }
            </div>
          </div>
        </aside>

        {/* Cards grid */}
        <div className="grid flex-1 auto-rows-max grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl bg-surface-container-high" />
              ))
            : filtrados.length === 0
              ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-on-surface-variant">
                    <FileTextIcon size={40} className="mb-3 opacity-40" />
                    <p className="text-body-md">Sin capacitaciones disponibles</p>
                    {catActiva !== 'Todos' && (
                      <button onClick={() => setCatActiva('Todos')} className="mt-2 text-body-sm text-primary hover:underline">
                        Ver todas
                      </button>
                    )}
                  </div>
                )
              : filtrados.map((curso) => {
                  const cfg = getConfig(curso.categoria)
                  const { Icon } = cfg
                  const isVencido = curso.fecha_vigencia && new Date(curso.fecha_vigencia) < new Date()

                  return (
                    <div
                      key={curso.id}
                      className="group flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-white shadow-sm transition-shadow hover:shadow-md"
                    >
                      {/* Banner con gradiente + icono */}
                      <div className={`relative flex h-40 items-center justify-center bg-gradient-to-br ${cfg.gradient}`}>
                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                          <Icon size={32} className="text-white" />
                        </div>

                        {/* Categoria badge */}
                        {curso.categoria && (
                          <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-label-sm font-bold text-on-surface shadow-sm">
                            {curso.categoria.split(' ').slice(0, 2).join(' ')}
                          </span>
                        )}

                        {/* Estado badge */}
                        {!curso.estado && (
                          <span className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-0.5 text-label-sm font-bold text-white">
                            Inactivo
                          </span>
                        )}
                        {isVencido && curso.estado && (
                          <span className="absolute left-3 top-3 rounded-md bg-error/90 px-2 py-0.5 text-label-sm font-bold text-white">
                            Vencido
                          </span>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-5">
                        <h3 className="text-body-md font-semibold text-on-surface leading-snug">
                          {curso.titulo}
                        </h3>

                        {curso.descripcion && (
                          <p className="mt-1.5 line-clamp-2 text-body-sm text-on-surface-variant">
                            {curso.descripcion}
                          </p>
                        )}

                        {curso.fecha_vigencia && (
                          <p className={`mt-2 text-label-sm ${isVencido ? 'text-error' : 'text-on-surface-variant'}`}>
                            Vigente hasta: {new Date(curso.fecha_vigencia).toLocaleDateString('es-CO')}
                          </p>
                        )}

                        <button
                          onClick={() => navigate(`/capacitaciones/${curso.id}`)}
                          className={`mt-auto pt-4 w-full rounded-lg py-2.5 text-body-sm font-semibold text-white transition-opacity hover:opacity-85 bg-gradient-to-r ${cfg.gradient}`}
                        >
                          Ver Capacitación
                        </button>
                      </div>
                    </div>
                  )
                })
          }
        </div>
      </div>
    </PageWrapper>
  )
}
