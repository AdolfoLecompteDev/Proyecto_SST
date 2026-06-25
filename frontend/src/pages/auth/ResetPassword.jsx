import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { restablecerPassword } from '../../api/authApi.js'
import { ROUTES } from '../../utils/constants.js'

function ShieldIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L3 7V12C3 16.55 6.84 20.74 12 22C17.16 20.74 21 16.55 21 12V7L12 2Z" fill="#006c49" />
      <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!password || !confirmPassword) return
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }
    
    setError(null)
    setLoading(true)
    
    try {
      await restablecerPassword(token, password)
      setSuccess(true)
      setTimeout(() => navigate(ROUTES.LOGIN), 3000)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al restablecer la contraseña')
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
            Nueva<br />Contraseña
          </h2>
          <p className="mt-4 max-w-sm text-body-md text-on-tertiary-container">
            Ingresa tu nueva contraseña para acceder al sistema.
          </p>
        </div>
        <div className="px-10 py-6 text-label-sm text-on-tertiary-container">
          © 2024 SST Enterprise Systems. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full items-center justify-center bg-white px-gutter py-stack-lg lg:w-1/2">
        <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-white p-8 shadow-elevation-2">
          {!success ? (
            <>
              <div className="mb-stack-lg">
                <h1 className="text-headline-lg font-semibold text-on-surface">Nueva Contraseña</h1>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  Establece una contraseña segura (mínimo 6 caracteres).
                </p>
              </div>

              {error && (
                <div className="mb-4 rounded-md bg-error-container p-3 text-body-sm text-error">
                  {error}
                </div>
              )}

              <form className="space-y-stack-md" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-body-sm font-medium text-on-surface">Contraseña</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><LockIcon /></span>
                    <input type="password" placeholder="••••••" value={password} onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-md border border-outline bg-white py-2.5 pl-10 pr-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-body-sm font-medium text-on-surface">Confirmar Contraseña</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><LockIcon /></span>
                    <input type="password" placeholder="••••••" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-md border border-outline bg-white py-2.5 pl-10 pr-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-md bg-primary py-3 text-body-md font-semibold text-on-primary transition-opacity hover:opacity-80 disabled:opacity-50">
                  {loading ? 'Guardando...' : 'Restablecer contraseña'}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary-fixed">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#006c49" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="text-headline-md font-semibold text-on-surface">¡Contraseña actualizada!</h2>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Serás redirigido al inicio de sesión en unos segundos.
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to={ROUTES.LOGIN} className="text-body-sm font-medium text-on-surface no-underline hover:text-primary">
              ← Volver al inicio de sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
