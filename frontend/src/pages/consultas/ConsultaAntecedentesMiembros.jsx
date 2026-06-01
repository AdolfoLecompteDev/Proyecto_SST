import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { UploadIcon, PlusIcon, RefreshIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon, EyeOutlineIcon, XIcon, ChevronDownIcon } from '../../components/ui/Icons.jsx'

const historial = [
  { nombre: 'Carlos Mendoza Ramirez', doc: 'CC - 1023456789', fecha: 'Oct 24, 09:30 AM', estado: 'Validado' },
  { nombre: 'Ana Lucia Gomez', doc: 'CE - 987654321', fecha: 'Oct 24, 08:15 AM', estado: 'Pendiente' },
  { nombre: 'Jorge Silva Restrepo', doc: 'CC - 1122334455', fecha: 'Oct 23, 14:45 PM', estado: 'Alerta' },
  { nombre: 'Maria Fernanda Castro', doc: 'CC - 5544332211', fecha: 'Oct 23, 10:10 AM', estado: 'Validado' },
]

const estadoBadge = {
  Validado: { cls: 'bg-secondary-fixed text-on-secondary-fixed', icon: CheckCircleIcon },
  Pendiente: { cls: 'bg-surface-container-high text-on-surface-variant', icon: ClockIcon },
  Alerta: { cls: 'bg-error-container text-error', icon: AlertTriangleIcon },
}

const apisExternas = [
  { nombre: 'Registraduría Nacional', estado: 'En línea', ok: true },
  { nombre: 'Procuraduría (Antecedentes)', estado: 'En línea', ok: true },
  { nombre: 'Contraloría', estado: 'Tiempo de espera', ok: false },
]

const detalle = {
  nombre: 'Jorge Silva Restrepo',
  doc: 'CC - 1122334455',
  cargo: 'Contratista - Logística',
  fechaNac: '15 Mayo 1985',
  tipoSangre: 'O+',
  estadoGeneral: 'Requiere Revisión',
  fuentes: [
    {
      titulo: 'Identidad (Registraduría)',
      resultado: '100% Coincidencia',
      ok: true,
      detalle: 'Nombre y número de ID verificados como activos.',
    },
    {
      titulo: 'Disciplinario (Procuraduría)',
      resultado: 'Alerta Encontrada',
      ok: false,
      detalle: 'Investigación activa registrada 2023. Requiere revisión manual.',
    },
    {
      titulo: 'Fiscal (Contraloría)',
      resultado: 'Sin hallazgos',
      ok: true,
      detalle: 'No se encontraron responsabilidades fiscales.',
    },
    {
      titulo: 'Antecedentes Policiales (PONAL)',
      resultado: 'API Pendiente',
      ok: null,
      detalle: 'Esperando respuesta del servidor externo.',
    },
  ],
}

