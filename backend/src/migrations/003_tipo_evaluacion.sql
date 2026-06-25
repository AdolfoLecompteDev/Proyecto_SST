-- ============================================================
-- MIGRACIÓN 003: Tipos de evaluación (normal / final)
-- Fecha: 2026-06-25
-- ============================================================

SET search_path TO sst;

-- 1. Agregar columna tipo a evaluaciones
ALTER TABLE sst.evaluaciones
  ADD COLUMN IF NOT EXISTS tipo VARCHAR(10) NOT NULL DEFAULT 'normal';

-- 2. Restricción de valores válidos
ALTER TABLE sst.evaluaciones
  DROP CONSTRAINT IF EXISTS evaluaciones_tipo_check;

ALTER TABLE sst.evaluaciones
  ADD CONSTRAINT evaluaciones_tipo_check
    CHECK (tipo IN ('normal', 'final'));

-- 3. Garantizar máximo UN quiz final por capacitación
DROP INDEX IF EXISTS sst.idx_unico_final_por_capacitacion;

CREATE UNIQUE INDEX idx_unico_final_por_capacitacion
  ON sst.evaluaciones (capacitacion_id)
  WHERE tipo = 'final' AND estado = true;

-- ============================================================
-- FIN MIGRACIÓN 003
-- ============================================================
