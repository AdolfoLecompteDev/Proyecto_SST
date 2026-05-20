import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Badge from '../../components/ui/Badge.jsx'

const reportes = [
  { id: 1, nombre: 'Carlos Ruiz', avance: '80%', estado: 'En progreso' },
  { id: 2, nombre: 'Paula Arango', avance: '100%', estado: 'Completado' },
]

export default function ReporteSeguimiento() {
  return (
    <PageWrapper title="Seguimiento" subtitle="Reportes">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-primary text-on-primary">
            <tr>
              <th className="px-4 py-3 text-label-md uppercase">Funcionario</th>
              <th className="px-4 py-3 text-label-md uppercase">Avance</th>
              <th className="px-4 py-3 text-label-md uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reportes.map((reporte, index) => (
              <tr
                key={reporte.id}
                className={index % 2 === 0 ? 'bg-surface' : 'bg-surface-container'}
              >
                <td className="px-4 py-3 text-on-surface">{reporte.nombre}</td>
                <td className="px-4 py-3 text-on-surface-variant">
                  {reporte.avance}
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={reporte.estado === 'Completado' ? 'success' : 'warning'}
                  >
                    {reporte.estado}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  )
}
