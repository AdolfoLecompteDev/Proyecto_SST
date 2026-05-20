export const formatDate = (value) => {
  if (!value) return ''
  const date = typeof value === 'string' || typeof value === 'number' ? new Date(value) : value
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  }).format(date)
}

export const formatPercentage = (value) => {
  if (value === null || value === undefined) return ''
  return `${Number(value).toFixed(0)}%`
}
