import { useEffect, useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { CheckCircleIcon, AlertTriangleIcon, BellIcon, XIcon, ClockIcon, RefreshIcon } from '../../components/ui/Icons.jsx'
import { fetchNotificaciones } from '../../api/notificacionesApi.js'

const tipoIcono = {
  success: { icon: CheckCircleIcon, cls: 'bg-secondary-fixed text-secondary' },
  warning: { icon: AlertTriangleIcon, cls: 'bg-error-container text-error' },
  info: { icon: BellIcon, cls: 'bg-primary-fixed text-on-primary-fixed' },
  system: { icon: ClockIcon, cls: 'bg-surface-container-high text-on-surface-variant' },
}

const tabs = ['Todas', 'No leídas', 'Sistema']

function formatHora(ts) {
  if (!ts) return ''
  const diff = Date.now() - new Date(ts).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'Hace un momento'
  if (m < 60) return `Hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Hace ${h}h`
  return `Hace ${Math.floor(h / 24)}d`
}

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [tabActiva, setTabActiva] = useState('Todas')

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetchNotificaciones()
      setNotificaciones(res.data.data.map((n) => ({ ...n, leida: false })))
      setError(null)
    } catch {
      setError('No se pudieron cargar las notificaciones')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const marcarLeida = (id) =>
    setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n))

  const eliminar = (id) =>
    setNotificaciones((prev) => prev.filter((n) => n.id !== id))

  const marcarTodas = () =>
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))

  const filtradas = notificaciones.filter((n) => {
    if (tabActiva === 'No leídas') return !n.leida
    if (tabActiva === 'Sistema') return n.tipo === 'system'
    return true
  })

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <PageWrapper
      title="Notificaciones"
      subtitle="Centro de alertas y avisos del sistema."
      actions={
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2 text-label-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">
            <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          {noLeidas > 0 && (
            <button onClick={marcarTodas}
              className="rounded-lg border border-outline px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
              Marcar todo como leído
            </button>
          )}
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-error-container px-4 py-3 text-body-sm text-error">{error}</div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setTabActiva(tab)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-body-sm font-medium transition-colors ${
              tabActiva === tab ? 'bg-on-surface text-inverse-on-surface' : 'text-on-surface-variant hover:text-on-surface'
            }`}>
            {tab}
            {tab === 'No leídas' && noLeidas > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error text-label-sm text-on-error">
                {noLeidas}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-surface-container-high" />
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest py-16">
          <BellIcon size={40} className="mb-3 text-outline" />
          <p className="text-body-md text-on-surface-variant">Sin notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((n) => {
            const { icon: Icon, cls } = tipoIcono[n.tipo] ?? tipoIcono.info
            return (
              <div key={n.id} onClick={() => marcarLeida(n.id)}
                className={`group flex gap-4 rounded-xl border p-5 transition-colors cursor-pointer ${
                  n.leida ? 'border-outline-variant bg-surface-container-lowest' : 'border-primary/20 bg-primary/[0.02]'
                }`}>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cls}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!n.leida && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                      <p className="text-body-sm font-semibold text-on-surface">{n.titulo}</p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-label-sm text-on-surface-variant">{formatHora(n.fecha)}</span>
                      <button onClick={(e) => { e.stopPropagation(); eliminar(n.id) }}
                        className="hidden text-on-surface-variant hover:text-error group-hover:block">
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-body-sm text-on-surface-variant">{n.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
