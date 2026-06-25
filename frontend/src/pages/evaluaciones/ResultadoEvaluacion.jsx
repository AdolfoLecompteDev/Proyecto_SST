import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { CheckCircleIcon, AlertTriangleIcon, CertificateIcon, BarChartIcon } from '../../components/ui/Icons.jsx'
import { ROUTES } from '../../utils/constants.js'

export default function ResultadoEvaluacion() {
  const { state } = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (!state) navigate(ROUTES.CAPACITACIONES, { replace: true })
  }, [state, navigate])

  if (!state) return null

  const puntaje = state?.puntaje ?? 0
  const aprobado = state?.aprobado ?? false
  const correctas = state?.correctas ?? 0
  const total = state?.total ?? 0
  const timeout = state?.timeout ?? false
  const evaluacion_id = state?.evaluacion_id
  const capacitacion_id = state?.capacitacion_id

  const strokeDash = 283
  const strokeOffset = strokeDash - (strokeDash * puntaje) / 100

  return (
    <PageWrapper
      title="Resultado de Evaluación"
      subtitle={aprobado ? '¡Felicitaciones! Evaluación completada exitosamente.' : 'Evaluación completada.'}
    >
      <div className="mx-auto max-w-2xl">
        {/* Main result card */}
        <div className={`rounded-2xl border-2 p-8 text-center ${
          aprobado ? 'border-secondary bg-secondary-fixed/20' : 'border-error bg-error-container/20'
        }`}>
          {/* Score circle */}
          <div className="relative mx-auto mb-6 flex h-36 w-36 items-center justify-center">
            <svg className="-rotate-90 absolute inset-0" width="144" height="144" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-container-high" />
              <circle cx="50" cy="50" r="45" fill="none" strokeWidth="6"
                stroke={aprobado ? '#006c49' : '#ba1a1a'}
                strokeLinecap="round"
                strokeDasharray={strokeDash}
                strokeDashoffset={strokeOffset}
                style={{ transition: 'stroke-dashoffset 1s ease' }}
              />
            </svg>
            <div>
              <p className={`text-headline-lg font-bold ${aprobado ? 'text-secondary' : 'text-error'}`}>{Math.round(Number(puntaje))}%</p>
            </div>
          </div>

          {/* Status badge */}
          <div className={`inline-flex items-center gap-2 rounded-full px-5 py-2 text-body-md font-semibold ${
            aprobado ? 'bg-secondary text-on-secondary' : 'bg-error text-on-error'
          }`}>
            {aprobado ? <CheckCircleIcon size={18} /> : <AlertTriangleIcon size={18} />}
            {aprobado ? 'APROBADO' : 'NO APROBADO'}
          </div>

          {timeout && (
            <p className="mt-3 text-body-sm text-on-surface-variant">⏱ Evaluación enviada automáticamente por tiempo agotado.</p>
          )}

          {/* Stats */}
          <div className="mt-6 grid grid-cols-3 gap-4">
            {[
              { label: 'Correctas', value: correctas, icon: CheckCircleIcon, color: 'text-secondary' },
              { label: 'Incorrectas', value: total - correctas, icon: AlertTriangleIcon, color: 'text-error' },
              { label: 'Total', value: total, icon: BarChartIcon, color: 'text-on-surface' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="rounded-xl border border-outline-variant bg-white p-4">
                <Icon size={20} className={`mx-auto mb-1 ${color}`} />
                <p className="text-headline-lg font-bold text-on-surface">{value}</p>
                <p className="text-label-sm text-on-surface-variant">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Certificate or retry */}
        <div className="mt-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          {aprobado ? (
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-secondary-fixed">
                <CertificateIcon size={22} className="text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="text-body-md font-semibold text-on-surface">¡Certificado disponible!</h3>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  Tu certificado ha sido generado y está disponible en la sección de Certificados.
                </p>
                <div className="mt-4 flex gap-3">
                  <button onClick={() => navigate(ROUTES.CERTIFICADOS)}
                    className="rounded-lg bg-secondary px-5 py-2.5 text-body-sm font-semibold text-on-secondary hover:opacity-85">
                    Ver mis certificados
                  </button>
                  <button onClick={() => navigate(ROUTES.CAPACITACIONES)}
                    className="rounded-lg border border-outline px-5 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
                    Volver a capacitaciones
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-error-container">
                <AlertTriangleIcon size={22} className="text-error" />
              </div>
              <div className="flex-1">
                <h3 className="text-body-md font-semibold text-on-surface">Necesitas repasar el material</h3>
                <p className="mt-1 text-body-sm text-on-surface-variant">
                  El puntaje mínimo para aprobar es 70%. Revisa el módulo nuevamente antes de reintentar.
                </p>
                <div className="mt-4 flex gap-3">
                  {evaluacion_id && (
                    <button onClick={() => navigate(`/evaluaciones/${evaluacion_id}/preguntas`)}
                      className="rounded-lg bg-primary px-5 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85">
                      Reintentar evaluación
                    </button>
                  )}
                  {capacitacion_id ? (
                    <button onClick={() => navigate(`/capacitaciones/${capacitacion_id}`)}
                      className="rounded-lg border border-outline px-5 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
                      Repasar módulo
                    </button>
                  ) : (
                    <button onClick={() => navigate(ROUTES.CAPACITACIONES)}
                      className="rounded-lg border border-outline px-5 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
                      Volver a capacitaciones
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
