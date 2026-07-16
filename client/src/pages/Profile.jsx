import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword } from '../api/auth'
import { getHouseholdMembers } from '../api/household'
import Header from './Dashboard/Header'
import { themes } from './Dashboard/theme'
import { ArrowLeft, User, Lock, Users, Sparkles, Check, Copy } from 'lucide-react'

export default function Profile() {
  const { user, setUser, logout, activeHouseholdName } = useAuth()
  const navigate = useNavigate()

  // Theme logic
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('nd-theme') === 'dark' } catch { return true }
  })
  const t = isDark ? themes.dark : themes.light
  const toggleTheme = () => setIsDark(prev => {
    const next = !prev
    try { localStorage.setItem('nd-theme', next ? 'dark' : 'light') } catch {}
    return next
  })

  // State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showToast, setShowToast] = useState(null)

  // Forms state
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  
  const [passwordForm, setPasswordForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' })
  const [isPasswordSubmitting, setIsPasswordSubmitting] = useState(false)
  
  const [household, setHousehold] = useState(null)
  const [members, setMembers] = useState([])
  const [householdLoading, setHouseholdLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  // Initialization
  useEffect(() => {
    if (!user) return
    setProfileForm({ name: user.name, email: user.email })
    
    // Fetch household members
    getHouseholdMembers().then(res => {
      setMembers(res.data.members || [])
      setHousehold(res.data.household)
      setHouseholdLoading(false)
    }).catch(() => {
      setHouseholdLoading(false)
    })
  }, [user])

  const triggerToast = (message, type = 'success') => {
    setShowToast({ message, type })
    setTimeout(() => setShowToast(null), 3500)
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    setIsProfileSubmitting(true)
    try {
      const res = await updateProfile(profileForm)
      setUser(res.data.user)
      triggerToast('Profil berhasil diperbarui.')
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal update profil.', 'error')
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      triggerToast('Konfirmasi password tidak cocok.', 'error')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      triggerToast('Password baru minimal 8 karakter.', 'error')
      return
    }
    setIsPasswordSubmitting(true)
    try {
      await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      triggerToast('Password berhasil diubah.')
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal mengubah password.', 'error')
    } finally {
      setIsPasswordSubmitting(false)
    }
  }
  
  const handleCopyCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code)
      setCopied(true)
      triggerToast('Kode undangan disalin.')
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Dashboard Helpers for Header
  const flameLevel = useMemo(() => {
    const s = user?.currentStreak || 0
    if (s >= 30) return 'Mythic Flame'
    if (s >= 7)  return 'Blaze'
    return 'Spark'
  }, [user])
  const isFireLit = user?.isFireLit || false

  const isDefaultSolo = members.length === 1 && household?.owner_id === user?.id
  const now = new Date()

  if (!user) return null

  const inputClass = `w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${t.modalInput}`

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${t.page}`}>
      <Header
        t={t} isDark={isDark} user={user} isFireLit={isFireLit} flameLevel={flameLevel}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        toggleTheme={toggleTheme} logout={logout}
        activeHouseholdName={activeHouseholdName}
      />

      <main className="max-w-3xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/dashboard')}
          className={`flex items-center gap-2 text-xs font-bold mb-6 transition-all duration-200 hover:translate-x-[-2px] focus:outline-none ${t.editBtn}`}
          aria-label="Kembali ke Dashboard"
        >
          <ArrowLeft className="w-4 h-4" /> Kembali ke Dashboard
        </button>

        {/* Header Profil */}
        <div className={`p-6 rounded-3xl border mb-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left ${t.sectionCard}`}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent text-white flex items-center justify-center text-4xl font-extrabold shadow-lg relative overflow-hidden select-none shrink-0">
            <span className="relative z-10">{user.name.charAt(0).toUpperCase()}</span>
            <div className="absolute inset-0 bg-black/10 mix-blend-overlay" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className={`text-2xl font-black mb-1 tracking-tight truncate ${isDark ? 'text-stone-100' : 'text-gray-900'}`}>{user.name}</h2>
            <p className={`text-xs font-semibold mb-4 truncate ${isDark ? 'text-stone-400' : 'text-muted'}`}>{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-1.5">
              <span className={`px-3 py-1 rounded-full border text-[10px] font-bold ${t.pill}`}>{user.xp} XP</span>
              <span className={`px-3 py-1 rounded-full border text-[10px] font-bold ${t.pill}`}>Level {user.level}</span>
              <span className={`px-3 py-1 rounded-full border text-[10px] font-bold ${t.pill}`}>🔥 {user.currentStreak} Hari Streak</span>
            </div>
          </div>
        </div>

        {/* Form Edit Profil */}
        <div className={`p-6 rounded-3xl border mb-6 ${t.sectionCard}`}>
          <h3 className={`text-base font-black mb-4 flex items-center gap-1.5 ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
            <User className="w-4 h-4 text-primary" /> Pengaturan Profil
          </h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Nama</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                className={inputClass} required />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Email</label>
              <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                className={inputClass} required />
            </div>
            <button type="submit" disabled={isProfileSubmitting} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-accent text-white font-bold rounded-xl text-xs transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer">
              {isProfileSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>

        {/* Ganti Password */}
        <div className={`p-6 rounded-3xl border mb-6 ${t.sectionCard}`}>
          <h3 className={`text-base font-black mb-4 flex items-center gap-1.5 ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
            <Lock className="w-4 h-4 text-primary" /> Keamanan Sandi
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Password Lama</label>
              <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                className={inputClass} required />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Password Baru (min 8 karakter)</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className={inputClass} required />
            </div>
            <div>
              <label className={`block text-[10px] font-bold uppercase tracking-wide mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Konfirmasi Password Baru</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className={inputClass} required />
            </div>
            <button type="submit" disabled={isPasswordSubmitting} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-accent text-white font-bold rounded-xl text-xs transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer">
              {isPasswordSubmitting ? 'Mengubah...' : 'Ganti Password'}
            </button>
          </form>
        </div>

        {/* Dapur Keluarga */}
        <div className={`p-6 rounded-3xl border ${t.sectionCard}`}>
          <h3 className={`text-base font-black mb-4 flex items-center gap-1.5 ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
            <Users className="w-4 h-4 text-primary" /> Dapur Keluarga
          </h3>
          
          {householdLoading ? (
            <div className="flex items-center gap-2 text-xs text-muted font-bold py-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              Memuat data dapur...
            </div>
          ) : (
            isDefaultSolo ? (
              <div className="py-2">
                <p className={`text-xs leading-relaxed mb-4 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
                  Anda saat ini mengelola Dapur Mandiri. Dapatkan pengalaman yang lebih menyenangkan dengan membuat atau bergabung ke Dapur Keluarga!
                </p>
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary hover:from-secondary hover:to-accent text-white font-bold rounded-xl text-xs transition-all duration-200 active:scale-95 shadow-sm cursor-pointer">
                  Buat atau Gabung Dapur
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${isDark ? 'bg-zinc-900/60 border-zinc-700' : 'bg-cream border-border'}`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-[#7BAE7F]' : 'text-primary'}`}>Dapur Aktif</p>
                    <h4 className={`text-sm font-black ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>{household?.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold mb-1 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>Invite Code</p>
                    <button onClick={handleCopyCode} className={`text-xs px-2.5 py-1 rounded-lg border font-black transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 ${isDark ? 'bg-zinc-800 border-zinc-600 text-stone-200' : 'bg-white border-gray-300 text-gray-700 shadow-sm'}`}>
                      <span className="font-mono">{household?.invite_code}</span>
                      {copied ? <Check className="w-3.5 h-3.5 text-success" /> : <Copy className="w-3.5 h-3.5 text-muted" />}
                    </button>
                  </div>
                </div>

                <div className={`rounded-xl border divide-y overflow-hidden ${isDark ? 'border-zinc-700 divide-zinc-700 bg-zinc-950/20' : 'border-border divide-gray-100 bg-[#F8F7F2]'}`}>
                  {members.map(m => {
                    const lastActive = m.last_active_at ? new Date(m.last_active_at) : null;
                    const isActive = lastActive && (now - lastActive) < 24 * 60 * 60 * 1000;

                    return (
                      <div key={m.id} className="flex justify-between items-center px-4 py-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? 'bg-success' : 'bg-gray-400'}`} title={isActive ? 'Aktif 24 jam terakhir' : 'Tidak aktif hari ini'} />
                          <div className="min-w-0">
                            <p className={`text-xs font-bold truncate ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
                              {m.name} {m.id === user.id ? '(Anda)' : ''}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${
                          m.role === 'owner' 
                            ? (isDark ? 'bg-[#7BAE7F]/10 border-[#7BAE7F]/30 text-[#7BAE7F]' : 'bg-primary/10 border-primary/20 text-primary')
                            : (isDark ? 'bg-zinc-800 border-zinc-600 text-stone-450' : 'bg-white border-border text-gray-500')
                        }`}>
                          {m.role === 'owner' ? 'Owner' : 'Anggota'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          )}
        </div>

        {/* TOAST */}
        {showToast && (
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50 animate-[fadeIn_0.2s_ease-out]">
            <div className={`px-4 sm:px-5 py-3 rounded-2xl shadow-lg border text-xs font-black text-center sm:text-left ${
              showToast.type === 'error' 
                ? (isDark ? 'bg-red-950 border-red-950 text-red-400' : 'bg-danger/10 border-danger/20 text-danger')
                : t.toast
            }`}>
              {showToast.message}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
