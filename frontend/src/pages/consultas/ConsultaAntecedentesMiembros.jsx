import { useState } from 'react'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { RefreshIcon, CheckCircleIcon, AlertTriangleIcon, ClockIcon, ChevronDownIcon } from '../../components/ui/Icons.jsx'
import { ejecutarVerificacion } from '../../api/consultasApi.js'

const apisExternas = [
  { nombre: 'Registraduría Nacional', estado: 'En línea', ok: true },
  { nombre: 'Procuraduría (Antecedentes)', estado: 'En línea', ok: true },
  { nombre: 'Contraloría', estado: 'En línea', ok: true },
  { nombre: 'PONAL', estado: 'Tiempo de espera', ok: false },
]

export default function ConsultaAntecedentesMiembros() {
  const [docTipo, setDocTipo] = useState('CC')
  const [docNum, setDocNum] = useState('')
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [error, setError] = useState('')

  const handleVerificar = async (e) => {
    e.preventDefault()
    if (!docNum.trim()) { setError('Ingresa el número de documento'); return }
    setError('')
    setLoading(true)
    setResultado(null)
    try {
      const res = await ejecutarVerificacion({ tipo_doc: docTipo, numero_doc: docNum.trim() })
      setResultado(res.data.data)
    } catch (err) {
      setError(err?.response?.data?.message || 'Error al ejecutar la verificación')
    } finally {
      setLoading(false)
    }
  }

  const estadoBadge = (r) => {
    if (!r) return 'bg-surface-container-high text-on-surface-variant'
    if (r.estado_general === 'Requiere Revisión') return 'text-error'
    return 'text-secondary'
  }

  return (
    <PageWrapper
      title="Verificación de Empleados"
      subtitle="Valida IDs del personal contra bases de datos gubernamentales y revisa antecedentes."
    >
      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        {/* Left: Form + API Status */}
        <div className="space-y-4">
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <h2 className="mb-4 text-body-md font-semibold text-on-surface">Verificar ID</h2>
            <form onSubmit={handleVerificar} className="space-y-3">
              <div>
                <label className="mb-1 block text-body-sm text-on-surface-variant">Tipo de Documento</label>
                <div className="relative">
                  <select
                    value={docTipo}
                    onChange={(e) => setDocTipo(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-outline bg-white py-2.5 pl-3 pr-8 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                  >
                    <option value="CC">Cédula de Ciudadanía (CC)</option>
                    <option value="CE">Cédula de Extranjería (CE)</option>
                    <option value="PAS">Pasaporte</option>
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
                  onChange={(e) => { setDocNum(e.target.value); setError('') }}
                  className="w-full rounded-lg border border-outline bg-white px-3 py-2.5 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                />
                {error && <p className="mt-1 text-label-sm text-error">{error}</p>}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-60"
              >
                <RefreshIcon size={15} className={loading ? 'animate-spin' : ''} />
                {loading ? 'Verificando...' : 'Ejecutar Verificación'}
              </button>
            </form>
          </div>

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

        {/* Right: Result */}
        <div>
          {!resultado && !loading && (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-outline-variant text-body-sm text-on-surface-variant">
              Ingresa un documento y ejecuta la verificación para ver los resultados
            </div>
          )}

          {resultado && (
            <div className="space-y-4">
              <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-body-md font-semibold text-on-surface">
                      Documento: {resultado.tipo_doc} - {resultado.documento}
                    </p>
                    <p className={`mt-1 text-body-sm font-medium ${estadoBadge(resultado)}`}>
                      Estado: {resultado.estado_general}
                    </p>
                  </div>
                  <button
                    onClick={() => { setResultado(null); setDocNum('') }}
                    className="text-body-sm text-on-surface-variant hover:text-on-surface"
                  >
                    Nueva consulta
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {resultado.fuentes.map((f) => (
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
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  )
}
