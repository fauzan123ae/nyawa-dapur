import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboard, buyFirewood, igniteWood, simulateNextDay } from '../api/dashboard';
import { addIngredient, updateIngredient, adjustQuantity, cookIngredient, wasteIngredient, deleteIngredient } from '../api/ingredients';
import { claimQuest } from '../api/quests';

const FlameIcon = ({ className, level = 'Spark', isLit = true }) => {
  let fillGradient = 'url(#sparkGradient)';
  let glowColor = 'rgba(34, 197, 94, 0.6)';
  if (!isLit) { fillGradient = 'url(#dormantGradient)'; glowColor = 'rgba(148, 163, 184, 0.1)'; }
  else if (level === 'Blaze') { fillGradient = 'url(#blazeGradient)'; glowColor = 'rgba(20, 184, 166, 0.7)'; }
  else if (level === 'Mythic Flame') { fillGradient = 'url(#mythicGradient)'; glowColor = 'rgba(234, 179, 8, 0.8)'; }
  return (
    <svg className={`${className} transition-all duration-500`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ filter: `drop-shadow(0 0 12px ${glowColor})` }}>
      <defs>
        <linearGradient id="dormantGradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#475569" /><stop offset="50%" stopColor="#64748b" /><stop offset="100%" stopColor="#94a3b8" /></linearGradient>
        <linearGradient id="sparkGradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#15803d" /><stop offset="60%" stopColor="#22c55e" /><stop offset="100%" stopColor="#4ade80" /></linearGradient>
        <linearGradient id="blazeGradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#0d9488" /><stop offset="40%" stopColor="#14b8a6" /><stop offset="80%" stopColor="#22c55e" /><stop offset="100%" stopColor="#bbf7d0" /></linearGradient>
        <linearGradient id="mythicGradient" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#166534" /><stop offset="40%" stopColor="#b45309" /><stop offset="80%" stopColor="#eab308" /><stop offset="100%" stopColor="#fef08a" /></linearGradient>
      </defs>
      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" fill={fillGradient} stroke="none" />
      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" stroke={isLit ? "#FFFFFF" : "#94a3b8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const PlusIcon = () => (<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>);
const TrashIcon = () => (<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>);
const ShoppingBagIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>);
const PencilIcon = ({ className }) => (<svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>);

