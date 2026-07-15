import { PlusIcon } from './icons'
import IngredientCard from './IngredientCard'

// =============================================
// LEFT PANEL — Inventaris + Filter + List
// =============================================
export default function LeftPanel({
  t, isDark,
  ingredients, filteredIngredients, cookingHistory,
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
}) {
  const statMap  = { Segar: t.statSegar, Waspada: t.statWaspada, Kritis: t.statKritis, Busuk: t.statBusuk }
  const countMap = { Segar: pantryStats.segar, Waspada: pantryStats.layu, Kritis: pantryStats.sekarat, Busuk: pantryStats.busuk }
  const emojis   = { Segar: isDark ? '🌿' : '🌿', Waspada: '⚠️', Kritis: '🚨', Busuk: '💀' }

  return (
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
                <button onClick={onToggleCookMode}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl transition-all text-xs flex-1 sm:flex-none justify-center active:scale-95 border ${
                    isDark ? 'bg-orange-950/40 border-orange-700/50 text-orange-400 hover:bg-orange-950/60' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100'
                  }`}>
                  🍳 Mulai Masak
                </button>
                <button onClick={onOpenAddModal}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl transition-all text-xs flex-1 sm:flex-none justify-center active:scale-95 ${t.addBtn}`}>
                  <PlusIcon /> Tambah
                </button>
              </>
            ) : (
              <>
                <button onClick={onSelectAllActive}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl text-xs flex-1 justify-center border transition-all active:scale-95 ${
                    isDark ? 'bg-zinc-700 border-zinc-600 text-stone-300 hover:bg-zinc-600' : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
                  }`}>
                  ☑️ Pilih Semua
                </button>
                <button onClick={onOpenCookModal} disabled={selectedIds.size === 0}
                  className={`flex items-center gap-1.5 px-3 py-2 font-bold rounded-xl text-xs flex-1 justify-center transition-all active:scale-95 ${
                    selectedIds.size > 0 ? 'bg-orange-500 hover:bg-orange-400 text-white shadow-sm' : isDark ? 'bg-zinc-700 text-zinc-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}>
                  🔥 Masak ({selectedIds.size})
                </button>
                <button onClick={onToggleCookMode}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${isDark ? 'bg-zinc-800 border-zinc-700 text-stone-400 hover:text-stone-200' : 'bg-white border-gray-200 text-gray-500 hover:text-gray-700'}`}>
                  ✕
                </button>
              </>
            )}
          </div>
        </div>

        {isCookMode && (
          <div className={`rounded-xl px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border ${isDark ? 'bg-orange-950/30 border-orange-800/40 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
            <span className="text-base">🍳</span>
            <span>Mode Masak aktif — centang bahan yang ingin dimasak, lalu tekan <strong>Masak ({selectedIds.size})</strong></span>
          </div>
        )}
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {['Semua','Segar','Waspada','Kritis','Busuk','Dimasak','Riwayat'].map(filter => (
          <button key={filter} onClick={() => setActiveFilter(filter)}
            className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 active:scale-95 ${activeFilter === filter ? t.filterActive : t.filterIdle}`}>
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
                className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all active:scale-95 ${
                  isDark
                    ? 'bg-red-950/40 border-red-800/50 text-red-400 hover:bg-red-950/70'
                    : 'bg-red-50 border-red-200 text-red-500 hover:bg-red-100'
                }`}
              >
                🗑️ Hapus Semua
              </button>
            </div>
          )}
          {cookingHistory.length === 0 ? (
            <div className={`border border-dashed rounded-2xl p-8 text-center flex flex-col items-center gap-3 ${t.emptyBox}`}>
              <span className="text-4xl">🍳</span>
              <p className="text-sm">Belum ada riwayat masak.</p>
            </div>
          ) : cookingHistory.map(h => (
            <div key={h.id} className={`rounded-2xl px-5 py-4 border flex items-center justify-between gap-4 ${t.ingCard}`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0 ${isDark ? 'bg-orange-950/50' : 'bg-orange-50'}`}>🔥</div>
                <div className="min-w-0">
                  <p className={`font-bold text-sm truncate ${isDark ? 'text-stone-100' : 'text-gray-800'}`}>{h.ingredient_name}</p>
                  <p className={`text-xs ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>{parseFloat(h.quantity)} {h.unit} dimasak</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className={`text-[11px] font-bold ${isDark ? 'text-lime-400' : 'text-green-600'}`}>+{h.xp_earned} XP</p>
                  <p className={`text-[10px] font-mono ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>
                    {new Date(h.cooked_at).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' })}
                    {' '}
                    {new Date(h.cooked_at).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <button
                  onClick={() => onDeleteHistory(h.id)}
                  title="Hapus riwayat ini"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all active:scale-90 shrink-0 ${
                    isDark
                      ? 'text-stone-500 hover:text-red-400 hover:bg-red-950/40'
                      : 'text-gray-400 hover:text-red-500 hover:bg-red-50'
                  }`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INGREDIENT LIST */}
      {activeFilter !== 'Riwayat' && (
        <div className="flex flex-col gap-3">
          {filteredIngredients.length === 0 ? (
            <div className={`border border-dashed rounded-2xl p-8 sm:p-10 text-center flex flex-col items-center gap-3 ${t.emptyBox}`}>
              <span className="text-4xl">🌱</span>
              <p className="text-sm">Tidak ada data bahan makanan dalam kategori ini.</p>
            </div>
          ) : filteredIngredients.map(ing => {
            const health    = calculateIngredientHealth(ing)
            const statusInfo = getHealthStatus(health)
            const isWasted  = ing.status === 'wasted' || (ing.status === 'active' && health <= 0)
            const isCooked  = ing.status === 'cooked'
            return (
              <IngredientCard
                key={ing.id}
                ing={ing}
                t={t}
                isDark={isDark}
                health={health}
                statusInfo={statusInfo}
                isWasted={isWasted}
                isCooked={isCooked}
                isItemLoading={loadingIds.has(ing.id)}
                isCookMode={isCookMode}
                isSelectable={isCookMode && ing.status === 'active' && !isWasted}
                isSelected={selectedIds.has(ing.id)}
                onToggleSelect={() => onToggleSelectIngredient(ing.id)}
                onAdjustQuantity={onAdjustQuantity}
                onOpenEditModal={onOpenEditModal}
                onOpenCookAmountModal={onOpenCookAmountModal}
                onWaste={onWaste}
                onDelete={onDelete}
              />
            )
          })}
        </div>
      )}
    </section>
  )
}
