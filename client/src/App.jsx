import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/landingPage'
import LoginPage from './pages/loginPage'
import SignupPage from './pages/signupPage'
import QuestionnairePage from './pages/questionnairePage'
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
        <div className="text-green-400 text-xl">Loading...</div>
      </div>
    )
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Dashboard Component
const Dashboard = () => {
  const navigate = useNavigate()
  
  const handleLogout = async () => {
    await auth.signOut()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to MoneyAura Dashboard</h1>
        <p className="text-gray-600 mb-8">Your financial dashboard will be displayed here.</p>
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  )
}

export default App
