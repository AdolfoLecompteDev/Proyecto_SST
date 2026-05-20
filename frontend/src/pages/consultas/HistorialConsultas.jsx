import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Badge from '../../components/ui/Badge.jsx'

const consultas = [
  { id: 1, documento: '10203040', entidad: 'Fiscalia', estado: 'Exitosa' },
  { id: 2, documento: '90102030', entidad: 'Policia', estado: 'Fallida' },
]

export default function HistorialConsultas() {
  return (
    <PageWrapper title="Consultas externas" subtitle="Antecedentes">
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-primary text-on-primary">
            <tr>
              <th className="px-4 py-3 text-label-md uppercase">Documento</th>
              <th className="px-4 py-3 text-label-md uppercase">Entidad</th>
              <th className="px-4 py-3 text-label-md uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((consulta, index) => (
              <tr
                key={consulta.id}
                className={index % 2 === 0 ? 'bg-surface' : 'bg-surface-container'}
              >
                <td className="px-4 py-3 text-on-surface">{consulta.documento}</td>
                <td className="px-4 py-3 text-on-surface-variant">{consulta.entidad}</td>
                <td className="px-4 py-3">
                  <Badge variant={consulta.estado === 'Exitosa' ? 'success' : 'danger'}>
                    {consulta.estado}
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
