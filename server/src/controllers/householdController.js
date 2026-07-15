import { query, queryOne } from '../db/index.js'
import crypto from 'crypto'
import { invalidateUserCache } from '../middleware/auth.js'

export async function createHousehold(req, res) {
  const { name } = req.body
  if (!name) return res.status(422).json({ message: 'Nama dapur wajib diisi.' })

  try {
    const inviteCode = crypto.randomBytes(4).toString('hex')
    const result = await query(
      `INSERT INTO households (name, owner_id, invite_code) VALUES ($1, $2, $3) RETURNING *`,
      [name, req.user.id, inviteCode]
    )
    const household = result.rows[0]

    // Tambahkan user sbg owner di household baru
    await query(
      `INSERT INTO household_members (household_id, user_id, role) VALUES ($1, $2, 'owner')`,
      [household.id, req.user.id]
    )

    invalidateUserCache(req.user.id)
    return res.status(201).json({ message: 'Dapur berhasil dibuat.', household })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
}

export async function joinHousehold(req, res) {
  const { invite_code } = req.body
  if (!invite_code) return res.status(422).json({ message: 'Invite code wajib diisi.' })

  try {
    const household = await queryOne('SELECT * FROM households WHERE invite_code = $1', [invite_code])
    if (!household) return res.status(404).json({ message: 'Dapur tidak ditemukan atau kode salah.' })

    const isMember = await queryOne('SELECT * FROM household_members WHERE user_id = $1 AND household_id = $2', [req.user.id, household.id])
    if (isMember) {
      return res.status(400).json({ message: 'Anda sudah berada di dapur ini.' })
    }

    // Tambahkan user sbg member di household baru
    await query(
      `INSERT INTO household_members (household_id, user_id, role) VALUES ($1, $2, 'member')`,
      [household.id, req.user.id]
    )

    invalidateUserCache(req.user.id)
    return res.json({ message: `Berhasil bergabung dengan ${household.name}.`, household })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
}

export async function getMembers(req, res) {
  try {
    if (!req.user.householdId) {
      return res.json([])
    }

    const result = await query(
      `SELECT u.id, u.name, u.email, u.last_active_at, hm.role, hm.joined_at 
       FROM household_members hm 
       JOIN users u ON u.id = hm.user_id 
       WHERE hm.household_id = $1 
       ORDER BY hm.joined_at ASC`,
      [req.user.householdId]
    )
    const household = await queryOne('SELECT id, name, invite_code, owner_id FROM households WHERE id = $1', [req.user.householdId])
    return res.json({ members: result.rows, household })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
}

export async function getMyHouseholds(req, res) {
  try {
    const result = await query(
      `SELECT h.id, h.name, h.invite_code, hm.role, 
        (SELECT COUNT(*) FROM household_members WHERE household_id = h.id) as member_count,
        CASE WHEN h.owner_id = $1 AND h.name = $2 THEN true ELSE false END as is_personal
       FROM households h
       JOIN household_members hm ON h.id = hm.household_id
       WHERE hm.user_id = $1
       ORDER BY is_personal DESC, h.created_at ASC`,
      [req.user.id, `Dapur ${req.user.name}`]
    )
    return res.json(result.rows)
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
}

export async function leaveHousehold(req, res) {
  try {
    if (!req.user.householdId) return res.status(400).json({ message: 'Tidak ada dapur yang aktif.' })

    const membership = await queryOne(
      'SELECT * FROM household_members WHERE user_id = $1 AND household_id = $2',
      [req.user.id, req.user.householdId]
    )

    if (!membership) return res.status(400).json({ message: 'Anda tidak berada di dapur ini.' })
    if (membership.role === 'owner') {
      return res.status(400).json({ message: 'Owner tidak bisa keluar dari dapur. Hapus dapur (jika fitur tersedia).' })
    }

    await query(`DELETE FROM household_members WHERE user_id = $1 AND household_id = $2`, [req.user.id, req.user.householdId])
    
    invalidateUserCache(req.user.id)
    return res.json({ message: 'Berhasil keluar dari dapur.' })
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Terjadi kesalahan server.' })
  }
}
