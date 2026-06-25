-- ============================================================
-- MIGRACIÓN 002: Ruta de estudio y gestión de quizzes
-- Fecha: 2026-06-25
-- ============================================================

SET search_path TO sst;

-- 1. Ampliar tipos permitidos en archivos_capacitacion
--    (soporte para video_url, docx, enlace además de video y pdf)
ALTER TABLE sst.archivos_capacitacion
  DROP CONSTRAINT IF EXISTS archivos_capacitacion_tipo_check;

ALTER TABLE sst.archivos_capacitacion
  ADD CONSTRAINT archivos_capacitacion_tipo_check
    CHECK (tipo IN ('video', 'pdf', 'video_url', 'docx', 'enlace'));

-- 2. Agregar campo orden para estructurar la ruta de estudio
ALTER TABLE sst.archivos_capacitacion
  ADD COLUMN IF NOT EXISTS orden INTEGER NOT NULL DEFAULT 1;

-- 3. Agregar descripción opcional al recurso
ALTER TABLE sst.archivos_capacitacion
  ADD COLUMN IF NOT EXISTS descripcion TEXT;

-- Hacer nombre_almacenado opcional (para recursos por URL no hay archivo local)
ALTER TABLE sst.archivos_capacitacion
  ALTER COLUMN nombre_almacenado DROP NOT NULL;

-- Hacer tamano_bytes opcional explícito (ya era nullable, confirmar)
-- (ya era BIGINT sin NOT NULL, sin cambios necesarios)

-- ============================================================
-- FIN MIGRACIÓN 002
-- ============================================================
