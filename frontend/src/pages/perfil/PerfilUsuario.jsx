import { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { CheckCircleIcon, ClockIcon, PencilIcon, ShieldCheckIcon } from '../../components/ui/Icons.jsx'
import { actualizarPerfil, cambiarPassword, fetchPerfilStats } from '../../api/authApi.js'

function formatFecha(iso) {
  if (!iso) return 'Nunca'
  return new Date(iso).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function PerfilUsuario() {
  const { user, login, token } = useAuth()

  const [form, setForm] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    email: user?.email || '',
    documento: user?.documento || '',
  })
  const [passForm, setPassForm] = useState({ actual: '', nueva: '', confirmar: '' })
  const [guardado, setGuardado] = useState(false)
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [apiError, setApiError] = useState('')
  const [passError, setPassError] = useState('')
  const [passOk, setPassOk] = useState(false)
  const [editando, setEditando] = useState(false)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchPerfilStats()
      .then((res) => setStats(res.data.data))
      .catch(() => {})
  }, [])

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const handlePassChange = (e) => {
    setPassForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setPassError('')
    setPassOk(false)
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    setApiError('')
    setGuardando(true)
    try {
      const res = await actualizarPerfil(form)
      login({ ...user, ...res.data.data }, token)
      setGuardado(true)
      setEditando(false)
      setTimeout(() => setGuardado(false), 3000)
    } catch (err) {
      setApiError(err.response?.data?.message || 'Error al guardar')
    } finally {
      setGuardando(false)
    }
  }

  const handleCambiarPass = async (e) => {
    e.preventDefault()
    if (!passForm.actual) { setPassError('Ingresa tu contraseña actual'); return }
    if (passForm.nueva.length < 6) { setPassError('La nueva contraseña debe tener mínimo 6 caracteres'); return }
    if (passForm.nueva !== passForm.confirmar) { setPassError('Las contraseñas no coinciden'); return }
    setPassError('')
    setGuardandoPass(true)
    try {
      await cambiarPassword({ actual: passForm.actual, nueva: passForm.nueva })
      setPassOk(true)
      setPassForm({ actual: '', nueva: '', confirmar: '' })
    } catch (err) {
      setPassError(err.response?.data?.message || 'Error al cambiar contraseña')
    } finally {
      setGuardandoPass(false)
    }
  }

  const initials = `${form.nombre[0] || ''}${form.apellido[0] || ''}`.toUpperCase()

  const rolColors = {
    SUPER_USUARIO: 'bg-primary text-on-primary',
    ADMIN: 'bg-secondary text-on-secondary',
    FUNCIONARIO: 'bg-surface-container-high text-on-surface',
  }

  return (
    <PageWrapper title="Mi Perfil" subtitle="Información personal y configuración de cuenta.">
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Left: avatar + info */}
        <div className="space-y-4">
          <div className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-6 text-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary text-headline-lg font-bold text-on-primary">
              {initials}
            </div>
            <p className="text-body-md font-semibold text-on-surface">{form.nombre} {form.apellido}</p>
            <p className="text-body-sm text-on-surface-variant">{form.email}</p>
            <span className={`mt-3 rounded-full px-3 py-1 text-label-sm font-semibold ${rolColors[user?.rol] || rolColors.FUNCIONARIO}`}>
              {user?.rol}
            </span>
          </div>

          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">Actividad</p>
            <div className="space-y-2.5 text-body-sm">
              <div className="flex items-center gap-2 text-on-surface-variant">
                <ClockIcon size={14} />
                Último acceso: {stats ? formatFecha(stats.ultimo_login) : '…'}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <CheckCircleIcon size={14} />
                {stats ? `${stats.certificados_total} certificado${stats.certificados_total !== '1' ? 's' : ''} obtenido${stats.certificados_total !== '1' ? 's' : ''}` : '…'}
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <ShieldCheckIcon size={14} />
                {stats ? `${stats.evaluaciones_aprobadas} evaluación${stats.evaluaciones_aprobadas !== '1' ? 'es' : ''} aprobada${stats.evaluaciones_aprobadas !== '1' ? 's' : ''}` : '…'}
              </div>
            </div>
          </div>
        </div>

        {/* Right: forms */}
        <div className="space-y-4">
          {/* Personal info */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-body-lg font-semibold text-on-surface">Información Personal</h2>
              <button onClick={() => { setEditando((v) => !v); setApiError('') }}
                className="flex items-center gap-1.5 text-body-sm text-on-surface-variant hover:text-on-surface">
                <PencilIcon size={14} /> {editando ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            <form onSubmit={handleGuardar} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {[{ name: 'nombre', label: 'Nombre' }, { name: 'apellido', label: 'Apellido' }].map(({ name, label }) => (
                  <div key={name}>
                    <label className="mb-1 block text-body-sm font-medium text-on-surface">{label}</label>
                    <input name={name} value={form[name]} onChange={handleChange} disabled={!editando}
                      className="w-full rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface disabled:bg-surface-container-low disabled:text-on-surface-variant focus:border-primary focus:outline-none" />
                  </div>
                ))}
              </div>
              <div>
                <label className="mb-1 block text-body-sm font-medium text-on-surface">Correo institucional</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} disabled={!editando}
                  className="w-full rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface disabled:bg-surface-container-low disabled:text-on-surface-variant focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-body-sm font-medium text-on-surface">Documento</label>
                <input name="documento" value={form.documento} onChange={handleChange} disabled={!editando} placeholder="Cédula de ciudadanía"
                  className="w-full rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface disabled:bg-surface-container-low disabled:text-on-surface-variant focus:border-primary focus:outline-none" />
              </div>

              {apiError && <p className="rounded-lg bg-error-container px-3 py-2 text-body-sm text-error">{apiError}</p>}

              {editando && (
                <div className="flex items-center gap-3 pt-1">
                  <button type="submit" disabled={guardando}
                    className="rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-60">
                    {guardando ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                  {guardado && (
                    <span className="flex items-center gap-1.5 text-body-sm text-secondary">
                      <CheckCircleIcon size={14} /> Guardado correctamente
                    </span>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Change password */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-5 text-body-lg font-semibold text-on-surface">Cambiar Contraseña</h2>
            <form onSubmit={handleCambiarPass} className="space-y-4">
              {[
                { name: 'actual', label: 'Contraseña actual' },
                { name: 'nueva', label: 'Nueva contraseña' },
                { name: 'confirmar', label: 'Confirmar nueva contraseña' },
              ].map(({ name, label }) => (
                <div key={name}>
                  <label className="mb-1 block text-body-sm font-medium text-on-surface">{label}</label>
                  <input name={name} type="password" value={passForm[name]} onChange={handlePassChange} placeholder="••••••••"
                    className="w-full rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface focus:border-primary focus:outline-none" />
                </div>
              ))}
              {passError && <p className="rounded-lg bg-error-container px-3 py-2 text-body-sm text-error">{passError}</p>}
              {passOk && (
                <p className="flex items-center gap-1.5 text-body-sm text-secondary">
                  <CheckCircleIcon size={14} /> Contraseña actualizada correctamente
                </p>
              )}
              <button type="submit" disabled={guardandoPass}
                className="rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-60">
                {guardandoPass ? 'Actualizando…' : 'Actualizar contraseña'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
