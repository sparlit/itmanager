const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Simon%403551@localhost:5432/itmanager',
  // Add connection timeout
  connectionTimeoutMillis: 5000,
});

async function test() {
  console.log('Testing PostgreSQL connection...');
  console.log('Connection string:', 'postgresql://postgres:***@localhost:5432/itmanager');
  
  try {
    await client.connect();
    console.log('Connected successfully!');
    
    const result = await client.query('SELECT version()');
    console.log('PostgreSQL version:', result.rows[0].version);
    
    await client.end();
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    console.error('Code:', err.code);
    console.error('Detail:', err.detail);
    process.exit(1);
  }
}

test();