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
