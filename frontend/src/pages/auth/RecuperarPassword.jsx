import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '../../utils/constants.js'

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

export default function RecuperarPassword() {
  const [email, setEmail] = useState('')
  const [enviado, setEnviado] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1000))
    setEnviado(true)
    setLoading(false)
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
            Recuperación<br />de Acceso
          </h2>
          <p className="mt-4 max-w-sm text-body-md text-on-tertiary-container">
            Te enviaremos un enlace seguro para restablecer tu contraseña. El enlace expira en 30 minutos.
          </p>
        </div>
        <div className="px-10 py-6 text-label-sm text-on-tertiary-container">
          © 2024 SST Enterprise Systems. Todos los derechos reservados.
        </div>
      </div>

      {/* Right panel */}
      <div className="flex w-full items-center justify-center bg-white px-gutter py-stack-lg lg:w-1/2">
        <div className="w-full max-w-sm rounded-xl border border-outline-variant bg-white p-8 shadow-elevation-2">
          {!enviado ? (
            <>
              <div className="mb-stack-lg">
                <h1 className="text-headline-lg font-semibold text-on-surface">Restablecer contraseña</h1>
                <p className="mt-2 text-body-sm text-on-surface-variant">
                  Ingresa tu correo institucional y te enviaremos el enlace de recuperación.
                </p>
              </div>

              <form className="space-y-stack-md" onSubmit={handleSubmit}>
                <div>
                  <label className="mb-1 block text-body-sm font-medium text-on-surface">Correo Corporativo</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant"><MailIcon /></span>
                    <input type="email" placeholder="nombre@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-md border border-outline bg-white py-2.5 pl-10 pr-3 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full rounded-md bg-primary py-3 text-body-md font-semibold text-on-primary transition-opacity hover:opacity-80 disabled:opacity-50">
                  {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
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
              <h2 className="text-headline-md font-semibold text-on-surface">Correo enviado</h2>
              <p className="mt-2 text-body-sm text-on-surface-variant">
                Enviamos el enlace a <strong>{email}</strong>. Revisa tu bandeja de entrada y la carpeta de spam.
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
