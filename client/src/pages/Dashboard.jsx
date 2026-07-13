import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboard, buyFirewood, igniteWood } from '../api/dashboard';
import { addIngredient, updateIngredient, adjustQuantity, cookIngredient, cookAmountIngredient, cookBatchIngredients, wasteIngredient, deleteIngredient } from '../api/ingredients';
import { claimQuest } from '../api/quests';

// =============================================
// THEME TOKENS
// =============================================
const themes = {
  light: {
    page:        'bg-gradient-to-br from-green-50 via-white to-emerald-50 text-gray-800',
    header:      'bg-white/80 border-green-100 shadow-sm',
    logo:        'from-green-700 via-emerald-600 to-teal-500',
    logoSub:     'text-green-600/80',
    headerIcon:  'bg-green-100',
    headerIconLit:'bg-gradient-to-tr from-green-500 to-emerald-400',
    pill:        'bg-green-50 border-green-200 text-green-700',
    streakOff:   'bg-gray-50 border-gray-200 text-gray-500',
    streakOn:    'bg-green-100 border-green-400 text-green-700',
    logoutBtn:   'bg-white hover:bg-red-50 text-gray-500 hover:text-red-500 border-gray-200 hover:border-red-200',
    toggleBtn:   'bg-gray-100 hover:bg-gray-200 text-gray-600 border-gray-200',
    card:        'bg-white border-gray-100 hover:border-green-200 shadow-sm hover:shadow-md',
    sectionCard: 'bg-white border-green-100 shadow-sm',
    sectionTitle:'text-green-800',
    sectionSub:  'text-gray-500',
    addBtn:      'bg-green-600 hover:bg-green-500 text-white shadow-sm',
    filterActive:'bg-green-600 text-white shadow-sm',
    filterIdle:  'bg-white text-gray-500 border border-gray-200 hover:border-green-300 hover:text-green-700',
    statSegar:   { on: 'bg-green-100 border-green-400 text-green-800 shadow-sm',   off: 'bg-white border-gray-200 hover:border-green-300 text-gray-700' },
    statWaspada: { on: 'bg-amber-50 border-amber-400 text-amber-800 shadow-sm',   off: 'bg-white border-gray-200 hover:border-amber-300 text-gray-700' },
    statKritis:  { on: 'bg-rose-50 border-rose-400 text-rose-800 shadow-sm',     off: 'bg-white border-gray-200 hover:border-rose-300 text-gray-700' },
    statBusuk:   { on: 'bg-red-50 border-red-400 text-red-800 shadow-sm',         off: 'bg-white border-gray-200 hover:border-red-300 text-gray-700' },
    ingCard:     'bg-white border-gray-100 hover:border-green-200 shadow-sm hover:shadow-md',
    cookedBadge: 'bg-green-100 text-green-700 border-green-200',
    qtyBox:      'bg-green-50 border-green-200',
    qtyText:     'text-green-700',
    qtyMinus:    'text-gray-400 hover:text-red-500',
    qtyPlus:     'text-gray-400 hover:text-green-600',
    healthBg:    'bg-gray-100',
    healthText:  'text-gray-400',
    editBtn:     'text-gray-400 hover:text-green-600',
    cookBtn:     'bg-green-600 hover:bg-green-500 text-white shadow-sm',
    wasteBtn:    'bg-gray-100 hover:bg-red-100 hover:text-red-500',
    deleteBtn:   'bg-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50',
    divider:     'border-gray-100',
    emptyBox:    'bg-white border-green-200 text-gray-400',
    fireWidget:  { on: 'bg-gradient-to-b from-green-50 to-emerald-50 border-green-200', off: 'bg-white border-gray-100' },
    fireRing:    { on: 'border-green-300 bg-green-50 shadow-lg shadow-green-100 scale-105', off: 'border-gray-200 bg-gray-50' },
    fireLabel:   'text-green-600',
    streakNum:   'text-gray-800',
    fireOnMsg:   'text-green-600',
    fireOffMsg:  'text-amber-600',
    igniteBtn:   'bg-green-600 hover:bg-green-500 text-white',
    levelBox:    'bg-white border-green-100',
    levelLabel:  'text-green-700',
    levelOn:     'bg-green-100 border-green-400 text-green-800 scale-105',
    levelOff:    'bg-gray-50 border-gray-200 text-gray-400',
    shopCard:    'bg-white border-gray-100 shadow-sm',
    shopInner:   'bg-green-50 border-green-100',
    shopIcon:    'bg-white border-green-200 shadow-sm',
    shopTitle:   'text-gray-700',
    shopSub:     'text-gray-400',
    shopXp:      'text-green-700',
    shopBtnOn:   'bg-green-600 text-white hover:bg-green-500 shadow-sm',
    shopBtnOff:  'bg-gray-100 text-gray-400 cursor-not-allowed',
    questCard:   'bg-white border-gray-100 shadow-sm',
    questTitle:  'text-gray-800',
    questItem:   { done: 'bg-gray-50 border-gray-100 opacity-60', todo: 'bg-green-50/50 border-green-100 hover:border-green-300' },
    questDesc:   'text-gray-700',
    questXp:     'text-green-700',
    questDone:   'bg-green-100 text-green-700 border border-green-200',
    questClaim:  'bg-green-600 hover:bg-green-500 text-white shadow-sm',
    questLock:   'bg-gray-100 text-gray-400 cursor-not-allowed',
    simCard:     'bg-white border-gray-100 shadow-sm',
    simLabel:    'text-green-700',
    simBtn:      'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-400',
    modal:       'bg-white border-green-100',
    modalTitle:  'text-green-800',
    modalSub:    'text-gray-400',
    modalClose:  'text-gray-400 hover:text-gray-600',
    modalInput:  'bg-white border-green-200 text-gray-800 placeholder:text-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-100',
    modalLabel:  'text-gray-600',
    modalCancel: 'bg-gray-100 hover:bg-gray-200 text-gray-600',
    modalSubmit: 'bg-green-600 hover:bg-green-500 text-white shadow-sm',
    modalOverlay:'bg-black/20',
    toast:       'bg-white border-green-300 text-green-700',
    footer:      'border-green-100 bg-white text-gray-400',
    healthSegar:  { color: 'text-green-700 bg-green-50 border-green-200',   bar: 'bg-green-500' },
    healthWaspada:{ color: 'text-amber-600 bg-amber-50 border-amber-200',   bar: 'bg-amber-400' },
    healthKritis: { color: 'text-rose-600 bg-rose-50 border-rose-200',      bar: 'bg-rose-500 animate-pulse' },
    healthBusuk:  { color: 'text-red-600 bg-red-50 border-red-200',         bar: 'bg-red-500' },
  },
  dark: {
    page:        'bg-stone-900 text-stone-100',
    header:      'bg-stone-900/90 border-emerald-900/30',
    logo:        'from-emerald-400 via-green-300 to-lime-300',
    logoSub:     'text-emerald-500/80',
    headerIcon:  'bg-zinc-800',
    headerIconLit:'bg-gradient-to-tr from-emerald-700 to-green-500',
    pill:        'bg-zinc-800/90 border-emerald-900/20 text-lime-400',
    streakOff:   'bg-zinc-800 text-stone-400 border-zinc-700',
    streakOn:    'bg-emerald-950/60 border-emerald-600/50 text-emerald-300',
    logoutBtn:   'bg-zinc-800 hover:bg-zinc-700 text-stone-400 hover:text-stone-200 border-zinc-700',
    toggleBtn:   'bg-zinc-800 hover:bg-zinc-700 text-stone-400 border-zinc-700',
    card:        'bg-zinc-800/80 border-zinc-700/80 hover:border-emerald-800/50 shadow-sm',
    sectionCard: 'bg-gradient-to-r from-emerald-950/30 to-zinc-800/40 border-emerald-900/30',
    sectionTitle:'text-emerald-100',
    sectionSub:  'text-stone-400',
    addBtn:      'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 text-white shadow-md',
    filterActive:'bg-emerald-900/40 text-emerald-400 border border-emerald-600 shadow-sm',
    filterIdle:  'bg-zinc-800/80 text-stone-400 hover:bg-zinc-800 hover:text-stone-200',
    statSegar:   { on: 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]', off: 'bg-zinc-800/70 border-zinc-700 hover:border-emerald-700/60 text-stone-100' },
    statWaspada: { on: 'bg-amber-950/60 border-amber-500 text-amber-300',   off: 'bg-zinc-800/70 border-zinc-700 hover:border-amber-700/60 text-stone-100' },
    statKritis:  { on: 'bg-rose-950/60 border-rose-500 text-rose-300',     off: 'bg-zinc-800/70 border-zinc-700 hover:border-rose-700/60 text-stone-100' },
    statBusuk:   { on: 'bg-red-950/60 border-red-500 text-red-300',         off: 'bg-zinc-800/70 border-zinc-700 hover:border-red-700/60 text-stone-100' },
    ingCard:     'bg-zinc-800/80 border-zinc-700/80 hover:border-emerald-800/50 shadow-sm',
    cookedBadge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40',
    qtyBox:      'bg-zinc-900 border-zinc-700',
    qtyText:     'text-emerald-400',
    qtyMinus:    'text-stone-400 hover:text-red-400',
    qtyPlus:     'text-stone-400 hover:text-emerald-400',
    healthBg:    'bg-zinc-900 border border-zinc-700',
    healthText:  'text-stone-400',
    editBtn:     'text-stone-400 hover:text-emerald-400',
    cookBtn:     'bg-emerald-600 hover:bg-emerald-500 text-white shadow',
    wasteBtn:    'bg-zinc-700 hover:bg-red-950',
    deleteBtn:   'bg-zinc-700 text-stone-400 hover:text-rose-400',
    divider:     'border-zinc-700/60',
    emptyBox:    'bg-zinc-800/30 border-zinc-700/60 text-stone-400',
    fireWidget:  { on: 'bg-gradient-to-b from-emerald-950/20 to-zinc-800/40 border-emerald-900/30', off: 'bg-zinc-800/50 border-zinc-700/60' },
    fireRing:    { on: 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)] scale-105 bg-zinc-950', off: 'border-zinc-800 bg-zinc-950' },
    fireLabel:   'text-emerald-400',
    streakNum:   'text-white',
    fireOnMsg:   'text-emerald-400',
    fireOffMsg:  'text-amber-400',
    igniteBtn:   'bg-emerald-500 hover:bg-emerald-400 text-zinc-950',
    levelBox:    'bg-zinc-900/90 border-zinc-700/80',
    levelLabel:  'text-emerald-400',
    levelOn:     'bg-emerald-950/60 border-emerald-500 text-emerald-300 scale-105',
    levelOff:    'bg-zinc-800 border-zinc-700/60 text-stone-500',
    shopCard:    'bg-zinc-800/50 border-zinc-700/60 shadow-lg',
    shopInner:   'bg-zinc-900 border-zinc-700/80',
    shopIcon:    'bg-emerald-950/50 border-emerald-900/30',
    shopTitle:   'text-stone-200',
    shopSub:     'text-stone-400',
    shopXp:      'text-lime-400',
    shopBtnOn:   'bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm',
    shopBtnOff:  'bg-zinc-800 text-stone-600 cursor-not-allowed',
    questCard:   'bg-zinc-800/50 border-zinc-700/60 shadow-lg',
    questTitle:  'text-emerald-100',
    questItem:   { done: 'bg-zinc-900/40 border-zinc-900 text-stone-500 opacity-60', todo: 'bg-zinc-900 border-zinc-700 text-stone-200 hover:border-zinc-600' },
    questDesc:   'text-current',
    questXp:     'text-lime-400',
    questDone:   'bg-emerald-900 text-emerald-300',
    questClaim:  'bg-emerald-600 hover:bg-emerald-500 text-white',
    questLock:   'bg-zinc-800 text-zinc-500 cursor-not-allowed',
    simCard:     'bg-zinc-900 border-zinc-700/80',
    simLabel:    'text-emerald-400',
    simBtn:      'bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border-emerald-800/40',
    modal:       'bg-zinc-900 border-zinc-700',
    modalTitle:  'text-emerald-100',
    modalSub:    'text-stone-400',
    modalClose:  'text-stone-400 hover:text-stone-200',
    modalInput:  'bg-zinc-950 border-zinc-700 text-stone-100 placeholder:text-stone-500 focus:border-emerald-500',
    modalLabel:  'text-stone-400',
    modalCancel: 'bg-zinc-800 text-stone-400',
    modalSubmit: 'bg-emerald-600 hover:bg-emerald-500 text-white',
    modalOverlay:'bg-zinc-950/80',
    toast:       'bg-zinc-900 border-emerald-500 text-emerald-400',
    footer:      'border-zinc-800 bg-zinc-950 text-stone-500',
    healthSegar:  { color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50', bar: 'bg-emerald-500' },
    healthWaspada:{ color: 'text-amber-400 bg-amber-950/30 border-amber-900/50',       bar: 'bg-amber-500' },
    healthKritis: { color: 'text-rose-400 bg-rose-950/30 border-rose-900/50',          bar: 'bg-rose-500 animate-pulse' },
    healthBusuk:  { color: 'text-red-400 bg-red-950/40 border-red-900/50',             bar: 'bg-red-600' },
  },
}

