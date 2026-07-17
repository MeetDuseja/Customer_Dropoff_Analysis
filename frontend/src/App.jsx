import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DashboardLayout from './pages/DashboardLayout'
import OnboardingForm from './pages/OnboardingForm'
import Overview from './pages/Overview'
import FunnelAnalysis from './pages/FunnelAnalysis'
import PatternAnalysis from './pages/PatternAnalysis'
import Insights from './pages/Insights'
import LivePredictor from './pages/LivePredictor'
import RevenueImpact from './pages/RevenueImpact'
import CohortAnalysis from './pages/CohortAnalysis'
import ABSimulator from './pages/ABSimulator'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Homepage */}
        <Route path="/" element={<HomePage />} />

        {/* Onboarding Form */}
        <Route path="/onboarding" element={<OnboardingForm />} />

        {/* Dashboard with Sidebar */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Overview />} />
          <Route path="funnel"    element={<FunnelAnalysis />} />
          <Route path="patterns"  element={<PatternAnalysis />} />
          <Route path="cohort"    element={<CohortAnalysis />} />
          <Route path="insights"  element={<Insights />} />
          <Route path="simulator" element={<ABSimulator />} />
          <Route path="predictor" element={<LivePredictor />} />
          <Route path="revenue"   element={<RevenueImpact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}