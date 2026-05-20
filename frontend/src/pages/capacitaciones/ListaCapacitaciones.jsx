import { Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'

const capacitaciones = [
  { id: 1, titulo: 'Trabajo en alturas', estado: 'Activa', vigencia: '2026-06-30' },
  { id: 2, titulo: 'Uso de EPP', estado: 'Activa', vigencia: '2026-05-18' },
  { id: 3, titulo: 'Prevencion de incendios', estado: 'Vencida', vigencia: '2026-04-10' },
]

export default function ListaCapacitaciones() {
  return (
    <PageWrapper
      title="Capacitaciones"
      subtitle="Catalogo"
      actions={
        <Button as={Link} to="/capacitaciones/nueva">
          Crear capacitacion
        </Button>
      }
    >
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-primary text-on-primary">
            <tr>
              <th className="px-4 py-3 text-label-md uppercase">Titulo</th>
              <th className="px-4 py-3 text-label-md uppercase">Vigencia</th>
              <th className="px-4 py-3 text-label-md uppercase">Estado</th>
              <th className="px-4 py-3 text-label-md uppercase">Accion</th>
            </tr>
          </thead>
          <tbody>
            {capacitaciones.map((item, index) => (
              <tr
                key={item.id}
                className={index % 2 === 0 ? 'bg-surface' : 'bg-surface-container'}
              >
                <td className="px-4 py-3 text-on-surface">{item.titulo}</td>
                <td className="px-4 py-3 text-on-surface-variant">{item.vigencia}</td>
                <td className="px-4 py-3">
                  <Badge variant={item.estado === 'Activa' ? 'success' : 'danger'}>
                    {item.estado}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    to={`/capacitaciones/${item.id}`}
                    className="text-primary"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  )
}
