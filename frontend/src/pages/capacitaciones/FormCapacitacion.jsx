import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function FormCapacitacion() {
  return (
    <PageWrapper title="Nueva capacitacion" subtitle="Catalogo">
      <form className="max-w-2xl space-y-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <Input label="Titulo" name="titulo" placeholder="Titulo de la capacitacion" />
        <Input
          label="Categoria"
          name="categoria"
          placeholder="Seguridad en el Trabajo"
        />
        <Input label="Fecha de vigencia" name="vigencia" type="date" />
        <div className="flex justify-end gap-3">
          <Button variant="secondary">Cancelar</Button>
          <Button type="submit">Guardar</Button>
        </div>
      </form>
    </PageWrapper>
  )
}
