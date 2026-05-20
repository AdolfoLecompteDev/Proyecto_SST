import PageWrapper from '../../components/layout/PageWrapper.jsx'
import Button from '../../components/ui/Button.jsx'

const preguntas = [
  { id: 1, texto: 'El uso de arnes es obligatorio en trabajo en alturas.' },
  { id: 2, texto: 'Las inspecciones de EPP se realizan cada mes.' },
]

export default function FormEvaluacion() {
  return (
    <PageWrapper title="Evaluacion" subtitle="Capacitaciones">
      <section className="space-y-stack-md rounded-lg border border-outline-variant bg-surface-container-lowest p-6">
        {preguntas.map((pregunta) => (
          <div key={pregunta.id} className="space-y-3">
            <p className="text-body-md text-on-surface">{pregunta.texto}</p>
            <div className="flex gap-4 text-body-sm text-on-surface-variant">
              <label className="flex items-center gap-2">
                <input type="radio" name={`q${pregunta.id}`} />
                Verdadero
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name={`q${pregunta.id}`} />
                Falso
              </label>
            </div>
          </div>
        ))}
        <div className="flex justify-end">
          <Button type="submit">Enviar respuestas</Button>
        </div>
      </section>
    </PageWrapper>
  )
}
