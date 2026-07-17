import { useEffect, useState } from 'react'
import { getOverview } from '../api/api'
import KPICard from '../components/KPICard'
import LoadingSpinner from '../components/LoadingSpinner'
import DateFilter from '../components/DateFilter'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'

const COLORS = [
  '#6366f1','#f59e0b','#ef4444','#10b981',
  '#8b5cf6','#ec4899','#14b8a6','#f97316'
]

function HealthScore({ completionRate }) {
  const score = Math.min(Math.round(completionRate * 1.5), 100)
  const getGrade = (s) => {
    if (s >= 80) return { grade: 'A', color: 'text-green-400',  label: 'Excellent' }
    if (s >= 65) return { grade: 'B', color: 'text-indigo-400', label: 'Good'      }
    if (s >= 50) return { grade: 'C', color: 'text-yellow-400', label: 'Average'   }
    if (s >= 35) return { grade: 'D', color: 'text-orange-400', label: 'Poor'      }
    return              { grade: 'F', color: 'text-red-400',    label: 'Critical'  }
  }
  const { grade, color, label } = getGrade(score)
  return (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 text-center">
      <p className="text-slate-400 text-sm mb-2">Onboarding Health Score</p>
      <p className={`text-7xl font-black ${color}`}>{grade}</p>
      <p className={`text-lg font-semibold ${color} mt-1`}>{label}</p>
      <p className="text-slate-500 text-xs mt-2">
        Score: {score}/100 — Target: 65
      </p>
    </div>
  )
}

export default function Overview() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays]       = useState(0)

  const fetchData = (d) => {
    setLoading(true)
    getOverview(d)
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData(0) }, [])

  const handleDaysChange = (d) => {
    setDays(d)
    fetchData(d)
  }

  if (loading) return <LoadingSpinner />

  const { summary, daily_trend, drop_distribution } = data

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Customer Onboarding Analytics
          </h1>
          <p className="text-slate-400 mt-1">
            Identifying where and why customers abandon their loan application
          </p>
        </div>
        <DateFilter selected={days} onChange={handleDaysChange} />
      </div>

      {/* Health Score + KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-1">
          <HealthScore completionRate={summary.completion_rate} />
        </div>
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            title="Total Started"
            value={summary.total_started.toLocaleString()}
            subtitle="This period"
            color="indigo"
            icon="👥"
          />
          <KPICard
            title="Completed"
            value={summary.total_completed.toLocaleString()}
            subtitle={`${summary.completion_rate}% rate`}
            color="green"
            icon="✅"
          />
          <KPICard
            title="Dropped"
            value={summary.total_dropped.toLocaleString()}
            subtitle={`${summary.drop_rate}% drop rate`}
            color="red"
            icon="❌"
          />
          <KPICard
            title="Completion Rate"
            value={`${summary.completion_rate}%`}
            subtitle="Target: 65%"
            color="yellow"
            icon="🎯"
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            📈 Daily Completion Rate
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={daily_trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="start_date"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                tickFormatter={v => v.slice(5)}
              />
              <YAxis
                domain={[20, 80]}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                unit="%"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
              <Line
                type="monotone"
                dataKey="completion_rate"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
                name="Completion Rate %"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">
            🥧 Drop-off by Step
          </h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={drop_distribution}
                dataKey="count"
                nameKey="step_label"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ step_label, percent }) =>
                  `${step_label?.split(' ')[0]} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={false}
              >
                {drop_distribution.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-red-500/10 border border-red-500/30
                      rounded-xl p-4 flex items-start gap-3">
        <span className="text-2xl">⚠️</span>
        <div>
          <p className="text-red-400 font-semibold">Critical Business Impact</p>
          <p className="text-slate-300 text-sm mt-1">
            {summary.total_dropped.toLocaleString()} customers are lost this period.
            At ₹3,000 commission per loan, this represents{' '}
            <span className="text-red-400 font-bold">
              ₹{(summary.total_dropped * 0.2 * 3000).toLocaleString()}
            </span>{' '}
            in monthly recoverable revenue.
          </p>
        </div>
      </div>

    </div>
  )
}