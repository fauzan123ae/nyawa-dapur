import { useNavigate } from 'react-router-dom'
import { FlameIcon, SunIcon, MoonIcon, MenuIcon, ChevronUpIcon } from './icons'

// =============================================
// HEADER — sticky top bar
// =============================================
export default function Header({ t, isDark, user, isFireLit, flameLevel, mobileMenuOpen, setMobileMenuOpen, toggleTheme, logout, activeHouseholdName }) {
  const navigate = useNavigate()
  
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 ${t.header}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className={`p-1.5 flex items-center justify-center w-10 h-10 rounded-xl shadow-sm transition-all duration-300 ${isFireLit ? t.headerIconLit + ' scale-105' + (isDark ? ' animate-pulse' : '') : t.headerIcon}`}>
            <span className="text-xl">🍲</span>
          </div>
          <div>
            <h1 className={`text-lg font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${t.logo}`}>Nyawa Dapur</h1>
            <p className={`text-[10px] font-medium tracking-wide hidden sm:block ${t.logoSub}`}>Fresh & Sustainable Kitchen</p>
          </div>
        </div>

        {/* Pills — desktop */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
          <div className={`px-2.5 py-1 rounded-full border text-xs shadow-sm ${t.pill}`}>
            <span className="font-black">{user.xp} XP</span>
          </div>
          <div className={`px-2.5 py-1 rounded-full border text-xs shadow-sm ${t.pill}`}>
            <span className="font-black">🪵 {user.firewood || 0}</span>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-xs ${isFireLit ? t.streakOn : t.streakOff}`}>
            <FlameIcon className={`w-3.5 h-3.5 ${isFireLit ? 'animate-bounce' : ''}`} level={flameLevel} isLit={isFireLit} />
            <span className="font-black">{user.currentStreak || 0} Hari</span>
          </div>
          <button onClick={toggleTheme} className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1 ${t.toggleBtn}`}>
            {isDark ? <SunIcon /> : <MoonIcon />}
          </button>
          <button onClick={() => navigate('/kitchen-select')} className={`px-2.5 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 ${t.toggleBtn}`} title="Ganti Dapur">
            🏠 <span className="max-w-[100px] truncate">{activeHouseholdName || 'Dapur'}</span>
          </button>
          <button onClick={() => navigate('/profile')} className={`px-2.5 py-1 rounded-full border text-xs font-bold transition-all ${t.toggleBtn}`}>
            Profil
          </button>
          <button onClick={logout} className={`px-2.5 py-1 rounded-full border text-xs font-semibold transition-all ${t.logoutBtn}`}>Keluar</button>
        </div>

        {/* Mobile: XP pill + hamburger */}
        <div className="flex sm:hidden items-center gap-2">
          <div className={`px-2.5 py-1 rounded-full border text-xs ${t.pill}`}>
            <span className="font-black">{user.xp} XP</span>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full border text-xs ${isFireLit ? t.streakOn : t.streakOff}`}>
            <FlameIcon className="w-3 h-3" level={flameLevel} isLit={isFireLit} />
            <span className="font-black">{user.currentStreak || 0}</span>
          </div>
          <button onClick={() => setMobileMenuOpen(v => !v)} className={`p-2 rounded-xl border ${t.toggleBtn}`}>
            {mobileMenuOpen ? <ChevronUpIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className={`sm:hidden mt-3 pt-3 border-t flex flex-col gap-2 ${isDark ? 'border-zinc-700' : 'border-gray-100'}`}>
          <div className="flex flex-wrap gap-2 justify-between items-center px-1">
            <div className="flex gap-2">
              <div className={`px-3 py-1.5 rounded-full border text-xs ${t.pill}`}><span className="font-black">🪵 {user.firewood || 0} Kayu</span></div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { toggleTheme(); setMobileMenuOpen(false) }} className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${t.toggleBtn}`}>
                {isDark ? <SunIcon /> : <MoonIcon />} {isDark ? 'Terang' : 'Gelap'}
              </button>
              <button onClick={() => { navigate('/kitchen-select'); setMobileMenuOpen(false) }} className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${t.toggleBtn}`}>
                🏠 Ganti Dapur
              </button>
              <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false) }} className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${t.toggleBtn}`}>
                Profil
              </button>
              <button onClick={logout} className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${t.logoutBtn}`}>Keluar</button>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}