const variants = {
  primary: 'bg-primary text-on-primary hover:bg-primary-container',
  secondary:
    'border border-primary text-primary hover:border-primary-container hover:text-primary-container',
  success: 'bg-secondary text-on-secondary hover:bg-secondary-container',
}

export default function Button({
  as: Component = 'button',
  type = 'button',
  variant = 'primary',
  className = '',
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center rounded-md px-4 py-2 text-body-sm font-semibold transition-colors'
  const variantStyles = variants[variant] || variants.primary
  const componentProps = Component === 'button' ? { type } : {}

  return (
    <Component
      {...componentProps}
      className={`${baseStyles} ${variantStyles} ${className}`.trim()}
      {...props}
    />
  )
}
