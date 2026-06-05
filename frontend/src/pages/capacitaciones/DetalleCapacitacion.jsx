import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { PlayIcon, FileTextIcon, DownloadIcon, CheckCircleIcon, ClockIcon } from '../../components/ui/Icons.jsx'
import { fetchCapacitacionById } from '../../api/capacitacionesApi.js'

export default function DetalleCapacitacion() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [curso, setCurso] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchCapacitacionById(id)
        setCurso(res.data.data)
      } catch {
        setError('No se pudo cargar la capacitación')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  if (loading) {
    return (
      <PageWrapper title="Cargando..." subtitle="">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="h-96 animate-pulse rounded-xl bg-surface-container-high" />
          <div className="h-64 animate-pulse rounded-xl bg-surface-container-high" />
        </div>
      </PageWrapper>
    )
  }

  if (error || !curso) {
    return (
      <PageWrapper title="Error" subtitle="">
        <div className="rounded-xl bg-error-container p-6 text-error">{error || 'Capacitación no encontrada'}</div>
      </PageWrapper>
    )
  }

  const primerEval = curso.evaluaciones?.[0]
  const primerVideo = curso.archivos?.find((a) => a.tipo === 'video')
  const primerPdf = curso.archivos?.find((a) => a.tipo === 'pdf')
  const pdfs = curso.archivos?.filter((a) => a.tipo === 'pdf') ?? []

  return (
    <PageWrapper
      title={curso.titulo}
      subtitle={curso.categoria}
      actions={
        primerEval && (
          <button onClick={() => navigate(`/evaluaciones/${primerEval.id}/preguntas`)}
            className="rounded-lg bg-secondary px-5 py-2.5 text-body-sm font-semibold text-on-secondary hover:opacity-85">
            Iniciar Evaluación
          </button>
        )
      }
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Main content */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-black">
            {primerVideo?.url ? (
              <video controls className="w-full" src={primerVideo.url}>
                Tu navegador no soporta video HTML5.
              </video>
            ) : primerPdf?.url ? (
              <iframe src={primerPdf.url} title={curso.titulo} className="h-[500px] w-full bg-white" />
            ) : (
              <div className="flex h-64 items-center justify-center bg-surface-container-high text-on-surface-variant">
                <div className="text-center">
                  <PlayIcon size={48} className="mx-auto mb-2 opacity-30" />
                  <p className="text-body-sm">Sin contenido multimedia cargado</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex gap-4 text-body-sm text-on-surface-variant">
              {primerVideo && <span className="flex items-center gap-1.5"><PlayIcon size={14} /> Video</span>}
              {primerPdf && <span className="flex items-center gap-1.5"><FileTextIcon size={14} /> PDF</span>}
              {curso.fecha_vigencia && (
                <span className="flex items-center gap-1.5">
                  <ClockIcon size={14} />
                  Vigente hasta {new Date(curso.fecha_vigencia).toLocaleDateString('es-CO')}
                </span>
              )}
            </div>
            <p className="mt-4 text-body-sm text-on-surface-variant">{curso.descripcion}</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {pdfs.length > 0 && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <h3 className="mb-4 text-body-sm font-semibold uppercase tracking-wide text-on-surface-variant">
                Material de apoyo
              </h3>
              <div className="space-y-2">
                {pdfs.map((r) => (
                  <a key={r.id} href={r.url} target="_blank" rel="noreferrer"
                    className="flex items-center justify-between rounded-lg border border-outline-variant p-3 text-body-sm transition-colors hover:bg-surface-container-low">
                    <div className="flex items-center gap-2.5">
                      <FileTextIcon size={16} className="flex-shrink-0 text-on-surface-variant" />
                      <span className="text-on-surface">{r.nombre_original}</span>
                    </div>
                    <DownloadIcon size={14} className="flex-shrink-0 text-on-surface-variant" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {primerEval && (
            <div className="rounded-xl border border-secondary/30 bg-secondary-fixed/30 p-5">
              <div className="mb-2 flex items-center gap-2">
                <CheckCircleIcon size={16} className="text-secondary" />
                <span className="text-body-sm font-semibold text-on-surface">Evaluación disponible</span>
              </div>
              <p className="text-body-sm text-on-surface-variant">
                Puntaje mínimo: {primerEval.puntaje_minimo}%. Intentos permitidos: {primerEval.max_intentos}.
              </p>
              <button onClick={() => navigate(`/evaluaciones/${primerEval.id}/preguntas`)}
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
