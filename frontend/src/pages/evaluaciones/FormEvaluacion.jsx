import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { ClockIcon, CheckCircleIcon } from '../../components/ui/Icons.jsx'
import { fetchPreguntas, submitEvaluacion } from '../../api/evaluacionesApi.js'

const TIEMPO_LIMITE = 10 * 60

export default function FormEvaluacion() {
  const navigate = useNavigate()
  const { id } = useParams()
  const numId = Number(id)

  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [respuestas, setRespuestas] = useState({})
  const [enviado, setEnviado] = useState(false)
  const [segundos, setSegundos] = useState(TIEMPO_LIMITE)

  useEffect(() => {
    if (!id || isNaN(numId)) {
      navigate('/capacitaciones', { replace: true })
      return
    }
    const load = async () => {
      try {
        const res = await fetchPreguntas(numId)
        setData(res.data.data)
      } catch (err) {
        setError(err?.response?.data?.message || 'No se pudo cargar la evaluación')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, numId, navigate])

  const handleEnviar = useCallback(async (timeout = false) => {
    if (enviado || !data) return
    setEnviado(true)

    const respuestasArray = data.preguntas.map((p) => ({
      pregunta_id: p.id,
      opcion_id: respuestas[p.id] ?? null,
    })).filter((r) => r.opcion_id !== null)

    const evaluacion_id = numId
    const capacitacion_id = data.evaluacion?.capacitacion_id ?? null

    try {
      const res = await submitEvaluacion(evaluacion_id, respuestasArray)
      const { puntaje, aprobado, correctas, total, certificado } = res.data.data
      navigate('/evaluaciones/resultado', {
        state: { puntaje, aprobado, correctas, total, timeout, certificado, evaluacion_id, capacitacion_id },
      })
    } catch (err) {
      const msg = err?.response?.data?.message || 'Error al enviar la evaluación'
      navigate('/evaluaciones/resultado', {
        state: { puntaje: 0, aprobado: false, correctas: 0, total: data.preguntas.length, timeout, error: msg, evaluacion_id, capacitacion_id },
      })
    }
  }, [enviado, data, respuestas, numId, navigate])

  useEffect(() => {
    if (enviado || loading) return
    const interval = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) { clearInterval(interval); handleEnviar(true); return 0 }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [enviado, loading, handleEnviar])

  const minutos = Math.floor(segundos / 60)
  const segs = String(segundos % 60).padStart(2, '0')
  const timerRojo = segundos < 120

  const seleccionar = (pregId, opcionId) => {
    if (enviado) return
    setRespuestas((prev) => ({ ...prev, [pregId]: opcionId }))
  }

  if (loading) {
    return (
      <PageWrapper title="Cargando evaluación..." subtitle="">
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-container-high" />
          ))}
        </div>
      </PageWrapper>
    )
  }

  if (error || !data) {
    return (
      <PageWrapper title="Error" subtitle="">
        <div className="rounded-xl bg-error-container p-6 text-body-sm text-error">{error}</div>
      </PageWrapper>
    )
  }

  const { evaluacion, preguntas } = data
  const respondidas = Object.keys(respuestas).length
  const progreso = Math.round((respondidas / preguntas.length) * 100)

  return (
    <PageWrapper
      title={`Evaluación: ${evaluacion.titulo}`}
      subtitle={`Puntaje mínimo para aprobar: ${evaluacion.puntaje_minimo}%`}
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
              <span className="mr-2 text-on-surface-variant">{idx + 1}.</span>{p.enunciado}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {(p.opciones ?? []).map((op, opIdx) => {
                const seleccionada = respuestas[p.id] === op.id
                return (
                  <button key={op.id} onClick={() => seleccionar(p.id, op.id)}
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
                    {op.texto}
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
        <button onClick={() => handleEnviar(false)} disabled={respondidas === 0 || enviado}
          className="rounded-lg bg-primary px-6 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-40">
          {enviado ? 'Enviando...' : 'Enviar evaluación'}
        </button>
      </div>
    </PageWrapper>
  )
}
