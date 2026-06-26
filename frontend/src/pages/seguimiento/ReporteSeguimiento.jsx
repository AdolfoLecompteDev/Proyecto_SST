import { useEffect, useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { DownloadIcon, CheckCircleIcon, ClockIcon, AlertTriangleIcon, BarChartIcon, RefreshIcon } from '../../components/ui/Icons.jsx'
import { fetchSeguimiento, refreshSeguimiento } from '../../api/seguimientoApi.js'

// Estados:
// Completado  → aprobó todas las capacitaciones disponibles (verde)
// En progreso → aprobó al menos 1 pero no todas (azul)
// Pendiente   → tiene capacitaciones disponibles pero no ha aprobado ninguna (amarillo)
// Sin iniciar → no aparece en ningún intento todavía (gris)
const estadoBadge = {
  Completado:    { cls: 'bg-emerald-100 text-emerald-700',  icon: CheckCircleIcon   },
  'En progreso': { cls: 'bg-blue-100 text-blue-700',        icon: ClockIcon         },
  Pendiente:     { cls: 'bg-amber-100 text-amber-700',      icon: AlertTriangleIcon },
  'Sin iniciar': { cls: 'bg-surface-container-high text-on-surface-variant', icon: ClockIcon },
}

function calcEstado(u) {
  if (u.total === 0) return 'Sin iniciar'
  if (u.completadas === u.total) return 'Completado'
  if (u.completadas > 0) return 'En progreso'
  return 'Pendiente'
}

export default function ReporteSeguimiento() {
  const [empleados, setEmpleados] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [busqueda, setBusqueda] = useState('')

  const load = async () => {
    try {
      setLoading(true)
      const res = await fetchSeguimiento()
      setEmpleados(res.data.data)
      setError(null)
    } catch {
      setError('No se pudo cargar el reporte de seguimiento')
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const headers = ['Nombre', 'Email', 'Completadas', 'Total', 'Porcentaje (%)', 'Estado']
    const rows = empleados.map(e => {
      const estado = calcEstado(e)
      return [e.nombre_completo, e.email, e.completadas, e.total, e.porcentaje, estado]
    })
    const csv = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n')
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `seguimiento-${new Date().toISOString().slice(0,10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleRefreshData = async () => {
    try {
      setLoading(true)
      await refreshSeguimiento() // Actualizar la vista materializada en BD
      await load() // Volver a cargar los datos
    } catch {
      setError('No se pudo refrescar la vista de datos')
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtrados = empleados.filter((e) =>
    !busqueda || e.nombre_completo.toLowerCase().includes(busqueda.toLowerCase()) || e.email.toLowerCase().includes(busqueda.toLowerCase()),
  )

  const cumplimientoGeneral = empleados.length > 0
    ? Math.round(empleados.reduce((acc, e) => acc + e.porcentaje, 0) / empleados.length)
    : 0

  const completados = empleados.filter((e) => e.porcentaje === 100).length
  const enProgreso = empleados.filter((e) => e.porcentaje > 0 && e.porcentaje < 100).length
  const sinIniciar = empleados.filter((e) => e.porcentaje === 0).length

  return (
    <PageWrapper
      title="Seguimiento de Capacitaciones"
      subtitle="Reporte de avance por funcionario."
      actions={
        <div className="flex gap-2">
          <button onClick={handleRefreshData} disabled={loading}
            className="flex items-center gap-1.5 rounded-lg border border-outline-variant px-3 py-2.5 text-body-sm text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50">
            <RefreshIcon size={14} className={loading ? 'animate-spin' : ''} />
          </button>
          <button onClick={handleExportCSV} disabled={loading || empleados.length === 0}
            className="flex items-center gap-2 rounded-lg border border-outline px-4 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low disabled:opacity-50">
            <DownloadIcon size={15} /> Exportar CSV
          </button>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg bg-error-container px-4 py-3 text-body-sm text-error">{error}</div>
      )}

      {/* Summary cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total funcionarios', value: loading ? '...' : empleados.length, color: 'text-on-surface', desc: 'registrados en el sistema' },
          { label: 'Completado', value: loading ? '...' : completados, color: 'text-emerald-600', desc: 'aprobaron todas las capacitaciones' },
          { label: 'En progreso', value: loading ? '...' : enProgreso, color: 'text-blue-600', desc: 'han aprobado al menos una' },
          { label: 'Pendiente', value: loading ? '...' : sinIniciar, color: 'text-amber-600', desc: 'aún no han aprobado ninguna' },
        ].map((r) => (
          <div key={r.label} className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="text-body-sm text-on-surface-variant">{r.label}</p>
            <p className={`mt-2 text-headline-lg font-bold ${r.color}`}>{r.value}</p>
            {r.desc && <p className="mt-1 text-label-sm text-on-surface-variant">{r.desc}</p>}
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
        <input type="search" placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
          className="w-full max-w-xs rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none" />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full">
          <thead className="bg-primary text-on-primary">
            <tr>
              {['Funcionario', 'Progreso', 'Completadas', 'Estado'].map((h) => (
                <th key={h} className="px-5 py-3.5 text-left text-label-sm font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 4 }).map((_, j) => (
                    <td key={j} className="px-5 py-4">
                      <div className="h-4 animate-pulse rounded bg-surface-container-high" />
                    </td>
                  ))}
                </tr>
              ))
            ) : filtrados.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-12 text-center text-body-sm text-on-surface-variant">
                  Sin resultados
                </td>
              </tr>
            ) : (
              filtrados.map((emp) => {
                const estado = calcEstado(emp)
                const badge = estadoBadge[estado]
                return (
                  <tr key={emp.usuario_id} className="hover:bg-surface-container-low">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container text-label-sm font-bold text-on-surface">
                          {emp.nombre_completo.split(' ').slice(0, 2).map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-body-sm font-medium text-on-surface">{emp.nombre_completo}</p>
                          <p className="text-label-sm text-on-surface-variant">{emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-28 rounded-full bg-surface-container-high">
                          <div className="h-2 rounded-full bg-secondary" style={{ width: `${emp.porcentaje}%` }} />
                        </div>
                        <span className="text-body-sm text-on-surface-variant">{emp.porcentaje}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-body-sm text-on-surface-variant">
                      {emp.completadas}/{emp.total}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-label-sm font-medium ${badge.cls}`}>
                        <badge.icon size={12} /> {estado}
                      </span>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
        <div className="border-t border-outline-variant px-5 py-3 text-body-sm text-on-surface-variant">
          {loading ? '...' : `${filtrados.length} funcionarios`}
        </div>
      </div>
    </PageWrapper>
  )
}
