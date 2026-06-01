import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { PlayIcon, FileTextIcon } from '../../components/ui/Icons.jsx'

const categorias = ['Todos', 'Primeros Auxilios', 'Trabajo en Alturas', 'Manejo de Químicos', 'Ergonomía']
const estados = ['Pendiente', 'Completado']

const cursos = [
  {
    id: 1,
    titulo: 'Primeros Auxilios Básicos',
    categoria: 'Primeros Auxilios',
    descripcion: 'Protocolos de emergencia y reanimación cardiopulmonar.',
    tipo: 'VIDEO',
    progreso: 60,
    accion: 'Continuar Módulo',
    accionPrimaria: false,
    iconoBg: 'bg-tertiary-container',
  },
  {
    id: 2,
    titulo: 'Trabajo Seguro en Alturas',
    categoria: 'Trabajo en Alturas',
    descripcion: 'Normativa vigente y uso correcto de equipos de protección.',
    tipo: 'PDF',
    progreso: 100,
    accion: 'Iniciar Evaluación',
    accionPrimaria: true,
    iconoBg: 'bg-secondary-container',
  },
  {
    id: 3,
    titulo: 'Manejo de Sustancias Químicas',
    categoria: 'Manejo de Químicos',
    descripcion: 'Identificación de riesgos y lectura de hojas de datos.',
    tipo: 'VIDEO',
    progreso: 0,
    accion: 'Iniciar Módulo',
    accionPrimaria: true,
    iconoBg: 'bg-surface-container-high',
  },
  {
    id: 4,
    titulo: 'Ergonomía Laboral',
    categoria: 'Ergonomía',
    descripcion: 'Posturas correctas y prevención de lesiones en el trabajo.',
    tipo: 'PDF',
    progreso: 35,
    accion: 'Continuar Módulo',
    accionPrimaria: false,
    iconoBg: 'bg-primary-fixed',
  },
  {
    id: 5,
    titulo: 'Señalización Industrial',
    categoria: 'Primeros Auxilios',
    descripcion: 'Interpretación de señales y pictogramas de seguridad.',
    tipo: 'VIDEO',
    progreso: 100,
    accion: 'Iniciar Evaluación',
    accionPrimaria: true,
    iconoBg: 'bg-tertiary-container',
  },
]

export default function ListaCapacitaciones() {
  const navigate = useNavigate()
  const [catActiva, setCatActiva] = useState('Todos')
  const [estadoActivo, setEstadoActivo] = useState(null)

  const filtrados = cursos.filter((c) => {
    const porCat = catActiva === 'Todos' || c.categoria === catActiva
    const porEstado =
      !estadoActivo ||
      (estadoActivo === 'Completado' ? c.progreso === 100 : c.progreso < 100)
    return porCat && porEstado
  })

  return (
    <PageWrapper
      title="Gestión de Capacitaciones"
      subtitle="Administra y monitorea los cursos de seguridad requeridos."
    >
      <div className="flex gap-6">
        {/* Filters */}
        <aside className="w-52 flex-shrink-0">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Categorías
            </p>
            <div className="space-y-2">
              {categorias.map((cat) => (
                <label key={cat} className="flex cursor-pointer items-center gap-2.5 text-body-sm text-on-surface">
                  <input
                    type="checkbox"
                    checked={catActiva === cat}
                    onChange={() => setCatActiva(cat)}
                    className="h-4 w-4 rounded accent-primary"
                  />
                  {cat}
                </label>
              ))}
            </div>

            <p className="mb-3 mt-6 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Estado
            </p>
            <div className="space-y-2">
              {estados.map((est) => (
                <label key={est} className="flex cursor-pointer items-center gap-2.5 text-body-sm text-on-surface">
                  <input
                    type="radio"
                    name="estado"
                    checked={estadoActivo === est}
                    onChange={() => setEstadoActivo(estadoActivo === est ? null : est)}
                    className="h-4 w-4 accent-primary"
                  />
                  {est}
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Cards grid */}
        <div className="grid flex-1 grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtrados.map((curso) => (
            <div key={curso.id} className="flex flex-col overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
              {/* Banner */}
              <div className={`relative flex h-36 items-center justify-center ${curso.iconoBg}`}>
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-black/10">
                  {curso.tipo === 'VIDEO'
                    ? <PlayIcon size={24} className="text-on-surface" />
                    : <FileTextIcon size={24} className="text-on-surface" />}
                </div>
                <span className="absolute right-3 top-3 rounded-md bg-white/90 px-2 py-0.5 text-label-sm font-bold text-on-surface">
                  {curso.tipo}
                </span>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-body-md font-semibold text-on-surface">{curso.titulo}</h3>
                <p className="mt-1 text-body-sm text-on-surface-variant">{curso.descripcion}</p>

                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-label-sm text-on-surface-variant">
                    <span>Progreso</span>
                    <span>{curso.progreso}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-container-high">
                    <div className="h-1.5 rounded-full bg-secondary" style={{ width: `${curso.progreso}%` }} />
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/capacitaciones/${curso.id}`)}
                  className={`mt-auto pt-4 w-full rounded-lg py-2.5 text-body-sm font-semibold transition-opacity hover:opacity-85 ${
                    curso.accionPrimaria
                      ? 'bg-primary text-on-primary'
                      : 'border border-outline text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  {curso.accion}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
