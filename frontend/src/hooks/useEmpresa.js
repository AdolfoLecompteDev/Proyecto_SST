import { useEffect, useState } from 'react'

export function useEmpresa() {
  const [nombre, setNombre] = useState(
    () => localStorage.getItem('sst_empresa') || import.meta.env.VITE_APP_NAME || 'SST Enterprise'
  )

  useEffect(() => {
    const handler = (e) => setNombre(e.detail)
    window.addEventListener('empresa:update', handler)
    return () => window.removeEventListener('empresa:update', handler)
  }, [])

  return nombre
}
