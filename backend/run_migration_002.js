// Script de migración 002 — ejecutar con: node run_migration_002.js
import pool from './src/config/db.js'

const sql = `
SET search_path TO sst;

ALTER TABLE sst.archivos_capacitacion
  DROP CONSTRAINT IF EXISTS archivos_capacitacion_tipo_check;

ALTER TABLE sst.archivos_capacitacion
  ADD CONSTRAINT archivos_capacitacion_tipo_check
    CHECK (tipo IN ('video', 'pdf', 'video_url', 'docx', 'enlace'));

ALTER TABLE sst.archivos_capacitacion
  ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 1;

ALTER TABLE sst.archivos_capacitacion
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

ALTER TABLE sst.archivos_capacitacion
  ALTER COLUMN nombre_almacenado DROP NOT NULL;
`

try {
  await pool.query(sql)
  console.log('✅ Migración 002 aplicada correctamente')
} catch (err) {
  console.error('❌ Error en migración:', err.message)
} finally {
  await pool.end()
}
