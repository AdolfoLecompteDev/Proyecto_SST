import { useState, useEffect } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { fetchHistorial } from '../../api/consultasApi.js'

function formatFecha(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('es-CO', { dateStyle: 'short', timeStyle: 'short' })
}

export default function HistorialConsultas() {
  const [consultas, setConsultas] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistorial()
      .then((res) => setConsultas(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <PageWrapper title="Historial de Consultas" subtitle="Registro de verificaciones de antecedentes realizadas.">
      <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
        <table className="w-full text-left text-body-sm">
          <thead className="bg-surface-container">
            <tr>
              {['Documento', 'Entidad', 'Consultado por', 'Fecha', 'Estado'].map((h) => (
                <th key={h} className="px-5 py-3 text-label-sm font-semibold text-on-surface">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant">
            {loading && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">Cargando...</td>
              </tr>
            )}
            {!loading && consultas.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-on-surface-variant">
                  Sin consultas registradas. Ejecuta una verificación desde la pestaña de antecedentes.
                </td>
              </tr>
            )}
            {consultas.map((c) => (
              <tr key={c.id} className="hover:bg-surface-container-low">
                <td className="px-5 py-3 font-medium text-on-surface">{c.documento_consultado}</td>
                <td className="px-5 py-3 text-on-surface-variant">{c.entidad}</td>
                <td className="px-5 py-3 text-on-surface-variant">{c.consultado_por || '—'}</td>
                <td className="px-5 py-3 text-on-surface-variant">{formatFecha(c.fecha)}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-label-sm font-medium ${
                    c.exitosa
                      ? 'bg-secondary-fixed text-on-secondary-fixed'
                      : 'bg-error-container text-error'
                  }`}>
                    {c.exitosa ? 'Exitosa' : 'Pendiente'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  )
}
