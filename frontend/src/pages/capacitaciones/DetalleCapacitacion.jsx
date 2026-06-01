import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { PlayIcon, FileTextIcon, DownloadIcon, CheckCircleIcon, ClockIcon } from '../../components/ui/Icons.jsx'
import { ROUTES } from '../../utils/constants.js'

const cursosMock = {
  1: {
    titulo: 'Primeros Auxilios Básicos',
    categoria: 'Primeros Auxilios',
    descripcion: 'Aprende los fundamentos del soporte vital básico: RCP, manejo de hemorragias, atención de quemaduras y protocolos de emergencia en el entorno laboral.',
    tipo: 'VIDEO',
    duracion: '45 min',
    progreso: 60,
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    recursos: [
      { nombre: 'Guía de RCP.pdf', tipo: 'pdf', url: '#' },
      { nombre: 'Protocolo de emergencias.pdf', tipo: 'pdf', url: '#' },
      { nombre: 'Checklist primeros auxilios.pdf', tipo: 'pdf', url: '#' },
    ],
    evaluacionDisponible: false,
  },
  2: {
    titulo: 'Trabajo Seguro en Alturas',
    categoria: 'Trabajo en Alturas',
    descripcion: 'Normativa vigente (Resolución 4272), uso correcto de elementos de protección personal para trabajo en alturas, inspección de equipos y procedimientos de rescate.',
    tipo: 'PDF',
    duracion: '30 min',
    progreso: 100,
    videoUrl: null,
    pdfUrl: 'https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-sample.pdf',
    recursos: [
      { nombre: 'Resolución 4272 de 2021.pdf', tipo: 'pdf', url: '#' },
      { nombre: 'Manual EPP alturas.pdf', tipo: 'pdf', url: '#' },
    ],
    evaluacionDisponible: true,
  },
}

export default function DetalleCapacitacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const curso = cursosMock[id] || cursosMock[1]

  return (
    <PageWrapper
      title={curso.titulo}
      subtitle={curso.categoria}
      actions={
        curso.evaluacionDisponible && (
          <button onClick={() => navigate(ROUTES.EVALUACIONES)}
            className="rounded-lg bg-secondary px-5 py-2.5 text-body-sm font-semibold text-on-secondary hover:opacity-85">
            Iniciar Evaluación
          </button>
        )
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content: video o PDF */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-black">
            {curso.videoUrl ? (
              <video controls className="w-full" src={curso.videoUrl}>
                Tu navegador no soporta video HTML5.
              </video>
            ) : curso.pdfUrl ? (
              <iframe src={curso.pdfUrl} title={curso.titulo} className="h-[500px] w-full bg-white" />
            ) : (
              <div className="flex h-64 items-center justify-center text-on-surface-variant">
                <PlayIcon size={48} />
              </div>
            )}
          </div>

          {/* Progress + description */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-body-md font-semibold text-on-surface">Progreso del módulo</h3>
              <span className="text-body-sm text-on-surface-variant">{curso.progreso}% completado</span>
            </div>
            <div className="h-2 w-full rounded-full bg-surface-container-high">
              <div className="h-2 rounded-full bg-secondary transition-all" style={{ width: `${curso.progreso}%` }} />
            </div>

            <div className="mt-4 flex gap-4 text-body-sm text-on-surface-variant">
              <span className="flex items-center gap-1.5"><ClockIcon size={14} /> {curso.duracion}</span>
              <span className="flex items-center gap-1.5">
                {curso.tipo === 'VIDEO' ? <PlayIcon size={14} /> : <FileTextIcon size={14} />}
                {curso.tipo}
              </span>
              {curso.progreso === 100 && (
                <span className="flex items-center gap-1.5 text-secondary"><CheckCircleIcon size={14} /> Completado</span>
              )}
            </div>

            <p className="mt-4 text-body-sm text-on-surface-variant">{curso.descripcion}</p>
          </div>
        </div>

        {/* Sidebar: resources */}
        <div className="space-y-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <h3 className="mb-4 text-body-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Material de apoyo
            </h3>
            <div className="space-y-2">
              {curso.recursos.map((r) => (
                <a key={r.nombre} href={r.url} download
                  className="flex items-center justify-between rounded-lg border border-outline-variant p-3 text-body-sm transition-colors hover:bg-surface-container-low">
                  <div className="flex items-center gap-2.5">
                    <FileTextIcon size={16} className="flex-shrink-0 text-on-surface-variant" />
                    <span className="text-on-surface">{r.nombre}</span>
                  </div>
                  <DownloadIcon size={14} className="flex-shrink-0 text-on-surface-variant" />
                </a>
              ))}
            </div>
          </div>

          {curso.evaluacionDisponible && (
            <div className="rounded-xl border border-secondary/30 bg-secondary-fixed/30 p-5">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircleIcon size={16} className="text-secondary" />
                <span className="text-body-sm font-semibold text-on-surface">Módulo completado</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Ya puedes presentar la evaluación para obtener tu certificado.
              </p>
              <button onClick={() => navigate(ROUTES.EVALUACIONES)}
                className="mt-3 w-full rounded-lg bg-secondary py-2.5 text-body-sm font-semibold text-on-secondary hover:opacity-85">
                Presentar evaluación
              </button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
