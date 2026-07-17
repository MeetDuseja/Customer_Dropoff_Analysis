import { useState } from 'react'
import { Download } from 'lucide-react'

export default function ExportButton({ data, filename }) {
  const [exporting, setExporting] = useState(false)

  const exportCSV = () => {
    if (!data || data.length === 0) {
      alert('No data to export')
      return
    }

    setExporting(true)

    const headers = Object.keys(data[0]).join(',')
    const rows = data.map(row =>
      Object.values(row)
        .map(v => `"${v}"`)
        .join(',')
    ).join('\n')

    const csv = `${headers}\n${rows}`
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    setExporting(false)
  }

  return (
    <button
      onClick={exportCSV}
      disabled={exporting}
      className="flex items-center gap-2 px-4 py-2 bg-slate-700
                 hover:bg-slate-600 text-slate-300 rounded-lg
                 text-sm transition-colors disabled:opacity-50
                 border border-slate-600"
    >
      <Download size={16} />
      {exporting ? 'Exporting...' : 'Export CSV'}
    </button>
  )
}