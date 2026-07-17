import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutDashboard, FileText, Smartphone, Monitor, Tablet } from 'lucide-react'

const DEVICES = [
  { id: 'mobile_android', label: 'Android',  icon: Smartphone, desc: 'Mobile Android'  },
  { id: 'mobile_ios',     label: 'iOS',      icon: Smartphone, desc: 'Mobile iOS'      },
  { id: 'desktop',        label: 'Desktop',  icon: Monitor,    desc: 'Desktop Browser' },
  { id: 'tablet',         label: 'Tablet',   icon: Tablet,     desc: 'Tablet Device'   },
]

export default function HomePage() {
  const navigate = useNavigate()
  const [device, setDevice] = useState(null)
  const [showDeviceError, setShowDeviceError] = useState(false)

  const handleOnboarding = () => {
    if (!device) {
      setShowDeviceError(true)
      return
    }
    setShowDeviceError(false)
    navigate('/onboarding', { state: { device } })
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-3xl w-full space-y-10">

        {/* Logo */}
        <div className="text-center">
          <h1 className="text-5xl font-black text-white mb-3">
            📊 DropOff Analyzer
          </h1>
          <p className="text-slate-400 text-lg">
            Customer Onboarding Analytics & Simulation System
          </p>
          <p className="text-slate-600 text-sm mt-2">
            Hackathon 2026 — Team Status 200
          </p>
        </div>

        {/* Two Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Admin Dashboard */}
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-slate-800 border-2 border-indigo-500/30
                       hover:border-indigo-500 rounded-2xl p-8
                       transition-all duration-300 group text-left
                       hover:bg-slate-800/80"
          >
            <div className="w-14 h-14 bg-indigo-500/20 rounded-xl
                            flex items-center justify-center mb-5
                            group-hover:bg-indigo-500/30 transition-colors">
              <LayoutDashboard size={28} className="text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              Admin Dashboard
            </h2>
            <p className="text-slate-400 text-sm">
              View analytics, funnel analysis, drop-off patterns,
              actionable insights, revenue impact, and A/B simulator.
            </p>
            <p className="text-indigo-400 text-sm mt-4 font-medium
                          group-hover:underline">
              Open Dashboard →
            </p>
          </button>

          {/* Onboarding Form */}
          <div className="bg-slate-800 border-2 border-green-500/30
                         rounded-2xl p-8 text-left space-y-5">
            <div className="w-14 h-14 bg-green-500/20 rounded-xl
                            flex items-center justify-center">
              <FileText size={28} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">
              Loan Application
            </h2>
            <p className="text-slate-400 text-sm">
              Simulate a real customer going through the
              8-step loan onboarding process.
            </p>

            {/* Device Selector */}
            <div>
              <p className="text-slate-300 text-sm font-medium mb-3">
                Select Device Type:
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEVICES.map(d => {
                  const Icon = d.icon
                  const selected = device === d.id
                  return (
                    <button
                      key={d.id}
                      onClick={() => {
                        setDevice(d.id)
                        setShowDeviceError(false)
                      }}
                      className={`flex items-center gap-3 p-3 rounded-lg
                                  border-2 transition-all text-sm
                                  ${selected
                                    ? 'border-green-500 bg-green-500/10 text-green-400'
                                    : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-500'
                                  }`}
                    >
                      <Icon size={18} />
                      <div>
                        <p className="font-medium">{d.label}</p>
                        <p className="text-xs text-slate-500">{d.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
              {showDeviceError && (
                <p className="text-red-400 text-xs mt-2">
                  ⚠️ Please select a device type before starting
                </p>
              )}
            </div>

            <button
              onClick={handleOnboarding}
              className="w-full bg-green-600 hover:bg-green-700 text-white
                         font-semibold py-3 rounded-lg transition-colors text-sm"
            >
              Start Loan Application →
            </button>
          </div>

        </div>

        {/* Footer */}
        <p className="text-center text-slate-700 text-xs">
          Data from this form feeds directly into the analytics dashboard
        </p>

      </div>
    </div>
  )
}