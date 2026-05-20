import { Link } from 'react-router-dom'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'
import { ROUTES } from '../../utils/constants.js'

export default function RecuperarPassword() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-gutter py-stack-lg">
      <div className="w-full max-w-md rounded-lg border border-outline-variant bg-surface-container-lowest p-8 shadow-elevation-2">
        <div className="mb-stack-lg space-y-2">
          <p className="text-label-sm uppercase text-on-surface-variant">
            Recuperacion
          </p>
          <h1 className="text-headline-lg font-semibold text-on-surface">
            Restablecer contrasena
          </h1>
          <p className="text-body-sm text-on-surface-variant">
            Enviaremos un enlace seguro al correo registrado.
          </p>
        </div>

        <form className="space-y-stack-md">
          <Input
            label="Correo institucional"
            name="email"
            type="email"
            placeholder="usuario@sst.local"
          />
          <Button type="submit" className="w-full">
            Enviar enlace
          </Button>
        </form>

        <div className="mt-stack-md text-body-sm">
          <Link to={ROUTES.LOGIN} className="font-medium text-primary">
            Volver al inicio de sesion
          </Link>
        </div>
      </div>
    </div>
  )
}
