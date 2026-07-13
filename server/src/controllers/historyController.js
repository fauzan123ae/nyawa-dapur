import { query } from "../db/index.js";

export async function getCookingHistory(req, res) {

    const result = await query(
        `
        SELECT *
        FROM cooking_history
        WHERE user_id = $1
        ORDER BY cooked_at DESC
        `,
        [req.user.id]
    );

    return res.json(result.rows);
}