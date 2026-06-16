import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import PageWrapper from '../../components/layout/PageWrapper.jsx'
import { fetchCategorias, createCapacitacion } from '../../api/capacitacionesApi.js'
import {
  FlameIcon, HeartPulseIcon, WrenchIcon, BookOpenIcon, HardHatIcon, GraduationCapIcon,
} from '../../components/ui/Icons.jsx'

const catIcons = {
  'Emergencias y Evacuación': FlameIcon,
  'Salud Ocupacional': HeartPulseIcon,
  'Manejo de Equipos': WrenchIcon,
  'Normatividad SST': BookOpenIcon,
  'Seguridad en el Trabajo': HardHatIcon,
}

export default function FormCapacitacion() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    categoria_id: '',
    fecha_vigencia: '',
  })
  const [categorias, setCategorias] = useState([])
  const [errores, setErrores] = useState({})
  const [apiError, setApiError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchCategorias()
      .then((res) => setCategorias(res.data.data || []))
      .catch(() => {})
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((p) => ({ ...p, [name]: value }))
    if (errores[name]) setErrores((p) => ({ ...p, [name]: '' }))
  }

  const validar = () => {
    const e = {}
    if (!form.titulo.trim()) e.titulo = 'El título es requerido'
    return e
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length) { setErrores(errs); return }
    setLoading(true)
    setApiError('')
    try {
      await createCapacitacion({
        titulo: form.titulo,
        descripcion: form.descripcion || null,
        categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
        fecha_vigencia: form.fecha_vigencia || null,
      })
      navigate('/capacitaciones')
    } catch (err) {
      setApiError(err?.response?.data?.message || 'Error al crear la capacitación')
    } finally {
      setLoading(false)
    }
  }

  const catSeleccionada = categorias.find((c) => String(c.id) === form.categoria_id)
  const CatIcon = catSeleccionada ? (catIcons[catSeleccionada.nombre] || GraduationCapIcon) : GraduationCapIcon

  return (
    <PageWrapper title="Nueva Capacitación" subtitle="Agrega un nuevo módulo al catálogo de formación.">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Main form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {apiError && (
            <div className="rounded-lg bg-error-container px-4 py-3 text-body-sm text-error">{apiError}</div>
          )}

          {/* Título */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 text-body-md font-semibold text-on-surface">Información básica</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-body-sm font-medium text-on-surface">
                  Título <span className="text-error">*</span>
                </label>
                <input
                  name="titulo"
                  value={form.titulo}
                  onChange={handleChange}
                  placeholder="Ej. Trabajo en Alturas Nivel II"
                  className={`w-full rounded-lg border px-4 py-3 text-body-sm text-on-surface focus:outline-none ${
                    errores.titulo ? 'border-error bg-error-container/10' : 'border-outline focus:border-primary'
                  }`}
                />
                {errores.titulo && <p className="mt-1 text-label-sm text-error">{errores.titulo}</p>}
              </div>

              <div>
                <label className="mb-1.5 block text-body-sm font-medium text-on-surface">Descripción</label>
                <textarea
                  name="descripcion"
                  value={form.descripcion}
                  onChange={handleChange}
                  rows={5}
                  placeholder="Describe el contenido, objetivos y competencias que desarrollará este módulo..."
                  className="w-full resize-none rounded-lg border border-outline px-4 py-3 text-body-sm text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Clasificación */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
            <h2 className="mb-4 text-body-md font-semibold text-on-surface">Clasificación y vigencia</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-body-sm font-medium text-on-surface">Categoría</label>
                <select
                  name="categoria_id"
                  value={form.categoria_id}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-outline bg-white px-4 py-3 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                >
                  <option value="">Sin categoría</option>
                  {categorias.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nombre}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-body-sm font-medium text-on-surface">Fecha de vigencia</label>
                <input
                  name="fecha_vigencia"
                  type="date"
                  value={form.fecha_vigencia}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-outline px-4 py-3 text-body-sm text-on-surface focus:border-primary focus:outline-none"
                />
                <p className="mt-1 text-label-sm text-on-surface-variant">
                  Fecha límite en que el certificado es válido
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/capacitaciones')}
              className="rounded-lg border border-outline px-6 py-2.5 text-body-sm font-medium text-on-surface hover:bg-surface-container-low"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-primary px-6 py-2.5 text-body-sm font-semibold text-on-primary hover:opacity-85 disabled:opacity-60"
            >
              {loading ? 'Creando...' : 'Crear capacitación'}
            </button>
          </div>
        </form>

        {/* Preview sidebar */}
        <div className="space-y-4">
          {/* Preview card */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5">
            <p className="mb-3 text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">
              Vista previa
            </p>
            <div className="overflow-hidden rounded-xl border border-outline-variant bg-white">
              <div className="flex h-32 items-center justify-center bg-gradient-to-br from-primary to-secondary">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                  <CatIcon size={24} className="text-white" />
                </div>
              </div>
              <div className="p-4">
                <p className="font-semibold text-on-surface text-body-sm">
                  {form.titulo || 'Título de la capacitación'}
                </p>
                {form.descripcion && (
                  <p className="mt-1 line-clamp-2 text-label-sm text-on-surface-variant">{form.descripcion}</p>
                )}
                {catSeleccionada && (
                  <span className="mt-2 inline-block rounded-md bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">
                    {catSeleccionada.nombre}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Ayuda */}
          <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-5 space-y-3">
            <p className="text-label-sm font-semibold uppercase tracking-wide text-on-surface-variant">Recuerda</p>
            <ul className="space-y-2 text-body-sm text-on-surface-variant">
              <li className="flex gap-2"><span className="text-primary">•</span> El título es obligatorio y aparecerá en el certificado</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Asigna una categoría para facilitar el filtrado</li>
              <li className="flex gap-2"><span className="text-primary">•</span> La fecha de vigencia define cuándo vence el certificado</li>
              <li className="flex gap-2"><span className="text-primary">•</span> Podrás subir archivos y evaluaciones después de crear</li>
            </ul>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
