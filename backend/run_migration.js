import pool from '/home/richard/Proyecto_SST/backend/src/config/db.js';

async function migrate() {
  try {
    console.log('Running migration...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sst.configuracion_usuario (
          usuario_id  INTEGER NOT NULL REFERENCES sst.usuarios(id) ON DELETE CASCADE,
          clave       VARCHAR(100) NOT NULL,
          valor       JSONB NOT NULL,
          created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          PRIMARY KEY (usuario_id, clave)
      );
    `);
    
    // Check if trigger exists
    const { rows } = await pool.query(`
      SELECT tgname FROM pg_trigger WHERE tgname = 'trg_configuracion_usuario_updated_at';
    `);
    
    if (rows.length === 0) {
      await pool.query(`
        CREATE TRIGGER trg_configuracion_usuario_updated_at
        BEFORE UPDATE ON sst.configuracion_usuario
        FOR EACH ROW EXECUTE FUNCTION sst.set_updated_at();
      `);
      console.log('Trigger created.');
    } else {
      console.log('Trigger already exists.');
    }
    
    console.log('Migration completed.');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    process.exit(0);
  }
}

migrate();
