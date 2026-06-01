import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { BellIcon, HelpCircleIcon, SettingsIcon, SearchIcon } from '../ui/Icons.jsx'
import { ROUTES } from '../../utils/constants.js'

const NOTIF_COUNT = 3

export default function Navbar() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const initials = user
    ? user.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : 'U'

  return (
    <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-outline-variant bg-surface-container-lowest px-6">
      {/* Search */}
      <div className="relative w-80">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
          <SearchIcon size={16} />
        </span>
        <input
          type="search"
          placeholder="Buscar..."
          className="w-full rounded-lg border border-outline-variant bg-surface-container-low py-2 pl-9 pr-4 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
        />
      </div>

      {/* Icons + avatar */}
      <div className="flex items-center gap-1">
        {/* Bell con badge */}
        <button
          onClick={() => navigate(ROUTES.NOTIFICACIONES)}
          className="relative flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <BellIcon size={18} />
          {NOTIF_COUNT > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-[10px] font-bold text-on-error">
              {NOTIF_COUNT}
            </span>
          )}
        </button>

        <button
          onClick={() => navigate(ROUTES.CONFIGURACION)}
          title="Ayuda"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <HelpCircleIcon size={18} />
        </button>

        <button
          onClick={() => navigate(ROUTES.CONFIGURACION)}
          title="Configuración"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
        >
          <SettingsIcon size={18} />
        </button>

        {/* Avatar → perfil */}
        <button
          onClick={() => navigate(ROUTES.PERFIL)}
          title="Mi perfil"
          className="ml-2 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-secondary text-body-sm font-semibold text-on-secondary hover:opacity-85"
        >
          {initials}
        </button>
      </div>
    </header>
  )
}
