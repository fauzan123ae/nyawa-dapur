import dayjs from 'dayjs'
import { query, queryOne } from '../db/index.js'
import { invalidateUserCache } from '../middleware/auth.js'

const format = (r) => ({
  id:           r.id,
  name:         r.name,
  quantity:     parseFloat(r.quantity),
  unit:         r.unit,
  purchaseDate: r.purchase_date,
  expiryDate:   r.expiry_date,
  status:       r.status,
  updatedAt:    r.updated_at,
})

const ownerCheck = async (id, userId, res) => {
  const ing = await queryOne('SELECT * FROM ingredients WHERE id=$1', [id])
  if (!ing)                    { res.status(404).json({ message: 'Bahan tidak ditemukan.' }); return null }
  if (ing.user_id !== userId)  { res.status(403).json({ message: 'Akses ditolak.' }); return null }
  return ing
}

export async function store(req, res) {
  const { name, quantity, unit, days_to_expiry } = req.body
  if (!name || !quantity || !unit || !days_to_expiry)
    return res.status(422).json({ message: 'Semua field wajib diisi.' })

  const now    = dayjs()
  const expiry = now.add(parseInt(days_to_expiry), 'day')

  const result = await query(
    `INSERT INTO ingredients (user_id,name,quantity,unit,purchase_date,expiry_date,status)
     VALUES ($1,$2,$3,$4,$5,$6,'active') RETURNING *`,
    [req.user.id, name, quantity, unit, now.toISOString(), expiry.toISOString()]
  )
  return res.status(201).json({ message: 'Bahan ditambahkan.', ingredient: format(result.rows[0]) })
}

export async function update(req, res) {
  const ing = await ownerCheck(req.params.id, req.user.id, res)
  if (!ing) return

  const { name, quantity, unit, days_to_expiry } = req.body
  const newExpiry = dayjs(ing.purchase_date).add(parseInt(days_to_expiry), 'day')
  const newStatus = quantity > 0 ? 'active' : ing.status

  const result = await query(
    `UPDATE ingredients SET name=$1,quantity=$2,unit=$3,expiry_date=$4,status=$5,updated_at=NOW()
     WHERE id=$6 RETURNING *`,
    [name, quantity, unit, newExpiry.toISOString(), newStatus, ing.id]
  )
  return res.json({ message: 'Bahan diupdate.', ingredient: format(result.rows[0]) })
}

export async function adjust(req, res) {
  const ing = await ownerCheck(req.params.id, req.user.id, res)
  if (!ing) return

  const stepMap = { kilogram: 0.25, liter: 0.25, gram: 50 }
  const step    = stepMap[ing.unit] ?? 1
  let newQty    = parseFloat(ing.quantity)

  if (req.body.direction === 'plus')       newQty += step
  else if (req.body.direction === 'minus') newQty = Math.max(0, newQty - step)
  newQty = Math.round(newQty * 100) / 100

  await query('UPDATE ingredients SET quantity=$1,updated_at=NOW() WHERE id=$2', [newQty, ing.id])
  return res.json({ message: 'Kuantitas disesuaikan.', quantity: newQty })
}

export async function cook(req, res) {
  const ing = await ownerCheck(req.params.id, req.user.id, res)
  if (!ing) return

  await query("UPDATE ingredients SET status='cooked', quantity=0, updated_at=NOW() WHERE id=$1", [ing.id])
  const newXp = req.user.xp + 15
  await query(
    'UPDATE users SET xp=$1,last_active_at=NOW(),updated_at=NOW() WHERE id=$2',
    [newXp, req.user.id]
  )
  invalidateUserCache(req.user.id)
  return res.json({ message: 'Bahan dimasak. +15 XP', xp: newXp })
}

// BUG FIX 1 & 2: validasi input, simpan ke cooking_history, +XP dengan benar
export async function cookAmount(req, res) {
  try {
    const ing = await ownerCheck(req.params.id, req.user.id, res)
    if (!ing) return

    if (ing.status !== 'active')
      return res.status(422).json({ message: 'Bahan tidak dalam status aktif.' })

    const amount  = Math.round(parseFloat(req.body.amount) * 100) / 100
    const current = Math.round(parseFloat(ing.quantity) * 100) / 100

    if (isNaN(amount) || amount <= 0)
      return res.status(422).json({ message: 'Jumlah yang dimasak harus lebih dari 0.' })

    if (amount > current)
      return res.status(422).json({ message: `Stok tidak cukup. Sisa ${current} ${ing.unit}.` })

    const remaining = Math.round((current - amount) * 100) / 100
    const newStatus = remaining === 0 ? 'cooked' : 'active'

    // Update stok
    const ingredientResult = await query(
      `UPDATE ingredients SET quantity=$1, status=$2, updated_at=NOW() WHERE id=$3 RETURNING *`,
      [remaining, newStatus, ing.id]
    )

    // Simpan riwayat masak
    await query(
      `INSERT INTO cooking_history (user_id, ingredient_id, ingredient_name, quantity, unit, cooked_at, xp_earned)
       VALUES ($1, $2, $3, $4, $5, NOW(), 15)`,
      [req.user.id, ing.id, ing.name, amount, ing.unit]
    )

    // Tambah XP
    const newXp = req.user.xp + 15
    await query(
      'UPDATE users SET xp=$1, last_active_at=NOW(), updated_at=NOW() WHERE id=$2',
      [newXp, req.user.id]
    )
    invalidateUserCache(req.user.id)

    return res.json({
      message:    `${amount} ${ing.unit} ${ing.name} berhasil dimasak. +15 XP`,
      ingredient: format(ingredientResult.rows[0]),
      xp:         newXp,
      cooked:     amount,
      remaining,
    })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function waste(req, res) {
  const ing = await ownerCheck(req.params.id, req.user.id, res)
  if (!ing) return

  await query("UPDATE ingredients SET status='wasted',updated_at=NOW() WHERE id=$1", [ing.id])
  return res.json({ message: 'Bahan ditandai wasted.' })
}

export async function destroy(req, res) {
  const ing = await ownerCheck(req.params.id, req.user.id, res)
  if (!ing) return

  await query('DELETE FROM ingredients WHERE id=$1', [ing.id])
  return res.json({ message: 'Bahan dihapus.' })
}

export async function cookBatch(req, res) {
  const { ids } = req.body
  if (!Array.isArray(ids) || ids.length === 0)
    return res.status(422).json({ message: 'Pilih minimal 1 bahan.' })

  const placeholders = ids.map((_, i) => `$${i + 1}`).join(',')
  const result = await query(
    `SELECT * FROM ingredients WHERE id IN (${placeholders})`,
    ids
  )
  const rows = result.rows

  const invalid = rows.find(r => r.user_id !== req.user.id)
  if (invalid) return res.status(403).json({ message: 'Akses ditolak.' })

  const notActive = rows.filter(r => r.status !== 'active')
  if (notActive.length > 0)
    return res.status(422).json({ message: `${notActive.length} bahan tidak dalam status aktif.` })

  await query(
    `UPDATE ingredients SET status='cooked', quantity=0, updated_at=NOW() WHERE id IN (${placeholders})`,
    ids
  )

  const xpGained = ids.length * 15
  const newXp    = req.user.xp + xpGained
  await query(
    'UPDATE users SET xp=$1, last_active_at=NOW(), updated_at=NOW() WHERE id=$2',
    [newXp, req.user.id]
  )
  invalidateUserCache(req.user.id)

  return res.json({
    message: `${ids.length} bahan berhasil dimasak! +${xpGained} XP`,
    xp:      newXp,
    cooked:  ids.length,
  })
}
