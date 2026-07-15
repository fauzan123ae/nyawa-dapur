import pg from 'pg'
import 'dotenv/config'
import crypto from 'crypto'

const { Pool } = pg

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  console.log('Starting migration...')
  
  try {
    await pool.query('BEGIN')

    // 1. Buat tabel households
    console.log('Creating households table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS households (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        owner_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invite_code VARCHAR(50) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)

    // 2. Buat tabel household_members
    console.log('Creating household_members table...')
    await pool.query(`
      CREATE TABLE IF NOT EXISTS household_members (
        household_id INT NOT NULL REFERENCES households(id) ON DELETE CASCADE,
        user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        role VARCHAR(20) CHECK (role IN ('owner', 'member')) NOT NULL,
        joined_at TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY (household_id, user_id)
      )
    `)

    // 3. Tambahkan household_id ke ingredients
    console.log('Adding household_id to ingredients...')
    await pool.query(`
      ALTER TABLE ingredients ADD COLUMN IF NOT EXISTS household_id INT REFERENCES households(id) ON DELETE CASCADE
    `)

    // 4. Migrasi data user yang sudah ada
    console.log('Migrating existing users to households...')
    const usersRes = await pool.query('SELECT id, name FROM users')
    const users = usersRes.rows
    
    for (const user of users) {
      // Cek apakah user sudah di-migrate (punya household)
      const membership = await pool.query('SELECT * FROM household_members WHERE user_id = $1', [user.id])
      if (membership.rows.length === 0) {
        // Buat household
        const inviteCode = crypto.randomBytes(4).toString('hex')
        const hhRes = await pool.query(`
          INSERT INTO households (name, owner_id, invite_code) 
          VALUES ($1, $2, $3) RETURNING id
        `, [`Dapur ${user.name}`, user.id, inviteCode])
        
        const hhId = hhRes.rows[0].id
        
        // Buat membership
        await pool.query(`
          INSERT INTO household_members (household_id, user_id, role)
          VALUES ($1, $2, 'owner')
        `, [hhId, user.id])
        
        // Update ingredients milik user ke household barunya
        await pool.query(`
          UPDATE ingredients SET household_id = $1 WHERE user_id = $2 AND household_id IS NULL
        `, [hhId, user.id])
      }
    }

    await pool.query('COMMIT')
    console.log('Migration successful!')
  } catch (err) {
    await pool.query('ROLLBACK')
    console.error('Migration failed:', err)
  } finally {
    pool.end()
  }
}

migrate()
