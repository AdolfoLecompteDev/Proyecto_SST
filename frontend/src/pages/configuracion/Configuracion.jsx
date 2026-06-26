import { useState, useEffect } from 'react'
import { fetchConfig, saveConfig, fetchPublicConfig, saveSistemaConfig } from '../../api/configApi.js'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { useAuth } from '../../hooks/useAuth.js'
import { BellIcon, ShieldCheckIcon, SettingsIcon, UsersIcon } from '../../components/ui/Icons.jsx'
import { applyTheme } from '../../utils/theme.js'

function Toggle({ checked, onChange }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-surface-container-high'}`}>
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
    </button>
  )
}

function ColorPicker({ label, desc, value, onChange }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-outline-variant p-4">
      <div>
        <p className="text-body-sm font-medium text-on-surface">{label}</p>
        {desc && <p className="text-label-sm text-on-surface-variant">{desc}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-md border border-outline-variant" style={{ background: value }} />
        <input
          type="color"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="h-8 w-8 cursor-pointer rounded border border-outline p-0.5"
          title={value}
        />
        <span className="text-label-sm text-on-surface-variant font-mono">{value}</span>
      </div>
    </div>
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
  const [saving, setSaving] = useState(false)

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
  const [tema, setTema] = useState({
    color_primario: '#000000',
    color_secundario: '#006c49',
  })

  const setN = (k) => (v) => setNotif((p) => ({ ...p, [k]: v }))
  const setS = (k) => (v) => setSeg((p) => ({ ...p, [k]: v }))
  const setSis = (k) => (v) => setSistema((p) => ({ ...p, [k]: v }))

  useEffect(() => {
    fetchConfig().then(({ data }) => {
      const conf = data?.data || {}
      if (conf.notif) setNotif((p) => ({ ...p, ...conf.notif }))
      if (conf.seg) setSeg((p) => ({ ...p, ...conf.seg }))
      if (conf.sistema && esAdmin) setSistema((p) => ({ ...p, ...conf.sistema }))
    }).catch(console.error)

    if (esAdmin) {
      fetchPublicConfig().then(json => {
        const d = json?.data || {}
        if (d.color_primario || d.color_secundario) {
          setTema(p => ({
            color_primario: d.color_primario || p.color_primario,
            color_secundario: d.color_secundario || p.color_secundario,
          }))
        }
        if (d.nombre_empresa) setSistema(p => ({ ...p, nombreEmpresa: d.nombre_empresa }))
      }).catch(console.error)
    }
  }, [esAdmin])

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload = { notif, seg }
      if (esAdmin) payload.sistema = sistema
      await saveConfig(payload)

      if (esAdmin) {
        await saveSistemaConfig({
          nombre_empresa: sistema.nombreEmpresa,
          color_primario: tema.color_primario,
          color_secundario: tema.color_secundario,
        })
        applyTheme(tema)
      }

      alert('Configuración guardada exitosamente')
    } catch {
      alert('Error guardando configuración')
    } finally {
      setSaving(false)
    }
  }

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

              {/* Datos generales */}
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

              <hr className="border-outline-variant" />

              {/* Colores de la plataforma */}
              <div>
                <p className="mb-1 text-body-sm font-semibold text-on-surface">Colores de la plataforma</p>
                <p className="mb-4 text-label-sm text-on-surface-variant">Los cambios se aplican en tiempo real al guardar.</p>
                <div className="space-y-3">
                  <ColorPicker
                    label="Color primario"
                    desc="Botones, íconos activos, acentos principales"
                    value={tema.color_primario}
                    onChange={v => setTema(p => ({ ...p, color_primario: v }))}
                  />
                  <ColorPicker
                    label="Color secundario"
                    desc="Badges de aprobado, estados de éxito, acciones secundarias"
                    value={tema.color_secundario}
                    onChange={v => setTema(p => ({ ...p, color_secundario: v }))}
                  />
                </div>
                <div className="mt-4 rounded-lg border border-outline-variant p-4 flex gap-4 items-center">
                  <span className="text-label-sm text-on-surface-variant">Vista previa:</span>
                  <button className="rounded-lg px-4 py-2 text-body-sm font-semibold text-white" style={{ background: tema.color_primario }}>
                    Botón primario
                  </button>
                  <button className="rounded-lg px-4 py-2 text-body-sm font-semibold text-white" style={{ background: tema.color_secundario }}>
                    Botón secundario
                  </button>
                  <span className="rounded-full px-3 py-1 text-label-sm font-semibold text-white" style={{ background: tema.color_secundario }}>
                    Aprobado
                  </span>
                </div>
              </div>

              <hr className="border-outline-variant" />

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
            <button onClick={handleSave} disabled={saving}
              className="rounded-lg bg-primary px-6 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
