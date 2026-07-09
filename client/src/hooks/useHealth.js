export function calculateIngredientHealth(ingredient, simulatedDate) {
  if (ingredient.status !== 'active') return 0
  const now      = new Date(simulatedDate).getTime()
  const purchase = new Date(ingredient.purchaseDate).getTime()
  const expiry   = new Date(ingredient.expiryDate).getTime()
  if (now >= expiry)   return 0
  if (now <= purchase) return 100
  return Math.max(0, Math.min(100, Math.round(
    ((expiry - now) / (expiry - purchase)) * 100
  )))
}

export function getHealthStatus(health) {
  if (health <= 0)  return { label: 'Busuk',   color: 'text-red-400 bg-red-950/40 border-red-900/50',       barColor: 'bg-red-600',               emoji: '💀' }
  if (health < 30)  return { label: 'Kritis',  color: 'text-rose-400 bg-rose-950/30 border-rose-900/50',    barColor: 'bg-rose-500 animate-pulse', emoji: '🔴' }
  if (health < 60)  return { label: 'Waspada', color: 'text-amber-400 bg-amber-950/30 border-amber-900/50', barColor: 'bg-amber-500',              emoji: '🟡' }
  return              { label: 'Segar',   color: 'text-emerald-400 bg-emerald-950/40 border-emerald-900/50', barColor: 'bg-emerald-500',            emoji: '🟢' }
}

export function getFlameLevel(streak) {
  if (streak >= 30) return 'Mythic Flame'
  if (streak >= 7)  return 'Blaze'
  return 'Spark'
}