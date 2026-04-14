const { Pool } = require('pg');
const pool = new Pool({ 
  connectionString: 'postgresql://postgres:Simon%403551@localhost:5432/itmanager',
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 5000
});

async function test() {
  try {
    // Test connection
    const dbTest = await pool.query('SELECT current_database() as db');
    console.log('✓ Connected to:', dbTest.rows[0].db);
    
    // Check tables
    const tables = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name");
    console.log('✓ Tables:', tables.rows.map(t => t.table_name).join(', '));
    
    // Check users
    const users = await pool.query("SELECT id, username, role FROM users LIMIT 5");
    console.log('✓ Users:', users.rows.map(u => `${u.username} (${u.role})`).join(', '));
    
  } catch (e) {
    console.error('✗ Error:', e.message);
  } finally {
    await pool.end();
  }
}

test();