import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { ROUTES } from '../../utils/constants.js'
import { login as loginApi } from '../../api/authApi.js'

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#006c49" />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
  )
}

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { setError('Completa todos los campos'); return }
    setLoading(true)
    try {
      const { data } = await loginApi({ email: form.email, password: form.password })
      login(data.data.user, data.data.token)
      navigate(ROUTES.DASHBOARD)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left panel */}
      <div className="bg-grid relative hidden flex-col bg-tertiary-container lg:flex lg:w-1/2">
        <div className="flex items-center gap-3 px-10 pt-10">
          <ShieldIcon />
          <span className="text-body-lg font-semibold text-white">SST Enterprise</span>
        </div>

        <div className="flex flex-1 flex-col justify-center px-10">
          <h2 className="text-headline-xl font-bold leading-tight text-white">
            Confiabilidad Operativa &<br />Autoridad Administrativa
          </h2>
          <p className="mt-4 max-w-sm text-body-md text-on-tertiary-container">
            El estándar de la industria para cumplimiento de seguridad, reporte de incidentes y
            gestión de salud. Herramientas precisas para una fuerza laboral segura.
          </p>
        </div>

        <div className="px-10 py-6 text-label-sm text-on-tertiary-container">
          © 2024 SST Enterprise Systems. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full items-center justify-center bg-white px-gutter py-stack-lg lg:w-1/2">
        <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-white p-8 shadow-elevation-2">
          <div className="mb-stack-lg">
            <h1 className="text-headline-lg font-semibold text-on-surface">Bienvenido</h1>
            <p className="mt-2 text-body-sm text-on-surface-variant">
              Ingresa tus credenciales para acceder al sistema.
            </p>
          </div>

          <form className="space-y-stack-md" onSubmit={handleSubmit}>
            <div>
              <label className="mb-1 block text-body-sm font-medium text-on-surface">Correo Corporativo</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><MailIcon /></span>
                <input name="email" type="email" placeholder="nombre@empresa.com" value={form.email} onChange={handleChange}
                  className="w-full rounded-md border border-outline bg-white py-2.5 pl-10 pr-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-body-sm font-medium text-on-surface">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><LockIcon /></span>
                <input name="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={handleChange}
                  className="w-full rounded-md border border-outline bg-white py-2.5 pl-10 pr-10 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface">
                  {showPassword ? <EyeIcon /> : <EyeOffIcon />}
                </button>
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-error-container px-3 py-2 text-body-sm text-on-error-container">{error}</p>
            )}

            <div className="flex items-center justify-between">
              <label className="flex cursor-pointer items-center gap-2 text-body-sm text-on-surface-variant">
                <input type="checkbox" name="remember" checked={form.remember} onChange={handleChange} className="h-4 w-4 rounded border-outline accent-primary" />
                Recordarme
              </label>
              <Link to={ROUTES.RECUPERAR_PASSWORD} className="text-body-sm font-medium text-on-surface no-underline hover:text-primary">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              className="mt-2 w-full rounded-md bg-primary py-3 text-body-md font-semibold text-on-primary transition-opacity hover:opacity-80 disabled:opacity-50">
              {loading ? 'Verificando...' : 'Ingresar al Panel'}
            </button>
          </form>

          <div className="mt-stack-lg flex items-center justify-center gap-2 text-body-sm text-on-surface-variant">
            <span className="h-2 w-2 rounded-full bg-secondary" />
            Todos los sistemas operativos
          </div>
        </div>
      </div>
    </div>
  )
}
