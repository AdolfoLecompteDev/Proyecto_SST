import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useEmpresa } from '../../hooks/useEmpresa.js'
import { ROUTES } from '../../utils/constants.js'
import {
  ShieldIcon, GridIcon, GraduationCapIcon,
  CertificateIcon, BarChartIcon, UsersIcon, LogOutIcon, BellIcon,
} from '../ui/Icons.jsx'

const NAV_ITEMS = [
  { label: 'Dashboard',      to: ROUTES.DASHBOARD,      icon: GridIcon,         end: true,  adminOnly: false },
  { label: 'Capacitaciones', to: ROUTES.CAPACITACIONES, icon: GraduationCapIcon,end: false, adminOnly: false },
  { label: 'Certificados',   to: ROUTES.CERTIFICADOS,   icon: CertificateIcon,  end: false, adminOnly: false },
  { label: 'Reportes',       to: ROUTES.SEGUIMIENTO,    icon: BarChartIcon,     end: false, adminOnly: true  },
  { label: 'Usuarios',       to: ROUTES.USUARIOS,       icon: UsersIcon,        end: false, adminOnly: true  },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const empresa = useEmpresa()
  const esAdmin = user?.rol === 'ADMIN' || user?.rol === 'SUPER_USUARIO'

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || esAdmin)

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <ShieldIcon size={18} className="text-on-primary" />
        </div>
        <div>
          <p className="text-body-sm font-semibold leading-tight text-on-surface">{empresa}</p>
          <p className="text-label-sm text-on-surface-variant">Safety Management</p>
        </div>
      </div>

      {/* Quick action */}
      <div className="px-4 pb-4">
        <button
          onClick={() => navigate(ROUTES.NOTIFICACIONES)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary transition-opacity hover:opacity-85"
        >
          <BellIcon size={16} />
          Notificaciones
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {visibleItems.map(({ label, to, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              [
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium transition-colors',
                isActive
                  ? 'bg-surface-container text-on-surface border-r-2 border-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface',
              ].join(' ')
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? 'text-primary' : ''} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Rol badge + Logout */}
      <div className="border-t border-outline-variant px-3 py-4 space-y-1">
        <div className="px-3 py-1.5">
          <p className="text-label-sm text-on-surface-variant truncate">{user?.nombre} {user?.apellido}</p>
          <span className={`text-label-sm font-medium ${esAdmin ? 'text-primary' : 'text-secondary'}`}>
            {user?.rol === 'SUPER_USUARIO' ? 'Super Usuario' : user?.rol === 'ADMIN' ? 'Administrador' : 'Funcionario'}
          </span>
        </div>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-body-sm font-medium text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
        >
          <LogOutIcon size={18} />
          Cerrar Sesión
        </button>
      </div>
    </aside>
  )
}
