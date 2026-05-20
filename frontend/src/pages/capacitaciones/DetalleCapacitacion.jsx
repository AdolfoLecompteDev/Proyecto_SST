import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Badge from '../../components/ui/Badge.jsx'

export default function DetalleCapacitacion() {
  return (
    <PageWrapper title="Detalle de capacitacion" subtitle="Capacitaciones">
      <section className="grid gap-stack-md lg:grid-cols-3">
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 lg:col-span-2">
          <h3 className="text-headline-md font-semibold text-on-surface">
            Trabajo seguro en alturas
          </h3>
          <p className="mt-3 text-body-md text-on-surface-variant">
            Resumen del contenido, videos y documentos adjuntos para la
            capacitacion.
          </p>
          <div className="mt-stack-md flex gap-3">
            <Badge variant="success">Activa</Badge>
            <Badge variant="warning">Vigente hasta 2026-06-30</Badge>
          </div>
        </div>
        <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
          <h4 className="text-label-md uppercase text-on-surface-variant">
            Recursos
          </h4>
          <ul className="mt-3 space-y-2 text-body-sm text-on-surface">
            <li>Video introductorio</li>
            <li>PDF normatividad</li>
            <li>Checklist de inspeccion</li>
          </ul>
        </div>
      </section>
    </PageWrapper>
  )
}
