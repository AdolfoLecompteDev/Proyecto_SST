import { useEffect } from 'react'
import AppRouter from './routes/AppRouter.jsx'
import { loadAndApplyTheme } from './utils/theme.js'

function App() {
  useEffect(() => { loadAndApplyTheme() }, [])
  return <AppRouter />
}

export default App
