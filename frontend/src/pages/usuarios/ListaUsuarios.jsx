import { Link } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import { ROUTES } from '../../utils/constants.js'

const usuarios = [
  { id: 1, nombre: 'Andrea Perez', rol: 'ADMIN', estado: 'Activo' },
  { id: 2, nombre: 'Luis Gomez', rol: 'FUNCIONARIO', estado: 'Activo' },
  { id: 3, nombre: 'Sofia Diaz', rol: 'FUNCIONARIO', estado: 'Inactivo' },
]

export default function ListaUsuarios() {
  return (
    <PageWrapper
      title="Usuarios"
      subtitle="Administracion"
      actions={
        <Button as={Link} to={ROUTES.USUARIOS_NUEVO}>
          Crear usuario
        </Button>
      }
    >
      <div className="overflow-hidden rounded-lg border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-primary text-on-primary">
            <tr>
              <th className="px-4 py-3 text-label-md uppercase">Nombre</th>
              <th className="px-4 py-3 text-label-md uppercase">Rol</th>
              <th className="px-4 py-3 text-label-md uppercase">Estado</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario, index) => (
              <tr
                key={usuario.id}
                className={index % 2 === 0 ? 'bg-surface' : 'bg-surface-container'}
              >
                <td className="px-4 py-3 text-on-surface">{usuario.nombre}</td>
                <td className="px-4 py-3 text-on-surface-variant">{usuario.rol}</td>
                <td className="px-4 py-3">
                  <Badge variant={usuario.estado === 'Activo' ? 'success' : 'danger'}>
                    {usuario.estado}
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
