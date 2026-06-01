import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { BellIcon, ShieldCheckIcon, SettingsIcon, UsersIcon } from '../../components/ui/Icons.jsx'

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

const tabsList = [
  { id: 'notificaciones', label: 'Notificaciones', icon: BellIcon },
  { id: 'seguridad', label: 'Seguridad', icon: ShieldCheckIcon },
  { id: 'sistema', label: 'Sistema', icon: SettingsIcon },
  { id: 'equipo', label: 'Equipo', icon: UsersIcon },
]

export default function Configuracion() {
  const { user } = useAuth()
  const esAdmin = user?.rol === 'ADMIN' || user?.rol === 'SUPER_USUARIO'

  const [tab, setTab] = useState('notificaciones')
  const [notif, setNotif] = useState({
    emailCertificados: true,
    emailVencimientos: true,
    emailAlertas: false,
    pushNuevaCapacitacion: true,
    pushResultadoEval: true,
    pushSistema: false,
    diasAnticipacion: '15',
  })
  const [seg, setSeg] = useState({
    dosFactor: false,
    sesionRecordar: true,
    tiempoInactividad: '30',
  })
  const [sistema, setSistema] = useState({
    nombreEmpresa: 'SST Enterprise',
    puntajeMinimo: '70',
    maxIntentos: '3',
    vigenciaCertDias: '365',
    modoMantenimiento: false,
  })

  const setN = (k) => (v) => setNotif((p) => ({ ...p, [k]: v }))
  const setS = (k) => (v) => setSeg((p) => ({ ...p, [k]: v }))
  const setSis = (k) => (v) => setSistema((p) => ({ ...p, [k]: v }))

  return (
    <PageWrapper title="Configuración" subtitle="Preferencias del sistema y de tu cuenta.">
      <div className="flex gap-6">
        {/* Sidebar tabs */}
        <aside className="w-52 flex-shrink-0">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest overflow-hidden">
            {tabsList.filter((t) => t.id !== 'equipo' || esAdmin).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex w-full items-center gap-3 px-4 py-3 text-body-sm font-medium transition-colors border-b border-outline-variant last:border-0 ${
                  tab === id ? 'bg-surface-container text-on-surface' : 'text-on-surface-variant hover:bg-surface-container-low'
                }`}>
                <Icon size={16} className={tab === id ? 'text-primary' : ''} />
                {label}
              </button>
            ))}
          </div>
        </aside>

        {/* Content */}
        <div className="flex-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
          {tab === 'notificaciones' && (
            <div className="space-y-6">
              <h3 className="text-body-lg font-semibold text-on-surface">Preferencias de Notificaciones</h3>
              <div>
                <p className="mb-3 text-body-sm font-semibold text-on-surface">Correo electrónico</p>
                <div className="space-y-4">
                  {[
                    { key: 'emailCertificados', label: 'Certificados emitidos', desc: 'Recibir correo cuando se genere un nuevo certificado' },
                    { key: 'emailVencimientos', label: 'Alertas de vencimiento', desc: 'Avisar cuando un certificado esté próximo a vencer' },
                    { key: 'emailAlertas', label: 'Alertas de seguridad', desc: 'Notificaciones de acceso y cambios en la cuenta' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-body-sm font-medium text-on-surface">{label}</p>
                        <p className="text-label-sm text-on-surface-variant">{desc}</p>
                      </div>
                      <Toggle checked={notif[key]} onChange={setN(key)} />
                    </div>
                  ))}
                </div>
              </div>
              <hr className="border-outline-variant" />
              <div>
                <p className="mb-3 text-body-sm font-semibold text-on-surface">Notificaciones en plataforma</p>
                <div className="space-y-4">
                  {[
                    { key: 'pushNuevaCapacitacion', label: 'Nueva capacitación disponible', desc: 'Cuando se publique un módulo nuevo' },
                    { key: 'pushResultadoEval', label: 'Resultados de evaluación', desc: 'Al completar una evaluación' },
                    { key: 'pushSistema', label: 'Avisos del sistema', desc: 'Mantenimientos y actualizaciones' },
                  ].map(({ key, label, desc }) => (
                    <div key={key} className="flex items-center justify-between">
                      <div>
                        <p className="text-body-sm font-medium text-on-surface">{label}</p>
                        <p className="text-label-sm text-on-surface-variant">{desc}</p>
                      </div>
                      <Toggle checked={notif[key]} onChange={setN(key)} />
                    </div>
                  ))}
                </div>
              </div>
              <hr className="border-outline-variant" />
              <div>
                <label className="mb-1 block text-body-sm font-medium text-on-surface">
                  Días de anticipación para alertas de vencimiento
                </label>
                <input type="number" min="1" max="90" value={notif.diasAnticipacion}
                  onChange={(e) => setN('diasAnticipacion')(e.target.value)}
                  className="w-24 rounded-lg border border-outline px-3 py-2 text-body-sm focus:border-primary focus:outline-none" />
              </div>
            </div>
          )}

          {tab === 'seguridad' && (
            <div className="space-y-6">
              <h3 className="text-body-lg font-semibold text-on-surface">Seguridad de Cuenta</h3>
              <div className="space-y-4">
                {[
                  { key: 'dosFactor', label: 'Autenticación de dos factores', desc: 'Agregar capa adicional de seguridad al iniciar sesión' },
                  { key: 'sesionRecordar', label: 'Recordar sesión', desc: 'Mantener la sesión activa en este dispositivo' },
                ].map(({ key, label, desc }) => (
                  <div key={key} className="flex items-center justify-between rounded-lg border border-outline-variant p-4">
                    <div>
                      <p className="text-body-sm font-medium text-on-surface">{label}</p>
                      <p className="text-label-sm text-on-surface-variant">{desc}</p>
                    </div>
                    <Toggle checked={seg[key]} onChange={setS(key)} />
                  </div>
                ))}
              </div>
              <div>
                <label className="mb-1 block text-body-sm font-medium text-on-surface">
                  Cierre de sesión por inactividad (minutos)
                </label>
                <select value={seg.tiempoInactividad} onChange={(e) => setS('tiempoInactividad')(e.target.value)}
                  className="rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm focus:border-primary focus:outline-none">
                  {['15', '30', '60', '120'].map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          )}

          {tab === 'sistema' && esAdmin && (
            <div className="space-y-6">
              <h3 className="text-body-lg font-semibold text-on-surface">Configuración del Sistema</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'nombreEmpresa', label: 'Nombre de la empresa', full: true },
                  { key: 'puntajeMinimo', label: 'Puntaje mínimo de aprobación (%)', type: 'number' },
                  { key: 'maxIntentos', label: 'Máximo de intentos por evaluación', type: 'number' },
                  { key: 'vigenciaCertDias', label: 'Vigencia de certificados (días)', type: 'number' },
                ].map(({ key, label, type = 'text', full }) => (
                  <div key={key} className={full ? 'col-span-2' : ''}>
                    <label className="mb-1 block text-body-sm font-medium text-on-surface">{label}</label>
                    <input type={type} value={sistema[key]} onChange={(e) => setSis(key)(e.target.value)}
                      className="w-full rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm focus:border-primary focus:outline-none" />
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-error-container bg-error-container/20 p-4">
                <div>
                  <p className="text-body-sm font-medium text-on-surface">Modo mantenimiento</p>
                  <p className="text-label-sm text-on-surface-variant">Bloquea el acceso a todos los funcionarios mientras se realizan tareas de mantenimiento</p>
                </div>
                <Toggle checked={sistema.modoMantenimiento} onChange={setSis('modoMantenimiento')} />
              </div>
            </div>
          )}

          {tab === 'equipo' && esAdmin && (
            <div className="space-y-4">
              <h3 className="text-body-lg font-semibold text-on-surface">Gestión del Equipo</h3>
              <p className="text-body-sm text-on-surface-variant">
                Gestiona roles y permisos desde la sección de{' '}
                <a href="/usuarios" className="font-medium text-primary">Gestión de Usuarios</a>.
              </p>
              <div className="rounded-xl border border-outline-variant p-5">
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[{ label: 'Super Usuarios', val: 1 }, { label: 'Administradores', val: 2 }, { label: 'Funcionarios', val: 3 }].map((r) => (
                    <div key={r.label}>
                      <p className="text-headline-lg font-bold text-on-surface">{r.val}</p>
                      <p className="text-body-sm text-on-surface-variant">{r.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Save button */}
          <div className="mt-6 flex justify-end">
            <button className="rounded-lg bg-primary px-6 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85">
              Guardar cambios
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
