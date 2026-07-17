import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register as apiRegister } from '../api/auth'
import { useAuth } from '../context/AuthContext'
import { Leaf, UserPlus, Lock, Mail, User, Sparkles } from 'lucide-react'

export default function Register() {
  const { login }   = useAuth()
  const navigate    = useNavigate()
  const [form, setForm]       = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [shake, setShake]     = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setShake(false)
    if (form.password !== form.password_confirmation) {
      setShake(true)
      setTimeout(() => setShake(false), 500)
      return setError('Password tidak cocok.')
    }
    setLoading(true)
    try {
      const res = await apiRegister(form)
      login(res.data.token, res.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal.')
      setShake(true)
      setTimeout(() => setShake(false), 500)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { key: 'name',                  type: 'text',     placeholder: 'Nama Lengkap', icon: <User className="w-4 h-4" /> },
    { key: 'email',                 type: 'email',    placeholder: 'Alamat Email', icon: <Mail className="w-4 h-4" /> },
    { key: 'password',              type: 'password', placeholder: 'Password (min 8 karakter)', icon: <Lock className="w-4 h-4" /> },
    { key: 'password_confirmation', type: 'password', placeholder: 'Konfirmasi Password', icon: <Lock className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#FFFDF9] dark:bg-[#1C1008] flex flex-col lg:flex-row transition-colors duration-300">
      
      {/* Left Column / Mobile Top Hero Banner */}
      <div className="w-full lg:w-1/2 h-[260px] lg:h-auto bg-gradient-to-br from-primary via-[#E8956A] to-cream dark:from-[#1B221F] dark:via-[#222B27] dark:to-[#121714] relative overflow-hidden flex flex-col justify-between p-6 lg:p-12 text-white border-b-2 lg:border-b-0 lg:border-r-2 border-border dark:border-[#4A2E18] shrink-0">
        {/* Animated nature details */}
        <div className="absolute top-4 right-10 text-white/10 text-7xl lg:text-9xl pointer-events-none select-none">🍃</div>
        <div className="absolute top-1/4 right-8 lg:right-20 animate-bounce text-xl lg:text-2xl" style={{ animationDuration: '4.5s' }}>🦋</div>
        <div className="absolute bottom-4 left-1/4 animate-pulse text-base lg:text-xl">🌱</div>
        
        {/* Pot & Steam */}
        <div className="absolute right-4 bottom-4 lg:right-16 lg:bottom-16 text-5xl lg:text-7xl select-none flex flex-col items-center">
          <span className="animate-steam text-sm opacity-0 absolute -top-4">💨</span>
          <span className="animate-steam text-xs opacity-0 absolute -top-6" style={{ animationDelay: '0.4s' }}>💨</span>
          <span className="animate-sway">🍲</span>
        </div>

        {/* Floating Bee */}
        <div className="absolute top-16 left-1/3 animate-float-slow text-sm select-none">
          🐝 <span className="text-[8px] bg-white/20 px-1 py-0.5 rounded-full backdrop-blur-xs font-bold">bzz</span>
        </div>
        
        {/* Mushroom & Ladybug */}
        <div className="absolute bottom-8 right-1/3 text-sm animate-pulse">🍄</div>
        <div className="absolute top-24 left-8 text-sm animate-bounce">🐞</div>

        {/* Brand Header */}
        <div className="z-10 flex items-center gap-2">
          <div className="p-2 bg-white/15 rounded-xl backdrop-blur-sm shadow-sm">
            <span className="text-xl">🍲</span>
          </div>
          <span className="text-base lg:text-xl font-black tracking-tight text-white dark:text-[#F5A96A]">Nyawa Dapur</span>
        </div>

        {/* Desktop Title & Intro */}
        <div className="z-10 max-w-md my-auto hidden lg:block animate-[fadeIn_0.4s_ease-out]">
          <h2 className="text-4xl font-extrabold leading-tight mb-4 text-white">
            Mulailah Petualangan Hijau Dapur Anda.
          </h2>
          <p className="text-sm text-white/90 leading-relaxed font-semibold">
            Daftarkan diri Anda untuk mulai berkolaborasi menghemat makanan, menimbun XP ekologis, dan memelihara kebiasaan dapur yang segar dan lestari.
          </p>
        </div>

        {/* Mobile Title & Intro */}
        <div className="z-10 max-w-sm my-auto block lg:hidden pr-16 animate-[fadeIn_0.4s_ease-out]">
          <h2 className="text-xl font-black leading-tight text-white flex items-center gap-1">
            Start Your Green Kitchen Journey <span className="text-sm animate-sway">✨</span>
          </h2>
          <p className="text-[10px] text-white/90 mt-1 font-bold leading-relaxed">
            Discover delicious recipes while helping reduce food waste.
          </p>
        </div>

        {/* Footer info (Desktop only) */}
        <div className="z-10 hidden lg:flex justify-between text-xs text-white/60 font-semibold">
          <span>🌿 Nature, Cozy & Playful Dapur</span>
          <span>© 2026 Nyawa Dapur</span>
        </div>
      </div>

      {/* Right Column / Register Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-16">
        <div className={`w-full max-w-md bg-white dark:bg-[#261608] border-2 border-border dark:border-[#4A2E18] rounded-[2rem] p-8 sm:p-10 shadow-xl transition-all duration-300 ${shake ? 'animate-shake' : ''}`}>
          
          <div className="flex items-center gap-2 mb-6">
            <h1 className="text-xl sm:text-2xl font-black text-primary dark:text-[#F5A96A] tracking-tight">Daftar Akun Baru</h1>
          </div>

          {error && (
            <div className="text-danger text-xs mb-5 bg-danger/10 border-2 border-danger/20 p-3.5 rounded-2xl font-bold flex items-center gap-1.5 animate-[fadeIn_0.2s_ease-out]">
              <Sparkles className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {fields.map(({ key, type, placeholder, icon }) => (
              <div className="relative" key={key}>
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted dark:text-[#C4956A]">
                  {icon}
                </span>
                <input
                  type={type} placeholder={placeholder} required
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full bg-[#FFFDF9] dark:bg-[#2E1C0E] border-2 border-border dark:border-[#4A2E18] rounded-2xl pl-10 pr-4 py-3 text-gray-800 dark:text-[#F5E6D3] text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 dark:focus:ring-[#F5A96A]/10 focus:border-primary dark:focus:border-[#F5A96A] transition-all duration-200"
                />
              </div>
            ))}
            
            <button
              type="submit" disabled={loading}
              className="py-3 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-accent disabled:opacity-50 text-white font-extrabold rounded-2xl transition-all duration-200 active:scale-95 text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-primary/15 mt-2 cursor-pointer btn-squish"
            >
              <UserPlus className="w-4 h-4" />
              {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
            </button>
          </form>

          <p className="text-xs text-muted dark:text-[#C4956A] text-center mt-6 font-bold">
            Sudah memiliki akun?{' '}
            <Link to="/login" className="text-primary dark:text-[#F5A96A] font-black hover:underline">Masuk</Link>
          </p>
        </div>
      </div>

    </div>
  )
}