// =============================================
// ICONS
// =============================================
const SunIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5"/><path strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
  </svg>
)
const MoonIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
  </svg>
)

const FlameIcon = ({ className, level = 'Spark', isLit = true }) => {
  let fillGradient = 'url(#sparkGradient)';
  let glowColor    = 'rgba(34,197,94,0.6)';
  if (!isLit)                    { fillGradient = 'url(#dormantGradient)'; glowColor = 'rgba(148,163,184,0.1)'; }
  else if (level === 'Blaze')    { fillGradient = 'url(#blazeGradient)';   glowColor = 'rgba(20,184,166,0.7)'; }
  else if (level === 'Mythic Flame') { fillGradient = 'url(#mythicGradient)'; glowColor = 'rgba(234,179,8,0.8)'; }
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
  );
};
const PlusIcon        = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>);
const TrashIcon       = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>);
const ShoppingBagIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>);
const PencilIcon      = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>);
const MenuIcon        = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>);
const ChevronUpIcon   = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7"/></svg>);

// =============================================
// OPTIMISTIC UPDATE HELPERS
// =============================================
function applyOptimisticIngredient(ingredients, id, patch) {
  return ingredients.map(i => i.id === id ? { ...i, ...patch } : i);
}

// =============================================
// MAIN COMPONENT
// =============================================
export default function Dashboard() {
  const { logout } = useAuth();

  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('nd-theme') === 'dark' } catch { return true }
  });
  const t = isDark ? themes.dark : themes.light;

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      try { localStorage.setItem('nd-theme', next ? 'dark' : 'light') } catch {}
      return next;
    });
  };

  const [userData, setUserData]           = useState(null);
  const [ingredients, setIngredients]     = useState([]);
  const [quests, setQuests]               = useState([]);
  const [now, setNow]                     = useState(new Date().toISOString());
  const [pageLoading, setPageLoading]     = useState(true);

  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCookModalOpen, setIsCookModalOpen] = useState(false);
  const [activeFilter, setActiveFilter]       = useState('Semua');
  const [showToast, setShowToast]             = useState(null);

  // Mode Masak Batch
  const [isCookMode, setIsCookMode]           = useState(false);
  const [selectedIds, setSelectedIds]         = useState(new Set());
  const [isBatchCooking, setIsBatchCooking]   = useState(false);

  // Modal input jumlah masak per bahan
  const [cookAmountModal, setCookAmountModal] = useState(null); // { ingredient } | null
  const [cookAmountValue, setCookAmountValue] = useState('');
  const [isCookingAmount, setIsCookingAmount] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen]   = useState(false);
  const [mobileTab, setMobileTab]             = useState('pantry'); // 'pantry' | 'dapur'

  // Loading states per action (no full refetch)
  const [loadingIds, setLoadingIds] = useState(new Set());
  const toastRef = useRef(null);

  const [formName, setFormName]                 = useState('');
  const [formQty, setFormQty]                   = useState('');
  const [formUnit, setFormUnit]                 = useState('gram');
  const [formDaysToExpiry, setFormDaysToExpiry] = useState('3');
  const [formSubmitting, setFormSubmitting]     = useState(false);

  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editName, setEditName]                   = useState('');
  const [editQty, setEditQty]                     = useState('');
  const [editUnit, setEditUnit]                   = useState('gram');
  const [editDaysToExpiry, setEditDaysToExpiry]   = useState('3');

  const triggerToast = useCallback((message, type = 'success') => {
    if (toastRef.current) clearTimeout(toastRef.current);
    setShowToast({ message, type });
    toastRef.current = setTimeout(() => setShowToast(null), 3500);
  }, []);

  const setLoading = (id, val) => setLoadingIds(prev => {
    const next = new Set(prev);
    val ? next.add(id) : next.delete(id);
    return next;
  });

  const calculateIngredientHealth = useCallback((ingredient) => {
    if (ingredient.status !== 'active') return 0;
    const currentMs = new Date(now).getTime();
    const purchase  = new Date(ingredient.purchaseDate || ingredient.purchase_date).getTime();
    const expiry    = new Date(ingredient.expiryDate   || ingredient.expiry_date).getTime();
    if (currentMs >= expiry)   return 0;
    if (currentMs <= purchase) return 100;
    return Math.max(0, Math.min(100, Math.round(((expiry - currentMs) / (expiry - purchase)) * 100)));
  }, [now]);

  const getHealthStatus = useCallback((health) => {
    if (health <= 0) return { label: 'Busuk',   color: t.healthBusuk.color,   barColor: t.healthBusuk.bar,   emoji: '💀' };
    if (health < 30) return { label: 'Kritis',  color: t.healthKritis.color,  barColor: t.healthKritis.bar,  emoji: '🔴' };
    if (health < 60) return { label: 'Waspada', color: t.healthWaspada.color, barColor: t.healthWaspada.bar, emoji: '🟡' };
    return               { label: 'Segar',   color: t.healthSegar.color,   barColor: t.healthSegar.bar,   emoji: '🟢' };
  }, [t]);

  // Full fetch — hanya dipanggil sekali saat mount & aksi yang butuh full sync
  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setPageLoading(prev => prev); // tetap loading state dari luar
    try {
      const res = await getDashboard();
      setUserData(res.data.userData);
      setIngredients(res.data.ingredientsData);
      setQuests(res.data.questsData);
    } catch (err) {
      console.error('Gagal fetch dashboard:', err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Update waktu real setiap menit agar countdown kedaluarsa akurat
  useEffect(() => {
    const tick = () => setNow(new Date().toISOString());
    const interval = setInterval(tick, 60000);
    return () => clearInterval(interval);
  }, []);

  // ---- HANDLERS DENGAN OPTIMISTIC UPDATE ----

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    const tempId = `temp-${Date.now()}`;
    const purchaseNow = new Date().toISOString(); // waktu penginputan real (termasuk jam)
    const expiry = new Date(new Date().getTime() + parseInt(formDaysToExpiry) * 86400000).toISOString();
    // Optimistic: tambah langsung ke list
    const tempIng = { id: tempId, name: formName, quantity: parseFloat(formQty), unit: formUnit, purchaseDate: purchaseNow, expiryDate: expiry, status: 'active' };
    setIngredients(prev => [tempIng, ...prev]);
    setIsAddModalOpen(false);
    triggerToast('Bahan masakan tersimpan!');
    const savedName = formName; const savedQty = formQty;
    setFormName(''); setFormQty(''); setFormDaysToExpiry('3');
    try {
      await addIngredient({ name: savedName, quantity: savedQty, unit: formUnit, days_to_expiry: formDaysToExpiry });
      // Sync diam-diam setelah sukses untuk dapat ID real
      const res = await getDashboard();
      setIngredients(res.data.ingredientsData);
      setUserData(res.data.userData);
      setQuests(res.data.questsData);
    } catch (err) {
      // Rollback
      setIngredients(prev => prev.filter(i => i.id !== tempId));
      triggerToast(err.response?.data?.message || 'Gagal menambah bahan.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleOpenEditModal = (ing) => {
    setEditingIngredient(ing);
    setEditName(ing.name); setEditQty(ing.quantity); setEditUnit(ing.unit);
    const currentMs = Date.now();
    const expiry = new Date(ing.expiryDate || ing.expiry_date).getTime();
    setEditDaysToExpiry(Math.max(1, Math.ceil((expiry - currentMs) / 86400000)).toString());
    setIsEditModalOpen(true);
  };

  const handleSaveEditIngredient = async (e) => {
    e.preventDefault();
    setFormSubmitting(true);
    const oldIng = editingIngredient;
    // Optimistic update
    setIngredients(prev => applyOptimisticIngredient(prev, oldIng.id, { name: editName, quantity: parseFloat(editQty), unit: editUnit }));
    setIsEditModalOpen(false); setEditingIngredient(null);
    triggerToast('Log bahan diperbarui.');
    try {
      await updateIngredient(oldIng.id, { name: editName, quantity: editQty, unit: editUnit, days_to_expiry: editDaysToExpiry });
    } catch (err) {
      // Rollback
      setIngredients(prev => applyOptimisticIngredient(prev, oldIng.id, oldIng));
      triggerToast(err.response?.data?.message || 'Gagal update.', 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleCookIngredient = async (id) => {
    if (loadingIds.has(id)) return;
    setLoading(id, true);
    // Optimistic
    setIngredients(prev => applyOptimisticIngredient(prev, id, { status: 'cooked', updatedAt: new Date().toISOString() }));
    triggerToast('🔥 Masak sukses! Api Dapur tetap menyala.');
    try {
      await cookIngredient(id);
      // Sync semua data dari server agar konsisten
      const res = await getDashboard();
      setUserData(res.data.userData);
      setIngredients(res.data.ingredientsData);
      setQuests(res.data.questsData);
      setActiveFilter('Dimasak');
    } catch (err) {
      setIngredients(prev => applyOptimisticIngredient(prev, id, { status: 'active' }));
      triggerToast(err.response?.data?.message || 'Gagal.', 'error');
    } finally {
      setLoading(id, false);
    }
  };

  // ── COOK AMOUNT (modal input jumlah per bahan) ──────
  const handleOpenCookAmountModal = (ing) => {
    setCookAmountModal(ing);
    setCookAmountValue(String(ing.quantity)); // default: semua stok
  };

  const handleConfirmCookAmount = async (e) => {
    e.preventDefault();
    if (!cookAmountModal) return;
    const ing    = cookAmountModal;
    const amount = parseFloat(cookAmountValue);
    if (isNaN(amount) || amount <= 0) {
      triggerToast('Jumlah harus lebih dari 0.', 'error');
      return;
    }
    if (amount > ing.quantity) {
      triggerToast(`Stok tidak cukup. Maksimal ${ing.quantity} ${ing.unit}.`, 'error');
      return;
    }
    setIsCookingAmount(true);
    const remaining = Math.round((ing.quantity - amount) * 100) / 100;
    const newStatus = remaining === 0 ? 'cooked' : 'active';
    // Optimistic update
    setIngredients(prev =>
      applyOptimisticIngredient(prev, ing.id, { quantity: remaining, status: newStatus, updatedAt: new Date().toISOString() })
    );
    setCookAmountModal(null);
    triggerToast(`🔥 ${amount} ${ing.unit} ${ing.name} dimasak! Sisa: ${remaining} ${ing.unit}.`);
    try {
      await cookAmountIngredient(ing.id, amount);
      const res = await getDashboard();
      setUserData(res.data.userData);
      setIngredients(res.data.ingredientsData);
      setQuests(res.data.questsData);
      // Jika seluruh stok dimasak (remaining === 0), arahkan ke filter Dimasak
      if (remaining === 0) setActiveFilter('Dimasak');
    } catch (err) {
    console.error("COOK ERROR:", err);
    console.error("RESPONSE:", err.response?.data);

    toast.error(
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Gagal memasak"
    );
}
  };
  // ────────────────────────────────────────────────────

  // ── COOK MODE HELPERS ──────────────────────────────
  const toggleCookMode = () => {
    setIsCookMode(prev => !prev);
    setSelectedIds(new Set());
  };

  const toggleSelectIngredient = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllActive = () => {
    const activeIds = ingredients
      .filter(i => i.status === 'active' && calculateIngredientHealth(i) > 0)
      .map(i => i.id);
    setSelectedIds(new Set(activeIds));
  };

  const handleOpenCookModal = () => {
    if (selectedIds.size === 0) {
      triggerToast('Pilih minimal 1 bahan dulu.', 'error');
      return;
    }
    setIsCookModalOpen(true);
  };

  const handleConfirmBatchCook = async () => {
    const ids = [...selectedIds];
    setIsBatchCooking(true);
    // Optimistic update semua sekaligus
    const cookedAt = new Date().toISOString();
    setIngredients(prev => prev.map(i => ids.includes(i.id) ? { ...i, status: 'cooked', updatedAt: cookedAt } : i));
    setIsCookModalOpen(false);
    setIsCookMode(false);
    setSelectedIds(new Set());
    setActiveFilter('Dimasak');
    try {
      const res = await cookBatchIngredients(ids);
      triggerToast(`🔥 ${res.data.cooked} bahan dimasak! +${ids.length * 15} XP`, 'success');
      const dash = await getDashboard();
      setUserData(dash.data.userData);
      setIngredients(dash.data.ingredientsData);
      setQuests(dash.data.questsData);
    } catch (err) {
      // Rollback
      setIngredients(prev => prev.map(i => ids.includes(i.id) ? { ...i, status: 'active' } : i));
      triggerToast(err.response?.data?.message || 'Gagal memasak.', 'error');
    } finally {
      setIsBatchCooking(false);
    }
  };
  // ────────────────────────────────────────────────────

  const handleWasteIngredient = async (id) => {
    if (!window.confirm('Tandai bahan ini telah membusuk dan dibuang?')) return;
    if (loadingIds.has(id)) return;
    setLoading(id, true);
    setIngredients(prev => applyOptimisticIngredient(prev, id, { status: 'wasted' }));
    triggerToast('Bahan ditandai sebagai food waste.', 'error');
    try {
      await wasteIngredient(id);
    } catch {
      setIngredients(prev => applyOptimisticIngredient(prev, id, { status: 'active' }));
      triggerToast('Gagal.', 'error');
    } finally {
      setLoading(id, false);
    }
  };

  const handleAdjustQuantity = async (id, direction) => {
    if (loadingIds.has(`qty-${id}`)) return;
    setLoading(`qty-${id}`, true);
    // Optimistic qty update
    const ing = ingredients.find(i => i.id === id);
    if (!ing) return;
    const stepMap = { kilogram: 0.25, liter: 0.25, gram: 50 };
    const step = stepMap[ing.unit] ?? 1;
    const newQty = Math.round((direction === 'plus' ? ing.quantity + step : Math.max(0, ing.quantity - step)) * 100) / 100;
    setIngredients(prev => applyOptimisticIngredient(prev, id, { quantity: newQty }));
    try {
      await adjustQuantity(id, direction);
    } catch {
      // Rollback
      setIngredients(prev => applyOptimisticIngredient(prev, id, { quantity: ing.quantity }));
      triggerToast('Gagal adjust.', 'error');
    } finally {
      setLoading(`qty-${id}`, false);
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!window.confirm('Hapus log bahan ini secara permanen?')) return;
    if (loadingIds.has(id)) return;
    const backup = ingredients.find(i => i.id === id);
    setIngredients(prev => prev.filter(i => i.id !== id));
    triggerToast('Data bahan dibersihkan.', 'neutral');
    try {
      await deleteIngredient(id);
    } catch {
      setIngredients(prev => backup ? [backup, ...prev] : prev);
      triggerToast('Gagal.', 'error');
    }
  };

  const handleBuyFirewood = async () => {
    try {
      await buyFirewood();
      setUserData(prev => prev ? { ...prev, xp: prev.xp - 50, firewood: (prev.firewood || 0) + 1 } : prev);
      triggerToast('✨ Menukar 50 XP dengan 1 Kayu Bakar.', 'xp');
    } catch (err) { triggerToast(err.response?.data?.message || 'Gagal.', 'error'); }
  };

  const handleLightFireWithWood = async () => {
    try {
      await igniteWood();
      setUserData(prev => prev ? { ...prev, firewood: Math.max(0, (prev.firewood || 0) - 1), isFireLit: true } : prev);
      triggerToast('🪵 Kayu dilempar! Api dapur berhasil dijaga.');
    } catch (err) { triggerToast(err.response?.data?.message || 'Gagal.', 'error'); }
  };

  const handleClaimQuest = async (questType, id) => {
    try {
      await claimQuest(questType, id);
      setQuests(prev => prev.map(q => q.id === id ? { ...q, isCompleted: true, is_completed: true, canClaim: false } : q));
      triggerToast('🎉 Misi berhasil diklaim! Bonus XP masuk.', 'xp');
      // Sync XP saja
      const res = await getDashboard();
      setUserData(res.data.userData);
      setQuests(res.data.questsData);
    } catch (err) { triggerToast(err.response?.data?.message || 'Gagal klaim.', 'error'); }
  };

  const user      = userData || { xp: 0, firewood: 0, currentStreak: 0, isFireLit: false };
  const isFireLit = user.isFireLit || false;

  const flameLevel = useMemo(() => {
    const s = user.currentStreak || 0;
    if (s >= 30) return 'Mythic Flame';
    if (s >= 7)  return 'Blaze';
    return 'Spark';
  }, [user]);

  const pantryStats = useMemo(() => {
    let segar = 0, layu = 0, sekarat = 0, busuk = 0;
    ingredients.forEach(i => {
      if (i.status === 'wasted') { busuk++; return; }
      if (i.status === 'active') {
        const h = calculateIngredientHealth(i);
        if (h <= 0) busuk++; else if (h < 30) sekarat++; else if (h < 60) layu++; else segar++;
      }
    });
    return { segar, layu, sekarat, busuk };
  }, [ingredients, calculateIngredientHealth]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(i => {
      if (activeFilter === 'Dimasak') return i.status === 'cooked';
      if (activeFilter === 'Busuk')   return i.status === 'wasted' || (i.status === 'active' && calculateIngredientHealth(i) <= 0);
      if (i.status !== 'active')      return false;
      if (activeFilter === 'Semua')   return true;
      return getHealthStatus(calculateIngredientHealth(i)).label === activeFilter;
    });
  }, [ingredients, activeFilter, calculateIngredientHealth, getHealthStatus]);

  const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${t.modalInput}`;

  if (pageLoading) return (
    <div className={`min-h-screen flex items-center justify-center ${t.page}`}>
      <div className="flex flex-col items-center gap-3">
        <div className={`w-10 h-10 border-4 rounded-full animate-spin ${isDark ? 'border-zinc-700 border-t-emerald-500' : 'border-green-100 border-t-green-500'}`} />
        <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>Memuat dapur...</span>
      </div>
    </div>
  );

  const statMap = { Segar: t.statSegar, Waspada: t.statWaspada, Kritis: t.statKritis, Busuk: t.statBusuk };
  const countMap = { Segar: pantryStats.segar, Waspada: pantryStats.layu, Kritis: pantryStats.sekarat, Busuk: pantryStats.busuk };
  const emojis   = { Segar: isDark ? '🟢' : '🌿', Waspada: '🟡', Kritis: '🔴', Busuk: '💀' };

  // ---- RIGHT PANEL (dipakai di desktop & mobile tab) ----
  const RightPanel = () => (
    <aside className="flex flex-col gap-5">
      {/* FIRE WIDGET */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 text-center items-center border relative overflow-hidden ${isFireLit ? t.fireWidget.on : t.fireWidget.off}`}>
        {isFireLit && isDark && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse pointer-events-none" />}
        <div className="flex flex-col items-center">
          <span className={`text-xs font-black uppercase tracking-widest mb-3 ${t.fireLabel}`}>Energi Api Kompor</span>
          <div className={`relative p-5 rounded-full border-4 transition-all duration-500 ${isFireLit ? t.fireRing.on : t.fireRing.off}`}>
            <FlameIcon className={`w-16 h-16 sm:w-20 sm:h-20 ${isFireLit ? 'animate-pulse' : ''}`} level={flameLevel} isLit={isFireLit} />
            {isFireLit && (
              <>
                <span className="absolute text-sm animate-ping top-2 right-2 opacity-75">🌿</span>
                <span className="absolute text-xs animate-bounce top-10 left-2" style={{ animationDelay: '0.2s' }}>✨</span>
                <span className="absolute text-xs animate-bounce bottom-3 right-5" style={{ animationDelay: '0.5s' }}>🔥</span>
              </>
            )}
          </div>
        </div>
        <div className="w-full z-10">
          <h3 className={`text-2xl sm:text-3xl font-black ${t.streakNum}`}>{user.currentStreak || 0} Hari Streak</h3>
          <div className="text-xs mt-2 min-h-[40px] flex flex-col justify-center items-center gap-2">
            {isFireLit ? (
              <span className={`font-bold flex items-center gap-1.5 ${t.fireOnMsg}`}>✨ Api dapur menyala! Ekosistem terjaga.</span>
            ) : (
              <>
                <span className={`font-bold ${t.fireOffMsg}`}>Api meredup. Masak atau gunakan kayu bakar!</span>
                {user.firewood > 0 && (
                  <button onClick={handleLightFireWithWood} className={`px-3 py-1.5 text-[10px] font-black rounded-lg transition-all active:scale-95 ${t.igniteBtn}`}>
                    🪵 Lempar Kayu Bakar (-1 Kayu)
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className={`w-full rounded-2xl p-3 sm:p-4 text-left border z-10 ${t.levelBox}`}>
          <h4 className={`text-xs font-bold uppercase mb-2 tracking-wide ${t.levelLabel}`}>Tingkatan Energi</h4>
          <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
            {[['Spark','1-6 Hari'],['Blaze','7-29 Hari'],['Mythic Flame','30+ Hari']].map(([lvl, range]) => (
              <div key={lvl} className={`p-2 rounded-xl border transition-all font-semibold ${flameLevel === lvl && isFireLit ? t.levelOn : t.levelOff}`}>
                <span className="block font-bold">{lvl === 'Mythic Flame' ? 'Mythic' : lvl}</span>
                <span className="opacity-70">{range}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SHOP */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border ${t.shopCard}`}>
        <h3 className={`text-base font-black flex items-center gap-2 ${t.shopTitle}`}>
          <ShoppingBagIcon className={`w-5 h-5 ${isDark ? 'text-emerald-400' : 'text-green-600'}`} /> Toko Ekosistem Dapur
        </h3>
        <div className={`rounded-2xl p-4 flex justify-between items-center gap-4 border ${t.shopInner}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center text-xl border shrink-0 ${t.shopIcon}`}>🪵</div>
            <div>
              <h4 className={`text-xs font-black ${t.shopTitle}`}>Kayu Bakar Cadangan</h4>
              <p className={`text-[10px] mt-0.5 ${t.shopSub}`}>Jaga api saat tidak sempat memasak.</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <span className={`block text-xs font-black mb-1 ${t.shopXp}`}>50 XP</span>
            <button onClick={handleBuyFirewood} disabled={user.xp < 50}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all active:scale-95 ${user.xp >= 50 ? t.shopBtnOn : t.shopBtnOff}`}>
              Tukar
            </button>
          </div>
        </div>
      </div>

      {/* QUESTS */}
      <div className={`rounded-3xl p-5 sm:p-6 flex flex-col gap-4 border ${t.questCard}`}>
        <h3 className={`text-base font-black ${t.questTitle}`}>📜 Misi Ekologi Harian</h3>
        <div className="flex flex-col gap-2">
          {quests.length === 0 ? (
            <p className={`text-xs text-center py-4 ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Belum ada misi hari ini.</p>
          ) : quests.map(q => {
            const completed = q.isCompleted || q.is_completed;
            const canClaim  = q.canClaim === true;
            return (
              <div key={q.id} className={`border rounded-2xl p-3 sm:p-4 transition-all ${completed ? t.questItem.done : t.questItem.todo}`}>
                <div className="flex flex-col gap-2">
                  <p className={`text-xs font-semibold ${t.questDesc}`}>{q.description}</p>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold ${t.questXp}`}>+{q.xpReward || q.xp_reward} XP</span>
                    {completed ? (
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black ${t.questDone}`}>✅ Diklaim</span>
                    ) : canClaim ? (
                      <button onClick={() => handleClaimQuest(q.type, q.id)} className={`px-3 py-1 rounded-lg text-[10px] font-black transition-all active:scale-95 ${t.questClaim}`}>🎁 Klaim</button>
                    ) : (
                      <button disabled className={`px-3 py-1 rounded-lg text-[10px] font-black ${t.questLock}`}>🔒 Belum</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </aside>
  );

  // ---- LEFT PANEL ----
  const LeftPanel = () => (
    <section className="flex flex-col gap-4 sm:gap-6">
      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {['Segar','Waspada','Kritis','Busuk'].map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            className={`p-3 sm:p-4 rounded-2xl border text-left transition-all duration-200 active:scale-95 ${activeFilter === filter ? statMap[filter].on : statMap[filter].off}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold opacity-70">{filter}</span>
              <span className="text-sm sm:text-base">{emojis[filter]}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black">{countMap[filter]}</span>
              <span className="text-[10px] opacity-50">item</span>
            </div>
          </button>
        ))}
      </div>

      {/* SECTION HEADER */}
      <div className={`rounded-2xl p-4 sm:p-5 border flex flex-col gap-3 ${t.sectionCard}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className={`text-base sm:text-lg font-black flex items-center gap-2 ${t.sectionTitle}`}>🍃 Inventaris Hijau Dapur</h2>
            <p className={`text-xs mt-0.5 ${t.sectionSub}`}>Pertahankan ekosistem bahan pangan bebas food-waste</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {!isCookMode ? (
              <>
                <button onClick={toggleCookMode}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl transition-all text-xs flex-1 sm:flex-none justify-center active:scale-95 border ${isDark ? 'bg-orange-950/40 border-orange-700/50 text-orange-400 hover:bg-orange-950/60' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'}`}>
                  🍳 Mulai Masak
                </button>
                <button onClick={() => setIsAddModalOpen(true)}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl transition-all text-xs flex-1 sm:flex-none justify-center active:scale-95 ${t.addBtn}`}>
                  <PlusIcon /> Tambah
                </button>
              </>
            ) : (
              <>
                {/* Mode Masak aktif */}
                <button onClick={selectAllActive}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl text-xs flex-1 justify-center border transition-all active:scale-95 ${isDark ? 'bg-zinc-700 border-zinc-600 text-stone-300 hover:bg-zinc-600' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'}`}>
                  ☑️ Pilih Semua
                </button>
                <button onClick={handleOpenCookModal} disabled={selectedIds.size === 0}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl text-xs flex-1 justify-center transition-all active:scale-95 ${selectedIds.size > 0 ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-sm' : isDark ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}>
                  🔥 Masak ({selectedIds.size})
                </button>
                <button onClick={toggleCookMode}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${isDark ? 'bg-zinc-800 border-zinc-700 text-stone-400 hover:text-stone-200' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'}`}>
                  ✕
                </button>
              </>
            )}
          </div>
        </div>

        {/* Banner mode masak */}
        {isCookMode && (
          <div className={`rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border ${isDark ? 'bg-orange-950/30 border-orange-800/40 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
            <span className="text-base">🍳</span>
            <span>Mode Masak aktif — centang bahan yang ingin dimasak, lalu tekan <strong>Masak ({selectedIds.size})</strong></span>
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['Semua','Segar','Waspada','Kritis','Busuk','Dimasak'].map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${activeFilter === filter ? t.filterActive : t.filterIdle}`}>
            {filter}
          </button>
        ))}
      </div>

      {/* INGREDIENT LIST */}
      <div className="flex flex-col gap-3">
        {filteredIngredients.length === 0 ? (
          <div className={`border border-dashed rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center gap-3 ${t.emptyBox}`}>
            <span className="text-4xl">🌱</span>
            <p className="text-sm">Tidak ada data bahan makanan dalam kategori ini.</p>
          </div>
        ) : filteredIngredients.map(ing => {
          const health      = calculateIngredientHealth(ing);
          const status      = getHealthStatus(health);
          const isWasted    = ing.status === 'wasted' || (ing.status === 'active' && health <= 0);
          const isCooked    = ing.status === 'cooked';
          const expiryMs    = new Date(ing.expiryDate || ing.expiry_date).getTime();
          const remainingDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / 86400000));
          const isItemLoading = loadingIds.has(ing.id);
          const isSelectable  = isCookMode && ing.status === 'active' && !isWasted;
          const isSelected    = selectedIds.has(ing.id);

          return (
            <div key={ing.id}
              onClick={isSelectable ? () => toggleSelectIngredient(ing.id) : undefined}
              className={`rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all border ${t.ingCard}
                ${isItemLoading ? 'opacity-60' : ''}
                ${isSelectable ? 'cursor-pointer' : ''}
                ${isSelected ? isDark
                    ? 'border-orange-500/70 bg-orange-950/20 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
                    : 'border-orange-400 bg-orange-50/80 shadow-sm'
                  : ''}
                ${isCookMode && !isSelectable ? 'opacity-40' : ''}
              `}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 min-w-0 flex items-start gap-2.5">
                  {/* Checkbox saat mode masak */}
                  {isSelectable && (
                    <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : isDark ? 'border-zinc-500 bg-zinc-800' : 'border-gray-300 bg-white'
                    }`}>
                      {isSelected && <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm sm:text-base flex items-center gap-2 flex-wrap">
                      {isWasted ? '💀' : isDark ? '🔥' : '🌿'}
                      <span className="truncate">{ing.name}</span>
                      {isCooked && <span className={`text-xs px-2 py-0.5 rounded-md font-semibold border shrink-0 ${t.cookedBadge}`}>Selesai Dimasak</span>}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <span className={`text-xs ${isDark ? 'text-stone-400' : 'text-gray-400'}`}>Volume:</span>
                      {ing.status === 'active' && !isWasted ? (
                        <div onClick={e => e.stopPropagation()} className={`flex items-center rounded-lg py-0.5 px-1.5 gap-1.5 border ${t.qtyBox}`}>
                          <button onClick={() => handleAdjustQuantity(ing.id, 'minus')} disabled={isItemLoading} className={`text-xs font-black px-1 active:scale-90 ${t.qtyMinus}`}>−</button>
                          <span className={`text-xs font-mono font-bold ${t.qtyText}`}>{ing.quantity} {ing.unit}</span>
                          <button onClick={() => handleAdjustQuantity(ing.id, 'plus')} disabled={isItemLoading} className={`text-xs font-black px-1 active:scale-90 ${t.qtyPlus}`}>+</button>
                        </div>
                      ) : (
                        <span className={`text-xs font-mono ${isDark ? 'text-stone-300' : 'text-gray-600'}`}>{ing.quantity} {ing.unit}</span>
                      )}
                    </div>
                  </div>
                </div>
                <span className={`text-[10px] font-black px-2 py-1 rounded-lg border shrink-0 ${status.color}`}>
                  {isCooked ? 'LOG AMAN' : status.label}
                </span>
              </div>

              {ing.status === 'active' && !isWasted && (
                <div className="flex flex-col gap-1.5">
                  <div className={`w-full rounded-full h-2 overflow-hidden ${t.healthBg}`}>
                    <div className={`h-full rounded-full transition-all ${status.barColor}`} style={{ width: `${health}%` }} />
                  </div>
                  <div className={`flex justify-between text-[10px] font-mono ${t.healthText}`}>
                    <span>Kesegaran: {health}%</span>
                    <span>Sisa: {remainingDays} Hari</span>
                  </div>
                </div>
              )}

              {isCooked && ing.updatedAt && (
                <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-2 rounded-xl border ${
                  isDark
                    ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400'
                    : 'bg-green-50 border-green-200 text-green-700'
                }`}>
                  <span>🕐</span>
                  <span>Dimasak pada:</span>
                  <span className="font-bold font-mono">
                    {new Date(ing.updatedAt).toLocaleDateString('id-ID', {
                      weekday: 'short',
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    {new Date(ing.updatedAt).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              )}

              <div className={`flex justify-between items-center border-t pt-2.5 sm:pt-3 ${t.divider}`}>
                <div>
                  {ing.status === 'active' && !isWasted && (
                    <button onClick={() => handleOpenEditModal(ing)} className={`flex items-center gap-1 text-xs font-semibold transition-colors ${t.editBtn}`}>
                      <PencilIcon className="w-3.5 h-3.5" /> Ubah Log
                    </button>
                  )}
                </div>
                <div className="flex gap-2">
                  {/* Sembunyikan action buttons saat mode masak */}
                  {!isCookMode && ing.status === 'active' && !isWasted && (
                    <>
                      <button onClick={() => handleOpenCookAmountModal(ing)} disabled={isItemLoading}
                        className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 ${t.cookBtn}`}>🔥 Masak</button>
                      <button onClick={() => handleWasteIngredient(ing.id)} disabled={isItemLoading}
                        className={`p-1.5 rounded-lg text-xs transition-colors active:scale-95 ${t.wasteBtn}`} title="Tandai Rusak">🗑️</button>
                    </>
                  )}
                  {!isCookMode && (
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteIngredient(ing.id); }}
                      className={`p-1.5 rounded-lg transition-colors active:scale-95 ${t.deleteBtn}`}><TrashIcon /></button>
                  )}
                  {/* Hint saat mode masak */}
                  {isCookMode && isSelectable && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isSelected ? 'text-orange-500' : isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
                      {isSelected ? '✓ Dipilih' : 'Tap untuk pilih'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className={`min-h-screen font-sans selection:bg-green-200 selection:text-green-900 transition-colors duration-300 ${t.page}`}>

      {/* HEADER */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b px-4 py-3 ${t.header}`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className={`p-1.5 rounded-xl shadow-sm transition-all duration-300 ${isFireLit ? t.headerIconLit + ' scale-105' + (isDark ? ' animate-pulse' : '') : t.headerIcon}`}>
              <FlameIcon className="w-7 h-7 text-white" level={flameLevel} isLit={isFireLit} />
            </div>
            <div>
              <h1 className={`text-lg font-black tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${t.logo}`}>Nyawa Dapur</h1>
              <p className={`text-[10px] font-medium tracking-wide hidden sm:block ${t.logoSub}`}>Fresh & Sustainable Kitchen</p>
            </div>
          </div>

          {/* Pills — hidden on smallest mobile, shown from sm */}
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

        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className={`sm:hidden mt-3 pt-3 border-t flex flex-col gap-2 ${isDark ? 'border-zinc-700' : 'border-gray-100'}`}>
            <div className="flex flex-wrap gap-2 justify-between items-center px-1">
              <div className="flex gap-2">
                <div className={`px-3 py-1.5 rounded-full border text-xs ${t.pill}`}><span className="font-black">🪵 {user.firewood || 0} Kayu</span></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { toggleTheme(); setMobileMenuOpen(false); }} className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center gap-1.5 ${t.toggleBtn}`}>
                  {isDark ? <SunIcon /> : <MoonIcon />} {isDark ? 'Terang' : 'Gelap'}
                </button>
                <button onClick={logout} className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all ${t.logoutBtn}`}>Keluar</button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MOBILE TAB SWITCHER */}
      <div className={`lg:hidden sticky top-[56px] z-30 px-4 py-2 border-b backdrop-blur-sm ${isDark ? 'bg-stone-900/90 border-zinc-800' : 'bg-white/90 border-gray-100'}`}>
        <div className={`flex rounded-xl p-1 gap-1 ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
          <button onClick={() => setMobileTab('pantry')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'pantry' ? (isDark ? 'bg-emerald-600 text-white' : 'bg-green-600 text-white') : (isDark ? 'text-stone-400' : 'text-gray-500')}`}>
            🍃 Pantri
          </button>
          <button onClick={() => setMobileTab('dapur')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === 'dapur' ? (isDark ? 'bg-emerald-600 text-white' : 'bg-green-600 text-white') : (isDark ? 'text-stone-400' : 'text-gray-500')}`}>
            🔥 Dapur & Misi
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:px-8">
        {/* Desktop: side by side */}
        <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7"><LeftPanel /></div>
          <div className="lg:col-span-5"><RightPanel /></div>
        </div>

        {/* Mobile: tab based */}
        <div className="lg:hidden">
          {mobileTab === 'pantry' ? <LeftPanel /> : <RightPanel />}
        </div>
      </main>

      {/* TOAST */}
      {showToast && (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-auto z-50">
          <div className={`px-4 sm:px-5 py-3 rounded-2xl shadow-lg border text-xs font-black text-center sm:text-left ${t.toast}`}>
            🌿 {showToast.message}
          </div>
        </div>
      )}

      {/* MODAL MASAK BATCH */}
      {isCookModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}>
          <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl border ${t.modal}`}>
            <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>🍳 Konfirmasi Memasak</h3>
            <p className={`text-xs mb-4 ${t.modalSub}`}>Bahan-bahan berikut akan dimasak sekaligus</p>

            {/* List bahan yang dipilih */}
            <div className={`rounded-2xl border divide-y mb-4 max-h-48 overflow-y-auto ${isDark ? 'border-zinc-700 divide-zinc-700' : 'border-gray-100 divide-gray-100'}`}>
              {ingredients
                .filter(i => selectedIds.has(i.id))
                .map(i => {
                  const h = calculateIngredientHealth(i);
                  const s = getHealthStatus(h);
                  return (
                    <div key={i.id} className={`flex items-center justify-between px-4 py-2.5 ${isDark ? 'bg-zinc-800/60' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-2.5">
                        <span className="text-base">🌿</span>
                        <div>
                          <p className={`text-xs font-bold ${isDark ? 'text-stone-200' : 'text-gray-700'}`}>{i.name}</p>
                          <p className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>{i.quantity} {i.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-md border ${s.color}`}>{h}%</span>
                        <button onClick={() => toggleSelectIngredient(i.id)}
                          className={`text-[10px] font-bold ${isDark ? 'text-zinc-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>✕</button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Ringkasan XP */}
            <div className={`rounded-xl px-4 py-3 mb-4 flex justify-between items-center border ${isDark ? 'bg-orange-950/30 border-orange-800/40' : 'bg-orange-50 border-orange-200'}`}>
              <span className={`text-xs font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Total XP yang didapat</span>
              <span className={`text-sm font-black ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>+{selectedIds.size * 15} XP</span>
            </div>

            <div className="flex gap-2.5">
              <button onClick={() => setIsCookModalOpen(false)}
                className={`w-1/2 py-2.5 font-bold rounded-xl transition-all text-sm ${t.modalCancel}`}>
                Batal
              </button>
              <button onClick={handleConfirmBatchCook} disabled={isBatchCooking}
                className="w-1/2 py-2.5 font-bold rounded-xl transition-all text-sm bg-orange-500 hover:bg-orange-400 text-white shadow-sm disabled:opacity-50">
                {isBatchCooking ? 'Memasak...' : `🔥 Masak ${selectedIds.size} Bahan`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL ADD */}
      {isAddModalOpen && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}
          onClick={(e) => { if (e.target === e.currentTarget) setIsAddModalOpen(false); }}>
          <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl relative border ${t.modal}`}>
            {/* Drag handle for mobile */}
            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <button onClick={() => setIsAddModalOpen(false)} className={`absolute top-4 right-4 text-lg leading-none ${t.modalClose}`}>✕</button>
            <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>🍳 Daftarkan Log Bahan Makanan</h3>
            <p className={`text-xs mb-4 ${t.modalSub}`}>Catat bahan segar ke dalam inventaris dapur</p>
            <form onSubmit={handleAddIngredient} className="flex flex-col gap-4 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${t.modalLabel}`}>Nama Bahan*</label>
                <input type="text" placeholder="Misal: Sawi Organik..." value={formName} onChange={e => setFormName(e.target.value)} className={inputClass} required autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${t.modalLabel}`}>Kuantitas*</label>
                  <input type="number" step="any" placeholder="2" value={formQty} onChange={e => setFormQty(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${t.modalLabel}`}>Satuan</label>
                  <select value={formUnit} onChange={e => setFormUnit(e.target.value)} className={inputClass}>
                    <option value="gram">gram</option><option value="kilogram">kilogram</option>
                    <option value="ikat">ikat</option><option value="buah">buah</option><option value="liter">liter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block font-bold mb-1 ${t.modalLabel}`}>Masa Kedaluwarsa (Hari)*</label>
                <input type="number" min="1" placeholder="4" value={formDaysToExpiry} onChange={e => setFormDaysToExpiry(e.target.value)} className={inputClass} required />
              </div>
              <div className="flex gap-2.5 mt-1">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className={`w-1/2 py-3 font-bold rounded-xl transition-all ${t.modalCancel}`}>Batal</button>
                <button type="submit" disabled={formSubmitting} className={`w-1/2 py-3 font-bold rounded-xl transition-all active:scale-95 ${t.modalSubmit} ${formSubmitting ? 'opacity-70' : ''}`}>
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Bahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDIT */}
      {isEditModalOpen && editingIngredient && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}
          onClick={(e) => { if (e.target === e.currentTarget) { setIsEditModalOpen(false); setEditingIngredient(null); } }}>
          <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl relative border ${t.modal}`}>
            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <button onClick={() => { setIsEditModalOpen(false); setEditingIngredient(null); }} className={`absolute top-4 right-4 text-lg leading-none ${t.modalClose}`}>✕</button>
            <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>✏️ Sesuaikan Detail Stok</h3>
            <p className={`text-xs mb-4 ${t.modalSub}`}>Perbarui informasi bahan di inventaris</p>
            <form onSubmit={handleSaveEditIngredient} className="flex flex-col gap-4 text-xs">
              <div>
                <label className={`block font-bold mb-1 ${t.modalLabel}`}>Nama Bahan</label>
                <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block font-bold mb-1 ${t.modalLabel}`}>Sisa Stok</label>
                  <input type="number" step="any" value={editQty} onChange={e => setEditQty(e.target.value)} className={inputClass} required />
                </div>
                <div>
                  <label className={`block font-bold mb-1 ${t.modalLabel}`}>Satuan</label>
                  <select value={editUnit} onChange={e => setEditUnit(e.target.value)} className={inputClass}>
                    <option value="gram">gram</option><option value="kilogram">kilogram</option>
                    <option value="ikat">ikat</option><option value="buah">buah</option><option value="liter">liter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`block font-bold mb-1 ${t.modalLabel}`}>Perpanjang Kedaluwarsa (Hari)</label>
                <input type="number" min="1" value={editDaysToExpiry} onChange={e => setEditDaysToExpiry(e.target.value)} className={inputClass} required />
              </div>
              <div className="flex gap-2.5 mt-1">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingIngredient(null); }} className={`w-1/2 py-3 font-bold rounded-xl transition-all ${t.modalCancel}`}>Batal</button>
                <button type="submit" disabled={formSubmitting} className={`w-1/2 py-3 font-bold rounded-xl transition-all active:scale-95 ${t.modalSubmit} ${formSubmitting ? 'opacity-70' : ''}`}>
                  {formSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL MASAK JUMLAH TERTENTU */}
      {cookAmountModal && (
        <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}
          onClick={(e) => { if (e.target === e.currentTarget) setCookAmountModal(null); }}>
          <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 shadow-2xl border ${t.modal}`}>
            <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
            <button onClick={() => setCookAmountModal(null)} className={`absolute top-4 right-4 text-lg leading-none ${t.modalClose}`}>✕</button>

            {/* Header */}
            <h3 className={`text-lg font-black mb-0.5 ${t.modalTitle}`}>🍳 Masak Berapa?</h3>
            <p className={`text-xs mb-4 ${t.modalSub}`}>
              Stok <span className="font-bold">{cookAmountModal.name}</span>:{' '}
              <span className={`font-black ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
                {cookAmountModal.quantity} {cookAmountModal.unit}
              </span>
            </p>

            <form onSubmit={handleConfirmCookAmount} className="flex flex-col gap-4">
              {/* Input jumlah */}
              <div>
                <label className={`block text-xs font-bold mb-1 ${t.modalLabel}`}>
                  Jumlah yang dimasak ({cookAmountModal.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  min="0.01"
                  max={cookAmountModal.quantity}
                  value={cookAmountValue}
                  onChange={e => setCookAmountValue(e.target.value)}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${t.modalInput}`}
                  autoFocus
                  required
                />
              </div>

              {/* Preview sisa */}
              {cookAmountValue && !isNaN(parseFloat(cookAmountValue)) && parseFloat(cookAmountValue) > 0 && (
                <div className={`rounded-xl px-4 py-3 flex justify-between items-center border text-xs ${isDark ? 'bg-orange-950/30 border-orange-800/40' : 'bg-orange-50 border-orange-200'}`}>
                  <span className={isDark ? 'text-orange-300' : 'text-orange-700'}>
                    Sisa di kulkas setelah dimasak
                  </span>
                  <span className={`font-black ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                    {Math.max(0, Math.round((cookAmountModal.quantity - parseFloat(cookAmountValue)) * 100) / 100)} {cookAmountModal.unit}
                  </span>
                </div>
              )}

              {/* Quick select buttons */}
              <div className="flex gap-2 flex-wrap">
                {[0.25, 0.5, 1].map(frac => {
                  const val = Math.round(cookAmountModal.quantity * frac * 100) / 100;
                  if (val <= 0) return null;
                  return (
                    <button type="button" key={frac}
                      onClick={() => setCookAmountValue(String(val))}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${isDark ? 'bg-zinc-800 border-zinc-600 text-stone-300 hover:border-emerald-600 hover:text-emerald-400' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'}`}>
                      {frac === 1 ? 'Semua' : frac === 0.5 ? '½' : '¼'} ({val} {cookAmountModal.unit})
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-2.5 mt-1">
                <button type="button" onClick={() => setCookAmountModal(null)}
                  className={`w-1/2 py-3 font-bold rounded-xl text-sm transition-all ${t.modalCancel}`}>
                  Batal
                </button>
                <button type="submit" disabled={isCookingAmount}
                  className={`w-1/2 py-3 font-bold rounded-xl text-sm transition-all active:scale-95 bg-orange-500 hover:bg-orange-400 text-white shadow-sm disabled:opacity-50`}>
                  {isCookingAmount ? 'Memasak...' : '🔥 Masak'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className={`border-t mt-12 py-5 text-center text-xs ${t.footer}`}>
        <p>© 2026 Nyawa Dapur — Eco Gamified Kitchen Productivity.</p>
      </footer>
    </div>
  );
}