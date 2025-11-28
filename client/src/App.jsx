import { useState } from 'react'
import './App.css'
import LandingPage from './pages/landingPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // TODO: Add your dashboard component here
  const Dashboard = () => (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to MoneyAura Dashboard</h1>
        <p className="text-gray-600 mb-8">Your financial dashboard will be displayed here.</p>
        <button
          onClick={() => setIsAuthenticated(false)}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )

  return (
    <>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <LandingPage onLogin={() => setIsAuthenticated(true)} />
      )}
    </>
  )
}

export default App
