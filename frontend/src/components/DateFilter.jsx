export default function DateFilter({ selected, onChange }) {
  const options = [
    { value: 0,   label: 'All Time'    },
    { value: 7,   label: 'Last 7 Days' },
    { value: 30,  label: 'Last 30 Days'},
    { value: 90,  label: 'Last 90 Days'},
  ]

  return (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            selected === opt.value
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border border-slate-700'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}