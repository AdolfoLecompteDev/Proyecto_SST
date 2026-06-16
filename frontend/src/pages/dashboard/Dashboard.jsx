import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import {
  CheckCircleIcon, CertificateIcon, RefreshIcon,
  GraduationCapIcon, UsersIcon, AlertTriangleIcon,
  FlameIcon, HeartPulseIcon, WrenchIcon, BookOpenIcon, HardHatIcon,
  ShieldCheckIcon, ClockIcon, BellIcon, ChevronRightIcon,
} from '../../components/ui/Icons.jsx'
import { fetchDashboardStats } from '../../api/dashboardApi.js'
import { fetchMisCertificados } from '../../api/certificadosApi.js'
import { fetchCategorias, fetchCapacitaciones } from '../../api/capacitacionesApi.js'
import { fetchPerfilStats } from '../../api/authApi.js'
import { fetchNotificaciones } from '../../api/notificacionesApi.js'
import { useAuth } from '../../hooks/useAuth.js'

// Category colors — match ListaCapacitaciones
const CAT_CFG = {
  'Emergencias y Evacuación': { Icon: FlameIcon,       from: '#f97316', to: '#ef4444', light: '#fff7ed', text: '#c2410c' },
  'Salud Ocupacional':        { Icon: HeartPulseIcon,  from: '#ec4899', to: '#f43f5e', light: '#fdf2f8', text: '#9d174d' },
  'Manejo de Equipos':        { Icon: WrenchIcon,      from: '#64748b', to: '#475569', light: '#f8fafc', text: '#334155' },
  'Normatividad SST':         { Icon: BookOpenIcon,    from: '#8b5cf6', to: '#7c3aed', light: '#f5f3ff', text: '#5b21b6' },
  'Seguridad en el Trabajo':  { Icon: HardHatIcon,     from: '#f59e0b', to: '#eab308', light: '#fffbeb', text: '#92400e' },
}
const DEFAULT_CFG = { Icon: GraduationCapIcon, from: '#14b8a6', to: '#059669', light: '#f0fdfa', text: '#0f766e' }

function getCfg(nombre) { return CAT_CFG[nombre] || DEFAULT_CFG }

function relativeTime(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'hace un momento'
  if (m < 60) return `hace ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

function ComplianceRing({ pct, aprobados, intentos, loading }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const fill = loading ? 0 : (pct / 100) * circ
  const color = pct >= 80 ? '#16a34a' : pct >= 50 ? '#d97706' : '#dc2626'
  const bg = pct >= 80 ? '#dcfce7' : pct >= 50 ? '#fef3c7' : '#fee2e2'
  const label = pct >= 80 ? 'Bueno' : pct >= 50 ? 'Regular' : 'Crítico'

  return (
    <div className="flex items-center gap-6">
      <div className="relative flex-shrink-0">
        <svg width="128" height="128" className="-rotate-90">
          <circle cx="64" cy="64" r={r} fill="none" stroke={bg} strokeWidth="10" />
          <circle cx="64" cy="64" r={r} fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={circ} strokeDashoffset={circ - fill}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s ease-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-on-surface">{loading ? '–' : `${pct}%`}</span>
          <span className="text-label-sm font-medium" style={{ color }}>{label}</span>
        </div>
      </div>
      <div>
        <p className="text-body-lg font-semibold text-on-surface">Tasa de Aprobación</p>
        <p className="mt-1 text-body-sm text-on-surface-variant">Evaluaciones aprobadas vs. intentos totales</p>
        <div className="mt-3 flex gap-4">
          <div>
            <p className="text-label-sm text-on-surface-variant">Aprobadas</p>
            <p className="text-body-md font-bold text-on-surface">{loading ? '–' : aprobados}</p>
          </div>
          <div className="w-px bg-outline-variant" />
          <div>
            <p className="text-label-sm text-on-surface-variant">Intentos</p>
            <p className="text-body-md font-bold text-on-surface">{loading ? '–' : intentos}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, sub, subColor, Icon, iconColor, iconBg, loading, onClick }) {
  return (
    <button
      onClick={onClick}
      disabled={!onClick}
      className={`rounded-xl border border-outline-variant bg-surface-container-lowest p-5 text-left transition-shadow ${onClick ? 'hover:shadow-md cursor-pointer' : 'cursor-default'}`}
    >
      <div className="flex items-start justify-between">
        <p className="text-body-sm text-on-surface-variant">{label}</p>
        <span className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon size={17} className={iconColor} />
        </span>
      </div>
      <p className="mt-3 text-headline-lg font-bold text-on-surface">{loading ? '–' : value}</p>
      {sub && <p className={`mt-1 text-label-sm ${subColor || 'text-on-surface-variant'}`}>{sub}</p>}
    </button>
  )
}

function AlertBanner({ alertas, loading, navigate }) {
  if (loading) return null
  const items = [
    alertas.cap_vencidas > 0 && {
      label: `${alertas.cap_vencidas} capacitación${alertas.cap_vencidas > 1 ? 'es' : ''} vencida${alertas.cap_vencidas > 1 ? 's' : ''}`,
      sub: 'Requieren actualización',
      color: 'bg-red-50 border-red-200 text-red-700',
      dot: 'bg-red-500',
      action: () => navigate('/capacitaciones'),
    },
    alertas.cert_proximos_vencer > 0 && {
      label: `${alertas.cert_proximos_vencer} certificado${alertas.cert_proximos_vencer > 1 ? 's' : ''} vence en 30 días`,
      sub: 'Próximos a expirar',
      color: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      action: () => navigate('/certificados'),
    },
    alertas.funcionarios_sin_cert > 0 && {
      label: `${alertas.funcionarios_sin_cert} funcionario${alertas.funcionarios_sin_cert > 1 ? 's' : ''} sin certificados`,
      sub: 'No han completado ningún módulo',
      color: 'bg-blue-50 border-blue-200 text-blue-700',
      dot: 'bg-blue-500',
      action: () => navigate('/seguimiento'),
    },
  ].filter(Boolean)

  if (!items.length) return null

  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-3">
      {items.map((item) => (
        <button key={item.label} onClick={item.action}
          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-opacity hover:opacity-80 ${item.color}`}>
          <span className={`mt-0.5 h-2 w-2 flex-shrink-0 rounded-full ${item.dot}`} />
          <div>
            <p className="text-body-sm font-semibold">{item.label}</p>
            <p className="text-label-sm opacity-75">{item.sub}</p>
          </div>
        </button>
      ))}
    </div>
  )
}

