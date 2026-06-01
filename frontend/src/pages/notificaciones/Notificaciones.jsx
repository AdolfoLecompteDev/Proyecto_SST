import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { CheckCircleIcon, AlertTriangleIcon, BellIcon, XIcon, ClockIcon } from '../../components/ui/Icons.jsx'

const tipoIcono = {
  success: { icon: CheckCircleIcon, cls: 'bg-secondary-fixed text-secondary' },
  warning: { icon: AlertTriangleIcon, cls: 'bg-error-container text-error' },
  info: { icon: BellIcon, cls: 'bg-primary-fixed text-on-primary-fixed' },
  system: { icon: ClockIcon, cls: 'bg-surface-container-high text-on-surface-variant' },
}

const notificacionesIniciales = [
  { id: 1, tipo: 'warning', titulo: 'Certificado por vencer', desc: 'Tu certificado de Primeros Auxilios Nivel II vence en 12 días. Programa tu renovación.', hora: 'Hace 5 min', leida: false },
  { id: 2, tipo: 'success', titulo: 'Evaluación aprobada', desc: 'Aprobaste la evaluación de Trabajo en Alturas con 88%. Tu certificado está siendo generado.', hora: 'Hace 1 hora', leida: false },
  { id: 3, tipo: 'info', titulo: 'Nueva capacitación disponible', desc: 'Se publicó el módulo "Ergonomía Laboral Avanzada". Ya está disponible en tu lista de capacitaciones.', hora: 'Hace 3 horas', leida: false },
  { id: 4, tipo: 'warning', titulo: 'Verificación con alerta', desc: 'La verificación de antecedentes de Jorge Silva Restrepo requiere revisión manual.', hora: 'Ayer 14:45', leida: true },
  { id: 5, tipo: 'system', titulo: 'Mantenimiento programado', desc: 'El sistema estará en mantenimiento el sábado 01 Jun de 2:00 AM a 4:00 AM.', hora: 'Ayer 09:00', leida: true },
  { id: 6, tipo: 'success', titulo: 'Usuario creado exitosamente', desc: 'El usuario Diana Prieto fue creado y tiene acceso al sistema con rol FUNCIONARIO.', hora: 'Hace 2 días', leida: true },
]

const tabs = ['Todas', 'No leídas', 'Sistema']

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState(notificacionesIniciales)
  const [tabActiva, setTabActiva] = useState('Todas')

  const marcarLeida = (id) =>
    setNotificaciones((prev) => prev.map((n) => n.id === id ? { ...n, leida: true } : n))

  const eliminar = (id) =>
    setNotificaciones((prev) => prev.filter((n) => n.id !== id))

  const marcarTodas = () =>
    setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })))

  const filtradas = notificaciones.filter((n) => {
    if (tabActiva === 'No leídas') return !n.leida
    if (tabActiva === 'Sistema') return n.tipo === 'system'
    return true
  })

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  return (
    <PageWrapper
      title="Notificaciones"
      subtitle="Centro de alertas y avisos del sistema."
      actions={
        noLeidas > 0 && (
          <button onClick={marcarTodas}
            className="rounded-lg border border-outline px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
            Marcar todo como leído
          </button>
        )
      }
    >
      {/* Tabs */}
      <div className="mb-6 flex items-center gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-1 w-fit">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setTabActiva(tab)}
            className={`flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-body-sm font-medium transition-colors ${
              tabActiva === tab ? 'bg-on-surface text-inverse-on-surface' : 'text-on-surface-variant hover:text-on-surface'
            }`}>
            {tab}
            {tab === 'No leídas' && noLeidas > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-error text-label-sm text-on-error">
                {noLeidas}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {filtradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-outline-variant bg-surface-container-lowest py-16">
          <BellIcon size={40} className="mb-3 text-outline" />
          <p className="text-body-md text-on-surface-variant">Sin notificaciones</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtradas.map((n) => {
            const { icon: Icon, cls } = tipoIcono[n.tipo]
            return (
              <div key={n.id} onClick={() => marcarLeida(n.id)}
                className={`group flex gap-4 rounded-xl border p-5 transition-colors cursor-pointer ${
                  n.leida ? 'border-outline-variant bg-surface-container-lowest' : 'border-primary/20 bg-primary/[0.02]'
                }`}>
                <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${cls}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {!n.leida && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
                      <p className={`text-body-sm font-semibold ${n.leida ? 'text-on-surface' : 'text-on-surface'}`}>
                        {n.titulo}
                      </p>
                    </div>
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <span className="text-label-sm text-on-surface-variant">{n.hora}</span>
                      <button onClick={(e) => { e.stopPropagation(); eliminar(n.id) }}
                        className="hidden text-on-surface-variant hover:text-error group-hover:block">
                        <XIcon size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="mt-1 text-body-sm text-on-surface-variant">{n.desc}</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </PageWrapper>
  )
}
