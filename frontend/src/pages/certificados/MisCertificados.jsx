import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { AlertTriangleIcon, CheckCircleIcon, DownloadIcon, ShareIcon, ClipboardIcon } from '../../components/ui/Icons.jsx'

const tabs = ['Todas', 'Vigentes', 'Expiradas']

const certificados = [
  {
    id: 1,
    titulo: 'Primeros Auxilios Nivel II',
    entidad: 'Cruz Roja Colombiana',
    emitido: '15 Mar 2022',
    vence: '15 Mar 2024',
    estado: 'expirando',
    diasRestantes: 12,
    iconBg: 'bg-surface-container',
  },
  {
    id: 2,
    titulo: 'Trabajo en Alturas Avanzado',
    entidad: 'SENA Centro Industrial',
    emitido: '10 Ene 2023',
    vence: '10 Ene 2026',
    estado: 'vigente',
    diasRestantes: null,
    iconBg: 'bg-secondary-fixed',
  },
  {
    id: 3,
    titulo: 'Manejo de Sustancias Químicas Peligrosas',
    entidad: 'Instituto Nacional de Salud',
    emitido: '22 Ago 2023',
    vence: '22 Ago 2025',
    estado: 'vigente',
    diasRestantes: null,
    iconBg: 'bg-surface-container',
  },
  {
    id: 4,
    titulo: 'Prevención y Control de Incendios',
    entidad: 'Cuerpo de Bomberos Voluntarios',
    emitido: '05 Nov 2023',
    vence: '05 Nov 2024',
    estado: 'vigente',
    diasRestantes: null,
    iconBg: 'bg-secondary-fixed',
  },
  {
    id: 5,
    titulo: 'Conservación Auditiva',
    entidad: 'SST Consultores SAS',
    emitido: '01 Feb 2021',
    vence: '01 Feb 2023',
    estado: 'expirada',
    diasRestantes: null,
    iconBg: 'bg-surface-container-highest',
  },
]

const estadoBadge = {
  vigente: { label: 'Vigente', cls: 'bg-secondary-fixed text-on-secondary-fixed', icon: CheckCircleIcon },
  expirando: { label: null, cls: 'bg-error-container text-error', icon: AlertTriangleIcon },
  expirada: { label: 'Expirada', cls: 'bg-surface-container-high text-on-surface-variant', icon: null },
}

const borderColor = {
  vigente: 'border-t-2 border-t-secondary',
  expirando: 'border-t-2 border-t-error',
  expirada: 'border-t-2 border-t-outline-variant',
}

export default function MisCertificados() {
  const [tabActiva, setTabActiva] = useState('Todas')

  const filtrados = certificados.filter((c) => {
    if (tabActiva === 'Vigentes') return c.estado === 'vigente' || c.estado === 'expirando'
    if (tabActiva === 'Expiradas') return c.estado === 'expirada'
    return true
  })

  const expirando = certificados.filter((c) => c.estado === 'expirando').length

  return (
    <PageWrapper
      title="Centro de Certificaciones"
      subtitle="Consulta, descarga y gestiona tus credenciales de seguridad industrial."
    >
      {/* Alert banner */}
      {expirando > 0 && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-error-container bg-error-container/40 px-5 py-4">
          <div className="flex items-start gap-3">
            <AlertTriangleIcon size={20} className="mt-0.5 flex-shrink-0 text-error" />
            <div>
              <p className="text-body-sm font-semibold text-error">
                Acción Requerida: Certificaciones por Expirar
              </p>
              <p className="mt-0.5 text-body-sm text-on-error-container">
                Tienes {expirando} certificación que expira en los próximos 30 días. Por favor, programa tu renovación para mantener el cumplimiento.
              </p>
            </div>
          </div>
          <button className="ml-4 flex-shrink-0 rounded-lg bg-error px-4 py-2 text-body-sm font-semibold text-on-error hover:opacity-85">
            Renovar Ahora
          </button>
        </div>
      )}

      {/* Tabs + filter */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-1 rounded-xl border border-outline-variant bg-surface-container-lowest p-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setTabActiva(tab)}
              className={`rounded-lg px-4 py-1.5 text-body-sm font-medium transition-colors ${
                tabActiva === tab
                  ? 'bg-on-surface text-inverse-on-surface'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((cert) => {
          const badge = estadoBadge[cert.estado]
          return (
            <div
              key={cert.id}
              className={`flex flex-col rounded-xl border border-outline-variant bg-surface-container-lowest p-5 ${borderColor[cert.estado]}`}
            >
              <div className="flex items-start justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${cert.iconBg}`}>
                  <ClipboardIcon size={18} className="text-on-surface-variant" />
                </div>
                <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium ${badge.cls}`}>
                  {badge.icon && <badge.icon size={12} />}
                  {cert.estado === 'expirando'
                    ? `Expira en ${cert.diasRestantes} días`
                    : badge.label}
                </span>
              </div>

              <div className="mt-3">
                <h3 className={`text-body-md font-semibold ${cert.estado === 'expirada' ? 'text-on-surface-variant' : 'text-on-surface'}`}>
                  {cert.titulo}
                </h3>
                <p className="mt-0.5 text-body-sm text-on-surface-variant">{cert.entidad}</p>
              </div>

              <div className="mt-4 space-y-1.5 text-body-sm">
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Emitido:</span>
                  <span className="text-on-surface">{cert.emitido}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-on-surface-variant">Vence:</span>
                  <span className={cert.estado === 'expirando' ? 'font-medium text-error' : cert.estado === 'expirada' ? 'text-on-surface-variant' : 'text-on-surface'}>
                    {cert.vence}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {cert.estado !== 'expirada' ? (
                  <>
                    <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
                      <DownloadIcon size={14} /> PDF
                    </button>
                    <button className="flex h-9 w-9 items-center justify-center rounded-lg border border-outline text-on-surface-variant hover:bg-surface-container-low">
                      <ShareIcon size={14} />
                    </button>
                  </>
                ) : (
                  <button className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-outline py-2 text-body-sm font-medium text-on-surface-variant hover:bg-surface-container-low">
                    <DownloadIcon size={14} /> Archivo
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </PageWrapper>
  )
}
