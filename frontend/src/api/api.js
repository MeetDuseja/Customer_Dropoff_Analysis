import axios from 'axios'

const BASE = 'http://localhost:8000/api'
const api = axios.create({ baseURL: BASE })

export const getOverview       = (days = 0) => api.get(`/overview?days=${days}`)
export const getFunnel         = () => api.get('/funnel')
export const getPatternDevice  = () => api.get('/patterns/device')
export const getPatternTime    = () => api.get('/patterns/time')
export const getPatternAge     = () => api.get('/patterns/age')
export const getPatternCity    = () => api.get('/patterns/city')
export const getPatternSource  = () => api.get('/patterns/source')
export const getPatternHeatmap = () => api.get('/patterns/heatmap')
export const getInsights       = () => api.get('/insights')
export const getLiveUsers      = () => api.get('/predict/live-users')
export const getRevenue        = (loan, rate) => api.get(`/revenue?avg_loan=${loan}&commission_rate=${rate}`)
export const predictRisk       = (data) => api.post('/predict', data)
export const getCohort         = () => api.get('/cohort')
export const submitForm        = (data) => api.post('/form/submit', data)
export const validateOTP       = (data) => api.post('/form/validate-otp', data)
export const generateUserId    = () => api.get('/form/generate-user-id')