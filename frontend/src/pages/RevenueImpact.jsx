
import { useState, useEffect } from 'react'
import { getRevenue } from '../api/api'
import LoadingSpinner from '../components/LoadingSpinner'
import KPICard from '../components/KPICard'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const COLORS = ['#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#14b8a6','#3b82f6','#ef4444']

export default function RevenueImpact() {
  const [avgLoan, setAvgLoan]       = useState(150000)
  const [commission, setCommission] = useState(2)
  const [data, setData]             = useState(null)
  const [loading, setLoading]       = useState(true)

  const fetchRevenue = () => {
    setLoading(true)
    getRevenue(avgLoan, commission / 100).then(res => setData(res.data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchRevenue() }, [])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Revenue Impact</h1>
        <p className="text-slate-400 mt-1">Quantifying the business cost of drop-offs</p>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-base font-semibold text-white mb-4">⚙️ Configure Parameters</h2>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <label className="block text-slate-400 text-xs mb-1">Average Loan Amount (₹)</label>
            <input type="number" value={avgLoan} onChange={e => setAvgLoan(+e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-40" />
          </div>
          <div>
            <label className="block text-slate-400 text-xs mb-1">Commission Rate (%)</label>
            <input type="number" step="0.1" value={commission} onChange={e => setCommission(+e.target.value)}
              className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-32" />
          </div>
          <button onClick={fetchRevenue}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors">
            Recalculate
          </button>
        </div>
      </div>

      {loading ? <LoadingSpinner /> : data && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard title="Total Dropped / Month"  value={data.summary.total_dropped.toLocaleString()}                        color="red"    icon="❌" />
            <KPICard title="Recoverable Users"       value={data.summary.recoverable_users.toLocaleString()} subtitle="20% of dropped" color="yellow" icon="♻️" />
            <KPICard title="Monthly Opportunity"     value={`₹${(data.summary.monthly_opportunity/100000).toFixed(1)}L`}       color="green"  icon="💰" />
            <KPICard title="Annual Opportunity"      value={`₹${(data.summary.annual_opportunity/100000).toFixed(1)}L`} subtitle={`ROI: ${data.summary.roi_multiplier}x`} color="indigo" icon="📈" />
          </div>

          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-lg font-semibold text-white mb-4">💸 Annual Revenue Opportunity by Step</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.step_breakdown}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="step" tick={{ fill: '#94a3b8', fontSize: 11 }} angle={-15} textAnchor="end" height={60} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} formatter={v => [`₹${v.toLocaleString()}`, 'Annual Opportunity']} />
                <Bar dataKey="annual_opportunity" radius={[4,4,0,0]}>
                  {data.step_breakdown.map((_, i) => <Cell key={i} fill={COLORS[i % 8]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6">
            <h3 className="text-green-400 font-bold text-lg mb-2">💡 Business Case Summary</h3>
            <p className="text-slate-300">
              Investing <strong className="text-white">₹7-10 lakh</strong> in UX improvements recovers{' '}
              <strong className="text-green-400 text-xl">₹{data.summary.annual_opportunity.toLocaleString()}</strong> annually.{' '}
              <strong className="text-green-400">ROI = {data.summary.roi_multiplier}x in Year 1.</strong>
            </p>
          </div>
        </>
      )}
    </div>
  )
}
