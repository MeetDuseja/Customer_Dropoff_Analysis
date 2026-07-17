import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { submitForm, validateOTP, generateUserId } from '../api/api'
import { ArrowLeft, ArrowRight, X, CheckCircle, Loader2, Upload, AlertCircle, Clock, Info } from 'lucide-react'

const STEPS = [
  'Mobile Entry',
  'OTP Verification',
  'Personal Details',
  'PAN Upload',
  'Aadhaar Verify',
  'Income Details',
  'Loan Preferences',
  'Final Submit'
]

const STEP_KEYS = [
  'step_1_mobile_entry',
  'step_2_otp_verification',
  'step_3_personal_details',
  'step_4_pan_upload',
  'step_5_aadhaar_verify',
  'step_6_income_details',
  'step_7_loan_preferences',
  'step_8_final_submit'
]

const STATES_OF_INDIA = [
  'Maharashtra','Delhi','Karnataka','Tamil Nadu','Telangana',
  'West Bengal','Gujarat','Rajasthan','Uttar Pradesh','Madhya Pradesh',
  'Kerala','Punjab','Haryana','Bihar','Odisha'
]

const CITIES = {
  'Maharashtra': ['Mumbai','Pune','Nagpur','Nashik'],
  'Delhi': ['New Delhi','Dwarka','Rohini'],
  'Karnataka': ['Bengaluru','Mysuru','Hubli'],
  'Tamil Nadu': ['Chennai','Coimbatore','Madurai'],
  'Telangana': ['Hyderabad','Warangal','Nizamabad'],
  'West Bengal': ['Kolkata','Howrah','Siliguri'],
  'Gujarat': ['Ahmedabad','Surat','Vadodara'],
  'Rajasthan': ['Jaipur','Jodhpur','Udaipur'],
  'Uttar Pradesh': ['Lucknow','Noida','Agra'],
  'Madhya Pradesh': ['Bhopal','Indore','Gwalior'],
  'Kerala': ['Kochi','Thiruvananthapuram','Kozhikode'],
  'Punjab': ['Chandigarh','Ludhiana','Amritsar'],
  'Haryana': ['Gurugram','Faridabad','Karnal'],
  'Bihar': ['Patna','Gaya','Muzaffarpur'],
  'Odisha': ['Bhubaneswar','Cuttack','Rourkela']
}

