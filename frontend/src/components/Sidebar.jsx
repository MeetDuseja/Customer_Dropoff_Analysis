import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, TrendingDown, Search, Lightbulb,
  Bot, DollarSign, Calendar, FlaskConical, Home
} from 'lucide-react'

const links = [
  { to: '/dashboard',           icon: LayoutDashboard, label: 'Overview'        },
  { to: '/dashboard/funnel',    icon: TrendingDown,    label: 'Drop-off Funnel' },
  { to: '/dashboard/patterns',  icon: Search,          label: 'Why They Drop'   },
  { to: '/dashboard/cohort',    icon: Calendar,        label: 'Cohort Analysis' },
  { to: '/dashboard/insights',  icon: Lightbulb,       label: 'Action Insights' },
  { to: '/dashboard/simulator', icon: FlaskConical,    label: 'A/B Simulator'   },
  { to: '/dashboard/predictor', icon: Bot,             label: 'Live Predictor'  },
  { to: '/dashboard/revenue',   icon: DollarSign,      label: 'Revenue Impact'  },
]

export default function Sidebar() {
  const navigate = useNavigate()

  return (
    <div className="w-64 min-h-screen bg-slate-900 border-r border-slate-700
                    flex flex-col fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-xl font-bold text-indigo-400">📊 DropOff</h1>
        <p className="text-slate-500 text-xs mt-1">Analyzer — Hackathon 2026</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/dashboard'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm
               transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white font-medium'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-700 space-y-3">
        <button onClick={() => navigate('/')}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
                     text-sm text-slate-400 hover:bg-slate-800 hover:text-white
                     transition-colors">
          <Home size={18} />
          Back to Home
        </button>
        <p className="text-slate-600 text-xs">Team Status 200 — Hackathon 2026</p>
      </div>
    </div>
  )
}