function CategoryBreakdown({ categorias, loading }) {
  const total = categorias.reduce((a, c) => a + c.certificados, 0) || 1

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
      <h2 className="mb-1 text-body-lg font-semibold text-on-surface">Certificados por categoría</h2>
      <p className="mb-5 text-label-sm text-on-surface-variant">Distribución del catálogo de formación</p>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-container-high flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-28 animate-pulse rounded bg-surface-container-high" />
                <div className="h-2 animate-pulse rounded-full bg-surface-container-high" />
              </div>
              <div className="h-4 w-6 animate-pulse rounded bg-surface-container-high" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {categorias.map((cat) => {
            const cfg = getCfg(cat.nombre)
            const { Icon } = cfg
            const pct = Math.round((cat.certificados / total) * 100)
            return (
              <div key={cat.nombre} className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
                  style={{ background: cfg.light }}>
                  <Icon size={16} style={{ color: cfg.text }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <span className="truncate text-body-sm text-on-surface">{cat.nombre}</span>
                    <span className="flex-shrink-0 text-label-sm font-bold text-on-surface">{cat.certificados}</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-container-high overflow-hidden">
                    <div className="h-2 rounded-full transition-all duration-700"
                      style={{
                        width: cat.certificados > 0 ? `${Math.max(pct, 4)}%` : '0%',
                        background: `linear-gradient(to right, ${cfg.from}, ${cfg.to})`,
                      }}
                    />
                  </div>
                </div>
                <span className="w-9 flex-shrink-0 text-right text-label-sm text-on-surface-variant">{pct}%</span>
              </div>
            )
          })}

          <div className="mt-2 flex items-center justify-between border-t border-outline-variant pt-3">
            <span className="text-body-sm text-on-surface-variant">Total emitidos</span>
            <span className="text-body-md font-bold text-on-surface">{total}</span>
          </div>
        </div>
      )}
    </div>
  )
}

const TIPO_STYLE = {
  certificado: { label: 'Certificado', cls: 'bg-emerald-100 text-emerald-700', Icon: CertificateIcon },
  login:       { label: 'Acceso',      cls: 'bg-blue-100 text-blue-700',       Icon: ShieldCheckIcon },
}
const DEFAULT_TIPO = { label: 'Acción', cls: 'bg-surface-container text-on-surface', Icon: ClockIcon }

