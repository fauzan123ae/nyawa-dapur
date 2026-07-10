import dayjs from 'dayjs'
import { query, queryOne } from '../db/index.js'

const DEFAULT_QUESTS = [
  { type: 'check_risky',   description: '🔍 Inspeksi Kulkas: Periksa bahan yang hampir kedaluwarsa.', xp_reward: 15 },
  { type: 'add_green',     description: '🌱 Tambahkan minimal 1 bahan baru.',                         xp_reward: 20 },
  { type: 'clean_pantry',  description: '🧹 Tidak ada bahan busuk.',                                  xp_reward: 25 },
  { type: 'cook_saving',   description: '🍳 Masak minimal 1 bahan.',                                  xp_reward: 30 },
  { type: 'stale_defense', description: '🪵 Miliki minimal 1 kayu bakar.',                            xp_reward: 15 },
]

function checkCanClaim(type, user, now, ingredients) {
  const active = ingredients.filter((i) => i.status === 'active')
  const today  = now.format('YYYY-MM-DD')

  switch (type) {
    case 'check_risky':
      // Setidaknya ada 1 bahan aktif yang hampir kedaluwarsa (< 60% sisa masa aktif)
      return active.some((i) => {
        if (!i.purchase_date || !i.expiry_date) return false
        const p = dayjs(i.purchase_date)
        const e = dayjs(i.expiry_date)
        if (now.isBefore(p) || !now.isBefore(e)) return false
        const totalDuration  = e.diff(p, 'second')
        const remainingDuration = e.diff(now, 'second')
        if (totalDuration <= 0) return false
        const remaining = (remainingDuration / totalDuration) * 100
        return remaining > 0 && remaining < 60
      })

    case 'add_green':
      // Minimal 1 bahan ditambahkan HARI INI (berdasarkan purchase_date)
      return ingredients.some((i) => {
        if (i.status !== 'active') return false
        // purchase_date bisa berupa ISO string, ambil bagian tanggalnya saja
        const purchasedDay = dayjs(i.purchase_date).format('YYYY-MM-DD')
        return purchasedDay === today
      })

    case 'cook_saving':
      // Minimal 1 bahan dimasak HARI INI (updated_at di hari ini dengan status cooked)
      return ingredients.some((i) => {
        if (i.status !== 'cooked') return false
        if (!i.updated_at) return false
        return dayjs(i.updated_at).format('YYYY-MM-DD') === today
      })

    case 'clean_pantry': {
      // Tidak ada bahan wasted HARI INI dan tidak ada bahan aktif yang sudah expired
      const wastedToday = ingredients.some((i) => {
        if (i.status !== 'wasted') return false
        if (!i.updated_at) return false
        return dayjs(i.updated_at).format('YYYY-MM-DD') === today
      })
      const hasExpired = active.some((i) => i.expiry_date && !now.isBefore(dayjs(i.expiry_date)))
      return !wastedToday && !hasExpired && active.length > 0
    }

    case 'stale_defense':
      return user.firewood >= 1

    default:
      return false
  }
}

export async function getOrCreateDailyQuests(user, now, ingredients) {
  const today = now.format('YYYY-MM-DD')
  let result  = await query(
    'SELECT * FROM quests WHERE user_id=$1 AND quest_date=$2',
    [user.id, today]
  )

  if (result.rows.length === 0) {
    for (const q of DEFAULT_QUESTS) {
      await query(
        `INSERT INTO quests (user_id,type,description,xp_reward,is_completed,quest_date)
         VALUES ($1,$2,$3,$4,false,$5)`,
        [user.id, q.type, q.description, q.xp_reward, today]
      )
    }
    result = await query(
      'SELECT * FROM quests WHERE user_id=$1 AND quest_date=$2',
      [user.id, today]
    )
  }

  return result.rows.map((q) => ({
    id:          q.id,
    type:        q.type,
    description: q.description,
    xpReward:    q.xp_reward,
    isCompleted: q.is_completed,
    canClaim:    !q.is_completed && checkCanClaim(q.type, user, now, ingredients),
  }))
}

export async function claimQuest(req, res) {
  const { type }     = req.params
  const { quest_id } = req.body
  const user         = req.user

  const { getSimulatedNow } = await import('./dashboardController.js')
  const now   = getSimulatedNow(user.id)
  const today = now.format('YYYY-MM-DD')

  const quest = await queryOne(
    'SELECT * FROM quests WHERE id=$1 AND user_id=$2 AND quest_date=$3',
    [quest_id, user.id, today]
  )
  if (!quest)              return res.status(404).json({ message: 'Quest tidak ditemukan.' })
  if (quest.type !== type) return res.status(422).json({ message: 'Quest tidak valid.' })
  if (quest.is_completed)  return res.status(422).json({ message: 'Quest sudah diklaim.' })

  // Ambil ingredients dengan updated_at untuk pengecekan akurat
  const rows = await query(
    'SELECT id,name,quantity,unit,purchase_date,expiry_date,status,updated_at FROM ingredients WHERE user_id=$1',
    [user.id]
  )
  const canClaim = checkCanClaim(type, user, now, rows.rows)
  if (!canClaim) return res.status(422).json({ message: 'Kondisi misi belum terpenuhi.' })

  await query('UPDATE quests SET is_completed=true,updated_at=NOW() WHERE id=$1', [quest.id])
  await query('UPDATE users SET xp=xp+$1,updated_at=NOW() WHERE id=$2', [quest.xp_reward, user.id])

  return res.json({ message: `+${quest.xp_reward} XP berhasil diperoleh!`, xpGained: quest.xp_reward })
}
