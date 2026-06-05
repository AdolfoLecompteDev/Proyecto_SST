import { useEffect, useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { AlertTriangleIcon, CheckCircleIcon, ClipboardIcon, TrendUpIcon, MoreVerticalIcon, RefreshIcon } from '../../components/ui/Icons.jsx'
import { fetchDashboardStats } from '../../api/dashboardApi.js'

const tipoActividad = {
  certificado: { label: 'Certificado', cls: 'bg-secondary-fixed text-on-secondary-fixed' },
  login: { label: 'Acceso', cls: 'bg-primary-fixed text-on-primary-fixed' },
  default: { label: 'Acción', cls: 'bg-surface-container-high text-on-surface' },
}

function useRelativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'hace un momento'
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function StatCard({ label, value, badge, badgeColor, icon: Icon, iconBg, progress, progressColor, sub }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
      <div className="flex items-start justify-between">
        <p className="text-body-sm text-on-surface-variant">{label}</p>
        {Icon && (
          <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBg}`}>
            <Icon size={16} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end gap-2">
        <span className="text-headline-lg font-bold text-on-surface">{value}</span>
        {badge && <span className={`mb-0.5 text-label-sm font-medium ${badgeColor}`}>{badge}</span>}
        {sub && !badge && <span className="mb-0.5 text-label-sm text-on-surface-variant">{sub}</span>}
      </div>
      {progress != null && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-surface-container-high">
          <div className={`h-1.5 rounded-full ${progressColor}`} style={{ width: `${progress}%` }} />
        </div>
      )}
      {sub && badge && <p className="mt-2 text-label-sm text-on-surface-variant">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetchDashboardStats()
      setData(res.data.data)
      setError(null)
    } catch {
      setError('No se pudieron cargar las estadísticas')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const now = new Date()
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  const tasaAprobacion = data?.evaluaciones?.tasa_aprobacion ?? 0
  const capActivas = data?.capacitaciones?.activas ?? 0
  const certTotal = data?.certificados?.total ?? 0
  const usuariosActivos = data?.usuarios?.activos ?? 0

  const stats = data ? [
    {
      label: 'Tasa de Aprobación',
      value: `${tasaAprobacion}%`,
      badge: null,
      icon: CheckCircleIcon,
      iconBg: 'bg-secondary-fixed text-secondary',
      progress: tasaAprobacion,
      progressColor: 'bg-secondary',
      sub: 'En evaluaciones',
    },
    {
      label: 'Capacitaciones Activas',
      value: String(capActivas),
      badge: null,
      icon: null,
      iconBg: null,
      progress: null,
      sub: 'módulos publicados',
    },
    {
      label: 'Certificados Emitidos',
      value: String(certTotal),
      badge: null,
      icon: TrendUpIcon,
      iconBg: 'bg-primary-fixed text-on-primary-fixed',
      progress: null,
      sub: `${data.certificados.vigentes} vigentes`,
    },
    {
      label: 'Usuarios Activos',
      value: String(usuariosActivos),
      badge: null,
      icon: ClipboardIcon,
      iconBg: 'bg-tertiary-fixed text-on-tertiary-fixed',
      progress: null,
      sub: `de ${data.usuarios.total} registrados`,
    },
  ] : []

  return (
    <PageWrapper
      title="Visión General"
      subtitle="Métricas de cumplimiento y seguridad en tiempo real."
      actions={
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-outline-variant px-4 py-2 text-label-sm text-on-surface-variant">
            Hoy, {timeStr}
          </span>
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">
            <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-error-container px-4 py-3 text-body-sm text-error">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-container-high" />
            ))
          : stats.map((s) => <StatCard key={s.label} {...s} />)
        }
      </div>

      {/* Chart + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Por categoría */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-headline-md font-semibold text-on-surface">Certificados por Categoría</h2>
          </div>
          {loading ? (
            <div className="flex h-52 items-end gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full animate-pulse rounded-t-md bg-surface-container-high" style={{ height: '40%' }} />
                  <div className="h-3 w-10 animate-pulse rounded bg-surface-container-high" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-52 items-end gap-3">
              {(data?.por_categoria ?? []).map((d, i) => {
                const max = Math.max(...(data?.por_categoria ?? []).map((x) => x.certificados), 1)
                const pct = Math.max((d.certificados / max) * 100, 4)
                const isHighest = d.certificados === max
                return (
                  <div key={d.nombre} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-label-sm font-semibold text-on-surface">{d.certificados}</span>
                    <div
                      className={`w-full rounded-t-md transition-all ${isHighest ? 'bg-secondary' : 'bg-surface-container-high'}`}
                      style={{ height: `${pct}%` }}
                    />
                    <span className="text-center text-label-sm text-on-surface-variant leading-tight" style={{ fontSize: '10px' }}>
                      {d.nombre.split(' ').slice(0, 2).join(' ')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Actividad reciente */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="text-headline-md font-semibold text-on-surface">Actividad Reciente</h2>
            <button className="text-on-surface-variant hover:text-on-surface">
              <MoreVerticalIcon size={18} />
            </button>
          </div>
          <div className="divide-y divide-outline-variant">
            <div className="grid grid-cols-2 px-5 py-2.5">
              <span className="text-label-sm font-semibold uppercase text-on-surface-variant">Usuario</span>
              <span className="text-label-sm font-semibold uppercase text-on-surface-variant">Tipo</span>
            </div>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="h-4 flex-1 animate-pulse rounded bg-surface-container-high" />
                  <div className="h-6 w-20 animate-pulse rounded-lg bg-surface-container-high" />
                </div>
              ))
            ) : (
              (data?.actividad_reciente ?? []).slice(0, 6).map((a, i) => {
                const style = tipoActividad[a.tipo] ?? tipoActividad.default
                return (
                  <div key={i} className="grid grid-cols-2 items-center px-5 py-3">
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{a.usuario}</p>
                      <p className="text-label-sm text-on-surface-variant">{useRelativeTime(a.fecha)}</p>
                    </div>
                    <span className={`w-fit rounded-lg px-3 py-1 text-label-sm font-medium ${style.cls}`}>
                      {style.label}
                    </span>
                  </div>
                )
              })
            )}
          </div>
          <div className="border-t border-outline-variant px-5 py-3">
            <button className="w-full text-center text-body-sm text-on-surface-variant hover:text-on-surface">
              Ver todas las acciones
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