function ActivityFeed({ actividad, loading }) {
  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
      <div className="border-b border-outline-variant px-5 py-4">
        <h2 className="text-body-lg font-semibold text-on-surface">Actividad reciente</h2>
        <p className="mt-0.5 text-label-sm text-on-surface-variant">Últimas acciones en la plataforma</p>
      </div>

      <div className="divide-y divide-outline-variant">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-3.5">
              <div className="h-8 w-8 animate-pulse rounded-full bg-surface-container-high flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-32 animate-pulse rounded bg-surface-container-high" />
                <div className="h-2.5 w-20 animate-pulse rounded bg-surface-container-high" />
              </div>
              <div className="h-6 w-20 animate-pulse rounded-lg bg-surface-container-high" />
            </div>
          ))
        ) : actividad.length === 0 ? (
          <div className="px-5 py-10 text-center text-body-sm text-on-surface-variant">Sin actividad registrada</div>
        ) : (
          actividad.slice(0, 8).map((a, i) => {
            const style = TIPO_STYLE[a.tipo] || DEFAULT_TIPO
            const initials = a.usuario.split(' ').slice(0, 2).map((n) => n[0]).join('')
            return (
              <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-container text-label-sm font-bold text-on-surface-variant">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-body-sm font-medium text-on-surface">{a.usuario}</p>
                  <p className="text-label-sm text-on-surface-variant">{relativeTime(a.fecha)}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-label-sm font-medium ${style.cls}`}>
                  <style.Icon size={11} />
                  {style.label}
                </span>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

// ── Dashboard Funcionario ─────────────────────────────────────────────────────
function DashboardFuncionario() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [certs, setCerts]   = useState([])
  const [stats, setStats]   = useState(null)
  const [notifs, setNotifs] = useState([])
  const [caps, setCaps]     = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetchMisCertificados(),
      fetchPerfilStats(),
      fetchNotificaciones(),
      fetchCapacitaciones(),
    ]).then(([certsRes, statsRes, notifsRes, capsRes]) => {
      setCerts(certsRes.data.data ?? [])
      setStats(statsRes.data.data)
      setNotifs((notifsRes.data.data ?? []).filter((n) => !n.leida).slice(0, 4))
      setCaps((capsRes.data.data ?? []).length)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const hora = new Date().getHours()
  const saludo = hora < 12 ? 'Buenos días' : hora < 18 ? 'Buenas tardes' : 'Buenas noches'
  const certVigentes = certs.filter((c) => {
    if (!c.fecha_vigencia) return true
    return new Date(c.fecha_vigencia) >= new Date()
  })
  const certExpirando = certs.filter((c) => {
    if (!c.fecha_vigencia) return false
    const dias = Math.floor((new Date(c.fecha_vigencia) - Date.now()) / 86400000)
    return dias >= 0 && dias <= 30
  })
  const pct = caps > 0 ? Math.round((certs.length / caps) * 100) : 0

  const formatFecha = (ts) => ts ? new Date(ts).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
  const formatLogin = (ts) => {
    if (!ts) return 'Primera sesión'
    const diff = Date.now() - new Date(ts).getTime()
    const h = Math.floor(diff / 3600000)
    if (h < 1) return 'hace un momento'
    if (h < 24) return `hace ${h}h`
    return `hace ${Math.floor(h / 24)}d`
  }

  const TIPO_NOTIF = {
    success: { cls: 'bg-emerald-100 text-emerald-700', icon: CheckCircleIcon },
    warning: { cls: 'bg-amber-100 text-amber-700',    icon: AlertTriangleIcon },
    info:    { cls: 'bg-blue-100 text-blue-700',       icon: BellIcon },
  }

  return (
    <PageWrapper
      title={`${saludo}, ${user?.nombre}`}
      subtitle="Tu resumen personal de seguridad industrial."
    >
      {/* Progreso general */}
      <div className="mb-5 rounded-xl border border-outline-variant bg-gradient-to-r from-primary/5 to-secondary/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-body-sm text-on-surface-variant">Progreso de formación</p>
            <p className="mt-1 text-headline-lg font-bold text-on-surface">
              {loading ? '–' : certs.length} <span className="text-body-lg font-normal text-on-surface-variant">de {loading ? '–' : caps} cursos completados</span>
            </p>
            <div className="mt-3 flex items-center gap-3">
              <div className="h-2.5 w-48 rounded-full bg-surface-container-high overflow-hidden">
                <div className="h-2.5 rounded-full bg-primary transition-all duration-700"
                  style={{ width: `${pct}%` }} />
              </div>
              <span className="text-body-sm font-semibold text-primary">{loading ? '–' : `${pct}%`}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/capacitaciones')}
              className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85">
              <GraduationCapIcon size={15} /> Ver cursos
            </button>
            <button onClick={() => navigate('/certificados')}
              className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2.5 text-body-sm font-semibold text-on-surface hover:bg-surface-container-low">
              <CertificateIcon size={15} /> Mis certificados
            </button>
          </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Certificados obtenidos', value: loading ? '–' : certs.length,                     icon: CertificateIcon, bg: 'bg-emerald-100', color: 'text-emerald-600' },
          { label: 'Certificados vigentes',  value: loading ? '–' : certVigentes.length,               icon: CheckCircleIcon, bg: 'bg-blue-100',    color: 'text-blue-600'   },
          { label: 'Por vencer (30 días)',   value: loading ? '–' : certExpirando.length,              icon: AlertTriangleIcon, bg: certExpirando.length > 0 ? 'bg-amber-100' : 'bg-surface-container', color: certExpirando.length > 0 ? 'text-amber-600' : 'text-on-surface-variant' },
          { label: 'Evaluaciones aprobadas', value: loading ? '–' : (stats?.evaluaciones_aprobadas ?? 0), icon: GraduationCapIcon, bg: 'bg-violet-100', color: 'text-violet-600' },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-start justify-between">
              <p className="text-body-sm text-on-surface-variant">{k.label}</p>
              <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${k.bg}`}>
                <k.icon size={15} className={k.color} />
              </span>
            </div>
            <p className="mt-3 text-headline-lg font-bold text-on-surface">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Certs + Notificaciones */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Mis certificados recientes */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="text-body-lg font-semibold text-on-surface">Mis certificados</h2>
            <button onClick={() => navigate('/certificados')}
              className="flex items-center gap-1 text-label-sm text-primary hover:underline">
              Ver todos <ChevronRightIcon size={13} />
            </button>
          </div>
          <div className="divide-y divide-outline-variant">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-5 py-4">
                  <div className="h-10 w-10 animate-pulse rounded-lg bg-surface-container-high flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 animate-pulse rounded bg-surface-container-high" />
                    <div className="h-3 w-24 animate-pulse rounded bg-surface-container-high" />
                  </div>
                </div>
              ))
            ) : certs.length === 0 ? (
              <div className="px-5 py-12 text-center text-body-sm text-on-surface-variant">
                <CertificateIcon size={32} className="mx-auto mb-2 opacity-30" />
                Aún no tienes certificados. Completa una capacitación para obtener el primero.
              </div>
            ) : certs.slice(0, 5).map((cert) => {
              const dias = cert.fecha_vigencia
                ? Math.floor((new Date(cert.fecha_vigencia) - Date.now()) / 86400000)
                : null
              const expirando = dias !== null && dias >= 0 && dias <= 30
              const expirado  = dias !== null && dias < 0
              return (
                <div key={cert.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${expirado ? 'bg-surface-container' : expirando ? 'bg-amber-100' : 'bg-emerald-100'}`}>
                    <CertificateIcon size={18} className={expirado ? 'text-on-surface-variant' : expirando ? 'text-amber-600' : 'text-emerald-600'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-body-sm font-medium text-on-surface">{cert.capacitacion}</p>
                    <p className="text-label-sm text-on-surface-variant">
                      {cert.categoria} · Emitido {formatFecha(cert.fecha_emision)}
                    </p>
                  </div>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-label-sm font-medium ${
                    expirado  ? 'bg-surface-container text-on-surface-variant' :
                    expirando ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {expirado ? 'Expirado' : expirando ? `${dias}d` : 'Vigente'}
                  </span>
                </div>
              )
            })}
          </div>
          {!loading && stats && (
            <div className="border-t border-outline-variant px-5 py-3 flex items-center justify-between">
              <span className="text-label-sm text-on-surface-variant">Último acceso: {formatLogin(stats.ultimo_login)}</span>
              <span className="font-mono text-label-sm text-on-surface-variant">{user?.email}</span>
            </div>
          )}
        </div>

        {/* Notificaciones no leídas */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="text-body-lg font-semibold text-on-surface">Alertas pendientes</h2>
            <button onClick={() => navigate('/notificaciones')}
              className="flex items-center gap-1 text-label-sm text-primary hover:underline">
              Ver todas <ChevronRightIcon size={13} />
            </button>
          </div>
          {loading ? (
            <div className="space-y-px">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-3 px-5 py-4">
                  <div className="h-8 w-8 animate-pulse rounded-lg bg-surface-container-high flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-36 animate-pulse rounded bg-surface-container-high" />
                    <div className="h-2.5 w-full animate-pulse rounded bg-surface-container-high" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifs.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <CheckCircleIcon size={32} className="mx-auto mb-2 text-emerald-400" />
              <p className="text-body-sm text-on-surface-variant">Todo al día, sin alertas pendientes.</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant">
              {notifs.map((n) => {
                const style = TIPO_NOTIF[n.tipo] ?? TIPO_NOTIF.info
                return (
                  <div key={n.id} onClick={() => navigate('/notificaciones')}
                    className="flex cursor-pointer gap-3 px-5 py-4 hover:bg-surface-container-low">
                    <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${style.cls}`}>
                      <style.icon size={15} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-body-sm font-semibold text-on-surface">{n.titulo}</p>
                      <p className="mt-0.5 line-clamp-2 text-label-sm text-on-surface-variant">{n.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}

// ── Dashboard Admin ───────────────────────────────────────────────────────────
function DashboardAdmin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

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
  const dateStr = now.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })

  const tasa = data?.evaluaciones?.tasa_aprobacion ?? 0
  const capActivas = data?.capacitaciones?.activas ?? 0
  const certTotal = data?.certificados?.total ?? 0
  const certVigentes = data?.certificados?.vigentes ?? 0
  const usrActivos = data?.usuarios?.activos ?? 0
  const usrTotal = data?.usuarios?.total ?? 0

  return (
    <PageWrapper
      title="Visión General"
      subtitle={<span className="capitalize">{dateStr}</span>}
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

      {/* Alertas */}
      {data?.alertas && <AlertBanner alertas={data.alertas} loading={loading} navigate={navigate} />}

      {/* Compliance hero + KPIs */}
      <div className="mb-5 grid gap-4 lg:grid-cols-[auto_1fr_1fr_1fr]">
        {/* Compliance ring */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6 lg:col-span-1">
          <ComplianceRing
            pct={tasa}
            aprobados={data?.evaluaciones?.aprobados ?? 0}
            intentos={data?.evaluaciones?.total ?? 0}
            loading={loading}
          />
        </div>

        {/* KPI: Capacitaciones */}
        <KpiCard
          label="Capacitaciones activas"
          value={capActivas}
          sub={`${data?.capacitaciones?.total ?? 0} en total`}
          Icon={GraduationCapIcon}
          iconBg="bg-violet-100"
          iconColor="text-violet-600"
          loading={loading}
          onClick={() => navigate('/capacitaciones')}
        />

        {/* KPI: Certificados */}
        <KpiCard
          label="Certificados vigentes"
          value={certVigentes}
          sub={certTotal - certVigentes > 0 ? `${certTotal - certVigentes} vencido${certTotal - certVigentes > 1 ? 's' : ''}` : `${certTotal} emitidos en total`}
          subColor={certTotal - certVigentes > 0 ? 'text-red-500' : undefined}
          Icon={CertificateIcon}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
          loading={loading}
          onClick={() => navigate('/certificados')}
        />

        {/* KPI: Usuarios */}
        <KpiCard
          label="Usuarios activos"
          value={usrActivos}
          sub={`de ${usrTotal} registrados`}
          Icon={UsersIcon}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          loading={loading}
          onClick={() => navigate('/usuarios')}
        />
      </div>

      {/* Chart + Activity */}
      <div className="grid items-start gap-4 lg:grid-cols-[1fr_360px]">
        <CategoryBreakdown categorias={data?.por_categoria ?? []} loading={loading} />
        <ActivityFeed actividad={data?.actividad_reciente ?? []} loading={loading} />
      </div>
    </PageWrapper>
  )
}

// ── Dispatcher ────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  return user?.rol === 'FUNCIONARIO' ? <DashboardFuncionario /> : <DashboardAdmin />
}
