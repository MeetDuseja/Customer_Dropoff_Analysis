
import { useState, useEffect } from 'react'
import { predictRisk, getLiveUsers } from '../api/api'
import LoadingSpinner from '../components/LoadingSpinner'

export default function LivePredictor() {
  const [form, setForm] = useState({ age: 28, income: 45000, start_hour: 14, device: 'mobile_android', city: 'Mumbai', acquisition_source: 'paid_ads', is_weekend: 0, is_night: 0, total_time_seconds: 180 })
  const [result, setResult]         = useState(null)
  const [predicting, setPredicting] = useState(false)
  const [liveUsers, setLiveUsers]   = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)

  useEffect(() => {
    const fetchUsers = () => {
      getLiveUsers()
        .then(res => setLiveUsers(res.data.live_users))
        .finally(() => setLoadingUsers(false))
    }

    fetchUsers()

    const interval = setInterval(fetchUsers, 30000)
    return () => clearInterval(interval)
  }, [])

  const handlePredict = async () => {
    setPredicting(true)
    try { const res = await predictRisk(form); setResult(res.data) }
    finally { setPredicting(false) }
  }

  const inp = `w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-indigo-500`
  const lbl = `block text-slate-400 text-xs mb-1`
  const riskColors = {
    HIGH:   { bar: 'bg-red-500',    text: 'text-red-400',    bg: 'bg-red-500/10 border-red-500/30'       },
    MEDIUM: { bar: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30' },
    LOW:    { bar: 'bg-green-500',  text: 'text-green-400',  bg: 'bg-green-500/10 border-green-500/30'   },
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Live Risk Predictor</h1>
        <p className="text-slate-400 mt-1">Predict drop-off risk for any user in real-time</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 space-y-4">
          <h2 className="text-lg font-semibold text-white">User Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={lbl}>Age</label><input type="number" className={inp} value={form.age} onChange={e => setForm({...form, age: +e.target.value})} /></div>
            <div><label className={lbl}>Monthly Income (₹)</label><input type="number" className={inp} value={form.income} onChange={e => setForm({...form, income: +e.target.value})} /></div>
            <div>
              <label className={lbl}>Device</label>
              <select className={inp} value={form.device} onChange={e => setForm({...form, device: e.target.value})}>
                {['mobile_android','mobile_ios','desktop','tablet'].map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Source</label>
              <select className={inp} value={form.acquisition_source} onChange={e => setForm({...form, acquisition_source: e.target.value})}>
                {['organic_search','paid_ads','referral','social_media','email'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div><label className={lbl}>Hour (0-23)</label><input type="number" min={0} max={23} className={inp} value={form.start_hour} onChange={e => setForm({...form, start_hour: +e.target.value})} /></div>
            <div><label className={lbl}>Time on App (sec)</label><input type="number" className={inp} value={form.total_time_seconds} onChange={e => setForm({...form, total_time_seconds: +e.target.value})} /></div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_night === 1} onChange={e => setForm({...form, is_night: e.target.checked ? 1 : 0})} className="rounded" />Night Time?
            </label>
            <label className="flex items-center gap-2 text-slate-300 text-sm cursor-pointer">
              <input type="checkbox" checked={form.is_weekend === 1} onChange={e => setForm({...form, is_weekend: e.target.checked ? 1 : 0})} className="rounded" />Weekend?
            </label>
          </div>
          <button onClick={handlePredict} disabled={predicting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold py-3 rounded-lg transition-colors">
            {predicting ? '⏳ Predicting...' : '🔮 Predict Drop-off Risk'}
          </button>
        </div>

        <div>
          {result ? (
            <div className={`rounded-xl border p-6 space-y-4 ${riskColors[result.risk_level]?.bg}`}>
              <h2 className="text-lg font-semibold text-white">Prediction Result</h2>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Drop Probability</span>
                  <span className={`font-bold text-xl ${riskColors[result.risk_level]?.text}`}>{result.drop_probability}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4">
                  <div className={`h-4 rounded-full transition-all duration-700 ${riskColors[result.risk_level]?.bar}`} style={{ width: `${result.drop_probability}%` }} />
                </div>
              </div>
              <div className="text-center">
                <span className={`text-4xl font-black ${riskColors[result.risk_level]?.text}`}>{result.risk_level} RISK</span>
              </div>
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-slate-500 text-xs mb-1">RECOMMENDED ACTION</p>
                <p className="text-white font-medium">{result.recommended_action}</p>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex items-center justify-center h-64">
              <p className="text-slate-500">Fill in the form and click Predict</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              Live — Users Currently In Onboarding
            </h2>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-red-400 text-xs font-medium">LIVE</span>
              <span className="text-slate-500 text-xs">· refreshes every 30s</span>
            </div>
          </div>
        </div>
        {loadingUsers ? <LoadingSpinner /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-900/30">
                  {['User ID','Current Step','Time on Step','Device','Drop Risk','Action'].map(h => (
                    <th key={h} className="px-5 py-3 text-left text-slate-400 font-medium text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {liveUsers.map((user) => {
                  const rc = riskColors[user.risk_level]
                  return (
                    <tr key={user.user_id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-5 py-3 text-slate-300 font-mono text-xs">{user.user_id}</td>
                      <td className="px-5 py-3 text-white">{user.current_step}</td>
                      <td className="px-5 py-3 text-slate-400">{user.time_on_step}</td>
                      <td className="px-5 py-3 text-slate-400">{user.device}</td>
                      <td className="px-5 py-3"><span className={`font-bold ${rc?.text}`}>{user.drop_risk}%</span></td>
                      <td className="px-5 py-3">{user.action}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
