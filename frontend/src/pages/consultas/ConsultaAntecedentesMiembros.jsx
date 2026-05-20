import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'
import Input from '../../components/ui/Input.jsx'

export default function ConsultaAntecedentesMiembros() {
  return (
    <PageWrapper title="Consultar antecedentes" subtitle="Antecedentes">
      <form className="max-w-2xl space-y-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <Input label="Documento" name="documento" placeholder="Cedula del empleado" />
        <Input label="Entidad" name="entidad" placeholder="Fiscalia / Policia" />
        <div className="flex justify-end">
          <Button type="submit">Consultar</Button>
        </div>
      </form>
    </PageWrapper>
  )
}
