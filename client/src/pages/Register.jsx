import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as apiRegister } from '../api/auth'
import { useAuth } from '../context/AuthContext'

export default function Register() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.password !== form.password_confirmation) {
      return setError('Password tidak cocok.')
    }
    setLoading(true)
    try {
      const res = await apiRegister(form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal.')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',                  type: 'text',     placeholder: 'Nama lengkap' },
    { key: 'email',                 type: 'email',    placeholder: 'Email' },
    { key: 'password',              type: 'password', placeholder: 'Password (min 8 karakter)' },
    { key: 'password_confirmation', type: 'password', placeholder: 'Konfirmasi password' },
  ]

  return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-zinc-800 border border-zinc-700 rounded-3xl p-8">
        <h1 className="text-2xl font-black text-emerald-400 mb-1">🌱 Daftar Akun</h1>
        <p className="text-xs text-stone-400 mb-6">Mulai perjalanan dapur ekologismu</p>

        {error && (
          <div className="text-red-400 text-xs mb-4 bg-red-950/30 border border-red-900/40 p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {fields.map(({ key, type, placeholder }) => (
            <input
              key={key} type={type} placeholder={placeholder} required
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              className="bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 text-sm focus:outline-none focus:border-emerald-500"
            />
          ))}
          <button
            type="submit" disabled={loading}
            className="py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all text-sm"
          >
            {loading ? 'Mendaftar...' : 'Daftar'}
          </button>
        </form>

        <p className="text-xs text-stone-400 text-center mt-4">
          Sudah punya akun?{' '}
          <Link to="/login" className="text-emerald-400 hover:underline">Masuk</Link>
        </p>
      </div>
    </div>
  )
}