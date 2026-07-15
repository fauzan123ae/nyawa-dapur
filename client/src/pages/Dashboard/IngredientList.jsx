import { useState, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import { getIngredients } from '../../api/ingredients'
import IngredientCard from './IngredientCard'

const formatRow = (r) => ({
  id:           r.id,
  name:         r.name,
  quantity:     parseFloat(r.quantity),
  unit:         r.unit,
  purchaseDate: r.purchaseDate || r.purchase_date,
  expiryDate:   r.expiryDate || r.expiry_date,
  status:       r.status,
  updatedAt:    r.updatedAt || r.updated_at,
})

const IngredientList = forwardRef(({
  t, isDark, activeFilter, isCookMode, selectedIds, loadingIds,
  calculateIngredientHealth, getHealthStatus,
  onToggleCookMode, onSelectAllActive, onOpenCookModal,
  onToggleSelectIngredient, onOpenAddModal, onOpenEditModal,
  onAdjustQuantity, onOpenCookAmountModal, onWaste, onDelete,
  onDataLoaded // callback to pass ingredients & pantryStats to parent if needed
}, ref) => {
  const [ingredients, setIngredients] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchList = async (showLoading = false) => {
    if (showLoading) setLoading(true)
    try {
      const res = await getIngredients()
      const data = res.data.map(formatRow)
      setIngredients(data)
      if (onDataLoaded) onDataLoaded(data)
    } catch (err) {
      console.error(err)
    } finally {
      if (showLoading) setLoading(false)
    }
  }

  useEffect(() => {
    fetchList(true)

    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchList(false)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  useImperativeHandle(ref, () => ({
    refresh: () => fetchList(false),
    ingredients,
    setIngredients,
  }))

  const filteredIngredients = useMemo(() => {
    return ingredients.filter(i => {
      if (activeFilter === 'Dimasak') return i.status === 'cooked'
      if (activeFilter === 'Busuk')   return i.status === 'wasted' || (i.status === 'active' && calculateIngredientHealth(i) <= 0)
      if (i.status !== 'active')      return false
      if (activeFilter === 'Semua')   return true
      return getHealthStatus(calculateIngredientHealth(i)).label === activeFilter
    })
  }, [ingredients, activeFilter, calculateIngredientHealth, getHealthStatus])

  const pantryStats = useMemo(() => {
    let segar = 0, layu = 0, sekarat = 0, busuk = 0
    ingredients.forEach(i => {
      if (i.status === 'wasted') { busuk++; return }
      if (i.status !== 'active') return
      const s = getHealthStatus(calculateIngredientHealth(i)).label
      if (s === 'Segar') segar++
      if (s === 'Waspada') layu++
      if (s === 'Kritis') sekarat++
      if (s === 'Busuk') busuk++
    })
    return { segar, layu, sekarat, busuk }
  }, [ingredients, calculateIngredientHealth, getHealthStatus])

  useEffect(() => {
    if (onDataLoaded) onDataLoaded(ingredients, pantryStats)
  }, [ingredients, pantryStats, onDataLoaded])

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <div className={`w-6 h-6 border-2 rounded-full animate-spin ${isDark ? 'border-zinc-700 border-t-emerald-500' : 'border-green-200 border-t-green-500'}`} />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {filteredIngredients.length === 0 ? (
        <div className={`text-center p-8 border rounded-2xl ${t.card}`}>
          <div className="text-3xl mb-2 opacity-50">🍃</div>
          <p className="text-sm font-semibold opacity-50">Tidak ada bahan di filter "{activeFilter}".</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-3">
          {filteredIngredients.map(ing => (
            <IngredientCard
              key={ing.id}
              ing={ing} t={t} isDark={isDark} isCookMode={isCookMode}
              isSelected={selectedIds.has(ing.id)} isLoading={loadingIds.has(ing.id)}
              health={calculateIngredientHealth(ing)} healthStatus={getHealthStatus(calculateIngredientHealth(ing))}
              onToggleSelect={() => onToggleSelectIngredient(ing.id)}
              onEdit={() => onOpenEditModal(ing)}
              onAdjust={(dir) => onAdjustQuantity(ing.id, dir)}
              onCook={() => onOpenCookAmountModal(ing)}
              onWaste={() => onWaste(ing.id)}
              onDelete={() => onDelete(ing.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
})

IngredientList.displayName = 'IngredientList'
export default IngredientList
