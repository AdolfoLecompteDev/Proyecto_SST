import pool from './src/config/db.js';

async function check() {
  try {
    const { rows } = await pool.query('SELECT current_schema()');
    console.log('Current schema:', rows[0].current_schema);
    const { rows: tables } = await pool.query("SELECT tablename FROM pg_tables WHERE schemaname = 'sst' AND tablename = 'usuarios'");
    console.log('Usuarios table in sst:', tables.length > 0 ? 'exists' : 'does not exist');
    const { rows: testQuery } = await pool.query("SELECT * FROM usuarios LIMIT 1");
    console.log('Query without schema worked!');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
}
check();
