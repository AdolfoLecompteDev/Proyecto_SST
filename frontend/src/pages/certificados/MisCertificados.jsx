import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Button from '../../components/ui/Button.jsx'

const certificados = [
  { id: 1, titulo: 'Trabajo en alturas', estado: 'Vigente', fecha: '2026-06-30' },
  { id: 2, titulo: 'Manejo de equipos', estado: 'Vencido', fecha: '2026-03-12' },
]

export default function MisCertificados() {
  return (
    <PageWrapper title="Mis certificados" subtitle="Funcionarios">
      <div className="grid gap-stack-md md:grid-cols-2">
        {certificados.map((cert) => (
          <div
            key={cert.id}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-label-sm uppercase text-on-surface-variant">
                  Certificacion
                </p>
                <h3 className="text-headline-md font-semibold text-on-surface">
                  {cert.titulo}
                </h3>
              </div>
              <Badge variant={cert.estado === 'Vigente' ? 'success' : 'danger'}>
                {cert.estado}
              </Badge>
            </div>
            <p className="mt-stack-md text-body-sm text-on-surface-variant">
              Vence: {cert.fecha}
            </p>
            <Button variant="secondary" className="mt-stack-md">
              Descargar PDF
            </Button>
          </div>
        ))}
      </div>
    </PageWrapper>
  )
}
