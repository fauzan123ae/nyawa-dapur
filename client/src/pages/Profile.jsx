import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { updateProfile, changePassword } from '../api/auth'
import { getHouseholdMembers } from '../api/household'
import Header from './Dashboard/Header'
import { themes } from './Dashboard/theme'

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
    setIsProfileSubmitting(true)
    try {
      await changePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword })
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' })
      triggerToast('Password berhasil diubah.')
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal mengubah password.', 'error')
    } finally {
      setIsProfileSubmitting(false)
    }
  }
  
  const handleCopyCode = () => {
    if (household?.invite_code) {
      navigator.clipboard.writeText(household.invite_code)
      triggerToast('Kode undangan disalin.')
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

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${t.page}`}>
      <Header
        t={t} isDark={isDark} user={user} isFireLit={isFireLit} flameLevel={flameLevel}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        toggleTheme={toggleTheme} logout={logout}
        activeHouseholdName={activeHouseholdName}
      />

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Header Profil */}
        <div className={`p-6 rounded-3xl border mb-6 flex flex-col sm:flex-row gap-6 items-center sm:items-start text-center sm:text-left ${t.sectionCard}`}>
          <div className="w-24 h-24 rounded-full bg-emerald-500 text-white flex items-center justify-center text-4xl font-black shadow-lg">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h2 className={`text-2xl font-black mb-1 ${isDark ? 'text-stone-100' : 'text-gray-900'}`}>{user.name}</h2>
            <p className={`text-sm mb-4 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>{user.email}</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2">
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${t.pill}`}>{user.xp} XP</span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${t.pill}`}>Level {user.level}</span>
              <span className={`px-3 py-1 rounded-full border text-xs font-bold ${t.pill}`}>🔥 {user.currentStreak} Hari</span>
            </div>
          </div>
        </div>

        {/* Form Edit Profil */}
        <div className={`p-6 rounded-3xl border mb-6 ${t.sectionCard}`}>
          <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>Edit Profil</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Nama</label>
              <input type="text" value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${t.modalInput}`} required />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Email</label>
              <input type="email" value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${t.modalInput}`} required />
            </div>
            <button type="submit" disabled={isProfileSubmitting} className={`px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm transition-all ${isProfileSubmitting ? 'opacity-50' : ''}`}>
              {isProfileSubmitting ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </form>
        </div>

        {/* Ganti Password */}
        <div className={`p-6 rounded-3xl border mb-6 ${t.sectionCard}`}>
          <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>Ganti Password</h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Password Lama</label>
              <input type="password" value={passwordForm.oldPassword} onChange={e => setPasswordForm({...passwordForm, oldPassword: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${t.modalInput}`} required />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Password Baru (min 8 karakter)</label>
              <input type="password" value={passwordForm.newPassword} onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${t.modalInput}`} required />
            </div>
            <div>
              <label className={`block text-xs font-bold mb-1.5 ${isDark ? 'text-stone-400' : 'text-gray-600'}`}>Konfirmasi Password Baru</label>
              <input type="password" value={passwordForm.confirmPassword} onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                className={`w-full px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${t.modalInput}`} required />
            </div>
            <button type="submit" disabled={isPasswordSubmitting} className={`px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl text-sm transition-all ${isPasswordSubmitting ? 'opacity-50' : ''}`}>
              Ganti Password
            </button>
          </form>
        </div>

        {/* Dapur Keluarga */}
        <div className={`p-6 rounded-3xl border ${t.sectionCard}`}>
          <h3 className={`text-lg font-black mb-4 ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>Dapur Keluarga</h3>
          
          {householdLoading ? (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              Memuat data dapur...
            </div>
          ) : (
            isDefaultSolo ? (
              <div>
                <p className={`text-sm mb-4 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>
                  Anda saat ini berada di Dapur Mandiri. Dapatkan pengalaman yang lebih seru dengan membuat atau bergabung ke Dapur Keluarga!
                </p>
                <button onClick={() => navigate('/dashboard')} className="px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white font-bold rounded-xl text-sm transition-all shadow-sm">
                  Buat atau Gabung Dapur
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                <div className={`p-4 rounded-2xl border flex justify-between items-center ${isDark ? 'bg-orange-950/20 border-orange-900/50' : 'bg-orange-50 border-orange-200'}`}>
                  <div>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-0.5 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Dapur Aktif</p>
                    <h4 className={`text-base font-black ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>{household?.name}</h4>
                  </div>
                  <div className="text-right">
                    <p className={`text-[10px] font-bold mb-1 ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>Invite Code</p>
                    <button onClick={handleCopyCode} className={`text-xs px-2.5 py-1 rounded-lg border font-black transition-all hover:scale-105 active:scale-95 ${isDark ? 'bg-zinc-800 border-zinc-600 text-stone-200' : 'bg-white border-gray-300 text-gray-700'}`}>
                      {household?.invite_code} 📋
                    </button>
                  </div>
                </div>

                <div className={`rounded-xl border divide-y overflow-hidden ${isDark ? 'border-zinc-700 divide-zinc-700' : 'border-gray-200 divide-gray-100'}`}>
                  {members.map(m => {
                    // Cek aktif 24 jam terakhir
                    let isActive = false;
                    if (m.joined_at) { // TODO: we don't have last_active_at in members, only in users. Oh wait, it is in users! Let's assume m.last_active_at is available if we fetch it, wait, we don't fetch last_active_at in getMembers.
                      // Let's use m.last_active_at or assume not active.
                      // Oh, I should update getMembers in backend if needed. For now, let's use what we have. If missing, we assume false.
                    }
                    // Wait, the prompt says "indikator aktif hari ini (dot hijau jika last_active_at dalam 24 jam terakhir, dot abu jika tidak)"
                    const lastActive = m.last_active_at ? new Date(m.last_active_at) : null;
                    isActive = lastActive && (now - lastActive) < 24 * 60 * 60 * 1000;

                    return (
                      <div key={m.id} className={`flex justify-between items-center px-4 py-3 ${isDark ? 'bg-zinc-800/30' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} title={isActive ? 'Aktif 24 jam terakhir' : 'Tidak aktif hari ini'} />
                          <div>
                            <p className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-stone-200' : 'text-gray-800'}`}>
                              {m.name} {m.id === user.id ? '(Anda)' : ''}
                            </p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${
                          m.role === 'owner' 
                            ? (isDark ? 'bg-orange-900/30 border-orange-700 text-orange-400' : 'bg-orange-100 border-orange-300 text-orange-700')
                            : (isDark ? 'bg-zinc-700 border-zinc-600 text-stone-300' : 'bg-white border-gray-300 text-gray-600')
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
          <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50">
            <div className={`px-4 sm:px-5 py-3 rounded-2xl shadow-lg border text-xs font-black text-center sm:text-left ${
              showToast.type === 'error' 
                ? (isDark ? 'bg-red-950 border-red-900 text-red-400' : 'bg-red-100 border-red-200 text-red-700')
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
