import { useNavigate } from 'react-router-dom'
import { FlameIcon, SunIcon, MoonIcon, MenuIcon, ChevronUpIcon } from './icons'
import { Home, Sparkles } from 'lucide-react'

// =============================================
// HEADER — sticky top bar
// =============================================
export default function Header({ t, isDark, user, isFireLit, flameLevel, mobileMenuOpen, setMobileMenuOpen, toggleTheme, logout, activeHouseholdName, realtimeStatus }) {
  const navigate = useNavigate()
  
  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md border-b-2 px-4 py-3 ${t.header}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0 select-none">
          <div className={`p-1.5 flex items-center justify-center w-10 h-10 rounded-2xl shadow-sm transition-all duration-300 ${isFireLit ? t.headerIconLit + ' scale-105 animate-bounce-cute' : t.headerIcon}`}>
            <span className="text-xl animate-sway">🍲</span>
          </div>
          <div>
            <h1 className={`text-xl font-black tracking-tight flex items-center gap-1 ${t.logo}`}>
              Nyawa Dapur <span className="text-sm animate-sway">🌱</span>
            </h1>
            <p className={`text-[10px] font-bold tracking-wide hidden sm:block ${t.logoSub}`}>Dapur Ekologis Paling Ceria 😊</p>
          </div>
        </div>

        {/* Pills — desktop */}
        <div className="hidden sm:flex items-center gap-2 flex-wrap justify-end">
          <div className={`px-3.5 py-1 rounded-full border-2 text-xs shadow-sm flex items-center gap-1 ${t.pill}`}>
            <Sparkles className="w-3.5 h-3.5 text-secondary animate-pulse" />
            <span className="font-extrabold">{user.xp} XP</span>
          </div>
          <div className={`px-3.5 py-1 rounded-full border-2 text-xs shadow-sm flex items-center gap-1.5 ${t.pill}`}>
            <span className="text-base leading-none">🪵</span> <span className="font-extrabold">{user.firewood || 0}</span>
          </div>
          <div className={`flex items-center gap-1 px-3.5 py-1 rounded-full border-2 transition-all duration-200 text-xs shadow-sm ${isFireLit ? t.streakOn : t.streakOff}`}>
            <FlameIcon className={`w-3.5 h-3.5 ${isFireLit ? 'animate-bounce-cute' : ''}`} level={flameLevel} isLit={isFireLit} />
            <span className="font-black">{user.currentStreak || 0} Hari Streak 🌟</span>
          </div>
          <button onClick={toggleTheme} className={`p-2 rounded-full border-2 text-xs font-bold flex items-center justify-center transition-all duration-200 focus:outline-none ${t.toggleBtn}`} title="Ganti Tema" aria-label="Toggle Theme">
            {isDark ? <SunIcon className="w-4 h-4 text-warning" /> : <MoonIcon className="w-4 h-4 text-primary" />}
          </button>
          <button onClick={() => navigate('/kitchen-select')} className={`px-4 py-1.5 rounded-full border-2 text-xs font-extrabold flex items-center gap-1.5 transition-all duration-200 focus:outline-none ${t.toggleBtn}`} title="Ganti Dapur" aria-label="Ganti Dapur">
            <Home className="w-3.5 h-3.5" /> <span className="max-w-[100px] truncate">{activeHouseholdName || 'Dapur'}</span>
            {realtimeStatus && (
              <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] ml-1 transition-opacity ${realtimeStatus === 'connected' ? 'bg-success/10 text-success' : 'bg-gray-500/10 text-gray-500'} opacity-90`}>
                <span className={`w-1.5 h-1.5 rounded-full ${realtimeStatus === 'connected' ? 'bg-success' : 'bg-gray-500'}`}></span>
                {realtimeStatus === 'connected' ? 'Live' : ''}
              </span>
            )}
          </button>
          <button onClick={() => navigate('/profile')} className={`px-4 py-1.5 rounded-full border-2 text-xs font-extrabold transition-all duration-200 focus:outline-none ${t.toggleBtn}`} aria-label="Profil">
            Profil 👤
          </button>
          <button onClick={logout} className={`px-4 py-1.5 rounded-full border-2 text-xs font-extrabold transition-all duration-200 focus:outline-none ${t.logoutBtn}`} aria-label="Keluar">Keluar 🚪</button>
        </div>

        {/* Mobile: XP pill + hamburger */}
        <div className="flex sm:hidden items-center gap-1.5">
          <div className={`px-3 py-1 rounded-full border-2 text-xs shadow-sm flex items-center gap-1 ${t.pill}`}>
            <span className="font-extrabold">{user.xp} XP</span>
          </div>
          <div className={`flex items-center gap-1 px-3 py-1 rounded-full border-2 text-xs shadow-sm transition-all duration-200 ${isFireLit ? t.streakOn : t.streakOff}`}>
            <FlameIcon className="w-3.5 h-3.5" level={flameLevel} isLit={isFireLit} />
            <span className="font-extrabold">{user.currentStreak || 0}</span>
          </div>
          <button onClick={() => setMobileMenuOpen(v => !v)} className={`p-2 rounded-full border-2 transition-all duration-200 focus:outline-none ${t.toggleBtn}`} aria-label="Menu">
            {mobileMenuOpen ? <ChevronUpIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      <div className={`sm:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-48 opacity-100 mt-3 pt-3 border-t-2' : 'max-h-0 opacity-0'} border-border`}>
        <div className="flex flex-wrap gap-2 justify-between items-center px-1">
          <div className="flex gap-2">
            <div className={`px-3.5 py-1.5 rounded-full border-2 text-xs flex items-center shadow-sm ${t.pill}`}><span className="text-sm mr-1">🪵</span> <span className="font-extrabold">{user.firewood || 0} Kayu</span></div>
          </div>
          <div className="flex gap-1.5">
            <button onClick={() => { toggleTheme(); setMobileMenuOpen(false) }} className={`p-2 rounded-full border-2 text-xs font-bold flex items-center justify-center transition-all duration-200 focus:outline-none ${t.toggleBtn}`} aria-label="Toggle Theme">
              {isDark ? <SunIcon className="w-4 h-4 text-warning" /> : <MoonIcon className="w-4 h-4 text-primary" />}
            </button>
            <button onClick={() => { navigate('/kitchen-select'); setMobileMenuOpen(false) }} className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold flex items-center gap-1.5 transition-all duration-200 focus:outline-none ${t.toggleBtn}`} aria-label="Ganti Dapur">
              <Home className="w-3.5 h-3.5" /> Dapur
            </button>
            <button onClick={() => { navigate('/profile'); setMobileMenuOpen(false) }} className={`px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all duration-200 focus:outline-none ${t.toggleBtn}`} aria-label="Profil">
              Profil
            </button>
            <button onClick={logout} className={`px-3 py-1.5 rounded-full border-2 text-xs font-semibold transition-all duration-200 focus:outline-none ${t.logoutBtn}`} aria-label="Keluar">Keluar</button>
          </div>
        </div>
      </div>
    </header>
  )
}