import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import Landing from './pages/Landing'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'

const queryClient = new QueryClient()

function App() {
  const [user, setUser] = useState(null)

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('neustream_user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    localStorage.setItem('neustream_user', JSON.stringify(userData))
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('neustream_user')
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route
            path="/auth"
            element={
              user ? <Navigate to="/dashboard" replace /> : <Auth onLogin={handleLogin} />
            }
          />
          <Route
            path="/dashboard"
            element={
              user ? <Dashboard user={user} onLogout={handleLogout} /> : <Navigate to="/auth" replace />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  )
}

export default App