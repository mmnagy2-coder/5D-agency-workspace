import { useEffect } from 'react'
import { Rail, Topbar } from './components/Shell.jsx'
import { go, Toasts, useHashRoute } from './components/ui.jsx'
import AgencyDesk from './pages/AgencyDesk.jsx'
import BrandKit from './pages/BrandKit.jsx'
import Calendar from './pages/Calendar.jsx'
import Channels from './pages/Channels.jsx'
import Create from './pages/Create.jsx'
import Help from './pages/Help.jsx'
import Home from './pages/Home.jsx'
import Library from './pages/Library.jsx'
import Reports from './pages/Reports.jsx'
import Review from './pages/Review.jsx'
import Templates from './pages/Templates.jsx'
import { StoreProvider, useStore } from './store/store.jsx'

const ROUTES = { home: Home, create: Create, review: Review, calendar: Calendar, library: Library, templates: Templates, kit: BrandKit, channels: Channels, reports: Reports, help: Help, desk: AgencyDesk }

function Workspace() {
  const route = useHashRoute()
  const { state } = useStore()
  const Page = ROUTES[route] || Home

  useEffect(() => {
    if (route === 'desk' && state.role !== 'agency') go('home')
    if (route === 'help' && state.role === 'agency') go('desk')
  }, [route, state.role])

  return (
    <div className="shell">
      <Rail route={route} />
      <div className="main">
        <Topbar route={route} />
        <main>
          <Page key={route + state.role} />
        </main>
      </div>
      <Toasts />
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <Workspace />
    </StoreProvider>
  )
}
