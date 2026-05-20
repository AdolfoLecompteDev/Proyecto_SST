const variants = {
  success: 'bg-secondary-fixed text-on-secondary-fixed',
  warning: 'bg-primary-fixed text-on-primary-fixed',
  danger: 'bg-error-container text-on-error-container',
}

export default function Badge({ variant = 'success', className = '', children }) {
  const baseStyles = 'inline-flex items-center rounded-full px-3 py-1 text-label-sm'
  const variantStyles = variants[variant] || variants.success

  return (
    <span className={`${baseStyles} ${variantStyles} ${className}`.trim()}>
      {children}
    </span>
  )
}
