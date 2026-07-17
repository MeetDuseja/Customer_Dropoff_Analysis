import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer
} from 'recharts'

const STEPS = [
  { key: 'step_1_mobile_entry',     label: 'Mobile Entry',     current_drop: 3  },
  { key: 'step_2_otp_verification', label: 'OTP Verification', current_drop: 8  },
  { key: 'step_3_personal_details', label: 'Personal Details', current_drop: 7  },
  { key: 'step_4_pan_upload',       label: 'PAN Upload',       current_drop: 14 },
  { key: 'step_5_aadhaar_verify',   label: 'Aadhaar Verify',   current_drop: 12 },
  { key: 'step_6_income_details',   label: 'Income Details',   current_drop: 18 },
  { key: 'step_7_loan_preferences', label: 'Loan Preferences', current_drop: 6  },
  { key: 'step_8_final_submit',     label: 'Final Submit',     current_drop: 4  },
]

const TOTAL_USERS     = 10000
const REVENUE_PER_LOAN = 3000

function calculateCompletion(steps, improvements) {
  let remaining = TOTAL_USERS
  for (const step of steps) {
    const reduction = improvements[step.key] || 0
    const newDrop   = Math.max(0, step.current_drop - reduction)
    remaining       = remaining * (1 - newDrop / 100)
  }
  return Math.round(remaining)
}

export default function ABSimulator() {
  const [improvements, setImprovements] = useState(
    Object.fromEntries(STEPS.map(s => [s.key, 0]))
  )

  const currentCompleted  = calculateCompletion(STEPS, {})
  const improvedCompleted = calculateCompletion(STEPS, improvements)

  const currentRate   = (currentCompleted  / TOTAL_USERS * 100).toFixed(1)
  const improvedRate  = (improvedCompleted / TOTAL_USERS * 100).toFixed(1)
  const improvement   = (improvedRate - currentRate).toFixed(1)
  const extraLoans    = improvedCompleted - currentCompleted
  const revenueGain   = extraLoans * REVENUE_PER_LOAN
  const annualRevenue = revenueGain * 12

  const chartData = STEPS.map(s => ({
    name:     s.label,
    current:  s.current_drop,
    improved: Math.max(0, s.current_drop - (improvements[s.key] || 0))
  }))

  const resetAll = () => {
    setImprovements(Object.fromEntries(STEPS.map(s => [s.key, 0])))
  }

  return (
    <div className="space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">A/B Test Simulator</h1>
        <p className="text-slate-400 mt-1">
          Drag sliders to simulate what happens when you reduce drop rates
        </p>
      </div>

      {/* Impact Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 rounded-xl p-5 border border-slate-700">
          <p className="text-slate-400 text-sm">Current Rate</p>
          <p className="text-4xl font-bold text-red-400 mt-1">{currentRate}%</p>
          <p className="text-slate-500 text-xs mt-1">
            {currentCompleted.toLocaleString()} completions
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-indigo-500/50">
          <p className="text-slate-400 text-sm">Simulated Rate</p>
          <p className="text-4xl font-bold text-indigo-400 mt-1">{improvedRate}%</p>
          <p className="text-slate-500 text-xs mt-1">
            {improvedCompleted.toLocaleString()} completions
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-green-500/50">
          <p className="text-slate-400 text-sm">Improvement</p>
          <p className="text-4xl font-bold text-green-400 mt-1">
            +{improvement}%
          </p>
          <p className="text-slate-500 text-xs mt-1">
            +{extraLoans.toLocaleString()} extra loans/month
          </p>
        </div>
        <div className="bg-slate-800 rounded-xl p-5 border border-yellow-500/50">
          <p className="text-slate-400 text-sm">Annual Revenue Gain</p>
          <p className="text-3xl font-bold text-yellow-400 mt-1">
            ₹{(annualRevenue / 100000).toFixed(1)}L
          </p>
          <p className="text-slate-500 text-xs mt-1">
            ₹{revenueGain.toLocaleString()}/month
          </p>
        </div>
      </div>

      {/* Sliders */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            🎛️ Adjust Drop Reduction per Step
          </h2>
          <button
            onClick={resetAll}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600
                       text-slate-400 rounded-lg text-sm transition-colors"
          >
            Reset All
          </button>
        </div>

        <div className="space-y-6">
          {STEPS.map((step) => {
            const reduction = improvements[step.key] || 0
            const newDrop   = Math.max(0, step.current_drop - reduction)
            const saved     = Math.round(
              (TOTAL_USERS * (step.current_drop / 100)) -
              (TOTAL_USERS * (newDrop / 100))
            )

            return (
              <div key={step.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-300 text-sm font-medium">
                    {step.label}
                  </span>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-red-400">
                      Was: {step.current_drop}%
                    </span>
                    <span className="text-green-400">
                      Now: {newDrop}%
                    </span>
                    {saved > 0 && (
                      <span className="text-indigo-400">
                        +{saved} users saved
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar background */}
                <div className="relative">
                  <input
                    type="range"
                    min={0}
                    max={step.current_drop}
                    step={1}
                    value={reduction}
                    onChange={e => setImprovements({
                      ...improvements,
                      [step.key]: +e.target.value
                    })}
                    className="w-full h-2 appearance-none rounded-full
                               cursor-pointer accent-indigo-500"
                    style={{
                      background: `linear-gradient(to right,
                        #6366f1 0%,
                        #6366f1 ${(reduction / step.current_drop) * 100}%,
                        #334155 ${(reduction / step.current_drop) * 100}%,
                        #334155 100%)`
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-slate-600 mt-1">
                  <span>No change</span>
                  <span>Max reduction (-{step.current_drop}%)</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h2 className="text-lg font-semibold text-white mb-4">
          📊 Current vs Simulated Drop Rates
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis
              dataKey="name"
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
              formatter={v => [`${v}%`]}
            />
            <Bar
              dataKey="current"
              name="Current Drop %"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="improved"
              name="Simulated Drop %"
              fill="#6366f1"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-6 mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-red-500 inline-block" />
            Current Drop Rate
          </span>
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-indigo-500 inline-block" />
            Simulated Drop Rate
          </span>
        </div>
      </div>

      {/* Business Case */}
      {revenueGain > 0 && (
        <div className="bg-green-500/10 border border-green-500/30
                        rounded-xl p-6 space-y-3">
          <h3 className="text-green-400 font-bold text-lg">
            💡 Simulated Business Impact
          </h3>
          <p className="text-slate-300">
            With your selected improvements, completion rate goes from{' '}
            <strong className="text-red-400">{currentRate}%</strong> to{' '}
            <strong className="text-green-400 text-xl">{improvedRate}%</strong>.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Extra Loans/Month</p>
              <p className="text-white text-2xl font-bold">
                +{extraLoans.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Monthly Revenue</p>
              <p className="text-green-400 text-2xl font-bold">
                ₹{revenueGain.toLocaleString()}
              </p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-4 text-center">
              <p className="text-slate-500 text-xs mb-1">Annual Revenue</p>
              <p className="text-yellow-400 text-2xl font-bold">
                ₹{(annualRevenue / 100000).toFixed(1)} Lakhs
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}