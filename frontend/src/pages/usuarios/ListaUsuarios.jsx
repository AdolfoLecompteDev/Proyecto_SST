import { useEffect, useState, useCallback } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { UserPlusIcon, SearchIcon, PencilIcon, BanIcon, ChevronDownIcon, CheckCircleIcon, RefreshIcon } from '../../components/ui/Icons.jsx'
import FormUsuario from './FormUsuario.jsx'
import { fetchUsers, toggleUserEstado } from '../../api/usersApi.js'

const rolOpciones = ['Todos los Roles', 'SUPER_USUARIO', 'ADMIN', 'FUNCIONARIO']
const estadoOpciones = ['Todos los Estados', 'Activo', 'Inactivo']

const estadoBadge = {
  true: 'bg-secondary-fixed text-on-secondary-fixed',
  false: 'bg-surface-container-high text-on-surface-variant',
}

function formatFecha(ts) {
  if (!ts) return '—'
  const d = new Date(ts)
  const now = new Date()
  const diffDays = Math.floor((now - d) / 86400000)
  if (diffDays === 0) return `Hoy, ${d.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}`
  if (diffDays === 1) return `Ayer`
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ListaUsuarios() {
  const [usuarios, setUsuarios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')
  const [rolFiltro, setRolFiltro] = useState('Todos los Roles')
  const [estadoFiltro, setEstadoFiltro] = useState('Todos los Estados')
  const [modal, setModal] = useState(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchUsers()
      setUsuarios(res.data.data)
      setError(null)
    } catch {
      setError('No se pudieron cargar los usuarios')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const filtrados = usuarios.filter((u) => {
    const matchB = !busqueda || `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(busqueda.toLowerCase())
    const matchR = rolFiltro === 'Todos los Roles' || u.rol === rolFiltro
    const matchE = estadoFiltro === 'Todos los Estados' || (estadoFiltro === 'Activo' ? u.estado : !u.estado)
    return matchB && matchR && matchE
  })

  const handleGuardar = () => {
    setModal(null)
    load()
  }

  const handleToggle = async (id) => {
    try {
      await toggleUserEstado(id)
      setUsuarios((prev) => prev.map((u) => u.id === id ? { ...u, estado: !u.estado } : u))
    } catch {
      alert('No se pudo cambiar el estado del usuario')
    }
  }

  return (
    <PageWrapper
      title="Gestión de Usuarios"
      subtitle="Administra accesos al sistema, roles y privilegios administrativos."
      actions={
        <div className="flex gap-2">
          <button onClick={load} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2.5 text-body-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">
            <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={() => setModal('nuevo')}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85">
            <UserPlusIcon size={15} /> Agregar Usuario
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-error-container px-4 py-3 text-body-sm text-error">{error}</div>
      )}

      {/* Filters */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative min-w-60 flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><SearchIcon size={15} /></span>
          <input type="search" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
            className="w-full rounded-lg border border-outline bg-white py-2.5 pl-9 pr-3 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
        </div>
        {[{ val: rolFiltro, set: setRolFiltro, opts: rolOpciones }, { val: estadoFiltro, set: setEstadoFiltro, opts: estadoOpciones }].map(({ val, set, opts }) => (
          <div key={opts[0]} className="relative">
            <select value={val} onChange={(e) => set(e.target.value)}
              className="appearance-none rounded-lg border border-outline bg-white py-2.5 pl-3 pr-8 text-body-sm text-on-surface focus:border-primary focus:outline-none">
              {opts.map((o) => <option key={o}>{o}</option>)}
            </select>
            <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant"><ChevronDownIcon size={14} /></span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full">
          <thead className="bg-primary text-on-primary">
            <tr>
              {['Usuario', 'Rol', 'Estado', 'Último Acceso', 'Acciones'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-label-sm font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-surface-container-high" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-body-sm text-on-surface-variant">
                  Sin usuarios que coincidan con los filtros
                </td>
              </tr>
            ) : (
              filtrados.map((u) => (
                <tr key={u.id} className="hover:bg-surface-container-low">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-surface-container text-label-sm font-bold text-on-surface">
                        {u.nombre[0]}{u.apellido[0]}
                      </div>
                      <div>
                        <p className="text-body-sm font-medium text-on-surface">{u.nombre} {u.apellido}</p>
                        <p className="text-label-sm text-on-surface-variant">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="rounded-md border border-outline-variant px-2.5 py-1 text-label-sm text-on-surface">{u.rol}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium ${estadoBadge[u.estado]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.estado ? 'bg-secondary' : 'bg-on-surface-variant'}`} />
                      {u.estado ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-on-surface-variant">{formatFecha(u.ultimo_login)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setModal(u)} title="Editar" className="text-on-surface-variant hover:text-on-surface">
                        <PencilIcon size={16} />
                      </button>
                      <button onClick={() => handleToggle(u.id)} title={u.estado ? 'Desactivar' : 'Activar'}
                        className={u.estado ? 'text-on-surface-variant hover:text-error' : 'text-on-surface-variant hover:text-secondary'}>
                        {u.estado ? <BanIcon size={16} /> : <CheckCircleIcon size={16} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-outline-variant px-5 py-3 text-body-sm text-on-surface-variant">
          Mostrando {loading ? '...' : `${filtrados.length} de ${usuarios.length}`} usuarios
        </div>
      </div>

      {modal && (
        <FormUsuario
          usuario={modal === 'nuevo' ? null : modal}
          onClose={() => setModal(null)}
          onGuardar={handleGuardar}
        />
      )}
    </PageWrapper>
  )
}
