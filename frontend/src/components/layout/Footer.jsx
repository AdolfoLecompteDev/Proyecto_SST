export default function Footer() {
  return (
    <footer className="border-t border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-4 text-body-sm text-on-surface-variant">
        <span>Seguridad y Salud en el Trabajo</span>
        <span>{new Date().getFullYear()}</span>
      </div>
    </footer>
  )
}
