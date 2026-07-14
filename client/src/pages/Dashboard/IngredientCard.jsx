import { PencilIcon, TrashIcon } from './icons'

// =============================================
// INGREDIENT CARD — satu bahan di list
// =============================================
export default function IngredientCard({
  ing, t, isDark,
  health, statusInfo, isWasted, isCooked,
  isItemLoading, isCookMode, isSelectable, isSelected,
  onToggleSelect,
  onAdjustQuantity,
  onOpenEditModal,
  onOpenCookAmountModal,
  onWaste,
  onDelete,
}) {
  const expiryMs      = new Date(ing.expiryDate || ing.expiry_date).getTime()
  const remainingDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / 86400000))

  return (
    <div
      onClick={isSelectable ? onToggleSelect : undefined}
      className={`rounded-2xl p-4 sm:p-5 flex flex-col gap-3 sm:gap-4 transition-all border ${t.ingCard}
        ${isItemLoading ? 'opacity-60' : ''}
        ${isSelectable ? 'cursor-pointer' : ''}
        ${isSelected
          ? isDark
            ? 'border-orange-500/70 bg-orange-950/20 shadow-[0_0_12px_rgba(249,115,22,0.15)]'
            : 'border-orange-400 bg-orange-50/80 shadow-sm'
          : ''}
        ${isCookMode && !isSelectable ? 'opacity-40' : ''}
      `}
    >
      {/* Row atas: nama + badge */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0 flex items-start gap-2.5">
          {isSelectable && (
            <div className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              isSelected ? 'bg-orange-500 border-orange-500 text-white' : isDark ? 'border-zinc-500 bg-zinc-800' : 'border-gray-300 bg-white'
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
                  <button onClick={() => onAdjustQuantity(ing.id, 'minus')} disabled={isItemLoading} className={`text-xs font-black px-1 active:scale-90 ${t.qtyMinus}`}>−</button>
                  <span className={`text-xs font-mono font-bold ${t.qtyText}`}>{ing.quantity} {ing.unit}</span>
                  <button onClick={() => onAdjustQuantity(ing.id, 'plus')} disabled={isItemLoading} className={`text-xs font-black px-1 active:scale-90 ${t.qtyPlus}`}>+</button>
                </div>
              ) : (
                <span className={`text-xs font-mono ${isDark ? 'text-stone-300' : 'text-gray-600'}`}>{ing.quantity} {ing.unit}</span>
              )}
            </div>
          </div>
        </div>
        <span className={`text-[10px] font-black px-2 py-1 rounded-lg border shrink-0 ${statusInfo.color}`}>
          {isCooked ? 'LOG AMAN' : statusInfo.label}
        </span>
      </div>

      {/* Health bar */}
      {ing.status === 'active' && !isWasted && (
        <div className="flex flex-col gap-1.5">
          <div className={`w-full rounded-full h-2 overflow-hidden ${t.healthBg}`}>
            <div className={`h-full rounded-full transition-all ${statusInfo.barColor}`} style={{ width: `${health}%` }} />
          </div>
          <div className={`flex justify-between text-[10px] font-mono ${t.healthText}`}>
            <span>Kesegaran: {health}%</span>
            <span>Sisa: {remainingDays} Hari</span>
          </div>
        </div>
      )}

      {/* Waktu dimasak */}
      {isCooked && ing.updatedAt && (
        <div className={`flex items-center gap-1.5 text-[10px] font-semibold px-3 py-2 rounded-xl border ${
          isDark ? 'bg-emerald-950/40 border-emerald-900/40 text-emerald-400' : 'bg-green-50 border-green-200 text-green-700'
        }`}>
          <span>🕐</span>
          <span>Dimasak pada:</span>
          <span className="font-bold font-mono">
            {new Date(ing.updatedAt).toLocaleDateString('id-ID', { weekday:'short', day:'2-digit', month:'short', year:'numeric' })}
            {' '}
            {new Date(ing.updatedAt).toLocaleTimeString('id-ID', { hour:'2-digit', minute:'2-digit' })}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className={`flex justify-between items-center border-t pt-2.5 sm:pt-3 ${t.divider}`}>
        <div>
          {ing.status === 'active' && !isWasted && (
            <button onClick={() => onOpenEditModal(ing)} className={`flex items-center gap-1 text-xs font-semibold transition-colors ${t.editBtn}`}>
              <PencilIcon className="w-3.5 h-3.5" /> Ubah Log
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {!isCookMode && ing.status === 'active' && !isWasted && (
            <>
              <button onClick={() => onOpenCookAmountModal(ing)} disabled={isItemLoading}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all active:scale-95 ${t.cookBtn}`}>🔥 Masak</button>
              <button onClick={() => onWaste(ing.id)} disabled={isItemLoading}
                className={`p-1.5 rounded-lg text-xs transition-colors active:scale-95 ${t.wasteBtn}`} title="Tandai Rusak">🗑️</button>
            </>
          )}
          {!isCookMode && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(ing.id) }}
              className={`p-1.5 rounded-lg transition-colors active:scale-95 ${t.deleteBtn}`}>
              <TrashIcon />
            </button>
          )}
          {isCookMode && isSelectable && (
            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${isSelected ? 'text-orange-500' : isDark ? 'text-zinc-500' : 'text-gray-400'}`}>
              {isSelected ? '✓ Dipilih' : 'Tap untuk pilih'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
