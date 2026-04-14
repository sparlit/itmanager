import pg from 'pg';
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function test() {
  try {
    const result = await pool.query('SELECT 1 as test');
    console.log('pg direct works:', result.rows);
    await pool.end();
  } catch (err) {
    console.error('pg direct error:', err);
  }
}

test();