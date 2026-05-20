import { NavLink } from 'react-router-dom'
import { ROUTES } from '../../utils/constants.js'

const navItems = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD },
  { label: 'Usuarios', to: ROUTES.USUARIOS },
  { label: 'Capacitaciones', to: ROUTES.CAPACITACIONES },
  { label: 'Evaluaciones', to: ROUTES.EVALUACIONES },
  { label: 'Certificados', to: ROUTES.CERTIFICADOS },
  { label: 'Seguimiento', to: ROUTES.SEGUIMIENTO },
  { label: 'Consultas', to: ROUTES.CONSULTAS },
]

export default function Sidebar() {
  return (
    <aside className="hidden w-64 border-r border-outline-variant bg-surface-container-lowest md:block">
      <nav className="space-y-1 px-4 py-6">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === ROUTES.DASHBOARD}
            className={({ isActive }) =>
              [
                'block rounded-md px-3 py-2 text-body-sm font-medium transition-colors',
                isActive
                  ? 'bg-surface-container text-primary'
                  : 'text-on-surface-variant hover:bg-surface-container-low',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
