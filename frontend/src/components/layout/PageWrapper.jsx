import Footer from './Footer.jsx'
import Navbar from './Navbar.jsx'
import Sidebar from './Sidebar.jsx'

export default function PageWrapper({ title, subtitle, actions, children }) {
  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 px-gutter py-stack-lg">
          <div className="mx-auto flex max-w-container-max flex-col gap-stack-lg">
            <header className="flex flex-wrap items-start justify-between gap-stack-md">
              <div>
                {subtitle && (
                  <p className="text-label-sm uppercase text-on-surface-variant">
                    {subtitle}
                  </p>
                )}
                <h2 className="text-headline-xl font-bold text-on-surface">
                  {title}
                </h2>
              </div>
              {actions}
            </header>
            {children}
          </div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
