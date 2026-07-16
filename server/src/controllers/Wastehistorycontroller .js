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
    if (entry.user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' })
    await query('DELETE FROM waste_history WHERE id=$1', [req.params.id])
    return res.json({ message: 'Dihapus.' })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}