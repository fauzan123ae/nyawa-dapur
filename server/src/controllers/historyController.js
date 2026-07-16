import { query } from '../db/index.js'

export async function getCookingHistory(req, res) {
  try {
    const result = await query(
      `SELECT ch.id, ch.ingredient_id, ch.ingredient_name, ch.quantity, ch.unit, ch.cooked_at, ch.xp_earned,
              u.name as cooked_by
       FROM cooking_history ch
       JOIN users u ON ch.user_id = u.id
       JOIN ingredients i ON ch.ingredient_id = i.id
       WHERE i.household_id = $1
       ORDER BY ch.cooked_at DESC
       LIMIT 100`,
      [req.user.householdId]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function deleteHistoryEntry(req, res) {
  try {
    const { id } = req.params
    const result = await query(
      `DELETE FROM cooking_history WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, req.user.id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Riwayat tidak ditemukan.' })
    }
    return res.json({ message: 'Riwayat berhasil dihapus.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}

export async function clearAllHistory(req, res) {
  try {
    await query(
      `DELETE FROM cooking_history 
       WHERE ingredient_id IN (
         SELECT id FROM ingredients WHERE household_id = $1
       )`,
      [req.user.householdId]
    )
    return res.json({ message: 'Semua riwayat berhasil dihapus.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}
