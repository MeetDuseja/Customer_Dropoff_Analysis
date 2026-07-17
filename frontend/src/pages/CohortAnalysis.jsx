// src/pages/CohortAnalysis.jsx
import { useEffect, useState } from 'react'
import { getOverview } from '../api/api'
import LoadingSpinner from '../components/LoadingSpinner'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import axios from 'axios'

export default function CohortAnalysis() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axios.get('http://localhost:8000/api/cohort')
      .then(res => setData(res.data.cohort))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Cohort Analysis</h1>
        <p className="text-slate-400 mt-1">
          How completion rates change over months
        </p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          📅 Monthly Completion Trend
        </h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="month"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              unit="%"
              domain={[30, 70]}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px'
              }}
              formatter={v => [`${v}%`]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="completion_rate"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ fill: '#6366f1', r: 5 }}
              name="Completion Rate %"
            />
            <Line
              type="monotone"
              dataKey="drop_rate"
              stroke="#ef4444"
              strokeWidth={2}
              dot={{ fill: '#ef4444', r: 5 }}
              name="Drop Rate %"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Month Table */}
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-lg font-semibold text-white">
            Month by Month Breakdown
          </h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 bg-slate-900/50">
              {['Month','Total Users','Completed','Dropped','Completion Rate','Trend'].map(h => (
                <th key={h} className="px-6 py-3 text-left text-slate-400 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const prev = data[i - 1]
              const trend = prev
                ? row.completion_rate > prev.completion_rate
                  ? '📈 Up'
                  : row.completion_rate < prev.completion_rate
                  ? '📉 Down'
                  : '➡️ Same'
                : '—'
              const trendColor = trend.includes('Up')
                ? 'text-green-400'
                : trend.includes('Down')
                ? 'text-red-400'
                : 'text-slate-400'

              return (
                <tr key={row.month}
                    className="border-b border-slate-700/50 hover:bg-slate-700/20">
                  <td className="px-6 py-4 text-white font-medium">{row.month}</td>
                  <td className="px-6 py-4 text-slate-300">{row.total.toLocaleString()}</td>
                  <td className="px-6 py-4 text-green-400">{row.completed.toLocaleString()}</td>
                  <td className="px-6 py-4 text-red-400">{row.dropped.toLocaleString()}</td>
                  <td className="px-6 py-4 text-indigo-400 font-bold">
                    {row.completion_rate}%
                  </td>
                  <td className={`px-6 py-4 font-medium ${trendColor}`}>{trend}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}