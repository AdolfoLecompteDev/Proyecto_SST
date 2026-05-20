const appName = import.meta.env.VITE_APP_NAME || 'Sistema SST'

export default function Navbar() {
  return (
    <header className="border-b border-outline-variant bg-surface-container-lowest">
      <div className="mx-auto flex max-w-container-max items-center justify-between px-gutter py-4">
        <div>
          <p className="text-label-sm uppercase text-on-surface-variant">
            Plataforma SST
          </p>
          <h1 className="text-headline-md font-semibold text-on-surface">{appName}</h1>
        </div>
        <div className="text-body-sm text-on-surface-variant">
          Centro de Control
        </div>
      </div>
    </header>
  )
}
