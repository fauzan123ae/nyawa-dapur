import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard, buyFirewood, igniteWood } from '../../api/dashboard'
import { addIngredient, updateIngredient, adjustQuantity, cookIngredient, cookAmountIngredient, cookBatchIngredients, wasteIngredient, deleteIngredient } from '../../api/ingredients'
import { claimQuest } from '../../api/quests'
import { getCookingHistory, deleteHistoryEntry, clearAllHistory } from '../../api/history'
import { getMyHouseholds } from '../../api/household'
import { useHistoryRealtime } from '../../hooks/useHistoryRealtime'

import { themes } from './theme'
import { FlameIcon } from './icons'
import Header from './Header'
import LeftPanel from './LeftPanel'
import RightPanel from './RightPanel'
import { ModalAdd, ModalEdit, ModalBatchCook, ModalCookAmount, ModalWasteAmount } from './Modals'
import { useIngredientHealth } from './useIngredientHealth'
import IngredientList from './IngredientList'

const formatRow = (r) => ({
  id:           r.id,
  name:         r.name,
  quantity:     parseFloat(r.quantity),
  unit:         r.unit,
  purchaseDate: r.purchase_date,
  expiryDate:   r.expiry_date,
  status:       r.status,
  updatedAt:    r.updated_at,
})



