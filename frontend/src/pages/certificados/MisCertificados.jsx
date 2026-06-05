import { useEffect, useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { AlertTriangleIcon, CheckCircleIcon, DownloadIcon, ShareIcon, ClipboardIcon, RefreshIcon } from '../../components/ui/Icons.jsx'
import { fetchMisCertificados } from '../../api/certificadosApi.js'

const tabs = ['Todas', 'Vigentes', 'Expiradas']

const estadoBadge = {
  vigente: { label: 'Vigente', cls: 'bg-secondary-fixed text-on-secondary-fixed', icon: CheckCircleIcon },
  expirando: { label: null, cls: 'bg-error-container text-error', icon: AlertTriangleIcon },
  expirado: { label: 'Expirado', cls: 'bg-surface-container-high text-on-surface-variant', icon: null },
}

const borderColor = {
  vigente: 'border-t-2 border-t-secondary',
  expirando: 'border-t-2 border-t-error',
  expirado: 'border-t-2 border-t-outline-variant',
}

function calcEstado(cert) {
  if (cert.estado === 'expirado') return { ...cert, estadoCalc: 'expirado', diasRestantes: null }
  if (!cert.fecha_vigencia) return { ...cert, estadoCalc: 'vigente', diasRestantes: null }
  const dias = Math.floor((new Date(cert.fecha_vigencia) - Date.now()) / 86400000)
  if (dias < 0) return { ...cert, estadoCalc: 'expirado', diasRestantes: null }
  if (dias <= 30) return { ...cert, estadoCalc: 'expirando', diasRestantes: dias }
  return { ...cert, estadoCalc: 'vigente', diasRestantes: null }
}

function formatFecha(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function MisCertificados() {
  const [certificados, setCertificados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabActiva, setTabActiva] = useState('Todas')

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetchMisCertificados()
      setCertificados(res.data.data.map(calcEstado))
      setError(null)
    } catch {
      setError('No se pudieron cargar los certificados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtrados = certificados.filter((c) => {
    if (tabActiva === 'Vigentes') return c.estadoCalc === 'vigente' || c.estadoCalc === 'expirando'
    if (tabActiva === 'Expiradas') return c.estadoCalc === 'expirado'
    return true
  })

  const expirando = certificados.filter((c) => c.estadoCalc === 'expirando').length

  return (
    <PageWrapper
      title="Centro de Certificaciones"
      subtitle="Consulta, descarga y gestiona tus credenciales de seguridad industrial."
      actions={
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">
          <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
          Actualizar
        </button>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-error-container px-4 py-3 text-body-sm text-error">{error}</div>
      )}

      {/* Alert banner */}
      {!loading && expirando > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-error-container bg-error-container/40 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon size={20} className="mt-0.5 flex-shrink-0 text-error" />
            <div>
              <p className="text-body-sm font-semibold text-error">Acción Requerida: Certificaciones por Expirar</p>
              <p className="mt-0.5 text-body-sm text-on-error-container">
                Tienes {expirando} certificación{expirando > 1 ? 'es' : ''} que expira{expirando === 1 ? '' : 'n'} en los próximos 30 días.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setTabActiva(tab)}
            className={`rounded-lg px-4 py-1.5 text-body-sm font-medium transition-colors ${
              tabActiva === tab ? 'bg-on-surface text-inverse-on-surface' : 'text-on-surface-variant hover:text-on-surface'
            }`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-xl bg-surface-container-high" />
            ))
          : filtrados.length === 0
            ? (
                <div className="col-span-full flex flex-col items-center justify-center py-20 text-on-surface-variant">
                  <ClipboardIcon size={40} className="mb-3 opacity-30" />
                  <p className="text-body-md">Sin certificados en esta categoría</p>
                </div>
              )
            : filtrados.map((cert) => {
                const badge = estadoBadge[cert.estadoCalc] ?? estadoBadge.vigente
                return (
                  <div key={cert.id}
                    className={`flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ${borderColor[cert.estadoCalc] ?? ''}`}>
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container">
                        <ClipboardIcon size={18} className="text-on-surface-variant" />
                      </div>
                      <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium ${badge.cls}`}>
                        {badge.icon && <badge.icon size={12} />}
                        {cert.estadoCalc === 'expirando'
                          ? `Expira en ${cert.diasRestantes} días`
                          : badge.label}
                      </span>
                    </div>

                    <div className="mt-3">
                      <h3 className={`text-body-md font-semibold ${cert.estadoCalc === 'expirado' ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                        {cert.capacitacion}
                      </h3>
                      <p className="mt-0.5 text-body-sm text-on-surface-variant">{cert.categoria}</p>
                    </div>

                    <div className="mt-4 space-y-1.5 text-body-sm">
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Emitido:</span>
                        <span className="text-on-surface">{formatFecha(cert.fecha_emision)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Vence:</span>
                        <span className={cert.estadoCalc === 'expirando' ? 'font-medium text-error' : cert.estadoCalc === 'expirado' ? 'text-on-surface-variant' : 'text-on-surface'}>
                          {cert.fecha_vigencia ? formatFecha(cert.fecha_vigencia) : 'Sin fecha límite'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-on-surface-variant">Código:</span>
                        <span className="font-mono text-label-sm text-on-surface">{cert.codigo_certificado}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      {cert.estadoCalc !== 'expirado' ? (
                        <>
                          <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
                            <DownloadIcon size={14} /> PDF
                          </button>
                          <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:bg-surface-container-low">
                            <ShareIcon size={14} />
                          </button>
                        </>
                      ) : (
                        <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-low">
                          <DownloadIcon size={14} /> Archivo
                        </button>
                      )}
                    </div>
                  </div>
                )
              })
        }
      </div>
    </PageWrapper>
  )
}
