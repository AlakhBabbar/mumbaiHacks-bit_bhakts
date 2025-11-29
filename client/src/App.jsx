import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/landingPage'
import LoginPage from './pages/loginPage'
import SignupPage from './pages/signupPage'
import QuestionnairePage from './pages/questionnairePage'
import Dashboard from './pages/dashboardPage'
import GoalsPage from './pages/goalsPage'
import AlertsPage from './pages/alertsPage'
import NotificationsPage from './pages/notificationsPage'
import FinancialDataPage from './pages/financialDataPage'
import { auth } from './firebase/firebase'
import { onAuthStateChanged } from 'firebase/auth'

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
      setLoading(false)
    })
    return unsubscribe
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-emerald-400 text-xl">Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Landing Page Wrapper
const LandingPageWrapper = () => {
  const navigate = useNavigate()
  
  return (
    <LandingPage 
      onLogin={() => navigate('/login')}
      onSignup={() => navigate('/signup')}
    />
  )
}

// Login Page Wrapper
const LoginPageWrapper = () => {
  const navigate = useNavigate()
  
  return (
    <LoginPage 
      onLoginComplete={() => navigate('/dashboard')}
      onBackToHome={() => navigate('/')}
      onSignup={() => navigate('/signup')}
    />
  )
}

// Signup Page Wrapper
const SignupPageWrapper = () => {
  const navigate = useNavigate()
  
  return (
    <SignupPage 
      onSignupComplete={() => navigate('/questionnaire')}
      onBackToHome={() => navigate('/')}
      onLogin={() => navigate('/login')}
    />
  )
}

// Questionnaire Page Wrapper
const QuestionnairePageWrapper = () => {
  const navigate = useNavigate()
  
  return (
    <QuestionnairePage 
      onComplete={() => navigate('/dashboard')}
      onBackToHome={() => navigate('/')}
    />
  )
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPageWrapper />} />
        <Route path="/login" element={<LoginPageWrapper />} />
        <Route path="/signup" element={<SignupPageWrapper />} />
        <Route path="/questionnaire" element={<QuestionnairePageWrapper />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/goals" 
          element={
            <ProtectedRoute>
              <GoalsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/alerts" 
          element={
            <ProtectedRoute>
              <AlertsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/notifications" 
          element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/financial-data" 
          element={
            <ProtectedRoute>
              <FinancialDataPage />
            </ProtectedRoute>
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
