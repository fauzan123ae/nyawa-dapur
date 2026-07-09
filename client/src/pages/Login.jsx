import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as apiLogin } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await apiLogin(form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-800 border border-zinc-700 rounded-3xl p-8">
        <h1 className="text-2xl font-black text-emerald-400 mb-1">🔥 Nyawa Dapur</h1>
        <p className="text-xs text-stone-400 mb-6">Masuk ke dapur ekosistemmu</p>

        {error && (
          <div className="text-red-400 text-xs mb-4 bg-red-950/30 border border-red-900/40 p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email" placeholder="Email" required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
          />
          <input
            type="password" placeholder="Password" required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit" disabled={loading}
            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm"
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </button>
        </form>

        <p className="text-xs text-stone-400 text-center mt-4">
          Belum punya akun?{' '}
          <Link to="/register" className="text-emerald-400 hover:underline">Daftar</Link>
        </p>
      </div>
    </div>
  )
}