import { query } from '../db/index.js'

export async function getCookingHistory(req, res) {
  try {
    const result = await query(
      `SELECT id, ingredient_id, ingredient_name, quantity, unit, cooked_at, xp_earned
       FROM cooking_history
       WHERE user_id = $1
       ORDER BY cooked_at DESC
       LIMIT 100`,
      [req.user.id]
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
      `DELETE FROM cooking_history WHERE user_id = $1`,
      [req.user.id]
    )
    return res.json({ message: 'Semua riwayat berhasil dihapus.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: err.message })
  }
}
