import { useEffect, useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { AlertTriangleIcon, CheckCircleIcon, DownloadIcon, ShareIcon, ClipboardIcon, RefreshIcon, SearchIcon, UsersIcon } from '../../components/ui/Icons.jsx'
import { fetchMisCertificados, fetchAllCertificados } from '../../api/certificadosApi.js'
import { useAuth } from '../../hooks/useAuth.js'

const tabs = ['Todas', 'Vigentes', 'Expiradas']

const estadoBadge = {
  vigente:   { label: 'Vigente',  cls: 'bg-secondary-fixed text-on-secondary-fixed', icon: CheckCircleIcon },
  expirando: { label: null,       cls: 'bg-error-container text-error',               icon: AlertTriangleIcon },
  expirado:  { label: 'Expirado', cls: 'bg-surface-container-high text-on-surface-variant', icon: null },
}

const borderColor = {
  vigente:   'border-t-2 border-t-secondary',
  expirando: 'border-t-2 border-t-error',
  expirado:  'border-t-2 border-t-outline-variant',
}

function calcEstado(cert) {
  if (!cert.fecha_vigencia) return { ...cert, estadoCalc: 'vigente', diasRestantes: null }
  const dias = Math.floor((new Date(cert.fecha_vigencia) - Date.now()) / 86400000)
  if (dias < 0)  return { ...cert, estadoCalc: 'expirado',  diasRestantes: null }
  if (dias <= 30) return { ...cert, estadoCalc: 'expirando', diasRestantes: dias }
  return { ...cert, estadoCalc: 'vigente', diasRestantes: null }
}

function formatFecha(ts) {
  if (!ts) return '—'
  return new Date(ts).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ── Vista funcionario: cards ──────────────────────────────────────────────────
function CardGrid({ certificados, loading }) {
  const [tabActiva, setTabActiva] = useState('Todas')

  const filtrados = certificados.filter((c) => {
    if (tabActiva === 'Vigentes')  return c.estadoCalc === 'vigente' || c.estadoCalc === 'expirando'
    if (tabActiva === 'Expiradas') return c.estadoCalc === 'expirado'
    return true
  })

  const expirando = certificados.filter((c) => c.estadoCalc === 'expirando').length

  return (
    <>
      {!loading && expirando > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-error-container bg-error-container/40 px-5 py-4">
          <AlertTriangleIcon size={20} className="flex-shrink-0 text-error" />
          <div>
            <p className="text-body-sm font-semibold text-error">Acción Requerida: Certificaciones por Expirar</p>
            <p className="mt-0.5 text-body-sm text-on-error-container">
              Tienes {expirando} certificación{expirando > 1 ? 'es' : ''} que expira{expirando === 1 ? '' : 'n'} en los próximos 30 días.
            </p>
          </div>
        </div>
      )}

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
                        {cert.estadoCalc === 'expirando' ? `Expira en ${cert.diasRestantes}d` : badge.label}
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
    </>
  )
}

// ── Vista admin: tabla ────────────────────────────────────────────────────────
function AdminTable({ certificados, loading }) {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = certificados.filter((c) =>
    !busqueda ||
    c.empleado?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.capacitacion?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.codigo_certificado?.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const vigentes  = certificados.filter((c) => c.estadoCalc !== 'expirado').length
  const expirados = certificados.filter((c) => c.estadoCalc === 'expirado').length

  return (
    <>
      {/* Summary strip */}
      <div className="mb-5 grid grid-cols-3 gap-4">
        {[
          { label: 'Total emitidos',  value: loading ? '–' : certificados.length, color: 'text-on-surface' },
          { label: 'Vigentes',        value: loading ? '–' : vigentes,             color: 'text-emerald-600' },
          { label: 'Expirados',       value: loading ? '–' : expirados,            color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
            <p className="text-body-sm text-on-surface-variant">{s.label}</p>
            <p className={`mt-1 text-headline-md font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="mb-4 relative w-80">
        <SearchIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input type="search" placeholder="Buscar empleado, curso o código..."
          value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="w-full rounded-lg border border-outline bg-white py-2.5 pl-9 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full">
          <thead className="bg-primary text-on-primary">
            <tr>
              {['Empleado', 'Capacitación', 'Emitido', 'Vence', 'Estado', 'Código'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-label-sm font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 animate-pulse rounded bg-surface-container-high" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-body-sm text-on-surface-variant">
                  Sin resultados
                </td>
              </tr>
            ) : filtrados.map((cert) => {
              const badge = estadoBadge[cert.estadoCalc] ?? estadoBadge.vigente
              return (
                <tr key={cert.id} className="hover:bg-surface-container-low">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-surface-container text-label-sm font-bold text-on-surface-variant">
                        {cert.empleado?.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                      </div>
                      <span className="text-body-sm font-medium text-on-surface">{cert.empleado}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-on-surface">{cert.capacitacion}</td>
                  <td className="px-4 py-3 text-body-sm text-on-surface-variant">{formatFecha(cert.fecha_emision)}</td>
                  <td className={`px-4 py-3 text-body-sm ${cert.estadoCalc === 'expirando' ? 'font-medium text-error' : 'text-on-surface-variant'}`}>
                    {cert.fecha_vigencia ? formatFecha(cert.fecha_vigencia) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-label-sm font-medium ${badge.cls}`}>
                      {badge.icon && <badge.icon size={11} />}
                      {cert.estadoCalc === 'expirando' ? `Expira en ${cert.diasRestantes}d` : badge.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-label-sm text-on-surface-variant">{cert.codigo_certificado}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="border-t border-outline-variant px-4 py-3 text-label-sm text-on-surface-variant">
          {loading ? '…' : `${filtrados.length} certificados`}
        </div>
      </div>
    </>
  )
}

// ── Página principal ──────────────────────────────────────────────────────────
export default function MisCertificados() {
  const { user } = useAuth()
  const esAdmin = user?.rol === 'ADMIN' || user?.rol === 'SUPER_USUARIO'

  const [certificados, setCertificados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = esAdmin ? await fetchAllCertificados() : await fetchMisCertificados()
      setCertificados((res.data.data ?? []).map(calcEstado))
      setError(null)
    } catch {
      setError('No se pudieron cargar los certificados')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [esAdmin])

  return (
    <PageWrapper
      title={esAdmin ? 'Gestión de Certificados' : 'Mis Certificaciones'}
      subtitle={esAdmin
        ? 'Todos los certificados emitidos en la plataforma.'
        : 'Consulta, descarga y gestiona tus credenciales de seguridad industrial.'}
      actions={
        <div className="flex items-center gap-2">
          {esAdmin && (
            <span className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant">
              <UsersIcon size={13} /> Vista administrador
            </span>
          )}
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">
            <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-error-container px-4 py-3 text-body-sm text-error">{error}</div>
      )}

      {esAdmin
        ? <AdminTable certificados={certificados} loading={loading} />
        : <CardGrid certificados={certificados} loading={loading} />
      }
    </PageWrapper>
  )
}
