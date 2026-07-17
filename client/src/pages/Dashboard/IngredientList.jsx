import { useState, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from 'react'
import { getIngredients } from '../../api/ingredients'
import IngredientCard from './IngredientCard'
import { useIngredientRealtime } from '../../hooks/useIngredientRealtime'

const formatRow = (r) => ({
  id: r.id,
  name: r.name,
  quantity: parseFloat(r.quantity),
  unit: r.unit,
  purchaseDate: r.purchaseDate || r.purchase_date,
  expiryDate: r.expiryDate || r.expiry_date,
  status: r.status,
  updatedAt: r.updatedAt || r.updated_at,
})

const IngredientList = forwardRef(({
  t, isDark, activeFilter, isCookMode, selectedIds, loadingIds,
  calculateIngredientHealth, getHealthStatus,
  onToggleCookMode, onSelectAllActive, onOpenCookModal,
  onToggleSelectIngredient, onOpenAddModal, onOpenEditModal,
  onAdjustQuantity, onOpenCookAmountModal, onWaste, onDelete,
  onDataLoaded,
  wasteHistory,
  householdId, currentUserId
}, ref) => {
  const [ingredients, setIngredients] = useState([])

  // Gunakan ref untuk onDataLoaded agar tidak masuk dependency array
  // dan tidak memicu re-render / infinite loop
  const onDataLoadedRef = useRef(onDataLoaded)
  useEffect(() => { onDataLoadedRef.current = onDataLoaded }, [onDataLoaded])

  const fetchList = async () => {
    try {
      const res = await getIngredients()
      const data = res.data.map(formatRow)
      setIngredients(data)
    } catch (err) {
      console.error(err)
    }
  }

  useIngredientRealtime({
    householdId,
    currentUserId,
    onAdded: (row) => {
      setIngredients(prev => {
        if (prev.find(i => i.id === row.id)) return prev
        return [formatRow(row), ...prev]
      })
    },
    onUpdated: (row) => {
      setIngredients(prev => prev.map(i => i.id === row.id ? { ...i, ...formatRow(row) } : i))
    },
    onDeleted: (row) => {
      setIngredients(prev => prev.filter(i => i.id !== row.id))
    },
  })

  useEffect(() => {
    fetchList()
    // Polling 30 detik sebagai fallback — realtime sudah ditangani
    // oleh useIngredientRealtime (Supabase)
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchList()
      }
    }, 30_000)
    return () => clearInterval(interval)
  }, [householdId])

  useImperativeHandle(ref, () => ({
    refresh: () => fetchList(false),
    ingredients,
    setIngredients,
  }), [ingredients, fetchList])

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(i => {
      if (activeFilter === 'Busuk') return i.status === 'wasted'
      if (i.status !== 'active') return false
      if (activeFilter === 'Semua') return true
      return getHealthStatus(calculateIngredientHealth(i)).label === activeFilter
    })
  }, [ingredients, activeFilter, calculateIngredientHealth, getHealthStatus])

  const pantryStats = useMemo(() => {
    let segar = 0, layu = 0, sekarat = 0
    ingredients.forEach(i => {
      if (i.status !== 'active') return
      const health = calculateIngredientHealth(i)
      const s = getHealthStatus(health).label
      if (s === 'Segar') segar++
      else if (s === 'Waspada') layu++
      else sekarat++
    })
    // Busuk = jumlah entri di waste_history (bukan status ingredient)
    // supaya partial waste (buang sebagian) juga ikut terhitung
    const busuk = Array.isArray(wasteHistory) ? wasteHistory.length : 0
    return { segar, layu, sekarat, busuk }
  }, [ingredients, wasteHistory, calculateIngredientHealth, getHealthStatus])

  // Kirim stats ke parent hanya saat ingredients atau pantryStats benar-benar berubah.
  // Pakai ref untuk callback agar tidak jadi dependency yang memicu loop.
  useEffect(() => {
    onDataLoadedRef.current?.(ingredients, pantryStats)
  }, [ingredients, pantryStats])



  return (
    <div className="flex flex-col gap-3">
      {filteredIngredients.length === 0 ? (
        <div className={`text-center p-8 border rounded-2xl ${t.card}`}>
          <div className="text-3xl mb-2 opacity-50">🍃</div>
          <p className="text-sm font-semibold opacity-50">Tidak ada bahan di filter "{activeFilter}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredIngredients.map(ing => {
            const health = calculateIngredientHealth(ing)
            const statusInfo = getHealthStatus(health)
            const isWasted = ing.status === 'wasted'
            const isCooked = ing.status === 'cooked'
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
    </div>
  )
})

IngredientList.displayName = 'IngredientList'
export default IngredientList