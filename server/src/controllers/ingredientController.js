export async function cookAmount(req, res) {
  try {
    const ing = await ownerCheck(req.params.id, req.user.id, res);
    if (!ing) return;

    const amount = Number(req.body.amount);
    const current = Number(ing.quantity);

    if (isNaN(amount) || amount <= 0) {
      return res.status(422).json({
        message: "Jumlah yang dimasak harus lebih dari 0."
      });
    }

    if (amount > current) {
      return res.status(422).json({
        message: `Stok tidak cukup. Sisa ${current} ${ing.unit}`
      });
    }

    const remaining = Math.round((current - amount) * 100) / 100;

    // Update stok
    const ingredientResult = await query(
      `UPDATE ingredients
       SET quantity=$1,
           status=$2,
           updated_at=NOW()
       WHERE id=$3
       RETURNING *`,
      [
        remaining,
        remaining === 0 ? "cooked" : "active",
        ing.id
      ]
    );

    // Simpan histori memasak
    await query(
      `INSERT INTO cooking_history
      (
        user_id,
        ingredient_id,
        ingredient_name,
        quantity,
        unit,
        cooked_at,
        xp_earned
      )
      VALUES
      (
        $1,$2,$3,$4,$5,NOW(),15
      )`,
      [
        req.user.id,
        ing.id,
        ing.name,
        amount,
        ing.unit
      ]
    );

    // Tambah XP
    const newXp = req.user.xp + 15;

    await query(
      `UPDATE users
       SET xp=$1,
           last_active_at=NOW(),
           updated_at=NOW()
       WHERE id=$2`,
      [
        newXp,
        req.user.id
      ]
    );

    invalidateUserCache(req.user.id);

    return res.json({
      message: `${amount} ${ing.unit} ${ing.name} berhasil dimasak.`,
      ingredient: ingredientResult.rows[0],
      xp: newXp
    });

  } catch (err) {
    console.error(err);

    return res.status(500).json({
      message: err.message
    });
  }
}