// =============================================
// DASHBOARD — orchestrator (state + handlers)
// =============================================
export default function Dashboard() {
  const { user: authUser, logout, activeHouseholdId, activeHouseholdName, switchHousehold } = useAuth()

  // ── Theme ─────────────────────────────────
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('nd-theme') === 'dark' } catch { return true }
  })
  const t = isDark ? themes.dark : themes.light
  const toggleTheme = () => setIsDark(prev => {
    const next = !prev
    try { localStorage.setItem('nd-theme', next ? 'dark' : 'light') } catch {}
    return next
  })

  // ── Data state ────────────────────────────
  const [userData, setUserData]         = useState(null)
  const [quests, setQuests]             = useState([])
  const [cookingHistory, setCookingHistory] = useState([])
  const [pantryStats, setPantryStats]   = useState({ segar: 0, layu: 0, sekarat: 0, busuk: 0 })
  const [now, setNow]                   = useState(new Date().toISOString())
  const [pageLoading, setPageLoading]   = useState(true)

  // ── UI state ──────────────────────────────
  const [activeFilter, setActiveFilter] = useState('Semua')
  const ingredientListRef = useRef(null)

  const handleDataLoaded = useCallback((data, stats) => {
    setPantryStats(stats || { segar: 0, layu: 0, sekarat: 0, busuk: 0 })
  }, [])
  const [showToast, setShowToast]       = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mobileTab, setMobileTab]       = useState('pantry')
  const [loadingIds, setLoadingIds]     = useState(new Set())
  const toastRef = useRef(null)

  // ── Modal: Add ────────────────────────────
  const [isAddOpen, setIsAddOpen]       = useState(false)
  const [addForm, setAddForm]           = useState({ name: '', qty: '', unit: 'gram', daysToExpiry: '3' })
  const [isAddSubmitting, setIsAddSubmitting] = useState(false)

  // ── Modal: Edit ───────────────────────────
  const [isEditOpen, setIsEditOpen]     = useState(false)
  const [editingIng, setEditingIng]     = useState(null)
  const [editForm, setEditForm]         = useState({ name: '', qty: '', unit: 'gram', daysToExpiry: '3' })
  const [isEditSubmitting, setIsEditSubmitting] = useState(false)

  // ── Modal: Batch Cook ─────────────────────
  const [isBatchCookOpen, setIsBatchCookOpen] = useState(false)
  const [isCookMode, setIsCookMode]     = useState(false)
  const [selectedIds, setSelectedIds]   = useState(new Set())
  const [isBatchCooking, setIsBatchCooking] = useState(false)

  // ── Modal: Cook Amount ────────────────────
  const [cookAmountIng, setCookAmountIng]     = useState(null)
  const [cookAmountValue, setCookAmountValue] = useState('')
  const [isCookingAmount, setIsCookingAmount] = useState(false)

  // ── Modal: Waste Amount ───────────────────
  const [wasteModal, setWasteModal] = useState({ open: false, ing: null })

  // ── Health helpers ────────────────────────
  const { calculateIngredientHealth: calcHealth, getHealthStatus } = useIngredientHealth(t)
  const calculateIngredientHealth = useCallback((ing) => calcHealth(ing, now), [calcHealth, now])

  // ── Toast ─────────────────────────────────
  const triggerToast = useCallback((message, type = 'success') => {
    if (toastRef.current) clearTimeout(toastRef.current)
    setShowToast({ message, type })
    toastRef.current = setTimeout(() => setShowToast(null), 3500)
  }, [])

  // ── Loading per item ──────────────────────
  const setLoading = (id, val) => setLoadingIds(prev => {
    const next = new Set(prev)
    val ? next.add(id) : next.delete(id)
    return next
  })

  // ── Realtime ──────────────────────────────
  useHistoryRealtime({
    currentUserId: userData?.id,
    onHistoryAdded: (row) => {
      setCookingHistory(prev => {
        if (prev.some(h => h.id === row.id)) return prev
        return [{ ...row, cooked_by: row.cooked_by || 'Anggota' }, ...prev]
      })
    },
  })

  // ── Fetch ─────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    try {
      const [res, histRes] = await Promise.all([getDashboard(), getCookingHistory()])
      setUserData(res.data.userData)
      setQuests(res.data.questsData)
      setCookingHistory(Array.isArray(histRes.data) ? histRes.data : [])
    } catch (err) {
      console.error('Gagal fetch dashboard:', err)
    } finally {
      setPageLoading(false)
    }
  }, [activeHouseholdId])

  // Auto-detect personal household on first load
  useEffect(() => {
    if (!activeHouseholdId) {
      getMyHouseholds().then(res => {
        const personal = res.data.find(h => h.is_personal === true || h.is_personal === 't')
        if (personal) {
          switchHousehold(String(personal.id), personal.name)
        } else if (res.data.length > 0) {
          switchHousehold(String(res.data[0].id), res.data[0].name)
        }
      }).catch(() => {})
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date().toISOString()), 60000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const interval = setInterval(async () => {
      if (document.visibilityState !== 'visible') return
      try {
        const histRes = await getCookingHistory()
        setCookingHistory(Array.isArray(histRes.data) ? histRes.data : [])
      } catch {}
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  // ── Add Ingredient ────────────────────────
  const handleAdd = async (e) => {
    e.preventDefault()
    setIsAddSubmitting(true)
    setIsAddOpen(false)
    triggerToast('Bahan masakan tersimpan!')
    const saved = { ...addForm }
    setAddForm({ name: '', qty: '', unit: 'gram', daysToExpiry: '3' })
    try {
      await addIngredient({ name: saved.name, quantity: saved.qty, unit: saved.unit, days_to_expiry: saved.daysToExpiry })
      const res = await getDashboard()
      setUserData(res.data.userData)
      setQuests(res.data.questsData)
      ingredientListRef.current?.refresh()
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal menambah bahan.', 'error')
    } finally {
      setIsAddSubmitting(false)
    }
  }

  // ── Edit Ingredient ───────────────────────
  const handleOpenEdit = (ing) => {
    setEditingIng(ing)
    const expiryMs = new Date(ing.expiryDate || ing.expiry_date).getTime()
    setEditForm({
      name: ing.name, qty: ing.quantity, unit: ing.unit,
      daysToExpiry: Math.max(1, Math.ceil((expiryMs - Date.now()) / 86400000)).toString(),
    })
    setIsEditOpen(true)
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    setIsEditSubmitting(true)
    setIsEditOpen(false); setEditingIng(null)
    triggerToast('Log bahan diperbarui.')
    try {
      await updateIngredient(editingIng.id, { name: editForm.name, quantity: editForm.qty, unit: editForm.unit, days_to_expiry: editForm.daysToExpiry })
      ingredientListRef.current?.refresh()
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal update.', 'error')
    } finally {
      setIsEditSubmitting(false)
    }
  }

  // ── Cook Amount ───────────────────────────
  const handleOpenCookAmount = (ing) => {
    setCookAmountIng(ing)
    setCookAmountValue(String(ing.quantity))
  }

  const handleConfirmCookAmount = async (e) => {
    e.preventDefault()
    if (!cookAmountIng) return
    const ing    = cookAmountIng
    const amount = parseFloat(cookAmountValue)
    if (isNaN(amount) || amount <= 0) { triggerToast('Jumlah harus lebih dari 0.', 'error'); return }
    if (amount > ing.quantity) { triggerToast(`Stok tidak cukup. Maksimal ${ing.quantity} ${ing.unit}.`, 'error'); return }

    setIsCookingAmount(true)
    setCookAmountIng(null); setCookAmountValue('')

    const remaining = Math.round((ing.quantity - amount) * 100) / 100

    try {
      await cookAmountIngredient(ing.id, amount)
      const [res, histRes] = await Promise.all([getDashboard(), getCookingHistory()])
      setUserData(res.data.userData); setQuests(res.data.questsData)
      setCookingHistory(Array.isArray(histRes.data) ? histRes.data : [])
      ingredientListRef.current?.refresh()
      if (remaining === 0) setActiveFilter('Riwayat')
      triggerToast(`🔥 ${amount} ${ing.unit} ${ing.name} dimasak! Sisa: ${remaining} ${ing.unit}.`)
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal memasak.', 'error')
    } finally {
      setIsCookingAmount(false)
    }
  }

  // ── Cook Mode (batch) ─────────────────────
  const toggleCookMode = () => { setIsCookMode(p => !p); setSelectedIds(new Set()) }

  const toggleSelectIngredient = (id) => setSelectedIds(prev => {
    const next = new Set(prev)
    next.has(id) ? next.delete(id) : next.add(id)
    return next
  })

  const selectAllActive = () => {
    const ingredients = ingredientListRef.current?.ingredients || []
    const ids = ingredients.filter(i => i.status === 'active' && calculateIngredientHealth(i) > 0).map(i => i.id)
    setSelectedIds(new Set(ids))
  }

  const handleConfirmBatchCook = async (cookAmounts) => {
    const payload = Object.entries(cookAmounts).map(([id, amount]) => ({ id: parseInt(id), amount: parseFloat(amount) }))
    setIsBatchCooking(true)
    setIsBatchCookOpen(false); setIsCookMode(false); setSelectedIds(new Set()); setActiveFilter('Riwayat')
    try {
      const res = await cookBatchIngredients(payload)
      triggerToast(res.data?.message || `🔥 ${payload.length} bahan dimasak!`)
      const [dash, histRes] = await Promise.all([getDashboard(), getCookingHistory()])
      setUserData(dash.data.userData); setQuests(dash.data.questsData)
      setCookingHistory(Array.isArray(histRes.data) ? histRes.data : [])
      ingredientListRef.current?.refresh()
    } catch (err) {
      triggerToast(err.response?.data?.message || 'Gagal memasak.', 'error')
    } finally {
      setIsBatchCooking(false)
    }
  }

  // ── Waste & Delete ────────────────────────
  const handleWaste = (id) => {
    const ing = ingredientListRef.current?.ingredients?.find(i => i.id === id)
    if (!ing) return
    setWasteModal({ open: true, ing })
  }

  const handleConfirmWaste = async (amount) => {
    const { ing } = wasteModal
    setWasteModal({ open: false, ing: null })
    try {
      await wasteIngredient(ing.id, amount)
      ingredientListRef.current?.refresh()
      const isFullWaste = amount >= ing.quantity
      triggerToast(
        isFullWaste
          ? 'Bahan dicatat sebagai busuk.'
          : `${amount} ${ing.unit} dicatat busuk.`,
        'error'
      )
    } catch {
      triggerToast('Gagal menandai busuk.', 'error')
    }
  }

  const handleAdjustQuantity = async (id, direction) => {
    const key = `qty-${id}`
    if (loadingIds.has(key)) return
    setLoading(key, true)
    try {
      await adjustQuantity(id, direction)
      ingredientListRef.current?.refresh()
    } catch {
      triggerToast('Gagal adjust.', 'error')
    } finally {
      setLoading(key, false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus log bahan ini secara permanen?')) return
    try {
      await deleteIngredient(id)
      ingredientListRef.current?.refresh()
      triggerToast('Bahan berhasil dihapus dari sistem.')
    } catch {
      triggerToast('Gagal.', 'error')
    }
  }

  // ── History ───────────────────────────────
  const handleDeleteHistory = async (id) => {
    // Optimistic entry (belum tersimpan di DB) — cukup hapus dari state saja
    if (String(id).startsWith('temp-')) {
      setCookingHistory(prev => prev.filter(h => h.id !== id))
      return
    }
    const backup = cookingHistory.find(h => h.id === id)
    setCookingHistory(prev => prev.filter(h => h.id !== id))
    try {
      await deleteHistoryEntry(id)
      triggerToast('Riwayat masak dihapus.')
    } catch {
      setCookingHistory(prev => backup ? [backup, ...prev.filter(h => h.id !== id)] : prev)
      triggerToast('Gagal menghapus riwayat.', 'error')
    }
  }

  const handleClearAllHistory = async () => {
    if (!window.confirm('Hapus semua riwayat masak? Tindakan ini tidak dapat dibatalkan.')) return
    const backup = [...cookingHistory]
    setCookingHistory([])
    // Jika semua entry adalah optimistic (temp-), tidak perlu hit API
    const hasRealEntries = backup.some(h => !String(h.id).startsWith('temp-'))
    if (!hasRealEntries) return
    try {
      await clearAllHistory()
      triggerToast('Semua riwayat masak telah dihapus.')
    } catch {
      setCookingHistory(backup)
      triggerToast('Gagal menghapus semua riwayat.', 'error')
    }
  }

  // ── Shop & Quests ─────────────────────────
  const handleBuyFirewood = async () => {
    try {
      await buyFirewood()
      setUserData(prev => prev ? { ...prev, xp: prev.xp - 50, firewood: (prev.firewood || 0) + 1 } : prev)
      triggerToast('✨ Menukar 50 XP dengan 1 Kayu Bakar.')
    } catch (err) { triggerToast(err.response?.data?.message || 'Gagal.', 'error') }
  }

  const handleIgniteWood = async () => {
    try {
      await igniteWood()
      setUserData(prev => prev ? { ...prev, firewood: Math.max(0, (prev.firewood || 0) - 1), isFireLit: true } : prev)
      triggerToast('🪵 Kayu dilempar! Api dapur berhasil dijaga.')
    } catch (err) { triggerToast(err.response?.data?.message || 'Gagal.', 'error') }
  }

  const handleClaimQuest = async (questType, id) => {
    try {
      await claimQuest(questType, id)
      setQuests(prev => prev.map(q => q.id === id ? { ...q, isCompleted: true, is_completed: true, canClaim: false } : q))
      triggerToast('🎉 Misi berhasil diklaim! Bonus XP masuk.')
      const res = await getDashboard()
      setUserData(res.data.userData); setQuests(res.data.questsData)
    } catch (err) { triggerToast(err.response?.data?.message || 'Gagal klaim.', 'error') }
  }

  // ── Derived ───────────────────────────────
  const user      = userData || { xp: 0, firewood: 0, currentStreak: 0, isFireLit: false }
  const isFireLit = user.isFireLit || false

  const flameLevel = useMemo(() => {
    const s = user.currentStreak || 0
    if (s >= 30) return 'Mythic Flame'
    if (s >= 7)  return 'Blaze'
    return 'Spark'
  }, [user])

  // ── Loading screen ────────────────────────
  if (pageLoading) return (
    <div className={`min-h-screen flex items-center justify-center ${t.page}`}>
      <div className="flex flex-col items-center gap-3">
        <div className={`w-10 h-10 border-4 rounded-full animate-spin ${isDark ? 'border-zinc-700 border-t-emerald-500' : 'border-green-100 border-t-green-500'}`} />
        <span className={`text-sm font-semibold ${isDark ? 'text-emerald-400' : 'text-green-700'}`}>Memuat dapur...</span>
      </div>
    </div>
  )

  // ── Render ────────────────────────────────
  const sharedPanelProps = {
    t, isDark, user,
    ingredients: ingredientListRef.current?.ingredients || [],
    filteredIngredients: ingredientListRef.current?.ingredients || [],
    cookingHistory,
    activeFilter, setActiveFilter,
    isCookMode, selectedIds,
    pantryStats, loadingIds,
    calculateIngredientHealth, getHealthStatus,
    onToggleCookMode:       toggleCookMode,
    onSelectAllActive:      selectAllActive,
    onOpenCookModal:        () => { if (selectedIds.size === 0) { triggerToast('Pilih minimal 1 bahan dulu.', 'error'); return } setIsBatchCookOpen(true) },
    onToggleSelectIngredient: toggleSelectIngredient,
    onOpenAddModal:         () => setIsAddOpen(true),
    onOpenEditModal:        handleOpenEdit,
    onAdjustQuantity:       handleAdjustQuantity,
    onOpenCookAmountModal:  handleOpenCookAmount,
    onWaste:                handleWaste,
    onDelete:               handleDelete,
    onDeleteHistory:        handleDeleteHistory,
    onClearAllHistory:      handleClearAllHistory,
  }

  return (
    <div className={`min-h-screen font-sans selection:bg-green-200 selection:text-green-900 transition-colors duration-300 ${t.page}`}>

      <Header
        t={t} isDark={isDark} user={user} isFireLit={isFireLit} flameLevel={flameLevel}
        mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen}
        toggleTheme={toggleTheme} logout={logout} activeHouseholdName={activeHouseholdName}
      />

      {/* MOBILE TAB SWITCHER */}
      <div className={`lg:hidden sticky top-[56px] z-30 px-4 py-2 border-b backdrop-blur-sm ${isDark ? 'bg-stone-900/90 border-zinc-800' : 'bg-white/90 border-gray-100'}`}>
        <div className={`flex rounded-xl p-1 gap-1 ${isDark ? 'bg-zinc-800' : 'bg-gray-100'}`}>
          {[['pantry','🍃 Pantri'],['dapur','🔥 Dapur & Misi']].map(([val, label]) => (
            <button key={val} onClick={() => setMobileTab(val)}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${mobileTab === val ? (isDark ? 'bg-emerald-600 text-white' : 'bg-green-600 text-white') : (isDark ? 'text-stone-400' : 'text-gray-500')}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-4 sm:py-6 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className={`lg:col-span-7 ${mobileTab !== 'pantry' ? 'hidden lg:block' : ''}`}>
            <LeftPanel {...sharedPanelProps}>
              <IngredientList
                ref={ingredientListRef}
                householdId={activeHouseholdId}
                currentUserId={userData?.id}
                t={t} isDark={isDark} activeFilter={activeFilter}
                isCookMode={isCookMode} selectedIds={selectedIds} loadingIds={loadingIds}
                calculateIngredientHealth={calculateIngredientHealth} getHealthStatus={getHealthStatus}
                onToggleCookMode={toggleCookMode} onSelectAllActive={selectAllActive} onOpenCookModal={() => { if (selectedIds.size === 0) { triggerToast('Pilih minimal 1 bahan dulu.', 'error'); return } setIsBatchCookOpen(true) }}
                onToggleSelectIngredient={toggleSelectIngredient} onOpenAddModal={() => setIsAddOpen(true)}
                onOpenEditModal={handleOpenEdit} onAdjustQuantity={handleAdjustQuantity}
                onOpenCookAmountModal={handleOpenCookAmount} onWaste={handleWaste} onDelete={handleDelete}
                onDataLoaded={handleDataLoaded}
              />
            </LeftPanel>
          </div>
          <div className={`lg:col-span-5 ${mobileTab !== 'dapur' ? 'hidden lg:block' : ''}`}>
            <RightPanel t={t} isDark={isDark} user={user} isFireLit={isFireLit} flameLevel={flameLevel}
              quests={quests} onBuyFirewood={handleBuyFirewood} onIgniteWood={handleIgniteWood} onClaimQuest={handleClaimQuest} />
          </div>
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

      {/* MODALS */}
      <ModalAdd      t={t} isDark={isDark} isOpen={isAddOpen}  onClose={() => setIsAddOpen(false)}  onSubmit={handleAdd}      form={addForm}  setForm={setAddForm}  isSubmitting={isAddSubmitting} />
      <ModalEdit     t={t} isDark={isDark} isOpen={isEditOpen} onClose={() => { setIsEditOpen(false); setEditingIng(null) }} onSubmit={handleSaveEdit} form={editForm} setForm={setEditForm} isSubmitting={isEditSubmitting} ingredient={editingIng} />
      <ModalBatchCook t={t} isDark={isDark} isOpen={isBatchCookOpen} selectedIds={selectedIds} ingredients={ingredientListRef.current?.ingredients || []} isBatchCooking={isBatchCooking}
        onClose={() => setIsBatchCookOpen(false)} onConfirm={handleConfirmBatchCook} onToggleSelect={toggleSelectIngredient}
        calculateIngredientHealth={calculateIngredientHealth} getHealthStatus={getHealthStatus} />
      <ModalCookAmount t={t} isDark={isDark} ingredient={cookAmountIng} value={cookAmountValue} onChange={setCookAmountValue}
        onClose={() => setCookAmountIng(null)} onSubmit={handleConfirmCookAmount} isCooking={isCookingAmount} />
      <ModalWasteAmount open={wasteModal.open} ing={wasteModal.ing} t={t} isDark={isDark}
        onClose={() => setWasteModal({ open: false, ing: null })} onConfirm={handleConfirmWaste} />

      <footer className={`border-t mt-12 py-5 text-center text-xs ${t.footer}`}>
        <p>© 2026 Nyawa Dapur — Eco Gamified Kitchen Productivity.</p>
      </footer>
    </div>
  )
}