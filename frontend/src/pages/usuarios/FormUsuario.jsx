import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function FormUsuario() {
  return (
    <PageWrapper title="Nuevo usuario" subtitle="Administracion de usuarios">
      <form className="max-w-2xl space-y-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="grid gap-stack-md md:grid-cols-2">
          <Input label="Nombre" name="nombre" placeholder="Nombre" />
          <Input label="Apellido" name="apellido" placeholder="Apellido" />
        </div>
        <Input label="Correo institucional" name="email" type="email" />
        <Input label="Documento" name="documento" placeholder="Cedula" />
        <div className="flex justify-end gap-3">
          <Button variant="secondary">Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </PageWrapper>
  )
}
