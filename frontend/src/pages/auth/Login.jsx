import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { ROLES, ROUTES } from '../../utils/constants.js'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    login(
      { nombre: 'Admin Demo', rol: ROLES.ADMIN, email: form.email || 'admin@sst.local' },
      'demo-token',
    )
    navigate(ROUTES.DASHBOARD)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-gutter py-stack-lg">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-elevation-2">
        <div className="mb-stack-lg space-y-2">
          <p className="text-label-sm uppercase text-on-surface-variant">Acceso</p>
          <h1 className="text-headline-lg font-semibold text-on-surface">
            Ingresar al sistema
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Gestiona capacitaciones, evaluaciones y certificados SST.
          </p>
        </div>

        <form className="space-y-stack-md" onSubmit={handleSubmit}>
          <Input
            label="Correo institucional"
            name="email"
            type="email"
            placeholder="admin@sst.local"
            value={form.email}
            onChange={handleChange}
          />
          <Input
            label="Contrasena"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />

          <Button type="submit" className="w-full">
            Entrar
          </Button>
        </form>

        <div className="mt-stack-md flex items-center justify-between text-body-sm">
          <span className="text-on-surface-variant">Olvidaste tu acceso?</span>
          <Link to={ROUTES.RECUPERAR_PASSWORD} className="font-medium text-primary">
            Recuperar
          </Link>
        </div>
      </div>
    </div>
  )
}