export default function OnboardingForm() {
  const location = useLocation()
  const navigate = useNavigate()
  const device = location.state?.device || 'desktop'

  const [step, setStep]             = useState(0)
  const [userId, setUserId]         = useState('')
  const [startTime, setStartTime]   = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [completed, setCompleted]   = useState(false)
  
  // OTP states
  const [otpSent, setOtpSent]       = useState(false)
  const [otpError, setOtpError]     = useState('')
  const [otpVerified, setOtpVerified] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpAttempts, setOtpAttempts] = useState(0)
  const [otpTimer, setOtpTimer]     = useState(0)
  const [otpResendCount, setOtpResendCount] = useState(0)
  
  // Aadhaar OTP states
  const [aadhaarOtpSent, setAadhaarOtpSent] = useState(false)
  const [aadhaarOtpError, setAadhaarOtpError] = useState('')
  const [aadhaarOtpVerified, setAadhaarOtpVerified] = useState(false)
  const [aadhaarOtpLoading, setAadhaarOtpLoading] = useState(false)
  const [aadhaarOtpAttempts, setAadhaarOtpAttempts] = useState(0)
  const [aadhaarOtpTimer, setAadhaarOtpTimer] = useState(0)
  
  // UX Issues based on insights
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const [showTip, setShowTip] = useState(true)
  const [pageLoadDelay, setPageLoadDelay] = useState(true)
  const [sessionWarning, setSessionWarning] = useState(false)

  const [form, setForm] = useState({
    mobile: '', otp: '',
    fullName: '', dob: '', gender: '', email: '',
    address: '', city: '', state: '', pincode: '',
    panNumber: '', panFile: null, panFileName: '',
    aadhaarNumber: '', aadhaarFile: null, aadhaarFileName: '', aadhaarOtp: '',
    employmentType: '', companyName: '', monthlyIncome: '',
    incomeProofFile: null, incomeProofFileName: '',
    bankName: '', accountNumber: '',
    loanAmount: '', loanTenure: '', loanPurpose: '',
    agreedTerms: false
  })

  const isAndroid = device === 'mobile_android'
  const isNightTime = () => {
    const hour = new Date().getHours()
    return hour >= 22 || hour <= 6
  }

  useEffect(() => {
    if (!location.state?.device) {
      navigate('/')
      return
    }
    const now = new Date()
    setStartTime(now.toISOString())
    generateUserId().then(res => setUserId(res.data.user_id))
  }, [])

  // Simulate slow page load on Android
  useEffect(() => {
    if (isAndroid) {
      setPageLoadDelay(true)
      const timer = setTimeout(() => setPageLoadDelay(false), 800)
      return () => clearTimeout(timer)
    } else {
      setPageLoadDelay(false)
    }
  }, [step, isAndroid])

  // OTP countdown timer
  useEffect(() => {
    if (otpTimer > 0) {
      const timer = setTimeout(() => setOtpTimer(otpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [otpTimer])

  useEffect(() => {
    if (aadhaarOtpTimer > 0) {
      const timer = setTimeout(() => setAadhaarOtpTimer(aadhaarOtpTimer - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [aadhaarOtpTimer])

  // Session warning for night users
  useEffect(() => {
    if (isNightTime()) {
      const timer = setTimeout(() => setSessionWarning(true), 60000)
      return () => clearTimeout(timer)
    }
  }, [step])

  const updateForm = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const getNow = () => {
    const now = new Date()
    return {
      hour: now.getHours(),
      day: now.toLocaleDateString('en-US', { weekday: 'long' }),
      date: now.toISOString().split('T')[0]
    }
  }

  const handleLeaveForm = async () => {
    const now = getNow()
    await submitForm({
      user_id: userId,
      device: device,
      step_reached: STEP_KEYS[step],
      step_number: step + 1,
      completed: false,
      dropped: true,
      start_hour: now.hour,
      start_day_of_week: now.day,
      start_date: now.date,
      start_timestamp: startTime,
      mobile_number: form.mobile || null,
      full_name: form.fullName || null,
      date_of_birth: form.dob || null,
      gender: form.gender || null,
      email: form.email || null,
      address: form.address || null,
      city: form.city || null,
      state: form.state || null,
      pincode: form.pincode || null,
      pan_number: form.panNumber || null,
      pan_file_name: form.panFileName || null,
      aadhaar_number: form.aadhaarNumber || null,
      aadhaar_file_name: form.aadhaarFileName || null,
      aadhaar_otp: form.aadhaarOtp || null,
      employment_type: form.employmentType || null,
      company_name: form.companyName || null,
      monthly_income: form.monthlyIncome ? parseFloat(form.monthlyIncome) : null,
      income_proof_file: form.incomeProofFileName || null,
      bank_name: form.bankName || null,
      account_number: form.accountNumber || null,
      loan_amount: form.loanAmount ? parseFloat(form.loanAmount) : null,
      loan_tenure: form.loanTenure ? parseInt(form.loanTenure) : null,
      loan_purpose: form.loanPurpose || null,
      agreed_terms: form.agreedTerms || null
    })
    navigate('/')
  }

  const handleFinalSubmit = async () => {
    setSubmitting(true)
    const now = getNow()
    await submitForm({
      user_id: userId,
      device: device,
      step_reached: 'step_8_final_submit',
      step_number: 8,
      completed: true,
      dropped: false,
      start_hour: now.hour,
      start_day_of_week: now.day,
      start_date: now.date,
      start_timestamp: startTime,
      mobile_number: form.mobile,
      full_name: form.fullName,
      date_of_birth: form.dob,
      gender: form.gender,
      email: form.email,
      address: form.address,
      city: form.city,
      state: form.state,
      pincode: form.pincode,
      pan_number: form.panNumber,
      pan_file_name: form.panFileName,
      aadhaar_number: form.aadhaarNumber,
      aadhaar_file_name: form.aadhaarFileName,
      aadhaar_otp: form.aadhaarOtp,
      employment_type: form.employmentType,
      company_name: form.companyName,
      monthly_income: parseFloat(form.monthlyIncome),
      income_proof_file: form.incomeProofFileName,
      bank_name: form.bankName,
      account_number: form.accountNumber,
      loan_amount: parseFloat(form.loanAmount),
      loan_tenure: parseInt(form.loanTenure),
      loan_purpose: form.loanPurpose,
      agreed_terms: form.agreedTerms
    })
    setSubmitting(false)
    setCompleted(true)
  }

  // UX Issue: Slow OTP send
  const handleSendOtp = () => {
    if (form.mobile.length === 10 && /^\d+$/.test(form.mobile)) {
      const delay = isAndroid ? 2000 : 500
      setOtpLoading(true)
      setTimeout(() => {
        setOtpSent(true)
        setOtpError('')
        setOtpTimer(30)
        setOtpLoading(false)
      }, delay)
    }
  }

  const handleResendOtp = () => {
    setOtpResendCount(otpResendCount + 1)
    setForm(prev => ({ ...prev, otp: '' }))
    setOtpError('')
    setOtpTimer(30)
  }

  const handleVerifyOtp = async () => {
    setOtpLoading(true)
    setOtpError('')
    const now = getNow()
    const res = await validateOTP({
      otp: form.otp,
      device: device,
      hour: now.hour,
      attempt: otpAttempts + 1
    })
    setOtpLoading(false)
    setOtpAttempts(otpAttempts + 1)
    if (res.data.valid) {
      setOtpVerified(true)
      setOtpError('')
    } else {
      setOtpError(res.data.message)
    }
  }

  const handleSendAadhaarOtp = () => {
    if (form.aadhaarNumber.length === 12 && /^\d+$/.test(form.aadhaarNumber)) {
      const delay = isAndroid ? 2500 : 800
      setAadhaarOtpLoading(true)
      setTimeout(() => {
        setAadhaarOtpSent(true)
        setAadhaarOtpError('')
        setAadhaarOtpTimer(45)
        setAadhaarOtpLoading(false)
      }, delay)
    }
  }

  const handleVerifyAadhaarOtp = async () => {
    setAadhaarOtpLoading(true)
    setAadhaarOtpError('')
    const now = getNow()
    const res = await validateOTP({
      otp: form.aadhaarOtp,
      device: device,
      hour: now.hour,
      attempt: aadhaarOtpAttempts + 1
    })
    setAadhaarOtpLoading(false)
    setAadhaarOtpAttempts(aadhaarOtpAttempts + 1)
    if (res.data.valid) {
      setAadhaarOtpVerified(true)
      setAadhaarOtpError('')
    } else {
      setAadhaarOtpError(res.data.message)
    }
  }

  // UX Issue: File upload sometimes fails on Android
  const handleFileUpload = (field, nameField) => {
    setUploadError('')
    setUploadingFile(true)
    
    const delay = isAndroid ? 2000 : 600
    
    setTimeout(() => {
      // 20% failure on Android
      if (isAndroid && Math.random() < 0.20) {
        setUploadingFile(false)
        setUploadError('Upload failed. File size too large or format not supported. Please try again.')
        return
      }
      
      const fakeNames = [
        'document_scan.jpg', 'IMG_20260709.png', 'photo_capture.jpg',
        'scan_001.pdf', 'upload_doc.jpeg'
      ]
      const randomName = fakeNames[Math.floor(Math.random() * fakeNames.length)]
      updateForm(nameField, randomName)
      setUploadingFile(false)
    }, delay)
  }

  // Check if current step is valid for Next button
  const isStepValid = () => {
    switch (step) {
      case 0: return form.mobile.length === 10 && /^\d+$/.test(form.mobile)
      case 1: return otpVerified
      case 2: return form.fullName && form.dob && form.gender && form.email &&
                     form.address && form.city && form.state && form.pincode &&
                     /^\d{6}$/.test(form.pincode) &&
                     /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)
      case 3: return form.panNumber.length === 10 &&
                     /^[A-Z]{5}\d{4}[A-Z]$/.test(form.panNumber.toUpperCase()) &&
                     form.panFileName
      case 4: return aadhaarOtpVerified && form.aadhaarFileName
      case 5: return form.employmentType && form.monthlyIncome &&
                     parseFloat(form.monthlyIncome) > 0 && form.bankName &&
                     form.accountNumber && form.incomeProofFileName
      case 6: return form.loanAmount && parseFloat(form.loanAmount) >= 10000 &&
                     form.loanTenure && form.loanPurpose
      case 7: return form.agreedTerms
      default: return false
    }
  }

  const inp = `w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3
               text-white text-sm focus:outline-none focus:border-indigo-500
               focus:ring-1 focus:ring-indigo-500 transition-colors`
  const lbl = `block text-slate-300 text-sm font-medium mb-2`
  const errCls = `text-red-400 text-xs mt-1`

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-slate-800 rounded-2xl p-10 border
                        border-green-500/30 text-center space-y-6">
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center
                          justify-center mx-auto">
            <CheckCircle size={40} className="text-green-400" />
          </div>
          <h1 className="text-3xl font-bold text-white">Application Submitted!</h1>
          <p className="text-slate-400">
            Your loan application <span className="text-green-400 font-mono">{userId}</span> has
            been submitted successfully. Our team will review it within 24-48 hours.
          </p>
          <div className="bg-slate-900/50 rounded-lg p-4 text-left space-y-2 text-sm">
            <p className="text-slate-400">Name: <span className="text-white">{form.fullName}</span></p>
            <p className="text-slate-400">Loan Amount: <span className="text-white">₹{parseFloat(form.loanAmount).toLocaleString()}</span></p>
            <p className="text-slate-400">Tenure: <span className="text-white">{form.loanTenure} months</span></p>
            <p className="text-slate-400">Device: <span className="text-white">{device}</span></p>
          </div>
          <button onClick={() => navigate('/')}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3
                       rounded-lg font-medium transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (pageLoadDelay && isAndroid) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 size={40} className="text-indigo-400 animate-spin mx-auto" />
          <p className="text-slate-400 text-sm">Loading... Please wait</p>
          <p className="text-slate-600 text-xs">Optimizing for your device</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8">
      <div className="max-w-lg w-full space-y-6">

        {/* Session Warning for Night Users */}
        {sessionWarning && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
            <Clock size={16} className="text-yellow-400 mt-0.5" />
            <div className="flex-1">
              <p className="text-yellow-400 text-xs font-medium">Session expires in 5 minutes</p>
              <p className="text-slate-400 text-xs mt-1">
                Complete your application soon to avoid data loss
              </p>
            </div>
            <button onClick={() => setSessionWarning(false)} className="text-slate-500 hover:text-white">
              <X size={14} />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Loan Application</h1>
            <p className="text-slate-500 text-xs mt-1">
              ID: {userId} | Device: {device}
            </p>
          </div>
          <button onClick={handleLeaveForm}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10
                       border border-red-500/30 text-red-400 rounded-lg
                       text-sm hover:bg-red-500/20 transition-colors">
            <X size={16} />
            Leave Form
          </button>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between text-xs text-slate-500 mb-2">
            <span>Step {step + 1} of 8</span>
            <span>{STEPS[step]}</span>
            <span>{Math.round(((step + 1) / 8) * 100)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((step + 1) / 8) * 100}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            {STEPS.map((s, i) => (
              <div key={i} className={`w-2 h-2 rounded-full ${
                i < step ? 'bg-green-500'
                : i === step ? 'bg-indigo-500'
                : 'bg-slate-600'
              }`} title={s} />
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl p-8 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">{STEPS[step]}</h2>

          {/* STEP 1: Mobile Entry */}
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Mobile Number *</label>
                <div className="flex gap-2">
                  <span className="bg-slate-700 border border-slate-600 rounded-lg
                                   px-4 py-3 text-slate-400 text-sm">+91</span>
                  <input type="tel" maxLength={10} className={inp}
                    placeholder="Enter 10-digit mobile number"
                    value={form.mobile}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 10)
                      updateForm('mobile', v)
                    }}
                  />
                </div>
                {form.mobile && form.mobile.length !== 10 && (
                  <p className={errCls}>Must be exactly 10 digits</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: OTP Verification (UX Issues) */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-slate-900/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">
                  OTP will be sent to <span className="text-white font-medium">+91 {form.mobile}</span>
                </p>
              </div>
              
              {!otpSent ? (
                <button onClick={handleSendOtp}
                  disabled={otpLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                             text-white py-3 rounded-lg font-medium transition-colors
                             flex items-center justify-center gap-2">
                  {otpLoading ? <><Loader2 size={18} className="animate-spin" /> Sending OTP...</>
                              : 'Send OTP'}
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-green-400 text-sm">✅ OTP sent to +91 {form.mobile}</p>
                    {otpTimer > 0 ? (
                      <p className="text-slate-500 text-xs">Resend in {otpTimer}s</p>
                    ) : (
                      <button onClick={handleResendOtp}
                        className="text-indigo-400 text-xs hover:underline">
                        Resend OTP
                      </button>
                    )}
                  </div>

                  {/* UX Issue: Android OTP auto-read warning */}
                  {isAndroid && (
                    <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <Info size={16} className="text-yellow-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-yellow-400 text-xs font-medium">
                            Auto-read may not work on your device
                          </p>
                          <p className="text-slate-400 text-xs mt-1">
                            Please open SMS app manually and enter OTP
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className={lbl}>
                      Enter 6-digit OTP *
                      {otpAttempts > 0 && (
                        <span className="text-slate-500 text-xs ml-2">
                          (Attempt {otpAttempts + 1})
                        </span>
                      )}
                    </label>
                    <input type="text" maxLength={6} className={inp}
                      placeholder="Enter OTP"
                      value={form.otp}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                        updateForm('otp', v)
                        setOtpError('')
                      }}
                    />
                    {form.otp && form.otp.length !== 6 && (
                      <p className={errCls}>OTP must be 6 digits</p>
                    )}
                  </div>

                  {otpError && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle size={16} className="text-red-400 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-red-400 text-sm">{otpError}</p>
                          {otpAttempts >= 2 && (
                            <p className="text-slate-400 text-xs mt-1">
                              Having trouble? Try requesting a new OTP or check your network
                            </p>
                          )}
                          {otpAttempts >= 4 && (
                            <p className="text-yellow-400 text-xs mt-1">
                              Multiple failures detected. Please contact support.
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {otpVerified ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                      <p className="text-green-400 text-sm">✅ OTP verified successfully</p>
                    </div>
                  ) : (
                    <button onClick={handleVerifyOtp}
                      disabled={form.otp.length !== 6 || otpLoading}
                      className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50
                                 text-white py-3 rounded-lg font-medium transition-colors
                                 flex items-center justify-center gap-2">
                      {otpLoading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                                  : 'Verify OTP'}
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 3: Personal Details */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Full Name *</label>
                <input type="text" className={inp} placeholder="Enter your full name"
                  value={form.fullName}
                  onChange={e => updateForm('fullName', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>Date of Birth *</label>
                  <input type="date" className={inp}
                    value={form.dob}
                    onChange={e => updateForm('dob', e.target.value)}
                  />
                </div>
                <div>
                  <label className={lbl}>Gender *</label>
                  <select className={inp} value={form.gender}
                    onChange={e => updateForm('gender', e.target.value)}>
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Email *</label>
                <input type="email" className={inp} placeholder="email@example.com"
                  value={form.email}
                  onChange={e => updateForm('email', e.target.value)}
                />
                {form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                  <p className={errCls}>Enter valid email</p>
                )}
              </div>
              <div>
                <label className={lbl}>Address *</label>
                <textarea className={inp} rows={2} placeholder="Full address"
                  value={form.address}
                  onChange={e => updateForm('address', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>State *</label>
                  <select className={inp} value={form.state}
                    onChange={e => {
                      updateForm('state', e.target.value)
                      updateForm('city', '')
                    }}>
                    <option value="">Select State</option>
                    {STATES_OF_INDIA.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={lbl}>City *</label>
                  <select className={inp} value={form.city}
                    onChange={e => updateForm('city', e.target.value)}>
                    <option value="">Select City</option>
                    {(CITIES[form.state] || []).map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className={lbl}>Pincode *</label>
                <input type="text" maxLength={6} className={inp} placeholder="6-digit pincode"
                  value={form.pincode}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                    updateForm('pincode', v)
                  }}
                />
                {form.pincode && form.pincode.length !== 6 && (
                  <p className={errCls}>Pincode must be 6 digits</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: PAN Upload (UX Issues) */}
          {step === 3 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>PAN Number *</label>
                <input type="text" maxLength={10} className={`${inp} uppercase`}
                  placeholder="ABCDE1234F"
                  value={form.panNumber}
                  onChange={e => updateForm('panNumber', e.target.value.toUpperCase().slice(0, 10))}
                />
                {form.panNumber && !/^[A-Z]{5}\d{4}[A-Z]$/.test(form.panNumber) && (
                  <p className={errCls}>Invalid PAN format (e.g., ABCDE1234F)</p>
                )}
              </div>
              <div>
                <label className={lbl}>Upload PAN Card *</label>
                
                {/* UX Issue: Android upload warning */}
                {isAndroid && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 mb-2">
                    <p className="text-yellow-400 text-xs">
                      ⚠️ Camera permission required. If upload fails, try again.
                    </p>
                  </div>
                )}
                
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                                  ${uploadingFile ? 'border-indigo-500 bg-indigo-500/5' :
                                    uploadError ? 'border-red-500' :
                                    'border-slate-600 hover:border-indigo-500'} cursor-pointer`}
                  onClick={() => !uploadingFile && handleFileUpload('panFile', 'panFileName')}>
                  {uploadingFile ? (
                    <div className="space-y-2">
                      <Loader2 size={24} className="text-indigo-400 mx-auto animate-spin" />
                      <p className="text-indigo-400 text-sm">Uploading...</p>
                      <p className="text-slate-500 text-xs">Please wait</p>
                    </div>
                  ) : form.panFileName ? (
                    <div className="space-y-2">
                      <CheckCircle size={24} className="text-green-400 mx-auto" />
                      <p className="text-green-400 text-sm">{form.panFileName}</p>
                      <p className="text-slate-500 text-xs">Click to re-upload</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={24} className="text-slate-500 mx-auto" />
                      <p className="text-slate-400 text-sm">Click to upload PAN card</p>
                      <p className="text-slate-600 text-xs">JPG, PNG, PDF — Max 5MB</p>
                    </div>
                  )}
                </div>
                {uploadError && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mt-2">
                    <div className="flex items-start gap-2">
                      <AlertCircle size={16} className="text-red-400 mt-0.5" />
                      <p className="text-red-400 text-xs">{uploadError}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 5: Aadhaar Verify (UX Issues) */}
          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Aadhaar Number *</label>
                <input type="text" maxLength={12} className={inp}
                  placeholder="12-digit Aadhaar number"
                  value={form.aadhaarNumber}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 12)
                    updateForm('aadhaarNumber', v)
                  }}
                />
                {form.aadhaarNumber && form.aadhaarNumber.length !== 12 && (
                  <p className={errCls}>Aadhaar must be 12 digits</p>
                )}
              </div>
              <div>
                <label className={lbl}>Upload Aadhaar Card *</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                                  ${uploadingFile ? 'border-indigo-500 bg-indigo-500/5' :
                                    'border-slate-600 hover:border-indigo-500'} cursor-pointer`}
                  onClick={() => !uploadingFile && handleFileUpload('aadhaarFile', 'aadhaarFileName')}>
                  {uploadingFile ? (
                    <div className="space-y-2">
                      <Loader2 size={24} className="text-indigo-400 mx-auto animate-spin" />
                      <p className="text-indigo-400 text-sm">Uploading...</p>
                    </div>
                  ) : form.aadhaarFileName ? (
                    <div className="space-y-2">
                      <CheckCircle size={24} className="text-green-400 mx-auto" />
                      <p className="text-green-400 text-sm">{form.aadhaarFileName}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={24} className="text-slate-500 mx-auto" />
                      <p className="text-slate-400 text-sm">Click to upload Aadhaar</p>
                      <p className="text-slate-600 text-xs">JPG, PNG, PDF — Max 5MB</p>
                    </div>
                  )}
                </div>
              </div>
              {form.aadhaarNumber.length === 12 && form.aadhaarFileName && (
                <div className="space-y-4">
                  {!aadhaarOtpSent ? (
                    <button onClick={handleSendAadhaarOtp}
                      disabled={aadhaarOtpLoading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50
                                 text-white py-3 rounded-lg font-medium transition-colors
                                 flex items-center justify-center gap-2">
                      {aadhaarOtpLoading ? <><Loader2 size={18} className="animate-spin" /> Connecting to UIDAI...</>
                                         : 'Send Aadhaar OTP'}
                    </button>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-green-400 text-sm">✅ OTP sent from UIDAI</p>
                        {aadhaarOtpTimer > 0 && (
                          <p className="text-slate-500 text-xs">Valid for {aadhaarOtpTimer}s</p>
                        )}
                      </div>
                      
                      {/* UX Issue: UIDAI slow warning */}
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-2">
                        <p className="text-blue-400 text-xs">
                          ℹ️ UIDAI servers may be slow. Please be patient.
                        </p>
                      </div>
                      
                      <div>
                        <label className={lbl}>
                          Enter Aadhaar OTP *
                          {aadhaarOtpAttempts > 0 && (
                            <span className="text-slate-500 text-xs ml-2">
                              (Attempt {aadhaarOtpAttempts + 1})
                            </span>
                          )}
                        </label>
                        <input type="text" maxLength={6} className={inp}
                          placeholder="Enter 6-digit OTP"
                          value={form.aadhaarOtp}
                          onChange={e => {
                            const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                            updateForm('aadhaarOtp', v)
                            setAadhaarOtpError('')
                          }}
                        />
                      </div>
                      {aadhaarOtpError && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <AlertCircle size={16} className="text-red-400 mt-0.5" />
                            <div>
                              <p className="text-red-400 text-sm">{aadhaarOtpError}</p>
                              {aadhaarOtpAttempts >= 2 && (
                                <p className="text-slate-400 text-xs mt-1">
                                  UIDAI service may be experiencing issues. Try again.
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                      {aadhaarOtpVerified ? (
                        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                          <p className="text-green-400 text-sm">✅ Aadhaar verified</p>
                        </div>
                      ) : (
                        <button onClick={handleVerifyAadhaarOtp}
                          disabled={form.aadhaarOtp.length !== 6 || aadhaarOtpLoading}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50
                                     text-white py-3 rounded-lg font-medium transition-colors
                                     flex items-center justify-center gap-2">
                          {aadhaarOtpLoading ? <><Loader2 size={18} className="animate-spin" /> Verifying...</>
                                             : 'Verify Aadhaar OTP'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 6: Income Details (UX Issues for Young Users) */}
          {step === 5 && (
            <div className="space-y-4">
              
              {/* UX Issue: Strict requirements warning */}
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="text-orange-400 mt-0.5" />
                  <div>
                    <p className="text-orange-400 text-xs font-medium">
                      Salary slip / bank statement mandatory
                    </p>
                    <p className="text-slate-400 text-xs mt-1">
                      Freelancers and self-employed users may face rejection.
                      Alternate income proofs not yet supported.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className={lbl}>Employment Type *</label>
                <select className={inp} value={form.employmentType}
                  onChange={e => updateForm('employmentType', e.target.value)}>
                  <option value="">Select</option>
                  <option value="salaried">Salaried (Recommended)</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="freelancer">Freelancer</option>
                  <option value="business_owner">Business Owner</option>
                </select>
              </div>

              {/* UX Issue: Warning for non-salaried users */}
              {form.employmentType && form.employmentType !== 'salaried' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-red-400 text-xs">
                    ⚠️ Higher rejection rate for non-salaried employment types.
                    Bank statement of last 6 months is mandatory.
                  </p>
                </div>
              )}

              {form.employmentType === 'salaried' && (
                <div>
                  <label className={lbl}>Company Name</label>
                  <input type="text" className={inp} placeholder="Company name"
                    value={form.companyName}
                    onChange={e => updateForm('companyName', e.target.value)}
                  />
                </div>
              )}
              <div>
                <label className={lbl}>Monthly Income (₹) *</label>
                <input type="number" className={inp} placeholder="Monthly income in ₹"
                  value={form.monthlyIncome}
                  onChange={e => updateForm('monthlyIncome', e.target.value)}
                />
                {form.monthlyIncome && parseFloat(form.monthlyIncome) < 15000 && (
                  <p className={errCls}>
                    ⚠️ Minimum income requirement is ₹15,000. Application may be rejected.
                  </p>
                )}
                {form.monthlyIncome && parseFloat(form.monthlyIncome) <= 0 && (
                  <p className={errCls}>Income must be positive</p>
                )}
              </div>
              <div>
                <label className={lbl}>Bank Name *</label>
                <select className={inp} value={form.bankName}
                  onChange={e => updateForm('bankName', e.target.value)}>
                  <option value="">Select Bank</option>
                  <option value="SBI">State Bank of India</option>
                  <option value="HDFC">HDFC Bank</option>
                  <option value="ICICI">ICICI Bank</option>
                  <option value="Axis">Axis Bank</option>
                  <option value="Kotak">Kotak Mahindra Bank</option>
                  <option value="PNB">Punjab National Bank</option>
                  <option value="BOB">Bank of Baroda</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Account Number *</label>
                <input type="text" className={inp} placeholder="Bank account number"
                  value={form.accountNumber}
                  onChange={e => updateForm('accountNumber', e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <label className={lbl}>
                  Upload Salary Slip / Bank Statement (Last 3 months) *
                </label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors
                                  ${uploadingFile ? 'border-indigo-500 bg-indigo-500/5' :
                                    'border-slate-600 hover:border-indigo-500'} cursor-pointer`}
                  onClick={() => !uploadingFile && handleFileUpload('incomeProofFile', 'incomeProofFileName')}>
                  {uploadingFile ? (
                    <div className="space-y-2">
                      <Loader2 size={24} className="text-indigo-400 mx-auto animate-spin" />
                      <p className="text-indigo-400 text-sm">Uploading...</p>
                    </div>
                  ) : form.incomeProofFileName ? (
                    <div className="space-y-2">
                      <CheckCircle size={24} className="text-green-400 mx-auto" />
                      <p className="text-green-400 text-sm">{form.incomeProofFileName}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload size={24} className="text-slate-500 mx-auto" />
                      <p className="text-slate-400 text-sm">Upload salary slip / bank statement</p>
                      <p className="text-slate-600 text-xs">JPG, PNG, PDF — Max 5MB</p>
                      <p className="text-red-400 text-xs mt-2">
                        ❌ UPI history / GST returns not accepted currently
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Loan Preferences */}
          {step === 6 && (
            <div className="space-y-4">
              <div>
                <label className={lbl}>Loan Amount (₹) *</label>
                <input type="number" className={inp} placeholder="Minimum ₹10,000"
                  value={form.loanAmount}
                  onChange={e => updateForm('loanAmount', e.target.value)}
                />
                {form.loanAmount && parseFloat(form.loanAmount) < 10000 && (
                  <p className={errCls}>Minimum loan amount is ₹10,000</p>
                )}
              </div>
              <div>
                <label className={lbl}>Loan Tenure (months) *</label>
                <select className={inp} value={form.loanTenure}
                  onChange={e => updateForm('loanTenure', e.target.value)}>
                  <option value="">Select Tenure</option>
                  <option value="6">6 Months</option>
                  <option value="12">12 Months</option>
                  <option value="18">18 Months</option>
                  <option value="24">24 Months</option>
                  <option value="36">36 Months</option>
                  <option value="48">48 Months</option>
                  <option value="60">60 Months</option>
                </select>
              </div>
              <div>
                <label className={lbl}>Loan Purpose *</label>
                <select className={inp} value={form.loanPurpose}
                  onChange={e => updateForm('loanPurpose', e.target.value)}>
                  <option value="">Select Purpose</option>
                  <option value="personal">Personal</option>
                  <option value="education">Education</option>
                  <option value="medical">Medical</option>
                  <option value="home_renovation">Home Renovation</option>
                  <option value="wedding">Wedding</option>
                  <option value="business">Business</option>
                  <option value="debt_consolidation">Debt Consolidation</option>
                  <option value="travel">Travel</option>
                </select>
              </div>
              {form.loanAmount && form.loanTenure && (
                <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Estimated Monthly EMI</p>
                  <p className="text-indigo-400 text-2xl font-bold mt-1">
                    ₹{Math.round(parseFloat(form.loanAmount) * 1.15 / parseInt(form.loanTenure)).toLocaleString()}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">
                    *Approximate at 15% annual interest rate
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 8: Final Submit */}
          {step === 7 && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-lg p-5 space-y-3 text-sm">
                <h3 className="text-white font-semibold text-base mb-3">Review Your Application</h3>
                <div className="grid grid-cols-2 gap-y-2">
                  <p className="text-slate-500">Name</p>
                  <p className="text-white">{form.fullName}</p>
                  <p className="text-slate-500">Mobile</p>
                  <p className="text-white">+91 {form.mobile}</p>
                  <p className="text-slate-500">Email</p>
                  <p className="text-white">{form.email}</p>
                  <p className="text-slate-500">PAN</p>
                  <p className="text-white">{form.panNumber}</p>
                  <p className="text-slate-500">City</p>
                  <p className="text-white">{form.city}, {form.state}</p>
                  <p className="text-slate-500">Income</p>
                  <p className="text-white">₹{parseFloat(form.monthlyIncome).toLocaleString()}/month</p>
                  <p className="text-slate-500">Loan Amount</p>
                  <p className="text-white">₹{parseFloat(form.loanAmount).toLocaleString()}</p>
                  <p className="text-slate-500">Tenure</p>
                  <p className="text-white">{form.loanTenure} months</p>
                  <p className="text-slate-500">Purpose</p>
                  <p className="text-white">{form.loanPurpose}</p>
                </div>
              </div>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" className="mt-1 rounded"
                  checked={form.agreedTerms}
                  onChange={e => updateForm('agreedTerms', e.target.checked)}
                />
                <span className="text-slate-300 text-sm">
                  I confirm that all information provided is correct and I agree to the
                  <span className="text-indigo-400"> Terms & Conditions</span> and
                  <span className="text-indigo-400"> Privacy Policy</span>.
                  I authorize the company to verify my documents and process my loan application.
                </span>
              </label>
            </div>
          )}

        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-6 py-3 bg-slate-800
                         border border-slate-700 text-slate-300 rounded-lg
                         text-sm hover:bg-slate-700 transition-colors">
              <ArrowLeft size={16} />
              Back
            </button>
          )}
          {step < 7 ? (
            <button onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3
                         bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30
                         disabled:cursor-not-allowed text-white rounded-lg
                         text-sm font-medium transition-colors">
              Next
              <ArrowRight size={16} />
            </button>
          ) : (
            <button onClick={handleFinalSubmit}
              disabled={!isStepValid() || submitting}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3
                         bg-green-600 hover:bg-green-700 disabled:opacity-30
                         disabled:cursor-not-allowed text-white rounded-lg
                         text-sm font-medium transition-colors">
              {submitting ? <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                          : '✅ Submit Application'}
            </button>
          )}
        </div>

      </div>
    </div>
  )
}