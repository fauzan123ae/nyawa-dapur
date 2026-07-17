import { query } from '../db/index.js'

export async function getWasteHistory(req, res) {
  try {
    const { rows } = await query(
      `SELECT wh.id, wh.ingredient_name, wh.quantity, wh.unit, wh.wasted_at, u.name as wasted_by
       FROM waste_history wh
       JOIN users u ON wh.user_id = u.id
       LEFT JOIN ingredients i ON wh.ingredient_id = i.id
       WHERE wh.user_id IN (
         SELECT user_id FROM household_members WHERE household_id = $1
       )
       ORDER BY wh.wasted_at DESC LIMIT 100`,
      [req.user.householdId]
    )
    return res.json(rows)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

export async function deleteWasteHistory(req, res) {
  try {
    const { rows } = await query('SELECT * FROM waste_history WHERE id=$1', [req.params.id])
    const entry = rows[0]
    if (!entry) return res.status(404).json({ error: 'Not found' })

    const isSameUser = Number(entry.user_id) === Number(req.user.id)
    const isSameHousehold = await query(
      'SELECT 1 FROM waste_history wh JOIN household_members hm ON hm.user_id = wh.user_id WHERE wh.id=$1 AND hm.household_id=$2',
      [req.params.id, req.user.householdId]
    )
    if (!isSameUser && isSameHousehold.rows.length === 0) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    await query('DELETE FROM waste_history WHERE id=$1', [req.params.id])

    // Setelah hapus riwayat busuk, cek apakah ingredient terkait masih punya
    // waste entry lain. Jika tidak ada, restore status ingredient ke 'active'
    // supaya angka Busuk di dashboard ikut berkurang.
    if (entry.ingredient_id) {
      const remaining = await query(
        'SELECT id FROM waste_history WHERE ingredient_id=$1 LIMIT 1',
        [entry.ingredient_id]
      )
      if (remaining.rows.length === 0) {
        // Tidak ada riwayat busuk lain → kembalikan ke active jika quantity > 0
        await query(
          `UPDATE ingredients 
           SET status = CASE WHEN quantity > 0 THEN 'active' ELSE status END,
               updated_at = NOW()
           WHERE id = $1 AND status = 'wasted'`,
          [entry.ingredient_id]
        )
      }
    }

    return res.json({ message: 'Dihapus.' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}