export default function ConsultaAntecedentesMiembros() {
  const [docTipo, setDocTipo] = useState('Cédula de Ciudadanía (CC)')
  const [docNum, setDocNum] = useState('')
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const [seleccionado, setSeleccionado] = useState(null)

  const verDetalle = (row) => {
    setSeleccionado(row)
    setDetalleAbierto(true)
  }

  return (
    <PageWrapper
      title="Verificación de Empleados"
      subtitle="Valida IDs del personal contra APIs gubernamentales externas y revisa antecedentes."
      actions={
        <>
          <button className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
            <UploadIcon size={15} /> Importar Empleados
          </button>
          <button className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85">
            <PlusIcon size={15} /> Entrada Manual
          </button>
        </>
      }
    >
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left: Form + API Status */}
        <div className="space-y-4">
          {/* Verify form */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <h2 className="mb-4 text-body-md font-semibold text-on-surface">Verificar ID</h2>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-body-sm text-on-surface-variant">Tipo de Documento</label>
                <div className="relative">
                  <select
                    value={docTipo}
                    onChange={(e) => setDocTipo(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-outline bg-white py-2.5 pl-3 pr-8 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option>Cédula de Ciudadanía (CC)</option>
                    <option>Cédula de Extranjería (CE)</option>
                    <option>Pasaporte</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    <ChevronDownIcon size={14} />
                  </span>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-body-sm text-on-surface-variant">Número de Documento</label>
                <input
                  type="text"
                  placeholder="ej. 1020304050"
                  value={docNum}
                  onChange={(e) => setDocNum(e.target.value)}
                  className="w-full rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                />
              </div>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85">
                <RefreshIcon size={15} /> Ejecutar Verificación
              </button>
            </div>
          </div>

          {/* API Status */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Estado APIs Externas
            </p>
            <div className="space-y-2.5">
              {apisExternas.map((api) => (
                <div key={api.nombre} className="flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${api.ok ? 'bg-secondary' : 'bg-error'}`} />
                    <span className="text-on-surface">{api.nombre}</span>
                  </div>
                  <span className={api.ok ? 'text-secondary' : 'text-error'}>{api.estado}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: History table */}
        <div className="space-y-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest">
            <div className="flex items-center justify-between border-b border-outline-variant px-5 py-4">
              <h2 className="text-body-md font-semibold text-on-surface">Historial de Verificaciones Recientes</h2>
              <button className="text-body-sm text-on-surface-variant hover:text-on-surface">Ver Todo</button>
            </div>
            <table className="w-full">
              <thead className="bg-surface-container">
                <tr>
                  {['Nombre Empleado', 'Nro. Documento', 'Fecha', 'Estado', 'Acción'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-label-sm font-semibold text-on-surface">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {historial.map((row) => {
                  const b = estadoBadge[row.estado]
                  return (
                    <tr key={row.doc} className="hover:bg-surface-container-low">
                      <td className="px-5 py-3 text-body-sm font-medium text-on-surface">{row.nombre}</td>
                      <td className="px-5 py-3 text-body-sm text-on-surface-variant">{row.doc}</td>
                      <td className="px-5 py-3 text-body-sm text-on-surface-variant">{row.fecha}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium ${b.cls}`}>
                          <b.icon size={12} /> {row.estado}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => verDetalle(row)}
                          className="text-on-surface-variant hover:text-on-surface"
                        >
                          <EyeOutlineIcon size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Detail view */}
          {detalleAbierto && seleccionado && (
            <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-body-md font-semibold text-on-surface">
                  Vista Detallada: {seleccionado.nombre}
                </h2>
                <button onClick={() => setDetalleAbierto(false)} className="text-on-surface-variant hover:text-on-surface">
                  <XIcon size={18} />
                </button>
              </div>
              <div className="grid gap-4 md:grid-cols-[200px_1fr]">
                {/* Info card */}
                <div className="rounded-xl border border-outline-variant p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container text-body-sm font-bold text-on-surface">
                      {seleccionado.nombre.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-body-sm font-semibold text-on-surface">{detalle.doc}</p>
                      <p className="text-label-sm text-on-surface-variant">{detalle.cargo}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-body-sm">
                    <div className="flex justify-between"><span className="text-on-surface-variant">Fecha Nac.:</span><span>{detalle.fechaNac}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Tipo Sangre:</span><span>{detalle.tipoSangre}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Estado:</span><span className="font-medium text-error">{detalle.estadoGeneral}</span></div>
                  </div>
                </div>

                {/* Sources grid */}
                <div className="grid grid-cols-2 gap-3">
                  {detalle.fuentes.map((f) => (
                    <div
                      key={f.titulo}
                      className={`rounded-xl border p-4 ${f.ok === false ? 'border-error/40 bg-error-container/20' : 'border-outline-variant'}`}
                    >
                      <p className="text-label-sm text-on-surface-variant">{f.titulo}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        {f.ok === true && <CheckCircleIcon size={14} className="text-secondary" />}
                        {f.ok === false && <AlertTriangleIcon size={14} className="text-error" />}
                        {f.ok === null && <ClockIcon size={14} className="text-on-surface-variant" />}
                        <span className={`text-body-sm font-semibold ${f.ok === false ? 'text-error' : f.ok === null ? 'text-on-surface-variant' : 'text-secondary'}`}>
                          {f.resultado}
                        </span>
                      </div>
                      <p className="mt-1 text-label-sm text-on-surface-variant">{f.detalle}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button className="rounded-lg border border-outline px-4 py-2 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
                  Solicitar Re-verificación
                </button>
                <button className="rounded-lg bg-primary px-4 py-2 text-body-sm font-semibold text-on-primary hover:opacity-85">
                  Reconocer y Continuar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
