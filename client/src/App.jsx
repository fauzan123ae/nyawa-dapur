import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Dashboard      from './pages/Dashboard'
import Profile        from './pages/Profile'
import KitchenSelect  from './pages/KitchenSelect'
import Login          from './pages/Login'
import Register       from './pages/Register'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <span className="text-emerald-400 text-sm animate-pulse">Memuat...</span>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) return null
  return !user ? children : <Navigate to="/dashboard" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"               element={<Navigate to="/dashboard" replace />} />
          <Route path="/login"          element={<GuestRoute><Login /></GuestRoute>} />
          <Route path="/register"       element={<GuestRoute><Register /></GuestRoute>} />
          <Route path="/dashboard"      element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"        element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/kitchen-select" element={<ProtectedRoute><KitchenSelect /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}