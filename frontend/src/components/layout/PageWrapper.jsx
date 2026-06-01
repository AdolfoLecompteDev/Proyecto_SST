import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-container-max px-8 py-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-headline-xl font-bold text-on-surface">{title}</h1>
                {subtitle && (
                  <p className="mt-1 text-body-sm text-on-surface-variant">{subtitle}</p>
                )}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
