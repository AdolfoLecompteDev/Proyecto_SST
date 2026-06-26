const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export function applyTheme({ color_primario, color_secundario } = {}) {
  const root = document.documentElement
  if (color_primario) root.style.setProperty('--color-primary', color_primario)
  if (color_secundario) root.style.setProperty('--color-secondary', color_secundario)
}

export async function loadAndApplyTheme() {
  try {
    const res = await fetch(`${API_BASE}/api/config/public`)
    const json = await res.json()
    if (json?.data) applyTheme(json.data)
  } catch { /* silent */ }
}
