import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../utils/constants.js'
import {
  ShieldIcon, GridIcon, GraduationCapIcon, ShieldCheckIcon,
  CertificateIcon, BarChartIcon, UsersIcon, LogOutIcon, PlusIcon,
} from '../ui/Icons.jsx'

const navItems = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: GridIcon, end: true },
  { label: 'Capacitaciones', to: ROUTES.CAPACITACIONES, icon: GraduationCapIcon },
  { label: 'Verificación', to: ROUTES.CONSULTAS_ANTECEDENTES, icon: ShieldCheckIcon },
  { label: 'Certificados', to: ROUTES.CERTIFICADOS, icon: CertificateIcon },
  { label: 'Reportes', to: ROUTES.SEGUIMIENTO, icon: BarChartIcon },
  { label: 'Usuarios', to: ROUTES.USUARIOS, icon: UsersIcon },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate(ROUTES.LOGIN)
  }

  return (
    <aside className="flex h-screen w-60 flex-shrink-0 flex-col border-r border-outline-variant bg-surface-container-lowest">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
          <ShieldIcon size={18} className="text-on-primary" />
        </div>
        <div>
          <p className="text-body-sm font-semibold leading-tight text-on-surface">SST Enterprise</p>
          <p className="text-label-sm text-on-surface-variant">Safety Management</p>
        </div>
      </div>

      {/* New Audit button */}
      <div className="px-4 pb-4">
        <button
          onClick={() => navigate(ROUTES.CAPACITACIONES_NUEVA)}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary transition-opacity hover:opacity-85"
        >
          <PlusIcon size={16} />
          Nueva Auditoría
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map(({ label, to, icon: Icon, end }) => (
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

      {/* Logout */}
      <div className="border-t border-outline-variant px-3 py-4">
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