export default function Dashboard() {
  const { logout } = useAuth();

  const [userData, setUserData]           = useState(null);
  const [ingredients, setIngredients]     = useState([]);
  const [quests, setQuests]               = useState([]);
  const [simulatedDate, setSimulatedDate] = useState(new Date().toISOString());
  const [pageLoading, setPageLoading]     = useState(true);

  const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeFilter, setActiveFilter]       = useState('Semua');
  const [showToast, setShowToast]             = useState(null);

  const [formName, setFormName]                 = useState('');
  const [formQty, setFormQty]                   = useState('');
  const [formUnit, setFormUnit]                 = useState('gram');
  const [formDaysToExpiry, setFormDaysToExpiry] = useState('3');

  const [editingIngredient, setEditingIngredient] = useState(null);
  const [editName, setEditName]                   = useState('');
  const [editQty, setEditQty]                     = useState('');
  const [editUnit, setEditUnit]                   = useState('gram');
  const [editDaysToExpiry, setEditDaysToExpiry]   = useState('3');

  const triggerToast = (message, type = 'success') => {
    setShowToast({ message, type });
    setTimeout(() => setShowToast(null), 4000);
  };

  const calculateIngredientHealth = (ingredient) => {
    if (ingredient.status !== 'active') return 0;
    const now      = new Date(simulatedDate).getTime();
    const purchase = new Date(ingredient.purchaseDate || ingredient.purchase_date).getTime();
    const expiry   = new Date(ingredient.expiryDate   || ingredient.expiry_date).getTime();
    if (now >= expiry)   return 0;
    if (now <= purchase) return 100;
    return Math.max(0, Math.min(100, Math.round(((expiry - now) / (expiry - purchase)) * 100)));
  };

  const getHealthStatus = (health) => {
    if (health <= 0) return { label: 'Busuk',   color: 'text-red-400 bg-red-950/40 border-red-900/50',       barColor: 'bg-red-600',               emoji: '💀' };
    if (health < 30) return { label: 'Kritis',  color: 'text-rose-400 bg-rose-950/30 border-rose-900/50',    barColor: 'bg-rose-500 animate-pulse', emoji: '🔴' };
    if (health < 60) return { label: 'Waspada', color: 'text-amber-400 bg-amber-950/30 border-amber-900/50', barColor: 'bg-amber-500',              emoji: '🟡' };
    return               { label: 'Segar',   color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50', barColor: 'bg-emerald-500',          emoji: '🟢' };
  };

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await getDashboard();
      setUserData(res.data.userData);
      setIngredients(res.data.ingredientsData);
      setQuests(res.data.questsData);
      setSimulatedDate(res.data.userData.simulatedDate);
    } catch (err) {
      console.error('Gagal fetch dashboard:', err);
    } finally {
      setPageLoading(false);
    }
  }, []);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  const handleAddIngredient = async (e) => {
    e.preventDefault();
    try {
      await addIngredient({ name: formName, quantity: formQty, unit: formUnit, days_to_expiry: formDaysToExpiry });
      await fetchDashboard();
      setIsAddModalOpen(false);
      setFormName(''); setFormQty(''); setFormDaysToExpiry('3');
      triggerToast('Bahan masakan tersimpan aman di database!', 'success');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal menambah bahan.', 'error');
    }
  };

  const handleOpenEditModal = (ing) => {
    setEditingIngredient(ing);
    setEditName(ing.name);
    setEditQty(ing.quantity);
    setEditUnit(ing.unit);
    const now         = new Date(simulatedDate).getTime();
    const expiry      = new Date(ing.expiryDate || ing.expiry_date).getTime();
    const remainingDays = Math.max(1, Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)));
    setEditDaysToExpiry(remainingDays.toString());
    setIsEditModalOpen(true);
  };

  const handleSaveEditIngredient = async (e) => {
    e.preventDefault();
    try {
      await updateIngredient(editingIngredient.id, { name: editName, quantity: editQty, unit: editUnit, days_to_expiry: editDaysToExpiry });
      await fetchDashboard();
      setIsEditModalOpen(false);
      setEditingIngredient(null);
      triggerToast('Perubahan log bahan berhasil disinkronkan.', 'success');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal update.', 'error');
    }
  };

  const handleCookIngredient = async (id) => {
    try {
      await cookIngredient(id);
      await fetchDashboard();
      setActiveFilter('Dimasak');
      triggerToast('🔥 Masak sukses! Api Dapur tetap menyala terang.', 'success');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal.', 'error');
    }
  };

  const handleWasteIngredient = async (id) => {
    if (!window.confirm('Tandai bahan ini telah membusuk dan dibuang?')) return;
    try {
      await wasteIngredient(id);
      await fetchDashboard();
      triggerToast('Bahan ditandai sebagai food waste.', 'error');
    } catch (err) {
      triggerToast('Gagal.', 'error');
    }
  };

  const handleAdjustQuantity = async (id, direction) => {
    try {
      await adjustQuantity(id, direction);
      await fetchDashboard();
    } catch (err) {
      triggerToast('Gagal adjust.', 'error');
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (!window.confirm('Hapus log bahan ini secara permanen dari server?')) return;
    try {
      await deleteIngredient(id);
      await fetchDashboard();
      triggerToast('Data bahan dibersihkan.', 'neutral');
    } catch (err) {
      triggerToast('Gagal.', 'error');
    }
  };

  const handleBuyFirewood = async () => {
    try {
      await buyFirewood();
      await fetchDashboard();
      triggerToast('✨ Menukar 50 XP dengan 1 Kayu Bakar.', 'xp');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal.', 'error');
    }
  };

  const handleLightFireWithWood = async () => {
    try {
      await igniteWood();
      await fetchDashboard();
      triggerToast('🪵 Kayu dilempar! Api dapur berhasil dijaga.', 'success');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal.', 'error');
    }
  };

  const handleClaimQuest = async (questType, id) => {
    try {
      await claimQuest(questType, id);
      await fetchDashboard();
      triggerToast('🎉 Misi berhasil diklaim! Bonus XP masuk dompet.', 'xp');
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal klaim.', 'error');
    }
  };

  const handleSimulateNextDay = async () => {
    try {
      await simulateNextDay();
      await fetchDashboard();
      triggerToast('⏩ Waktu melompat +1 Hari.', 'neutral');
    } catch (err) {
      triggerToast('Gagal.', 'error');
    }
  };

  const user       = userData || { xp: 0, firewood: 0, currentStreak: 0, isFireLit: false };
  const isFireLit  = user.isFireLit || false;

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
        if (h <= 0) busuk++;
        else if (h < 30) sekarat++;
        else if (h < 60) layu++;
        else segar++;
      }
    });
    return { segar, layu, sekarat, busuk };
  }, [ingredients, simulatedDate]);

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(i => {
      if (activeFilter === 'Dimasak') return i.status === 'cooked';
      if (activeFilter === 'Busuk')   return i.status === 'wasted' || (i.status === 'active' && calculateIngredientHealth(i) <= 0);
      if (i.status !== 'active')      return false;
      if (activeFilter === 'Semua')   return true;
      return getHealthStatus(calculateIngredientHealth(i)).label === activeFilter;
    });
  }, [ingredients, activeFilter, simulatedDate]);

  if (pageLoading) return (
    <div className="min-h-screen bg-stone-900 flex items-center justify-center">
      <span className="text-emerald-400 text-sm animate-pulse">Memuat dapur...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans selection:bg-emerald-600 selection:text-white">
      <header className="sticky top-0 z-40 backdrop-blur-md bg-stone-900/90 border-b border-emerald-900/30 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl shadow-md transition-transform duration-300 ${isFireLit ? 'bg-gradient-to-tr from-emerald-700 to-green-500 scale-105 animate-pulse' : 'bg-zinc-800'}`}>
              <FlameIcon className="w-8 h-8 text-white" level={flameLevel} isLit={isFireLit} />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight bg-gradient-to-r from-emerald-400 via-green-300 to-lime-300 bg-clip-text text-transparent">Nyawa Dapur</h1>
              <p className="text-xs text-emerald-500/80 font-medium tracking-wide">Fresh & Sustainable Kitchen</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <div className="bg-zinc-800/90 px-3 py-1.5 rounded-full border border-emerald-900/20 text-xs shadow-sm">
              <span className="text-lime-400 font-black">{user.xp} XP</span>
            </div>
            <div className="bg-zinc-800/90 px-3 py-1.5 rounded-full border border-emerald-900/20 text-xs shadow-sm">
              <span className="text-emerald-400 font-black">🪵 {user.firewood || 0} Kayu</span>
            </div>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all duration-300 ${isFireLit ? 'bg-emerald-950/60 border-emerald-600/50 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.2)]' : 'bg-zinc-800 text-stone-400 border-zinc-700'}`}>
              <FlameIcon className={`w-5 h-5 ${isFireLit ? 'animate-bounce' : ''}`} level={flameLevel} isLit={isFireLit} />
              <span className="text-sm font-black">{user.currentStreak || 0} Hari Streak</span>
            </div>
            <button onClick={logout} className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-stone-400 hover:text-stone-200 text-xs rounded-full border border-zinc-700 transition-all">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-7 flex flex-col gap-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Segar', 'Waspada', 'Kritis', 'Busuk'].map((filter) => {
              const countMap = { Segar: pantryStats.segar, Waspada: pantryStats.layu, Kritis: pantryStats.sekarat, Busuk: pantryStats.busuk };
              const colors = {
                Segar:   activeFilter === 'Segar'   ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.15)]' : 'bg-zinc-800/70 border-zinc-700 hover:border-emerald-700/60',
                Waspada: activeFilter === 'Waspada' ? 'bg-amber-950/60 border-amber-500 text-amber-300'   : 'bg-zinc-800/70 border-zinc-700 hover:border-amber-700/60',
                Kritis:  activeFilter === 'Kritis'  ? 'bg-rose-950/60 border-rose-500 text-rose-300'     : 'bg-zinc-800/70 border-zinc-700 hover:border-rose-700/60',
                Busuk:   activeFilter === 'Busuk'   ? 'bg-red-950/60 border-red-500 text-red-300'         : 'bg-zinc-800/70 border-zinc-700 hover:border-red-700/60',
              };
              const emojis = { Segar: '🟢', Waspada: '🟡', Kritis: '🔴', Busuk: '💀' };
              return (
                <button key={filter} onClick={() => setActiveFilter(filter)} className={`p-4 rounded-2xl border text-left transition-all duration-300 ${colors[filter]}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-stone-400 font-bold">{filter}</span>
                    <span className="text-base">{emojis[filter]}</span>
                  </div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black">{countMap[filter]}</span>
                    <span className="text-[10px] text-stone-500">item</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="bg-gradient-to-r from-emerald-950/30 to-zinc-800/40 rounded-2xl p-5 border border-emerald-900/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-lg font-black tracking-wide text-emerald-100 flex items-center gap-2">🍃 Inventaris Hijau Dapur</h2>
              <p className="text-xs text-stone-400">Pertahankan ekosistem bahan pangan bebas food-waste</p>
            </div>
            <button onClick={() => setIsAddModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-95 text-white font-bold rounded-xl transition-all shadow-md text-sm w-full sm:w-auto justify-center">
              <PlusIcon /> Tambah Log Bahan
            </button>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {['Semua', 'Segar', 'Waspada', 'Kritis', 'Busuk', 'Dimasak'].map((filter) => (
              <button key={filter} onClick={() => setActiveFilter(filter)} className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 ${activeFilter === filter ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-600 shadow-sm' : 'bg-zinc-800/80 text-stone-400 hover:bg-zinc-800 hover:text-stone-200'}`}>
                {filter}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-4">
            {filteredIngredients.length === 0 ? (
              <div className="bg-zinc-800/30 border border-dashed border-zinc-700/60 rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-3">
                <span className="text-4xl">🌱</span>
                <p className="text-stone-400 text-sm">Tidak ada data bahan makanan dalam kategori ini.</p>
              </div>
            ) : (
              filteredIngredients.map((ing) => {
                const health   = calculateIngredientHealth(ing);
                const status   = getHealthStatus(health);
                const isWasted = ing.status === 'wasted' || (ing.status === 'active' && health <= 0);
                const isCooked = ing.status === 'cooked';
                const expiryDate = new Date(ing.expiryDate || ing.expiry_date);
                const remainingDays = Math.max(0, Math.ceil((expiryDate.getTime() - new Date(simulatedDate).getTime()) / (1000 * 60 * 60 * 24)));

                return (
                  <div key={ing.id} className="bg-zinc-800/80 border border-zinc-700/80 hover:border-emerald-800/50 rounded-2xl p-5 flex flex-col gap-4 transition-all shadow-sm">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-bold text-base text-stone-100 flex items-center gap-2">
                          {isWasted ? '💀' : '🔥'} {ing.name}
                          {isCooked && <span className="text-xs bg-emerald-950/80 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded-md">Selesai Dimasak</span>}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="text-xs text-stone-400">Volume:</span>
                          {ing.status === 'active' && !isWasted ? (
                            <div className="flex items-center bg-zinc-900 border border-zinc-700 rounded-lg py-0.5 px-1.5 gap-1.5">
                              <button onClick={() => handleAdjustQuantity(ing.id, 'minus')} className="text-xs text-stone-400 hover:text-red-400 font-black px-1">−</button>
                              <span className="text-xs font-mono font-bold text-emerald-400">{ing.quantity} {ing.unit}</span>
                              <button onClick={() => handleAdjustQuantity(ing.id, 'plus')} className="text-xs text-stone-400 hover:text-emerald-400 font-black px-1">+</button>
                            </div>
                          ) : (
                            <span className="text-xs text-stone-300 font-mono">{ing.quantity} {ing.unit}</span>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] font-black px-2.5 py-1 rounded-md border ${status.color}`}>
                        {isCooked ? 'LOG AMAN' : status.label}
                      </span>
                    </div>

                    {ing.status === 'active' && !isWasted && (
                      <div className="flex flex-col gap-1.5">
                        <div className="w-full bg-zinc-900 rounded-full h-2.5 p-0.5 border border-zinc-700">
                          <div className={`h-full rounded-full ${status.barColor}`} style={{ width: `${health}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-400 font-mono">
                          <span>Kesegaran: {health}%</span>
                          <span>Sisa: {remainingDays} Hari</span>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center border-t border-zinc-700/60 pt-3">
                      <div className="text-[11px] text-stone-400">
                        {ing.status === 'active' && !isWasted && (
                          <button onClick={() => handleOpenEditModal(ing)} className="text-stone-400 hover:text-emerald-400 flex items-center gap-1 transition-colors">
                            <PencilIcon className="w-3.5 h-3.5" /> Ubah Log
                          </button>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {ing.status === 'active' && !isWasted && (
                          <>
                            <button onClick={() => handleCookIngredient(ing.id)} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow transition-all">🔥 Nyalakan Dapur</button>
                            <button onClick={() => handleWasteIngredient(ing.id)} className="p-1.5 bg-zinc-700 hover:bg-red-950 rounded-lg text-xs transition-colors" title="Tandai Rusak">🗑️</button>
                          </>
                        )}
                        <button onClick={() => handleDeleteIngredient(ing.id)} className="p-1.5 bg-zinc-700 text-stone-400 hover:text-rose-400 rounded-lg transition-colors"><TrashIcon /></button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        <aside className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-gradient-to-b from-emerald-950/20 to-zinc-800/40 border border-emerald-900/30 rounded-3xl p-6 flex flex-col gap-5 text-center items-center shadow-lg relative overflow-hidden">
            {isFireLit && <div className="absolute inset-0 bg-emerald-500/5 animate-pulse duration-[3000ms] pointer-events-none" />}
            <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-44 h-44 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl" />
            <div className="flex flex-col items-center">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Energi Api Kompor</span>
              <div className={`relative p-6 bg-zinc-950 rounded-full border transition-all duration-500 ${isFireLit ? 'border-emerald-500/60 shadow-[0_0_25px_rgba(16,185,129,0.25)] scale-105' : 'border-zinc-800'}`}>
                <FlameIcon className={`w-20 h-20 ${isFireLit ? 'animate-pulse' : ''}`} level={flameLevel} isLit={isFireLit} />
                {isFireLit && (
                  <>
                    <span className="absolute text-sm animate-ping top-2 right-2 opacity-75">🌱</span>
                    <span className="absolute text-xs animate-bounce top-12 left-2" style={{ animationDelay: '0.2s' }}>✨</span>
                    <span className="absolute text-xs animate-bounce bottom-3 right-6" style={{ animationDelay: '0.5s' }}>🔥</span>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 w-full z-10">
              <h3 className="text-3xl font-black tracking-tight text-white">{user.currentStreak || 0} Hari Streak</h3>
              <div className="text-xs mt-2 min-h-[40px] flex flex-col justify-center items-center">
                {isFireLit ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">✨ Bagus! Api hijau dapur Anda menyala terang hari ini.</span>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-amber-400 font-bold">Api meredup. Segera olah masakan atau gunakan kayu bakar!</span>
                    {user.firewood > 0 && (
                      <button onClick={handleLightFireWithWood} className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-[10px] font-black rounded-lg transition-all animate-bounce">
                        🪵 Lempar Kayu Bakar (-1 Kayu)
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="w-full bg-zinc-900/90 rounded-2xl p-4 text-left border border-zinc-700/80 z-10">
              <h4 className="text-xs font-bold text-emerald-400 uppercase mb-2">Tingkatan Energi</h4>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                {[['Spark','1-6 Hari'],['Blaze','7-29 Hari'],['Mythic Flame','30+ Hari']].map(([lvl, range]) => (
                  <div key={lvl} className={`p-2 rounded-lg border transition-all ${flameLevel === lvl && isFireLit ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 font-bold scale-105' : 'bg-zinc-800 border-zinc-700/60 text-stone-500'}`}>
                    <span className="block">{lvl === 'Mythic Flame' ? 'Mythic' : lvl}</span>
                    <span>{range}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
            <h3 className="text-base font-black text-emerald-100 flex items-center gap-2">
              <ShoppingBagIcon className="w-5 h-5 text-emerald-400" /> Toko Ekosistem Dapur
            </h3>
            <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl p-4 flex justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-emerald-950/50 border border-emerald-900/30 rounded-xl flex items-center justify-center text-xl">🪵</div>
                <div>
                  <h4 className="text-xs font-black text-stone-200">Kayu Bakar Cadangan</h4>
                  <p className="text-[10px] text-stone-400">Gunakan saat tidak sempat memasak untuk menjaga api.</p>
                </div>
              </div>
              <div className="text-right">
                <span className="block text-xs font-black text-lime-400 mb-1">50 XP</span>
                <button onClick={handleBuyFirewood} disabled={user.xp < 50} className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${user.xp >= 50 ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-zinc-800 text-stone-600 cursor-not-allowed'}`}>
                  Tukar
                </button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-800/50 border border-zinc-700/60 rounded-3xl p-6 flex flex-col gap-4 shadow-lg">
            <h3 className="text-base font-black text-emerald-100">📜 Misi Ekologi Harian</h3>
            <div className="flex flex-col gap-3">
              {quests.length === 0 ? (
                <p className="text-xs text-stone-500 text-center py-4">Belum ada misi hari ini.</p>
              ) : quests.map((q) => {
                const completed = q.isCompleted || q.is_completed;
                const canClaim  = q.canClaim === true;
                return (
                  <div key={q.id} className={`border rounded-2xl p-4 flex gap-3 transition-all ${completed ? 'bg-zinc-900/40 border-zinc-900 text-stone-500 opacity-60' : 'bg-zinc-900 border-zinc-700 text-stone-200 hover:border-zinc-600'}`}>
                    <div className="flex-grow flex flex-col gap-2">
                      <p className="text-xs font-semibold">{q.description}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-lime-400">+{q.xpReward || q.xp_reward} XP</span>
                        {completed ? (
                          <span className="px-3 py-1 rounded-lg bg-emerald-900 text-emerald-300 text-[10px] font-black">✅ Sudah Diklaim</span>
                        ) : canClaim ? (
                          <button onClick={() => handleClaimQuest(q.type, q.id)} className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black">🎁 Klaim</button>
                        ) : (
                          <button disabled className="px-3 py-1 rounded-lg bg-zinc-800 text-zinc-500 text-[10px] font-black cursor-not-allowed">🔒 Belum Selesai</button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700/80 rounded-3xl p-5 flex flex-col gap-3">
            <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest">🧪 Pengendali Simulasi Hari</h4>
            <button onClick={handleSimulateNextDay} className="w-full py-2 bg-emerald-900/20 hover:bg-emerald-900/40 text-emerald-400 border border-emerald-800/40 text-xs font-black rounded-xl transition-all">
              ⏩ Maju ke Hari Berikutnya (+1 Hari)
            </button>
          </div>
        </aside>
      </main>

      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="px-5 py-3 rounded-2xl shadow-xl bg-zinc-900 border border-emerald-500 text-emerald-400 text-xs font-black">
            🌿 {showToast.message}
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => setIsAddModalOpen(false)} className="absolute top-4 right-4 text-stone-400 hover:text-stone-200">✕</button>
            <h3 className="text-lg font-black text-emerald-100 mb-2">🍳 Daftarkan Log Bahan Makanan</h3>
            <form onSubmit={handleAddIngredient} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-400 mb-1">Nama Bahan*</label>
                <input type="text" placeholder="Misal: Sawi Organik..." value={formName} onChange={(e) => setFormName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-400 mb-1">Kuantitas*</label>
                  <input type="number" step="any" placeholder="2" value={formQty} onChange={(e) => setFormQty(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block font-bold text-stone-400 mb-1">Satuan</label>
                  <select value={formUnit} onChange={(e) => setFormUnit(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500">
                    <option value="gram">gram</option>
                    <option value="kilogram">kilogram</option>
                    <option value="ikat">ikat</option>
                    <option value="buah">buah</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-stone-400 mb-1">Masa Kedaluwarsa (Hari)*</label>
                <input type="number" min="1" placeholder="4" value={formDaysToExpiry} onChange={(e) => setFormDaysToExpiry(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="flex gap-2.5 mt-2">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="w-1/2 py-2.5 bg-zinc-800 text-stone-400 font-bold rounded-xl">Batal</button>
                <button type="submit" className="w-1/2 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500">Simpan Bahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isEditModalOpen && editingIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/80 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl w-full max-w-md p-6 shadow-2xl relative">
            <button onClick={() => { setIsEditModalOpen(false); setEditingIngredient(null); }} className="absolute top-4 right-4 text-stone-400 hover:text-stone-200">✕</button>
            <h3 className="text-lg font-black text-emerald-100 mb-2">✏️ Sesuaikan Detail Stok</h3>
            <form onSubmit={handleSaveEditIngredient} className="flex flex-col gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-400 mb-1">Nama Bahan</label>
                <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-400 mb-1">Sisa Stok</label>
                  <input type="number" step="any" value={editQty} onChange={(e) => setEditQty(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500" required />
                </div>
                <div>
                  <label className="block font-bold text-stone-400 mb-1">Satuan</label>
                  <select value={editUnit} onChange={(e) => setEditUnit(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500">
                    <option value="gram">gram</option>
                    <option value="kilogram">kilogram</option>
                    <option value="ikat">ikat</option>
                    <option value="buah">buah</option>
                    <option value="liter">liter</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-bold text-stone-400 mb-1">Perpanjang Kedaluwarsa (Hari)</label>
                <input type="number" min="1" value={editDaysToExpiry} onChange={(e) => setEditDaysToExpiry(e.target.value)} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-2.5 text-stone-100 focus:outline-none focus:border-emerald-500" required />
              </div>
              <div className="flex gap-2.5 mt-2">
                <button type="button" onClick={() => { setIsEditModalOpen(false); setEditingIngredient(null); }} className="w-1/2 py-2.5 bg-zinc-800 text-stone-400 font-bold rounded-xl">Batal</button>
                <button type="submit" className="w-1/2 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500">Simpan Perubahan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-800 mt-16 py-6 bg-zinc-950 text-center text-xs text-stone-500">
        <p>© 2026 Nyawa Dapur — Eco Gamified Kitchen Productivity.</p>
      </footer>
    </div>
  );
}
