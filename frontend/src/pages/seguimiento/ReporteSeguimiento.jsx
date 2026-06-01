import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { DownloadIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, BarChartIcon } from '../../components/ui/Icons.jsx'

const empleados = [
  { id: 1, nombre: 'Carlos Ruiz', area: 'Producción', cursos: 5, completados: 5, promedio: 88, estado: 'Completado' },
  { id: 2, nombre: 'Paula Arango', area: 'Logística', cursos: 4, completados: 4, promedio: 92, estado: 'Completado' },
  { id: 3, nombre: 'Miguel Torres', area: 'Mantenimiento', cursos: 6, completados: 4, promedio: 75, estado: 'En progreso' },
  { id: 4, nombre: 'Laura Jiménez', area: 'Administración', cursos: 3, completados: 1, promedio: 61, estado: 'Pendiente' },
  { id: 5, nombre: 'Felipe Mora', area: 'Producción', cursos: 5, completados: 3, promedio: 70, estado: 'En progreso' },
  { id: 6, nombre: 'Sandra Peña', area: 'RRHH', cursos: 3, completados: 0, promedio: 0, estado: 'Sin iniciar' },
]

const estadoBadge = {
  Completado: { cls: 'bg-secondary-fixed text-on-secondary-fixed', icon: CheckCircleIcon },
  'En progreso': { cls: 'bg-primary-fixed text-on-primary-fixed', icon: ClockIcon },
  Pendiente: { cls: 'bg-error-container text-error', icon: AlertTriangleIcon },
  'Sin iniciar': { cls: 'bg-surface-container-high text-on-surface-variant', icon: ClockIcon },
}

const resumen = [
  { label: 'Total funcionarios', value: 6, color: 'text-on-surface' },
  { label: 'Completaron todo', value: 2, color: 'text-secondary' },
  { label: 'En progreso', value: 2, color: 'text-primary' },
  { label: 'Sin iniciar / Pendiente', value: 2, color: 'text-error' },
]

export default function ReporteSeguimiento() {
  const [busqueda, setBusqueda] = useState('')

  const filtrados = empleados.filter((e) =>
    !busqueda || e.nombre.toLowerCase().includes(busqueda.toLowerCase()) || e.area.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const cumplimientoGeneral = Math.round(
    (empleados.reduce((acc, e) => acc + (e.completados / e.cursos || 0), 0) / empleados.length) * 100,
  )

  return (
    <PageWrapper
      title="Seguimiento de Capacitaciones"
      subtitle="Reporte de avance por funcionario y área."
      actions={
        <button className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low">
          <DownloadIcon size={15} /> Exportar CSV
        </button>
      }
    >
      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {resumen.map((r) => (
          <div key={r.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="text-body-sm text-on-surface-variant">{r.label}</p>
            <p className={`mt-2 text-headline-lg font-bold ${r.color}`}>{r.value}</p>
          </div>
        ))}
      </div>

      {/* Compliance bar */}
      <div className="mb-6 rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChartIcon size={18} className="text-on-surface-variant" />
            <span className="text-body-sm font-semibold text-on-surface">Cumplimiento general del equipo</span>
          </div>
          <span className="text-body-sm font-bold text-secondary">{cumplimientoGeneral}%</span>
        </div>
        <div className="h-3 w-full rounded-full bg-surface-container-high">
          <div className="h-3 rounded-full bg-secondary transition-all" style={{ width: `${cumplimientoGeneral}%` }} />
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input type="search" placeholder="Buscar por nombre o área..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full">
          <thead className="bg-primary text-on-primary">
            <tr>
              {['Funcionario', 'Área', 'Progreso', 'Promedio', 'Estado'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-label-sm font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {filtrados.map((emp) => {
              const pct = emp.cursos > 0 ? Math.round((emp.completados / emp.cursos) * 100) : 0
              const badge = estadoBadge[emp.estado]
              return (
                <tr key={emp.id} className="hover:bg-surface-container-low">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-label-sm font-bold text-on-surface">
                        {emp.nombre.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="text-body-sm font-medium text-on-surface">{emp.nombre}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-body-sm text-on-surface-variant">{emp.area}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-28 rounded-full bg-surface-container-high">
                        <div className="h-2 rounded-full bg-secondary" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-body-sm text-on-surface-variant">{emp.completados}/{emp.cursos}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-body-sm font-semibold ${emp.promedio >= 70 ? 'text-secondary' : emp.promedio > 0 ? 'text-error' : 'text-on-surface-variant'}`}>
                      {emp.promedio > 0 ? `${emp.promedio}%` : '—'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium ${badge.cls}`}>
                      <badge.icon size={12} /> {emp.estado}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="border-t border-outline-variant px-5 py-3 text-body-sm text-on-surface-variant">
          {filtrados.length} funcionarios
        </div>
      </div>
    </PageWrapper>
  )
}
