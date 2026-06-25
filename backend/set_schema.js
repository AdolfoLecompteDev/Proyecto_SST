import pool from './src/config/db.js';

async function setSchema() {
  try {
    console.log('Setting default search_path for the database role...');
    await pool.query('ALTER ROLE CURRENT_ROLE SET search_path TO sst, public');
    console.log('Successfully updated ROLE search_path.');
    
    // Testing the change by checking current schema and querying the table
    // Note: ALTER ROLE takes effect on NEW connections, so we end this pool and make a new one.
    await pool.end();
  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function testSchema() {
  // A fresh import won't work in the same process to recreate the pool easily
  // but we can just require pg manually and test
  const pg = await import('pg');
  const dotenv = await import('dotenv');
  dotenv.config();
  const config = {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
  };
  const testPool = new pg.default.Pool(config);
  try {
    const { rows } = await testPool.query('SELECT current_schema()');
    console.log('New connection current schema:', rows[0].current_schema);
    const { rows: testQuery } = await testPool.query("SELECT * FROM usuarios LIMIT 1");
    console.log('Successfully queried "usuarios" without schema prefix!');
  } catch (err) {
    console.error('Test error:', err.message);
  } finally {
    await testPool.end();
  }
}

async function run() {
  await setSchema();
  await testSchema();
}
run();
