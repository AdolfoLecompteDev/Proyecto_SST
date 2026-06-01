import { useState, useEffect } from 'react'
import { XIcon, ChevronDownIcon } from '../../components/ui/Icons.jsx'

const ROLES = ['SUPER_USUARIO', 'ADMIN', 'FUNCIONARIO']

export default function FormUsuario({ usuario = null, onClose, onGuardar }) {
  const esEdicion = Boolean(usuario)

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    documento: '',
    rol: 'FUNCIONARIO',
    password: '',
    estado: true,
  })
  const [errores, setErrores] = useState({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (usuario) {
      setForm({
        nombre: usuario.nombre || '',
        apellido: usuario.apellido || '',
        email: usuario.email || '',
        documento: usuario.documento || '',
        rol: usuario.rol || 'FUNCIONARIO',
        password: '',
        estado: usuario.estado ?? true,
      })
    }
  }, [usuario])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (errores[name]) setErrores((prev) => ({ ...prev, [name]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'Requerido'
    if (!form.apellido.trim()) e.apellido = 'Requerido'
    if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Correo inválido'
    if (!esEdicion && !form.password) e.password = 'Requerido para nuevo usuario'
    if (!esEdicion && form.password && form.password.length < 6) e.password = 'Mínimo 6 caracteres'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErrores(errs); return }
    setLoading(true)
    await new Promise((r) => setTimeout(r, 600))
    onGuardar({ ...form, id: usuario?.id ?? Date.now() })
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-elevation-2">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-outline-variant px-6 py-4">
          <h2 className="text-body-lg font-semibold text-on-surface">
            {esEdicion ? 'Editar Usuario' : 'Nuevo Usuario'}
          </h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface">
            <XIcon size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            {[{ name: 'nombre', label: 'Nombre' }, { name: 'apellido', label: 'Apellido' }].map(({ name, label }) => (
              <div key={name}>
                <label className="mb-1 block text-body-sm font-medium text-on-surface">{label}</label>
                <input name={name} value={form[name]} onChange={handleChange} placeholder={label}
                  className={`w-full rounded-lg border px-3 py-2.5 text-body-sm text-on-surface focus:outline-none ${errores[name] ? 'border-error focus:border-error' : 'border-outline focus:border-primary'}`} />
                {errores[name] && <p className="mt-1 text-label-sm text-error">{errores[name]}</p>}
              </div>
            ))}
          </div>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-on-surface">Correo Institucional</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="usuario@empresa.com"
              className={`w-full rounded-lg border px-3 py-2.5 text-body-sm text-on-surface focus:outline-none ${errores.email ? 'border-error' : 'border-outline focus:border-primary'}`} />
            {errores.email && <p className="mt-1 text-label-sm text-error">{errores.email}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-body-sm font-medium text-on-surface">Documento</label>
              <input name="documento" value={form.documento} onChange={handleChange} placeholder="Cédula"
                className="w-full rounded-lg border border-outline px-3 py-2.5 text-body-sm text-on-surface focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="mb-1 block text-body-sm font-medium text-on-surface">Rol</label>
              <div className="relative">
                <select name="rol" value={form.rol} onChange={handleChange}
                  className="w-full appearance-none rounded-lg border border-outline bg-white px-3 py-2.5 pr-8 text-body-sm text-on-surface focus:border-primary focus:outline-none">
                  {ROLES.map((r) => <option key={r}>{r}</option>)}
                </select>
                <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant">
                  <ChevronDownIcon size={14} />
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-body-sm font-medium text-on-surface">
              {esEdicion ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
            </label>
            <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••"
              className={`w-full rounded-lg border px-3 py-2.5 text-body-sm text-on-surface focus:outline-none ${errores.password ? 'border-error' : 'border-outline focus:border-primary'}`} />
            {errores.password && <p className="mt-1 text-label-sm text-error">{errores.password}</p>}
          </div>

          {esEdicion && (
            <label className="flex cursor-pointer items-center gap-2.5 text-body-sm text-on-surface">
              <input type="checkbox" name="estado" checked={form.estado} onChange={handleChange} className="h-4 w-4 rounded accent-primary" />
              Cuenta activa
            </label>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="rounded-lg border border-outline px-5 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-50">
              {loading ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear usuario'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
