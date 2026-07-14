// =============================================
// MODALS — Add, Edit, BatchCook, CookAmount
// =============================================

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
  if (!isOpen) return null
  return (
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}>
      <div className={`rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-2xl border ${t.modal}`}>
        <h3 className={`text-lg font-black mb-1 ${t.modalTitle}`}>🍳 Konfirmasi Memasak</h3>
        <p className={`text-xs mb-4 ${t.modalSub}`}>Bahan-bahan berikut akan dimasak sekaligus</p>
        <div className={`rounded-2xl border divide-y mb-4 max-h-48 overflow-y-auto ${isDark ? 'border-zinc-700 divide-zinc-700' : 'border-gray-100 divide-gray-100'}`}>
          {ingredients.filter(i => selectedIds.has(i.id)).map(i => {
            const h = calculateIngredientHealth(i)
            const s = getHealthStatus(h)
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
                  <button onClick={() => onToggleSelect(i.id)} className={`text-[10px] font-bold ${isDark ? 'text-zinc-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'}`}>✕</button>
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
          <button onClick={onConfirm} disabled={isBatchCooking}
            className="w-1/2 py-2.5 font-bold rounded-xl transition-all text-sm bg-orange-500 hover:bg-orange-400 text-white shadow-sm disabled:opacity-50">
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
    <div className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm ${t.modalOverlay}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className={`relative rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-6 shadow-2xl border ${t.modal}`}>
        <div className="sm:hidden w-10 h-1 rounded-full bg-gray-300 mx-auto mb-4" />
        <button onClick={onClose} className={`absolute top-4 right-4 text-lg leading-none ${t.modalClose}`}>✕</button>
        <h3 className={`text-lg font-black mb-0.5 ${t.modalTitle}`}>🍳 Masak Berapa?</h3>
        <p className={`text-xs mb-4 ${t.modalSub}`}>
          Stok <span className="font-bold">{ingredient.name}</span>:{' '}
          <span className={`font-black ${isDark ? 'text-emerald-400' : 'text-green-600'}`}>
            {ingredient.quantity} {ingredient.unit}
          </span>
        </p>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div>
            <label className={`block text-xs font-bold mb-1 ${t.modalLabel}`}>Jumlah yang dimasak ({ingredient.unit})</label>
            <input type="number" step="any" min="0.01" max={ingredient.quantity}
              value={value} onChange={e => onChange(e.target.value)}
              className={`w-full rounded-xl px-4 py-2.5 text-sm border focus:outline-none focus:ring-2 transition-all ${t.modalInput}`}
              autoFocus required />
          </div>
          {value && !isNaN(parseFloat(value)) && parseFloat(value) > 0 && (
            <div className={`rounded-xl px-4 py-3 flex justify-between items-center border text-xs ${isDark ? 'bg-orange-950/30 border-orange-800/40' : 'bg-orange-50 border-orange-200'}`}>
              <span className={isDark ? 'text-orange-300' : 'text-orange-700'}>Sisa di kulkas setelah dimasak</span>
              <span className={`font-black ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
                {Math.max(0, Math.round((ingredient.quantity - parseFloat(value)) * 100) / 100)} {ingredient.unit}
              </span>
            </div>
          )}
          <div className="flex gap-2 flex-wrap">
            {[0.25, 0.5, 1].map(frac => {
              const val = Math.round(ingredient.quantity * frac * 100) / 100
              if (val <= 0) return null
              return (
                <button type="button" key={frac} onClick={() => onChange(String(val))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold border transition-all active:scale-95 ${
                    isDark ? 'bg-zinc-800 border-zinc-600 text-stone-300 hover:border-emerald-600 hover:text-emerald-400' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700'
                  }`}>
                  {frac === 1 ? 'Semua' : frac === 0.5 ? '½' : '¼'} ({val} {ingredient.unit})
                </button>
              )
            })}
          </div>
          <div className="flex gap-2.5 mt-1">
            <button type="button" onClick={onClose} className={`w-1/2 py-3 font-bold rounded-xl text-sm transition-all ${t.modalCancel}`}>Batal</button>
            <button type="submit" disabled={isCooking}
              className="w-1/2 py-3 font-bold rounded-xl text-sm transition-all active:scale-95 bg-orange-500 hover:bg-orange-400 text-white shadow-sm disabled:opacity-50">
              {isCooking ? 'Memasak...' : '🔥 Masak'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
