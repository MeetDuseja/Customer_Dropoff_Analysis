import { useEffect, useState } from 'react'
import { getFunnel } from '../api/api'
import LoadingSpinner from '../components/LoadingSpinner'
import ExportButton from '../components/ExportButton'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

export default function FunnelAnalysis() {
  const [funnel, setFunnel]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFunnel()
      .then(res => setFunnel(res.data.funnel))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const getColor = (rate) => {
    if (rate > 15) return '#ef4444'
    if (rate > 10) return '#f59e0b'
    if (rate > 5)  return '#eab308'
    return '#10b981'
  }

  const getBadge = (rate) => {
    if (rate > 15) return { label: 'CRITICAL', cls: 'bg-red-500/20 text-red-400'       }
    if (rate > 10) return { label: 'HIGH',     cls: 'bg-orange-500/20 text-orange-400' }
    if (rate > 5)  return { label: 'MEDIUM',   cls: 'bg-yellow-500/20 text-yellow-400' }
    return             { label: 'GOOD',     cls: 'bg-green-500/20 text-green-400'   }
  }

  const maxUsers = funnel[0]?.users_reached || 1

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Drop-off Funnel</h1>
          <p className="text-slate-400 mt-1">
            Step-by-step analysis of where customers leave
          </p>
        </div>
        <ExportButton data={funnel} filename="funnel_analysis" />
      </div>

      {/* Visual Funnel */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-6">
          📉 Onboarding Funnel
        </h2>
        <div className="space-y-3">
          {funnel.map((step) => {
            const width = (step.users_reached / maxUsers) * 100
            const color = getColor(step.drop_rate)
            return (
              <div key={step.step_key}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-slate-400 text-xs w-4">
                    {step.step_number}
                  </span>
                  <span className="text-slate-300 text-sm w-36 truncate">
                    {step.step_name}
                  </span>
                  <div className="flex-1 bg-slate-700 rounded-full h-8 relative">
                    <div
                      className="h-8 rounded-full flex items-center px-3 transition-all duration-500"
                      style={{ width: `${width}%`, backgroundColor: '#6366f1' }}
                    >
                      <span className="text-white text-xs font-medium">
                        {step.users_reached.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xs font-bold w-16 text-right"
                    style={{ color }}
                  >
                    -{step.drop_rate}%
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          📊 Drop Rate per Step
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={funnel}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="step_name"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              angle={-20}
              textAnchor="end"
              height={60}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              unit="%"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              formatter={v => [`${v}%`, 'Drop Rate']}
            />
            <Bar dataKey="drop_rate" radius={[4, 4, 0, 0]}>
              {funnel.map((entry) => (
                <Cell key={entry.step_key} fill={getColor(entry.drop_rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            📋 Detailed Breakdown
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-900/50">
                {['#', 'Step', 'Users Reached', 'Users Dropped',
                  'Drop Rate', 'Status'].map(h => (
                  <th key={h}
                      className="px-6 py-3 text-left text-slate-400 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {funnel.map((row) => {
                const badge = getBadge(row.drop_rate)
                return (
                  <tr key={row.step_key}
                      className="border-b border-slate-700/50
                                 hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4 text-slate-500">
                      {row.step_number}
                    </td>
                    <td className="px-6 py-4 text-white font-medium">
                      {row.step_name}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {row.users_reached.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-300">
                      {row.users_dropped.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold"
                        style={{ color: getColor(row.drop_rate) }}>
                      {row.drop_rate}%
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs
                                        font-bold ${badge.cls}`}>
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}