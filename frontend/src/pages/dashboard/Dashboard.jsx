import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { AlertTriangleIcon, CheckCircleIcon, ClipboardIcon, TrendUpIcon, MoreVerticalIcon } from '../../components/ui/Icons.jsx'

const stats = [
  {
    label: 'Cumplimiento General',
    value: '94%',
    badge: '+2.1%',
    badgeIcon: TrendUpIcon,
    badgeColor: 'text-secondary',
    icon: CheckCircleIcon,
    iconBg: 'bg-secondary-fixed text-secondary',
    progress: 94,
    progressColor: 'bg-secondary',
    sub: null,
  },
  {
    label: 'Capacitaciones Activas',
    value: '128',
    badge: null,
    icon: null,
    iconBg: null,
    progress: 65,
    progressColor: 'bg-on-surface',
    sub: 'empleados',
  },
  {
    label: 'Alertas de Vencimiento',
    value: '12',
    badge: '↑ 4 nuevos',
    badgeColor: 'text-error',
    icon: AlertTriangleIcon,
    iconBg: 'bg-error-container text-error',
    progress: null,
    sub: 'Certificados en próximos 30 días',
  },
  {
    label: 'Revisiones Pendientes',
    value: '5',
    badge: null,
    icon: ClipboardIcon,
    iconBg: 'bg-tertiary-fixed text-on-tertiary-fixed',
    progress: null,
    sub: 'Requieren acción administrativa',
  },
]

const chartData = [
  { month: 'Ene', height: 35 },
  { month: 'Feb', height: 48 },
  { month: 'Mar', height: 58 },
  { month: 'Abr', height: 52 },
  { month: 'May', height: 72 },
  { month: 'Jun', height: 88 },
]

const statusStyles = {
  Completado: 'bg-secondary-fixed text-on-secondary-fixed',
  'En Proceso': 'bg-primary-fixed text-on-primary-fixed',
  Vencido: 'bg-error-container text-on-error-container',
  Revisión: 'bg-surface-container-high text-on-surface',
}

const recentActions = [
  { title: 'Auditoría Sitio Q2', sub: 'Planta Norte', status: 'Completado' },
  { title: 'Capacitación Alturas', sub: 'Grupo Mantenimiento', status: 'En Proceso' },
  { title: 'Renovación ISO 45001', sub: 'Documentación', status: 'Vencido' },
  { title: 'Reporte Incidente', sub: 'Área de Empaque', status: 'Revisión' },
  { title: 'Entrega EPP', sub: 'Nuevos Ingresos', status: 'Completado' },
]

export default function Dashboard() {
  const now = new Date()
  const timeStr = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })

  return (
    <PageWrapper
      title="Visión General"
      subtitle="Métricas de cumplimiento y seguridad en tiempo real."
      actions={
        <span className="rounded-lg border border-outline-variant px-4 py-2 text-label-sm text-on-surface-variant">
          Última actualización: Hoy, {timeStr}
        </span>
      }
    >
      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <div className="flex items-start justify-between">
              <p className="text-body-sm text-on-surface-variant">{s.label}</p>
              {s.icon && (
                <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${s.iconBg}`}>
                  <s.icon size={16} />
                </span>
              )}
            </div>
            <div className="mt-3 flex items-end gap-2">
              <span className="text-headline-lg font-bold text-on-surface">{s.value}</span>
              {s.badge && (
                <span className={`mb-0.5 text-label-sm font-medium ${s.badgeColor}`}>
                  {s.badge}
                </span>
              )}
              {s.sub && !s.badge && (
                <span className="mb-0.5 text-label-sm text-on-surface-variant">{s.sub}</span>
              )}
            </div>
            {s.progress !== null && (
              <div className="mt-3 h-1.5 w-full rounded-full bg-surface-container-high">
                <div
                  className={`h-1.5 rounded-full ${s.progressColor}`}
                  style={{ width: `${s.progress}%` }}
                />
              </div>
            )}
            {s.sub && s.badge && (
              <p className="mt-2 text-label-sm text-on-surface-variant">{s.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Chart + Recent Actions */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        {/* Bar chart */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-headline-md font-semibold text-on-surface">Progreso Mensual</h2>
            <span className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface-variant">
              Últimos 6 Meses
            </span>
          </div>
          <div className="flex h-52 items-end gap-3">
            {chartData.map((d) => (
              <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-md transition-all ${d.month === 'Jun' ? 'bg-secondary' : 'bg-surface-container-high'}`}
                  style={{ height: `${d.height}%` }}
                />
                <span className="text-label-sm text-on-surface-variant">{d.month}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Actions */}
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
          <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
            <h2 className="text-headline-md font-semibold text-on-surface">Acciones Recientes</h2>
            <button className="text-on-surface-variant hover:text-on-surface">
              <MoreVerticalIcon size={18} />
            </button>
          </div>
          <div className="divide-y divide-outline-variant">
            <div className="grid grid-cols-2 px-5 py-2.5">
              <span className="text-label-sm font-semibold uppercase text-on-surface-variant">Actividad</span>
              <span className="text-label-sm font-semibold uppercase text-on-surface-variant">Estado</span>
            </div>
            {recentActions.map((a) => (
              <div key={a.title} className="grid grid-cols-2 items-center px-5 py-3">
                <div>
                  <p className="text-body-sm font-medium text-on-surface">{a.title}</p>
                  <p className="text-label-sm text-on-surface-variant">{a.sub}</p>
                </div>
                <span className={`w-fit rounded-lg px-3 py-1 text-label-sm font-medium ${statusStyles[a.status]}`}>
                  {a.status}
                </span>
              </div>
            ))}
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
