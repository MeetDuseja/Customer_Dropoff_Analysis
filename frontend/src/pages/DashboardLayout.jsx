import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'

export default function DashboardLayout() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 flex-1 min-h-screen p-8">
        <Outlet />
      </main>
    </div>
  )
}