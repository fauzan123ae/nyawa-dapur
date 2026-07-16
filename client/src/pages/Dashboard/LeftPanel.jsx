import { PlusIcon } from './icons'
import IngredientCard from './IngredientCard'
import { Leaf, AlertTriangle, AlertCircle, Skull, Trash2, CheckSquare, Utensils, Flame, X, Clock } from 'lucide-react'

const formatDate = (dateStr) => {
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return ''
  const day = d.getDate()
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
  const month = months[d.getMonth()]
  const year = d.getFullYear()
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  return `${day} ${month} ${year} · ${hours}:${minutes}`
}

// =============================================
// LEFT PANEL — Inventaris + Filter + List
// =============================================
export default function LeftPanel({
  t, isDark, user,
  ingredients, filteredIngredients, cookingHistory, wasteHistory,
  activeFilter, setActiveFilter,
  isCookMode, selectedIds,
  pantryStats,
  loadingIds,
  calculateIngredientHealth, getHealthStatus,
  // handlers
  onToggleCookMode, onSelectAllActive, onOpenCookModal,
  onToggleSelectIngredient,
  onOpenAddModal,
  onOpenEditModal,
  onAdjustQuantity,
  onOpenCookAmountModal,
  onWaste,
  onDelete,
  onDeleteHistory,
  onClearAllHistory,
  onDeleteWasteEntry,
  children,
}) {
  const statMap  = { Segar: t.statSegar, Waspada: t.statWaspada, Kritis: t.statKritis, Busuk: t.statBusuk }
  const countMap = { Segar: pantryStats.segar, Waspada: pantryStats.layu, Kritis: pantryStats.sekarat, Busuk: pantryStats.busuk }
  const icons    = { 
    Segar: <span className="text-lg animate-sway">🌿</span>, 
    Waspada: <span className="text-lg animate-bounce-cute">🥕</span>, 
    Kritis: <span className="text-lg animate-pulse">🍅</span>, 
    Busuk: <span className="text-lg">🍄</span> 
  }

  return (
    <section className="flex flex-col gap-4 sm:gap-6 relative">
      
      {/* Decorative tiny bee floating */}
      <div className="absolute -top-6 right-2 text-sm select-none pointer-events-none animate-float-slow hidden md:block">
        🐝 <span className="text-[10px] text-muted font-bold bg-white dark:bg-zinc-800 px-2 py-0.5 rounded-full border border-border dark:border-[#34413B]">bzz...</span>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {['Segar','Waspada','Kritis','Busuk'].map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            className={`p-3.5 sm:p-4 rounded-[2rem] border-2 text-left transition-all duration-350 btn-squish focus:outline-none ${activeFilter === filter ? statMap[filter].on : statMap[filter].off}`}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-black opacity-80 tracking-tight">{filter}</span>
              <span>{icons[filter]}</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-black">{countMap[filter]}</span>
              <span className="text-[10px] opacity-60 font-extrabold">bahan</span>
            </div>
          </button>
        ))}
      </div>

      {/* SECTION HEADER */}
      <div className={`p-5 border-2 flex flex-col gap-3.5 ${t.sectionCard}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h2 className={`text-base sm:text-lg font-black flex items-center gap-1.5 ${t.sectionTitle}`}>
              <span className="animate-sway">🍃</span> Inventaris Hijau Dapur
            </h2>
            <p className={`text-xs mt-0.5 font-bold ${t.sectionSub}`}>Rawat ekosistem pangan keluarga bebas food-waste 💚</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            {!isCookMode ? (
              <>
                <button onClick={onToggleCookMode}
                  className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-xl transition-all duration-200 text-xs flex-1 sm:flex-none justify-center btn-squish border-2 focus:outline-none ${
                    isDark ? 'bg-[#7BAE7F]/20 border-[#7BAE7F]/40 text-[#7BAE7F]' : 'bg-primary/10 border-primary/20 text-primary hover:bg-primary/20'
                  }`}>
                  <Utensils className="w-3.5 h-3.5" /> Mulai Masak 🍳
                </button>
                <button onClick={onOpenAddModal}
                  className={`flex items-center gap-1.5 px-4 py-2.5 font-extrabold rounded-xl transition-all duration-200 text-xs flex-1 sm:flex-none justify-center btn-squish focus:outline-none ${t.addBtn}`}>
                  <PlusIcon /> Tambah
                </button>
              </>
            ) : (
              <>
                <button onClick={onSelectAllActive}
                  className={`flex items-center gap-1.5 px-3 py-2.5 font-extrabold rounded-xl text-xs flex-1 justify-center border-2 transition-all duration-200 btn-squish focus:outline-none ${
                    isDark ? 'bg-zinc-800 border-[#34413B] text-stone-300' : 'bg-[#F8F7F2] border-border text-[#1F2937] hover:bg-[#E5E7EB]'
                  }`}>
                  <CheckSquare className="w-3.5 h-3.5" /> Pilih Semua
                </button>
                <button onClick={onOpenCookModal} disabled={selectedIds.size === 0}
                  className={`flex items-center gap-1.5 px-3 py-2.5 font-extrabold rounded-xl text-xs flex-1 justify-center transition-all duration-200 btn-squish focus:outline-none ${
                    selectedIds.size > 0 ? 'bg-gradient-to-r from-secondary to-accent text-white shadow-sm' : isDark ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed border-2 border-transparent' : 'bg-[#E5E7EB] text-[#6B7280] cursor-not-allowed border-2 border-transparent'
                  }`}>
                  <Flame className="w-3.5 h-3.5" /> Masak ({selectedIds.size})
                </button>
                <button onClick={onToggleCookMode}
                  className={`px-3 py-2.5 rounded-xl text-xs font-bold border-2 transition-all duration-200 btn-squish focus:outline-none ${isDark ? 'bg-zinc-800 border-[#34413B] text-stone-400' : 'bg-white border-border text-[#6B7280]'}`} aria-label="Tutup Mode Masak">
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {isCookMode && (
          <div className={`rounded-2xl px-4 py-3 text-xs font-extrabold flex items-center gap-2 border-2 ${isDark ? 'bg-[#7BAE7F]/10 border-[#7BAE7F]/20 text-[#7BAE7F]' : 'bg-primary/10 border-primary/20 text-primary animate-pulse'}`}>
            <Utensils className="w-4 h-4" />
            <span>Mode Masak aktif — centang bahan yang ingin dimasak, lalu tekan <strong>Masak ({selectedIds.size})</strong></span>
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 scrollbar-hide">
        {['Semua','Segar','Waspada','Kritis','Busuk','Riwayat'].map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            className={`px-4 sm:px-5 py-2 rounded-full text-xs font-black whitespace-nowrap transition-all duration-200 btn-squish focus:outline-none ${activeFilter === filter ? t.filterActive : t.filterIdle}`}>
            {filter}
          </button>
        ))}
      </div>

      {/* RIWAYAT MASAK */}
      {activeFilter === 'Riwayat' && (
        <div className="flex flex-col gap-3">
          {cookingHistory.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={onClearAllHistory}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-extrabold rounded-full border-2 transition-all duration-200 btn-squish focus:outline-none ${
                  isDark
                    ? 'bg-red-950/40 border-red-800/50 text-red-400 hover:bg-red-950/70'
                    : 'bg-danger/10 border-danger/20 text-danger hover:bg-danger/20'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Semua
              </button>
            </div>
          )}
          {cookingHistory.length === 0 ? (
            <div className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center gap-4 ${t.emptyBox}`}>
              <div className="relative">
                <span className="text-4xl animate-sway block">🍳</span>
                <span className="absolute top-0 right-0 text-xs animate-steam">💨</span>
              </div>
              <p className="text-xs font-black opacity-80">Belum ada riwayat masak yang ceria.</p>
            </div>
          ) : cookingHistory.map(h => {
            const isOwn = h.cooked_by === user?.name
            const chefName = isOwn ? 'Kamu' : (h.cooked_by || 'Seseorang')
            return (
              <div key={h.id} className={`rounded-3xl px-5 py-4 border-2 flex items-center justify-between gap-4 ${t.ingCard}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-accent/20 text-secondary border border-accent/30">
                    <span className="text-lg">🍲</span>
                    <span className="absolute -top-1 -right-1 text-[8px] animate-steam">💨</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black text-sm truncate ${isDark ? 'text-stone-100' : 'text-gray-800'}`}>{h.ingredient_name}</p>
                    <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-[#6B7280]'} flex items-center gap-1.5 mt-0.5 flex-wrap font-bold`}>
                      <span className="flex items-center gap-1 text-primary">
                        👤 {chefName}
                      </span>
                      <span className="opacity-40">•</span>
                      <span>{parseFloat(h.quantity)} {h.unit}</span>
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 font-mono font-bold mt-1 ${isDark ? 'text-stone-500' : 'text-[#6B7280]'}`}>
                      <Clock className="w-3 h-3 text-secondary" /> {formatDate(h.cooked_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`px-3 py-1 rounded-full text-xs font-black border-2 ${
                    isDark ? 'bg-emerald-950/40 border-emerald-800/40 text-lime-400' : 'bg-success/10 border-success/20 text-success'
                  }`}>
                    +{h.xp_earned} XP 🎉
                  </span>
                  <button
                    onClick={() => onDeleteHistory(h.id)}
                    title="Hapus riwayat ini"
                    aria-label="Hapus riwayat ini"
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-transparent transition-all duration-200 active:scale-90 shrink-0 focus:outline-none ${
                      isDark
                        ? 'text-stone-500 hover:text-red-400 hover:bg-red-950/40'
                        : 'text-[#6B7280] hover:text-danger hover:bg-danger/10 hover:border-danger/20'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* RIWAYAT BUSUK */}
      {activeFilter === 'Busuk' && (
        <div className="flex flex-col gap-3">
          {(!wasteHistory || wasteHistory.length === 0) ? (
            <div className={`border-2 border-dashed rounded-3xl p-10 text-center flex flex-col items-center gap-4 ${t.emptyBox}`}>
              <span className="text-4xl">🌱</span>
              <p className="text-xs font-black opacity-80">Belum ada bahan yang dicatat busuk. Bagus!</p>
            </div>
          ) : wasteHistory.map(h => {
            const isOwn = h.wasted_by === user?.name
            const whoName = isOwn ? 'Kamu' : (h.wasted_by || 'Seseorang')
            return (
              <div key={h.id} className={`rounded-3xl px-5 py-4 border-2 flex items-center justify-between gap-4 ${t.ingCard}`}>
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-danger/10 border border-danger/20">
                    <span className="text-lg">🍄</span>
                  </div>
                  <div className="min-w-0">
                    <p className={`font-black text-sm truncate ${isDark ? 'text-stone-100' : 'text-gray-800'}`}>{h.ingredient_name}</p>
                    <p className={`text-xs flex items-center gap-1.5 mt-0.5 flex-wrap font-bold ${isDark ? 'text-stone-400' : 'text-[#6B7280]'}`}>
                      <span className="flex items-center gap-1 text-danger">👤 {whoName}</span>
                      <span className="opacity-40">•</span>
                      <span>{parseFloat(h.quantity)} {h.unit} busuk</span>
                    </p>
                    <p className={`text-[10px] flex items-center gap-1 font-mono font-bold mt-1 ${isDark ? 'text-stone-500' : 'text-[#6B7280]'}`}>
                      <Clock className="w-3 h-3 text-danger" /> {formatDate(h.wasted_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteWasteEntry(h.id)}
                  title="Hapus catatan ini"
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 border-transparent transition-all duration-200 active:scale-90 shrink-0 focus:outline-none ${
                    isDark ? 'text-stone-500 hover:text-red-400 hover:bg-red-950/40' : 'text-[#6B7280] hover:text-danger hover:bg-danger/10 hover:border-danger/20'
                  }`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* INGREDIENT LIST FROM PARENT */}
      {/* PERBAIKAN BUG: Tampilkan IngredientList juga saat filter Busuk agar bahan expired (health=0) muncul */}
      {activeFilter !== 'Riwayat' && children}
    </section>
  )
}