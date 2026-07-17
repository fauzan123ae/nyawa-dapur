import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

// ── Modal Tambah Bahan ──────────────────────
export function ModalAdd({ t, isDark, isOpen, onClose, onSubmit, form, setForm, isSubmitting }) {
  if (!isOpen) return null
  const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${t.modalInput}`
  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl relative border ${t.modal}`}>
        <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <button onClick={onClose} className={`absolute top-4 right-4 text-lg leading-none ${t.modalClose}`}>✕</button>
        <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>🍳 Daftarkan Log Bahan / Makanan</h3>
        <p className={`text-xs mb-4 ${t.modalSub}`}>Catat bahan segar ke dalam inventaris dapur</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className={`block font-bold mb-1 ${t.modalLabel}`}>Nama Bahan*</label>
            <input type="text" placeholder="Misal: Sawi Organik..." value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${t.modalLabel}`}>Kuantitas*</label>
              <input type="number" step="any" placeholder="1" value={form.qty}
                onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className={`block font-bold mb-1 ${t.modalLabel}`}>Satuan</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={inputClass}>
                <option value="gram">gram</option><option value="kilogram">kilogram</option>
                <option value="ikat">ikat</option><option value="buah">buah</option><option value="liter">liter</option>
              </select>
            </div>
          </div>
          <div>
            <label className={`block font-bold mb-1 ${t.modalLabel}`}>Masa Kedaluwarsa (Hari)*</label>
            <input type="number" min="1" placeholder="4" value={form.daysToExpiry}
              onChange={e => setForm(f => ({ ...f, daysToExpiry: e.target.value }))} className={inputClass} required />
          </div>
          <div className="flex gap-2.5 mt-1">
            <button type="button" onClick={onClose} className={`w-1/2 py-3 font-bold rounded-xl transition-all ${t.modalCancel}`}>Batal</button>
            <button type="submit" disabled={isSubmitting}
              className={`w-1/2 py-3 font-bold rounded-xl transition-all active:scale-95 ${t.modalSubmit} ${isSubmitting ? 'opacity-70' : ''}`}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Bahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Edit Bahan ────────────────────────
export function ModalEdit({ t, isDark, isOpen, ingredient, onClose, onSubmit, form, setForm, isSubmitting }) {
  if (!isOpen || !ingredient) return null
  const inputClass = `w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all ${t.modalInput}`
  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl relative border ${t.modal}`}>
        <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <button onClick={onClose} className={`absolute top-4 right-4 text-lg leading-none ${t.modalClose}`}>✕</button>
        <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>✏️ Sesuaikan Detail Stok</h3>
        <p className={`text-xs mb-4 ${t.modalSub}`}>Perbarui informasi bahan di inventaris</p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4 text-xs">
          <div>
            <label className={`block font-bold mb-1 ${t.modalLabel}`}>Nama Bahan</label>
            <input type="text" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inputClass} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={`block font-bold mb-1 ${t.modalLabel}`}>Sisa Stok</label>
              <input type="number" step="any" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))} className={inputClass} required />
            </div>
            <div>
              <label className={`block font-bold mb-1 ${t.modalLabel}`}>Satuan</label>
              <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className={inputClass}>
                <option value="gram">gram</option><option value="kilogram">kilogram</option>
                <option value="ikat">ikat</option><option value="buah">buah</option><option value="liter">liter</option>
              </select>
            </div>
          </div>
          <div>
            <label className={`block font-bold mb-1 ${t.modalLabel}`}>Perpanjang Kedaluwarsa (Hari)</label>
            <input type="number" min="1" value={form.daysToExpiry} onChange={e => setForm(f => ({ ...f, daysToExpiry: e.target.value }))} className={inputClass} required />
          </div>
          <div className="flex gap-2.5 mt-1">
            <button type="button" onClick={onClose} className={`w-1/2 py-3 font-bold rounded-xl transition-all ${t.modalCancel}`}>Batal</button>
            <button type="submit" disabled={isSubmitting}
              className={`w-1/2 py-3 font-bold rounded-xl transition-all active:scale-95 ${t.modalSubmit} ${isSubmitting ? 'opacity-70' : ''}`}>
              {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
// ── Modal Masak Batch ───────────────────────
export function ModalBatchCook({ t, isDark, isOpen, selectedIds, ingredients, isBatchCooking, onClose, onConfirm, onToggleSelect, calculateIngredientHealth, getHealthStatus }) {
  const [cookAmounts, setCookAmounts] = useState({})

  useEffect(() => {
    if (isOpen) {
      const selectedIngredients = ingredients.filter(i => selectedIds.has(i.id))
      setCookAmounts(prev => {
        const next = {}
        selectedIngredients.forEach(i => {
          next[i.id] = prev[i.id] !== undefined ? prev[i.id] : i.quantity
        })
        return next
      })
    } else {
      setCookAmounts({})
    }
  }, [isOpen, selectedIds, ingredients])

  if (!isOpen) return null

  const updateAmount = (id, val) => {
    setCookAmounts(prev => ({
      ...prev,
      [id]: val
    }))
  }

  const handleBlur = (id, maxVal) => {
    let val = parseFloat(cookAmounts[id])
    if (isNaN(val) || val < 0.1) {
      val = 0.1
    } else if (val > maxVal) {
      val = maxVal
    }
    val = Math.round(val * 100) / 100
    updateAmount(id, val)
  }

  const handleMinus = (id) => {
    const val = parseFloat(cookAmounts[id]) || 0.1
    const newVal = Math.max(0.1, Math.round((val - 1) * 100) / 100)
    updateAmount(id, newVal)
  }

  const handlePlus = (id, maxVal) => {
    const val = parseFloat(cookAmounts[id]) || 0.1
    const newVal = Math.min(maxVal, Math.round((val + 1) * 100) / 100)
    updateAmount(id, newVal)
  }

  const handleConfirmClick = () => {
    onConfirm(cookAmounts)
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl border ${t.modal}`}>
        <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>🍳 Konfirmasi Memasak</h3>
        <p className={`text-xs mb-4 ${t.modalSub}`}>Bahan-bahan berikut akan dimasak sekaligus</p>
        <div className={`rounded-2xl border divide-y mb-4 max-h-56 overflow-y-auto ${isDark ? 'border-zinc-700 divide-zinc-700' : 'border-gray-100 divide-gray-100'}`}>
          {ingredients.filter(i => selectedIds.has(i.id)).map(i => {
            const h = calculateIngredientHealth(i)
            const s = getHealthStatus(h)
            const currentAmount = cookAmounts[i.id] !== undefined ? cookAmounts[i.id] : i.quantity
            return (
              <div key={i.id} className={`flex items-center justify-between px-4 py-3 gap-2 ${isDark ? 'bg-zinc-800/60' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="text-base shrink-0">🌿</span>
                  <div className="min-w-0">
                    <p className={`text-xs font-bold truncate ${isDark ? 'text-stone-200' : 'text-gray-700'}`}>{i.name}</p>
                    <p className={`text-[10px] ${isDark ? 'text-stone-500' : 'text-gray-400'}`}>Stok: {i.quantity} {i.unit}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="flex items-center gap-1.5">
                    <div className={`flex items-center rounded-lg py-0.5 px-1.5 gap-1.5 border ${t.qtyBox}`}>
                      <button
                        type="button"
                        onClick={() => handleMinus(i.id)}
                        disabled={parseFloat(currentAmount) <= 0.1}
                        className={`text-xs font-black px-1 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed ${t.qtyMinus}`}
                      >
                        −
                      </button>
                      
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        max={i.quantity}
                        value={currentAmount}
                        onChange={(e) => updateAmount(i.id, e.target.value)}
                        onBlur={() => handleBlur(i.id, i.quantity)}
                        className={`w-12 text-center text-xs font-mono font-bold focus:outline-none bg-transparent ${t.qtyText}`}
                      />
                      
                      <button
                        type="button"
                        onClick={() => handlePlus(i.id, i.quantity)}
                        disabled={parseFloat(currentAmount) >= i.quantity}
                        className={`text-xs font-black px-1 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed ${t.qtyPlus}`}
                      >
                        +
                      </button>
                    </div>
                    <span className={`text-[10px] font-bold ${isDark ? 'text-stone-400' : 'text-gray-500'}`}>{i.unit}</span>
                  </div>
                  
                  <button
                    type="button"
                    onClick={() => onToggleSelect(i.id)}
                    className={`text-[10px] font-bold px-1.5 py-1 transition-colors ${isDark ? 'text-zinc-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}
                  >
                    ✕
                  </button>
                </div>
              </div>
            )
          })}
        </div>
        <div className={`rounded-xl px-4 py-3 mb-4 flex justify-between items-center border ${isDark ? 'bg-orange-950/30 border-orange-800/40' : 'bg-orange-50 border-orange-200'}`}>
          <span className={`text-xs font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>Total XP yang didapat</span>
          <span className={`text-sm font-black ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>+{selectedIds.size * 15} XP</span>
        </div>
        <div className="flex gap-2.5">
          <button onClick={onClose} className={`w-1/2 py-2.5 font-bold rounded-xl transition-all text-sm ${t.modalCancel}`}>Batal</button>
          <button onClick={handleConfirmClick} disabled={isBatchCooking || selectedIds.size === 0}
            className={`w-1/2 py-2.5 font-bold text-sm disabled:opacity-50 ${t.cookBtn}`}>
            {isBatchCooking ? 'Memasak...' : `🔥 Masak ${selectedIds.size} Bahan`}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Modal Masak Jumlah Tertentu ─────────────
export function ModalCookAmount({ t, isDark, ingredient, value, onChange, onClose, onSubmit, isCooking }) {
  if (!ingredient) return null
  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-150 ${t.modalOverlay}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`relative rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 shadow-2xl border animate-[scaleUp_0.15s_ease-out] ${t.modal}`}>
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700 mx-auto mb-4" />
        <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${t.modalClose}`} aria-label="Tutup Modal">
          <X className="w-4 h-4" />
        </button>
        <h3 className={`text-lg font-black mb-0.5 flex items-center gap-1.5 ${t.modalTitle}`}>
          🍳 Masak Berapa?
        </h3>
        <p className={`text-xs mb-4 ${t.modalSub}`}>
          Stok <span className="font-bold">{ingredient.name}</span>:{' '}
          <span className={`font-black ${isDark ? 'text-[#7BAE7F]' : 'text-primary'}`}>
            {ingredient.quantity} {ingredient.unit}
          </span>
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${t.modalLabel}`}>Jumlah yang dimasak ({ingredient.unit})</label>
            <input type="number" step="any" min="0.01" max={ingredient.quantity}
              value={value} onChange={e => onChange(e.target.value)}
              className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all duration-200 ${t.modalInput}`}
              autoFocus required />
          </div>
          {value && !isNaN(parseFloat(value)) && parseFloat(value) > 0 && (
            <div className={`rounded-xl px-4 py-3 flex justify-between items-center border text-xs ${isDark ? 'bg-[#7BAE7F]/15 border-[#7BAE7F]/30' : 'bg-primary/5 border-primary/20'}`}>
              <span className={isDark ? 'text-[#7BAE7F]' : 'text-primary'}>Sisa di kulkas setelah dimasak</span>
              <span className={`font-black ${isDark ? 'text-[#7BAE7F]' : 'text-primary'}`}>
                {Math.max(0, Math.round((ingredient.quantity - parseFloat(value)) * 100) / 100)} {ingredient.unit}
              </span>
            </div>
          )}
          <div className="flex gap-1.5 flex-wrap">
            {[0.25, 0.5, 1].map(frac => {
              const val = Math.round(ingredient.quantity * frac * 100) / 100
              if (val <= 0) return null
              return (
                <button type="button" key={frac} onClick={() => onChange(String(val))}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold border transition-all duration-200 active:scale-95 ${
                    isDark ? 'bg-[#222B27] border-[#34413B] text-[#B8C1BA] hover:border-[#7BAE7F] hover:text-[#7BAE7F]' : 'bg-cream border-border text-gray-600 hover:border-accent hover:text-primary'
                  }`}>
                  {frac === 1 ? 'Semua' : frac === 0.5 ? '½' : '¼'} ({val} {ingredient.unit})
                </button>
              )
            })}
          </div>
          <div className="flex gap-2.5 mt-2">
            <button type="button" onClick={onClose} className={`w-1/2 py-3 font-bold rounded-xl text-sm transition-all duration-200 ${t.modalCancel}`}>Batal</button>
            <button type="submit" disabled={isCooking}
              className={`w-1/2 py-3 font-bold text-sm disabled:opacity-50 ${t.cookBtn}`}>
              {isCooking ? 'Memasak...' : '🔥 Masak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Modal Waste Amount ────────────────────────
export function ModalWasteAmount({ open, ing, t, isDark, onClose, onConfirm }) {
  const [value, setValue] = useState('')
  useEffect(() => {
    if (open && ing) {
      setValue(String(ing.quantity))
    } else {
      setValue('')
    }
  }, [open, ing])

  if (!open || !ing) return null

  const handleMinus = () => {
    const val = parseFloat(value) || 0.1
    const newVal = Math.max(0.1, Math.round((val - 1) * 100) / 100)
    setValue(String(newVal))
  }

  const handlePlus = () => {
    const val = parseFloat(value) || 0.1
    const newVal = Math.min(ing.quantity, Math.round((val + 1) * 100) / 100)
    setValue(String(newVal))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const amount = parseFloat(value)
    if (isNaN(amount) || amount < 0.1 || amount > ing.quantity) return
    onConfirm(amount)
  }

  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 transition-opacity duration-150 ${t.modalOverlay}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`relative rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 shadow-2xl border animate-[scaleUp_0.15s_ease-out] ${t.modal}`}>
        <div className="sm:hidden w-12 h-1.5 rounded-full bg-gray-300 dark:bg-zinc-700 mx-auto mb-4" />
        <button onClick={onClose} className={`absolute top-4 right-4 p-1.5 rounded-full transition-colors ${t.modalClose}`} aria-label="Tutup Modal">
          <X className="w-4 h-4" />
        </button>
        <h3 className={`text-lg font-black mb-0.5 flex items-center gap-1.5 ${t.modalTitle}`}>
          🍄 Berapa yang Busuk?
        </h3>
        <p className={`text-xs mb-4 ${t.modalSub}`}>
          Stok <span className="font-bold">{ing.name}</span>:{' '}
          <span className="font-black text-danger">
            {ing.quantity} {ing.unit}
          </span>
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1.5 ${t.modalLabel}`}>Jumlah yang rusak ({ing.unit})</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center rounded-2xl bg-[#FFFDF9] dark:bg-[#222B27] border-2 border-border dark:border-[#34413B] overflow-hidden shadow-inner h-11 px-2">
                <button
                  type="button"
                  onClick={handleMinus}
                  disabled={parseFloat(value) <= 0.1}
                  className="w-8 h-full flex items-center justify-center transition-colors active:scale-95 text-gray-400 hover:text-danger disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <input
                  type="number"
                  step="any"
                  min="0.1"
                  max={ing.quantity}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full text-center text-sm font-mono font-bold focus:outline-none bg-transparent text-gray-800 dark:text-stone-200"
                  required
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handlePlus}
                  disabled={parseFloat(value) >= ing.quantity}
                  className="w-8 h-full flex items-center justify-center transition-colors active:scale-95 text-gray-400 hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
              <span className="text-xs font-bold text-muted">{ing.unit}</span>
            </div>
          </div>

          <div className="flex gap-2.5 mt-2">
            <button type="button" onClick={onClose} className={`w-1/2 py-3 font-bold rounded-xl text-sm transition-all duration-200 ${t.modalCancel}`}>Batal</button>
            <button type="submit"
              className="w-1/2 py-3 font-bold rounded-xl text-sm transition-all duration-200 active:scale-95 bg-danger hover:bg-danger/80 text-white shadow-md cursor-pointer">
              🍄 Tandai Busuk
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}