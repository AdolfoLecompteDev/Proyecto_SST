import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { ClockIcon, CheckCircleIcon } from '../../components/ui/Icons.jsx'

const preguntas = [
  {
    id: 1,
    texto: '¿Cuál es la altura mínima a partir de la cual se considera "trabajo en alturas" según la normativa colombiana?',
    opciones: ['1.0 metros', '1.5 metros', '1.8 metros', '2.0 metros'],
    correcta: 1,
  },
  {
    id: 2,
    texto: '¿Con qué frecuencia mínima se debe realizar la inspección del arnés de seguridad?',
    opciones: ['Mensualmente', 'Antes de cada uso', 'Cada semestre', 'Anualmente'],
    correcta: 1,
  },
  {
    id: 3,
    texto: '¿Qué elemento NO hace parte de un sistema de detención de caídas?',
    opciones: ['Arnés de cuerpo completo', 'Conector o eslinga', 'Casco de protección', 'Punto de anclaje'],
    correcta: 2,
  },
  {
    id: 4,
    texto: 'Según la Resolución 4272 de 2021, ¿quién puede autorizar el trabajo en alturas?',
    opciones: ['Cualquier supervisor', 'El coordinador de trabajo en alturas certificado', 'El trabajador mismo si tiene más de 2 años de experiencia', 'El jefe de área'],
    correcta: 1,
  },
  {
    id: 5,
    texto: '¿Cuál es el puntaje mínimo para aprobar esta evaluación?',
    opciones: ['60%', '65%', '70%', '80%'],
    correcta: 2,
  },
]

const TIEMPO_LIMITE = 10 * 60 // 10 minutos en segundos

export default function FormEvaluacion() {
  const navigate = useNavigate()
  const [respuestas, setRespuestas] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [segundos, setSegundos] = useState(TIEMPO_LIMITE)

  useEffect(() => {
    if (enviado) return
    const interval = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) { clearInterval(interval); handleEnviar(true); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [enviado])

  const minutos = Math.floor(segundos / 60)
  const segs = String(segundos % 60).padStart(2, '0')
  const timerRojo = segundos < 120

  const seleccionar = (pregId, opIdx) => {
    if (enviado) return
    setRespuestas((prev) => ({ ...prev, [pregId]: opIdx }))
  }

  const handleEnviar = (timeout = false) => {
    if (enviado) return
    setEnviado(true)
    const correctas = preguntas.filter((p) => respuestas[p.id] === p.correcta).length
    const puntaje = Math.round((correctas / preguntas.length) * 100)
    const aprobado = puntaje >= 70
    navigate('/evaluaciones/resultado', { state: { puntaje, aprobado, correctas, total: preguntas.length, timeout } })
  }

  const respondidas = Object.keys(respuestas).length
  const progreso = Math.round((respondidas / preguntas.length) * 100)

  return (
    <PageWrapper
      title="Evaluación: Trabajo en Alturas"
      subtitle="Responde todas las preguntas. Puntaje mínimo para aprobar: 70%"
    >
      {/* Header stats */}
      <div className="mb-6 grid grid-cols-3 gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <ClockIcon size={20} className={timerRojo ? 'text-error' : 'text-on-surface-variant'} />
          <div>
            <p className="text-label-sm text-on-surface-variant">Tiempo restante</p>
            <p className={`text-body-lg font-bold ${timerRojo ? 'text-error' : 'text-on-surface'}`}>
              {minutos}:{segs}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <CheckCircleIcon size={20} className="text-on-surface-variant" />
          <div>
            <p className="text-label-sm text-on-surface-variant">Respondidas</p>
            <p className="text-body-lg font-bold text-on-surface">{respondidas} / {preguntas.length}</p>
          </div>
        </div>
        <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
          <p className="mb-2 text-label-sm text-on-surface-variant">Progreso</p>
          <div className="h-2 rounded-full bg-surface-container-high">
            <div className="h-2 rounded-full bg-secondary transition-all" style={{ width: `${progreso}%` }} />
          </div>
          <p className="mt-1 text-right text-label-sm text-on-surface-variant">{progreso}%</p>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {preguntas.map((p, idx) => (
          <div key={p.id} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="mb-4 text-body-md font-medium text-on-surface">
              <span className="mr-2 text-on-surface-variant">{idx + 1}.</span>{p.texto}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {p.opciones.map((op, opIdx) => {
                const seleccionada = respuestas[p.id] === opIdx
                return (
                  <button key={opIdx} onClick={() => seleccionar(p.id, opIdx)}
                    className={`rounded-lg border px-4 py-3 text-left text-body-sm transition-colors ${
                      seleccionada
                        ? 'border-primary bg-primary/5 font-medium text-primary'
                        : 'border-outline-variant text-on-surface hover:border-primary hover:bg-surface-container-low'
                    }`}>
                    <span className={`mr-2.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border text-label-sm ${
                      seleccionada ? 'border-primary bg-primary text-on-primary' : 'border-outline text-on-surface-variant'
                    }`}>
                      {String.fromCharCode(65 + opIdx)}
                    </span>
                    {op}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-6 flex items-center justify-between rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <p className="text-body-sm text-on-surface-variant">
          {respondidas < preguntas.length
            ? `Faltan ${preguntas.length - respondidas} pregunta(s) por responder`
            : 'Todas las preguntas respondidas. ¡Listo para enviar!'}
        </p>
        <button onClick={() => handleEnviar(false)} disabled={respondidas === 0}
          className="rounded-lg bg-primary px-6 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-40">
          Enviar evaluación
        </button>
      </div>
    </PageWrapper>
  )
}
