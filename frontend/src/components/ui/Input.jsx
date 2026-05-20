export default function Input({ label, id, className = '', ...props }) {
  return (
    <label className="block text-body-sm text-on-surface-variant">
      {label && <span className="mb-1 block">{label}</span>}
      <input
        id={id}
        className={`w-full rounded-md border border-outline bg-surface-container-lowest px-3 py-2 text-body-md text-on-surface placeholder:text-on-surface-variant focus:border-primary focus:outline-none ${className}`.trim()}
        {...props}
      />
    </label>
  )
}
