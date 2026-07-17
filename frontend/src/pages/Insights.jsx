
import { useEffect, useState } from 'react'
import { getInsights } from '../api/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function Insights() {
  const [insights, setInsights] = useState([])
  const [loading, setLoading]   = useState(true)
  const [open, setOpen]         = useState(null)

  useEffect(() => {
    getInsights().then(res => setInsights(res.data.insights)).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const severityStyle = {
    CRITICAL: { border: 'border-red-500/50',    bg: 'bg-red-500/10',    badge: 'bg-red-500/20 text-red-400',       icon: '🔴' },
    HIGH:     { border: 'border-orange-500/50',  bg: 'bg-orange-500/10', badge: 'bg-orange-500/20 text-orange-400', icon: '🟠' },
    MEDIUM:   { border: 'border-yellow-500/50',  bg: 'bg-yellow-500/10', badge: 'bg-yellow-500/20 text-yellow-400', icon: '🟡' },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Actionable Insights</h1>
        <p className="text-slate-400 mt-1">Specific actions ordered by priority and business impact</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Critical Issues', count: insights.filter(i => i.severity === 'CRITICAL').length, color: 'text-red-400' },
          { label: 'High Priority',   count: insights.filter(i => i.severity === 'HIGH').length,     color: 'text-orange-400' },
          { label: 'Medium Priority', count: insights.filter(i => i.severity === 'MEDIUM').length,   color: 'text-yellow-400' },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-slate-800 rounded-xl p-4 border border-slate-700 text-center">
            <p className={`text-4xl font-bold ${color}`}>{count}</p>
            <p className="text-slate-400 text-sm mt-1">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {insights.map((insight) => {
          const style = severityStyle[insight.severity] || severityStyle.MEDIUM
          const isOpen = open === insight.priority
          return (
            <div key={insight.priority} className={`rounded-xl border ${style.border} ${style.bg} overflow-hidden`}>
              <button className="w-full p-5 flex items-center gap-4 text-left" onClick={() => setOpen(isOpen ? null : insight.priority)}>
                <span className="text-2xl">{style.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className="text-white font-semibold">#{insight.priority} {insight.title}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${style.badge}`}>{insight.severity}</span>
                    <span className="px-2 py-0.5 rounded text-xs bg-slate-700 text-slate-400">{insight.category}</span>
                  </div>
                  <p className="text-slate-400 text-sm">{insight.finding}</p>
                </div>
                <span className="text-slate-500 text-xl">{isOpen ? '▲' : '▼'}</span>
              </button>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-slate-700/50 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-500 text-xs font-medium mb-2">🔍 WHY THIS HAPPENS</p>
                      <p className="text-slate-300 text-sm">{insight.why}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-500 text-xs font-medium mb-2">✅ RECOMMENDED ACTION</p>
                      <p className="text-slate-300 text-sm">{insight.action}</p>
                    </div>
                    <div className="bg-slate-900/50 rounded-lg p-4">
                      <p className="text-slate-500 text-xs font-medium mb-2">📈 EXPECTED IMPACT</p>
                      <p className="text-green-400 text-sm font-medium">{insight.expected_improvement}</p>
                      <p className="text-slate-500 text-xs mt-2">Effort: {insight.effort}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
