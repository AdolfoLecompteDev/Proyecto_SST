export const isRequired = (value) => value !== null && value !== undefined && `${value}`.trim() !== ''

export const isEmail = (value) => {
  if (!isRequired(value)) return false
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}
