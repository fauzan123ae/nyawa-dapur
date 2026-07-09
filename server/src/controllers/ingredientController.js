import dayjs from 'dayjs'
import { query, queryOne } from '../db/index.js'

const format = (r) => ({
  id:           r.id,
  name:         r.name,
  quantity:     parseFloat(r.quantity),
  unit:         r.unit,
  purchaseDate: r.purchase_date,
  expiryDate:   r.expiry_date,
  status:       r.status,
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
  // FIX: hitung dari purchase_date asli, bukan now()
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

  await query("UPDATE ingredients SET status='cooked',updated_at=NOW() WHERE id=$1", [ing.id])
  const newXp = req.user.xp + 15
  await query(
    'UPDATE users SET xp=$1,last_active_at=NOW(),updated_at=NOW() WHERE id=$2',
    [newXp, req.user.id]
  )
  return res.json({ message: 'Bahan dimasak. +15 XP', xp: newXp })
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