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
    `SELECT id,name,quantity,unit,purchase_date,expiry_date,status,updated_at
     FROM ingredients
     WHERE household_id=$1 AND status != 'deleted'
     ORDER BY id DESC`,
    [user.householdId]
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
  const lastActive = user.last_active_at ? dayjs(user.last_active_at) : null

  // Sudah nyalakan api hari ini — tidak perlu update streak lagi
  if (lastActive && lastActive.isSame(now, 'day')) {
    return res.status(422).json({ message: 'Api sudah dinyalakan hari ini.' })
  }

  // Hitung streak baru saat nyalakan api:
  // - Belum pernah aktif → mulai dari 1
  // - Aktif kemarin (selisih 1 hari) → streak naik
  // - Absen 2+ hari → reset ke 1 (bukan 0, karena hari ini aktif)
  let newStreak = 1
  if (lastActive) {
    const daysDiff = now.startOf('day').diff(lastActive.startOf('day'), 'day')
    if (daysDiff === 1) {
      newStreak = (user.current_streak || 0) + 1
    }
    // daysDiff >= 2 → newStreak tetap 1 (reset)
  }

  await query(
    'UPDATE users SET firewood=firewood-1, last_active_at=$1, current_streak=$2, updated_at=NOW() WHERE id=$3',
    [now.toISOString(), newStreak, user.id]
  )
  invalidateUserCache(user.id)
  return res.json({ message: 'Api berhasil dinyalakan!', newStreak })
}

export async function nextDay(req, res) {
  const user    = req.user
  const current = getSimulatedNow(user.id)
  const next    = current.add(1, 'day')

  // Hanya maju waktu simulasi — streak TIDAK dihitung di sini.
  // Streak hanya naik saat user nyalakan api (igniteWood).
  setSimulatedDate(user.id, next.toISOString())

  return res.json({ message: 'Waktu maju +1 hari.', simulatedDate: next.toISOString() })
}