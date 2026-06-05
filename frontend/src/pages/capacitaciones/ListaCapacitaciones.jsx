import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { PlayIcon, FileTextIcon, RefreshIcon, PlusIcon } from '../../components/ui/Icons.jsx'
import { fetchCapacitaciones, fetchCategorias } from '../../api/capacitacionesApi.js'
import { useAuth } from '../../hooks/useAuth.js'

const bannerColors = [
  'bg-tertiary-container',
  'bg-secondary-container',
  'bg-surface-container-high',
  'bg-primary-fixed',
  'bg-error-container',
  'bg-secondary-fixed',
]

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
          <button onClick={() => navigate('/capacitaciones/nueva')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85">
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
        {/* Filters */}
        <aside className="w-52 flex-shrink-0">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Categorías
            </p>
            <div className="space-y-2">
              {loading
                ? Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-5 animate-pulse rounded bg-surface-container-high" />
                  ))
                : categorias.map((cat) => (
                    <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-body-sm text-on-surface">
                      <input
                        type="checkbox"
                        checked={catActiva === cat}
                        onChange={() => setCatActiva(cat)}
                        className="h-4 w-4 rounded accent-primary"
                      />
                      {cat}
                    </label>
                  ))
              }
            </div>
          </div>
        </aside>

        {/* Cards grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 content-start">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-72 animate-pulse rounded-xl bg-surface-container-high" />
              ))
            : filtrados.length === 0
              ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-20 text-on-surface-variant">
                    <FileTextIcon size={40} className="mb-3 opacity-40" />
                    <p className="text-body-md">Sin capacitaciones disponibles</p>
                  </div>
                )
              : filtrados.map((curso, idx) => (
                  <div key={curso.id} className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
                    {/* Banner */}
                    <div className={`relative flex h-36 items-center justify-center ${bannerColors[idx % bannerColors.length]}`}>
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black/10">
                        <PlayIcon size={24} className="text-on-surface" />
                      </div>
                      {curso.categoria && (
                        <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-label-sm font-bold text-on-surface">
                          {curso.categoria.split(' ')[0]}
                        </span>
                      )}
                      {!curso.estado && (
                        <span className="absolute left-3 top-3 rounded-md bg-error px-2 py-0.5 text-label-sm font-bold text-on-error">
                          Inactivo
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex flex-1 flex-col p-4">
                      <h3 className="text-body-md font-semibold text-on-surface">{curso.titulo}</h3>
                      <p className="mt-1 line-clamp-2 text-body-sm text-on-surface-variant">{curso.descripcion}</p>

                      {curso.fecha_vigencia && (
                        <p className="mt-2 text-label-sm text-on-surface-variant">
                          Vigente hasta: {new Date(curso.fecha_vigencia).toLocaleDateString('es-CO')}
                        </p>
                      )}

                      <button
                        onClick={() => navigate(`/capacitaciones/${curso.id}`)}
                        className="mt-auto pt-4 w-full rounded-lg bg-primary py-2.5 text-body-sm font-semibold text-on-primary transition-opacity hover:opacity-85"
                      >
                        Ver Capacitación
                      </button>
                    </div>
                  </div>
                ))
          }
        </div>
      </div>
    </PageWrapper>
  )
}
