import { PencilIcon, TrashIcon } from './icons'
import { Leaf, Skull, Check, Flame, Trash2, Clock, Pencil, Sparkles } from 'lucide-react'

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
  const expiryMs = new Date(ing.expiryDate || ing.expiry_date).getTime()
  const remainingDays = Math.max(0, Math.ceil((expiryMs - Date.now()) / 86400000))

  return (
    <div
      onClick={isSelectable ? onToggleSelect : undefined}
      className={`rounded-3xl p-5 flex flex-col gap-4 transition-all duration-300 border-2 ${t.ingCard}
        ${isItemLoading ? 'opacity-65' : ''}
        ${isSelectable ? 'cursor-pointer hover:scale-[1.02] hover:-translate-y-1' : ''}
        ${isSelected
          ? isDark
            ? 'border-primary/80 bg-primary/10 shadow-[0_0_15px_rgba(82,183,136,0.2)]'
            : 'border-primary bg-[#EAFDF8] shadow-md shadow-primary/5'
          : ''}
        ${isCookMode && !isSelectable ? 'opacity-40' : ''}
      `}
    >
      {/* Row atas: nama + badge */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0 flex items-start gap-3">
          {isSelectable && (
            <div className={`mt-0.5 w-5 h-5 rounded-lg border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${isSelected ? 'bg-primary border-primary text-white scale-110' : isDark ? 'border-zinc-500 bg-zinc-800' : 'border-border bg-white'
              }`}>
              {isSelected && <Check className="w-3.5 h-3.5" strokeWidth={4} />}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-sm sm:text-base flex items-center gap-1.5 flex-wrap">
              <span className="animate-sway select-none">
                {isWasted ? '🍄' : remainingDays <= 2 ? '⚠️' : '🌱'}
              </span>
              <span className="truncate leading-tight text-[#3D2314] dark:text-[#F5F5F4]">{ing.name}</span>
              {isCooked && <span className={`text-[9px] px-2 py-0.5 rounded-full font-black border-2 shrink-0 ${t.cookedBadge}`}>Selesai Dimasak 🍳</span>}
            </h3>
            <div className="flex items-center gap-2 mt-2.5">
              <span className={`text-[9px] font-black uppercase tracking-wider ${isDark ? 'text-stone-500' : 'text-[#A07856]'}`}>Kuantitas</span>
              {ing.status === 'active' && !isWasted ? (
                <div onClick={e => e.stopPropagation()} className={`flex items-center rounded-full py-0.5 px-2 gap-2 border-2 ${t.qtyBox}`}>
                  <button onClick={() => onAdjustQuantity(ing.id, 'minus')} disabled={isItemLoading} className={`text-xs font-black px-1.5 active:scale-75 focus:outline-none transition-transform ${t.qtyMinus}`}>−</button>
                  <span className={`text-xs font-mono font-black ${t.qtyText}`}>{ing.quantity} {ing.unit}</span>
                  <button onClick={() => onAdjustQuantity(ing.id, 'plus')} disabled={isItemLoading} className={`text-xs font-black px-1.5 active:scale-75 focus:outline-none transition-transform ${t.qtyPlus}`}>+</button>
                </div>
              ) : (
                <span className={`text-xs font-mono font-black px-2 py-0.5 rounded-lg bg-cream border border-border ${isDark ? 'text-stone-300' : 'text-[#3D2314]'}`}>{ing.quantity} {ing.unit}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={`text-[9px] font-black px-2 py-1 rounded-xl border-2 ${statusInfo.color}`}>
            {isCooked ? 'LOG AMAN' : statusInfo.label}
          </span>
        </div>
      </div>

      {/* Health bar */}
      {ing.status === 'active' && !isWasted && (
        <div className="flex flex-col gap-1.5 mt-1">
          <div className={`w-full rounded-full overflow-hidden border border-border dark:border-[#34413B] ${t.healthBg}`}>
            <div className={`h-full rounded-full transition-all duration-500 ${statusInfo.barColor}`} style={{ width: `${health}%` }} />
          </div>
          <div className={`flex justify-between text-[10px] font-bold ${t.healthText}`}>
            <span>Kesegaran: {health}%</span>
            <span>Sisa: {remainingDays} Hari</span>
          </div>
        </div>
      )}

      {/* Waktu dimasak */}
      {isCooked && ing.updatedAt && (
        <div className={`flex items-center gap-1.5 text-[9px] font-bold px-3 py-2 rounded-2xl border-2 mt-1 ${isDark ? 'bg-[#F5A96A]/10 border-[#F5A96A]/30 text-[#F5A96A]' : 'bg-primary/10 border-primary/20 text-primary'
          }`}>
          <Clock className="w-3.5 h-3.5 text-secondary animate-pulse" />
          <span>Dimasak pada:</span>
          <span className="font-extrabold font-mono">
            {new Date(ing.updatedAt).toLocaleDateString('id-ID', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
            {' '}
            {new Date(ing.updatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div className={`flex justify-between items-center border-t-2 pt-3 mt-1 ${t.divider}`}>
        <div>
          {ing.status === 'active' && !isWasted && (
            <button onClick={() => onOpenEditModal(ing)} className={`flex items-center gap-1 text-xs font-bold transition-colors btn-squish focus:outline-none rounded-md px-1 ${t.editBtn}`}>
              <Pencil className="w-3.5 h-3.5" /> Ubah Log
            </button>
          )}
        </div>
        <div className="flex gap-1.5">
          {!isCookMode && ing.status === 'active' && !isWasted && (
            <>
              <button onClick={() => onOpenCookAmountModal(ing)} disabled={isItemLoading}
                className={`flex items-center gap-1 px-3.5 py-1.5 text-xs font-black rounded-xl transition-all duration-200 btn-squish focus:outline-none ${t.cookBtn}`}>
                <Flame className="w-3.5 h-3.5" /> Masak
              </button>
              <button onClick={() => onWaste(ing.id)} disabled={isItemLoading}
                className={`p-1.5 rounded-xl text-xs flex items-center justify-center transition-all duration-200 btn-squish focus:outline-none ${t.wasteBtn}`} title="Tandai Rusak" aria-label="Tandai Rusak">
                <Skull className="w-4 h-4" />
              </button>
            </>
          )}
          {!isCookMode && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(ing.id) }}
              className={`p-1.5 rounded-xl flex items-center justify-center border transition-all duration-200 btn-squish focus:outline-none ${t.deleteBtn}`} aria-label="Hapus">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          {isCookMode && isSelectable && (
            <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${isSelected ? 'text-primary' : isDark ? 'text-zinc-500' : 'text-muted'}`}>
              {isSelected ? '✓ Dipilih' : 'Tap untuk pilih'}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}