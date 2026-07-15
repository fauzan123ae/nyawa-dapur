import dayjs from 'dayjs'
import { query } from '../db/index.js'
import { getOrCreateDailyQuests } from './questController.js'
import { invalidateUserCache } from '../middleware/auth.js'
import { getSimulatedNow, setSimulatedDate } from '../utils/simulatedTime.js'

export { getSimulatedNow }

export async function getDashboard(req, res) {
  const user = req.user
  const now  = getSimulatedNow(user.id)

  const isFireLit        = user.last_active_at ? dayjs(user.last_active_at).isSame(now, 'day') : false
  const streakThreatened = !isFireLit && user.current_streak > 0

  const ingResult = await query(
    'SELECT id,name,quantity,unit,purchase_date,expiry_date,status,updated_at FROM ingredients WHERE user_id=$1 ORDER BY id DESC',
    [user.id]
  )
  const ingredients = ingResult.rows

  const quests = await getOrCreateDailyQuests(user, now, ingredients)

  return res.json({
    userData: {
      id:               user.id,
      name:             user.name,
      xp:               user.xp,
      level:            user.level,
      firewood:         user.firewood,
      currentStreak:    user.current_streak,
      isFireLit,
      streakThreatened,
      simulatedDate:    now.toISOString(),
    },
    ingredientsData: ingredients.map((r) => ({
      id:           r.id,
      name:         r.name,
      quantity:     parseFloat(r.quantity),
      unit:         r.unit,
      purchaseDate: r.purchase_date,
      expiryDate:   r.expiry_date,
      status:       r.status,
      updatedAt:    r.updated_at,
    })),
    questsData: quests,
  })
}

export async function buyFirewood(req, res) {
  const user = req.user
  if (user.xp < 50) return res.status(422).json({ message: 'XP tidak cukup (butuh 50 XP).' })
  await query('UPDATE users SET xp=xp-50,firewood=firewood+1,updated_at=NOW() WHERE id=$1', [user.id])
  invalidateUserCache(user.id)
  return res.json({ message: 'Berhasil tukar 50 XP dengan 1 Kayu Bakar.' })
}

export async function igniteWood(req, res) {
  const user = req.user
  if (user.firewood < 1) return res.status(422).json({ message: 'Tidak ada kayu bakar.' })
  const now = getSimulatedNow(user.id)
  await query(
    'UPDATE users SET firewood=firewood-1,last_active_at=$1,updated_at=NOW() WHERE id=$2',
    [now.toISOString(), user.id]
  )
  invalidateUserCache(user.id)
  return res.json({ message: 'Api berhasil dinyalakan!' })
}

export async function nextDay(req, res) {
  const user    = req.user
  const current = getSimulatedNow(user.id)
  const next    = current.add(1, 'day')

  // Hitung streak SEBELUM maju hari:
  // Jika last_active_at ada di hari "current" (hari yang sedang berjalan),
  // artinya user aktif hari ini → streak naik.
  // Jika tidak aktif hari ini → streak reset 0.
  const wasActiveToday = user.last_active_at
    ? dayjs(user.last_active_at).isSame(current, 'day')
    : false

  const newStreak = wasActiveToday ? user.current_streak + 1 : 0

  // Maju ke hari berikutnya (hanya di memory simulasi)
  setSimulatedDate(user.id, next.toISOString())

  // Hanya update current_streak — JANGAN sentuh last_active_at.
  // last_active_at hanya boleh diubah oleh aksi user yang nyata
  // (masak atau igniteWood), bukan oleh pergantian hari simulasi.
  await query(
    'UPDATE users SET current_streak=$1, updated_at=NOW() WHERE id=$2',
    [newStreak, user.id]
  )
  invalidateUserCache(user.id)
  return res.json({ message: 'Waktu maju +1 hari.', simulatedDate: next.toISOString() })
}