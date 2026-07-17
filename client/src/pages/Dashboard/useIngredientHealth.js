import { useCallback } from 'react'

// =============================================
// HOOK — kalkulasi kesegaran bahan
// =============================================
export function useIngredientHealth(t) {
  const getHealthStatus = useCallback((health) => {
    if (health <= 0) return { label: 'Busuk', color: t.healthBusuk.color, barColor: t.healthBusuk.bar, emoji: '💀' }
    if (health < 30) return { label: 'Kritis', color: t.healthKritis.color, barColor: t.healthKritis.bar, emoji: '🔴' }
    if (health < 60) return { label: 'Waspada', color: t.healthWaspada.color, barColor: t.healthWaspada.bar, emoji: '🟡' }
    return { label: 'Segar', color: t.healthSegar.color, barColor: t.healthSegar.bar, emoji: '🟢' }
  }, [t])

  const calculateIngredientHealth = useCallback((ingredient, now) => {
    if (ingredient.status !== 'active') return 0
    const currentMs = new Date(now).getTime()
    const purchase = new Date(ingredient.purchaseDate || ingredient.purchase_date).getTime()
    const expiry = new Date(ingredient.expiryDate || ingredient.expiry_date).getTime()
    if (currentMs >= expiry) return 0
    if (currentMs <= purchase) return 100
    return Math.max(0, Math.min(100, Math.round(((expiry - currentMs) / (expiry - purchase)) * 100)))
  }, [])

  return { calculateIngredientHealth, getHealthStatus }
}
