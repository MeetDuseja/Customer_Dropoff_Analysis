export default function KPICard({ title, value, subtitle, color = 'indigo', icon }) {
  const colors = {
    indigo: 'border-indigo-500 bg-indigo-500/10',
    red:    'border-red-500 bg-red-500/10',
    green:  'border-green-500 bg-green-500/10',
    yellow: 'border-yellow-500 bg-yellow-500/10',
  }
  return (
    <div className={`rounded-xl border-l-4 p-5 ${colors[color]} bg-slate-800`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm">{title}</p>
          <p className="text-3xl font-bold text-white mt-1">{value}</p>
          {subtitle && <p className="text-slate-400 text-xs mt-1">{subtitle}</p>}
        </div>
        {icon && <div className="text-4xl opacity-20">{icon}</div>}
      </div>
    </div>
  )
}