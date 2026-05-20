import Badge from '../../components/ui/Badge.jsx'
import PageWrapper from '../../components/layout/PageWrapper.jsx'

export default function ResultadoEvaluacion() {
  return (
    <PageWrapper title="Resultado de evaluacion" subtitle="Evaluaciones">
      <div className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-body-sm text-on-surface-variant">Puntaje</p>
            <p className="text-headline-lg font-semibold text-on-surface">92%</p>
          </div>
          <Badge variant="success">Aprobado</Badge>
        </div>
        <p className="mt-stack-md text-body-md text-on-surface-variant">
          Tu certificado estara disponible una vez se complete la generacion del
          PDF.
        </p>
      </div>
    </PageWrapper>
  )
}
