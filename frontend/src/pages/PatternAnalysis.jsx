
import { useEffect, useState } from 'react'
import { getPatternDevice, getPatternTime, getPatternAge, getPatternCity, getPatternSource } from '../api/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Cell } from 'recharts'

const COLORS = ['#6366f1','#f59e0b','#ef4444','#10b981','#8b5cf6','#ec4899','#14b8a6','#f97316']

export default function PatternAnalysis() {
  const [activeTab, setActiveTab] = useState('device')
  const [device, setDevice] = useState([])
  const [time, setTime]     = useState([])
  const [age, setAge]       = useState([])
  const [city, setCity]     = useState([])
  const [source, setSource] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getPatternDevice(), getPatternTime(), getPatternAge(), getPatternCity(), getPatternSource()
    ]).then(([d, t, a, c, s]) => {
      setDevice(d.data); setTime(t.data); setAge(a.data); setCity(c.data); setSource(s.data)
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSpinner />

  const tabs = [
    { id: 'device', label: '📱 Device'  },
    { id: 'time',   label: '🕐 Time'    },
    { id: 'age',    label: '👤 Age'     },
    { id: 'city',   label: '🗺️ City'   },
    { id: 'source', label: '📣 Source'  },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Why They Drop</h1>
        <p className="text-slate-400 mt-1">Root cause analysis of drop-off patterns</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'device' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Drop Rate by Device</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={device}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="device" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={v => [`${v}%`]} />
              <Bar dataKey="drop_rate" radius={[4,4,0,0]}>
                {device.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'time' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Completion Rate by Hour of Day</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={time}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="start_hour" tick={{ fill: '#94a3b8', fontSize: 12 }} unit="h" />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={v => [`${v}%`, 'Completion Rate']} />
              <Line type="monotone" dataKey="completion_rate" stroke="#6366f1" strokeWidth={2} dot={{ fill: '#6366f1', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'age' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Completion Rate by Age Group</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={age}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="age_group" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={v => [`${v}%`, 'Completion Rate']} />
              <Bar dataKey="completion_rate" radius={[4,4,0,0]}>
                {age.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'city' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Drop Rate by City</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={city}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="city" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={v => [`${v}%`, 'Drop Rate']} />
              <Bar dataKey="drop_rate" radius={[4,4,0,0]}>
                {city.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === 'source' && (
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h2 className="text-lg font-semibold text-white mb-4">Completion Rate by Acquisition Source</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={source}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="acquisition_source" tick={{ fill: '#94a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} unit="%" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={v => [`${v}%`, 'Completion Rate']} />
              <Bar dataKey="completion_rate" radius={[4,4,0,0]}>
                {source.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
