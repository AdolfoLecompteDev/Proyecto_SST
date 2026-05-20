import Badge from '../../components/ui/Badge.jsx'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'

const stats = [
  { label: 'Capacitaciones activas', value: '12' },
  { label: 'Funcionarios al dia', value: '84%' },
  { label: 'Evaluaciones pendientes', value: '19' },
]

const alerts = [
  { label: 'Certificados por vencer', status: 'warning', value: '6 casos' },
  { label: 'Capacitaciones vencidas', status: 'danger', value: '3 casos' },
]

export default function Dashboard() {
  return (
    <PageWrapper
      title="Dashboard SST"
      subtitle="Resumen operativo"
      actions={<Button variant="secondary">Generar reporte</Button>}
    >
      <section className="grid gap-stack-md lg:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6"
          >
            <p className="text-body-sm text-on-surface-variant">{stat.label}</p>
            <p className="mt-3 text-headline-lg font-semibold text-on-surface">
              {stat.value}
            </p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-headline-md font-semibold text-on-surface">
            Alertas de cumplimiento
          </h3>
          <Badge variant="warning">Prioridad media</Badge>
        </div>
        <div className="mt-stack-md grid gap-stack-md md:grid-cols-2">
          {alerts.map((alert) => (
            <div
              key={alert.label}
              className="rounded-md border border-outline-variant bg-surface-container-low p-4"
            >
              <p className="text-body-sm text-on-surface-variant">{alert.label}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-headline-md font-semibold text-on-surface">
                  {alert.value}
                </span>
                <Badge variant={alert.status}>{alert.status.toUpperCase()}</Badge>
              </div>
            </div>
          ))}
        </div>
      </section>
    </PageWrapper>
  )
}
