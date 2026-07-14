// =============================================
// ICONS
// =============================================
export const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)

export const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

export const FlameIcon = ({ className, level = 'Spark', isLit = true }) => {
  let fillGradient = 'url(#sparkGradient)'
  let glowColor    = 'rgba(34,197,94,0.6)'
  if (!isLit)                        { fillGradient = 'url(#dormantGradient)'; glowColor = 'rgba(148,163,184,0.1)' }
  else if (level === 'Blaze')        { fillGradient = 'url(#blazeGradient)';   glowColor = 'rgba(20,184,166,0.7)' }
  else if (level === 'Mythic Flame') { fillGradient = 'url(#mythicGradient)';  glowColor = 'rgba(234,179,8,0.8)' }
  return (
    <svg className={`${className} transition-all duration-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}>
      <defs>
        <linearGradient id="dormantGradient"  x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#475569"/><stop offset="50%" stopColor="#64748b"/><stop offset="100%" stopColor="#94a3b8"/></linearGradient>
        <linearGradient id="sparkGradient"    x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#15803d"/><stop offset="60%" stopColor="#22c55e"/><stop offset="100%" stopColor="#4ade80"/></linearGradient>
        <linearGradient id="blazeGradient"    x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0d9488"/><stop offset="40%" stopColor="#14b8a6"/><stop offset="80%" stopColor="#22c55e"/><stop offset="100%" stopColor="#bbf7d0"/></linearGradient>
        <linearGradient id="mythicGradient"   x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#166534"/><stop offset="40%" stopColor="#b45309"/><stop offset="80%" stopColor="#eab308"/><stop offset="100%" stopColor="#fef08a"/></linearGradient>
      </defs>
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" fill={fillGradient} stroke="none"/>
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke={isLit ? '#fff' : '#94a3b8'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export const PlusIcon        = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>)
export const TrashIcon       = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>)
export const ShoppingBagIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>)
export const PencilIcon      = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>)
export const MenuIcon        = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>)
export const ChevronUpIcon   = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>)
