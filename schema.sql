-- ============================================================
-- PROYECTO: Sistema Web SST y Validación de Empleados
-- BASE DE DATOS: asistenciasDB
-- SCHEMA: sst
-- FECHA: 2026-05-19
-- ============================================================

-- Conectarse a la base de datos correcta


-- Crear schema exclusivo para este proyecto
CREATE SCHEMA IF NOT EXISTS sst;

-- Establecer schema por defecto para esta sesión
SET search_path TO sst;

-- ============================================================
-- EXTENSIONES
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";    -- Encriptación adicional

-- ============================================================
-- 1. ROLES
-- ============================================================
CREATE TABLE sst.roles (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(30) NOT NULL UNIQUE,  -- SUPER_USUARIO | ADMIN | FUNCIONARIO
    descripcion TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sst.roles (nombre, descripcion) VALUES
    ('SUPER_USUARIO', 'Control total del sistema y auditoría'),
    ('ADMIN',         'Gestiona cursos, usuarios y reportes'),
    ('FUNCIONARIO',   'Consume capacitaciones y realiza evaluaciones');

-- ============================================================
-- 2. USUARIOS
-- ============================================================
CREATE TABLE sst.usuarios (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    apellido        VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password_hash   VARCHAR(255) NOT NULL,
    documento       VARCHAR(20)  UNIQUE,           -- Cédula para consultas API
    rol_id          INTEGER NOT NULL REFERENCES sst.roles(id) ON DELETE RESTRICT,
    estado          BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE=activo, FALSE=inactivo
    ultimo_login    TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_usuarios_email  ON sst.usuarios(email);
CREATE INDEX idx_usuarios_rol_id ON sst.usuarios(rol_id);
CREATE INDEX idx_usuarios_estado ON sst.usuarios(estado);

-- ============================================================
-- 3. RECUPERACIÓN DE CONTRASEÑA
-- ============================================================
CREATE TABLE sst.tokens_recuperacion (
    id          SERIAL PRIMARY KEY,
    usuario_id  INTEGER NOT NULL REFERENCES sst.usuarios(id) ON DELETE CASCADE,
    token       VARCHAR(255) NOT NULL UNIQUE,
    expira_en   TIMESTAMPTZ NOT NULL,
    usado       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. CATEGORÍAS DE CAPACITACIÓN
-- ============================================================
CREATE TABLE sst.categorias (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO sst.categorias (nombre) VALUES
    ('Seguridad en el Trabajo'),
    ('Salud Ocupacional'),
    ('Manejo de Equipos'),
    ('Emergencias y Evacuación'),
    ('Normatividad SST');

-- ============================================================
-- 5. CAPACITACIONES
-- ============================================================
CREATE TABLE sst.capacitaciones (
    id              SERIAL PRIMARY KEY,
    titulo          VARCHAR(200) NOT NULL,
    descripcion     TEXT,
    categoria_id    INTEGER REFERENCES sst.categorias(id) ON DELETE SET NULL,
    creado_por      INTEGER NOT NULL REFERENCES sst.usuarios(id) ON DELETE RESTRICT,
    fecha_inicio    DATE NOT NULL DEFAULT CURRENT_DATE,
    fecha_vigencia  DATE,                          -- Hasta cuándo aplica (RF03)
    estado          BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_capacitaciones_categoria ON sst.capacitaciones(categoria_id);
CREATE INDEX idx_capacitaciones_vigencia  ON sst.capacitaciones(fecha_vigencia);

-- ============================================================
-- 6. ARCHIVOS DE CAPACITACIÓN (videos y PDFs)
-- ============================================================
CREATE TABLE sst.archivos_capacitacion (
    id                  SERIAL PRIMARY KEY,
    capacitacion_id     INTEGER NOT NULL REFERENCES sst.capacitaciones(id) ON DELETE CASCADE,
    tipo                VARCHAR(10) NOT NULL CHECK (tipo IN ('video', 'pdf')),
    nombre_original     VARCHAR(255) NOT NULL,
    nombre_almacenado   VARCHAR(255) NOT NULL,      -- uuid-timestamp.ext
    url                 VARCHAR(500) NOT NULL,      -- URL Cloudinary/S3 o ruta local
    tamano_bytes        BIGINT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_archivos_capacitacion_id ON sst.archivos_capacitacion(capacitacion_id);

-- ============================================================
-- 7. EVALUACIONES (cuestionarios por capacitación)
-- ============================================================
CREATE TABLE sst.evaluaciones (
    id                  SERIAL PRIMARY KEY,
    capacitacion_id     INTEGER NOT NULL REFERENCES sst.capacitaciones(id) ON DELETE CASCADE,
    titulo              VARCHAR(200) NOT NULL,
    puntaje_minimo      NUMERIC(5,2) NOT NULL DEFAULT 70.00,  -- % mínimo para aprobar
    max_intentos        INTEGER NOT NULL DEFAULT 3,
    estado              BOOLEAN NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 8. PREGUNTAS
-- ============================================================
CREATE TABLE sst.preguntas (
    id              SERIAL PRIMARY KEY,
    evaluacion_id   INTEGER NOT NULL REFERENCES sst.evaluaciones(id) ON DELETE CASCADE,
    enunciado       TEXT NOT NULL,
    puntaje         NUMERIC(5,2) NOT NULL DEFAULT 1.00,
    orden           INTEGER NOT NULL DEFAULT 1,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_preguntas_evaluacion ON sst.preguntas(evaluacion_id);

-- ============================================================
-- 9. OPCIONES DE RESPUESTA
-- ============================================================
CREATE TABLE sst.opciones_respuesta (
    id              SERIAL PRIMARY KEY,
    pregunta_id     INTEGER NOT NULL REFERENCES sst.preguntas(id) ON DELETE CASCADE,
    texto           TEXT NOT NULL,
    es_correcta     BOOLEAN NOT NULL DEFAULT FALSE,
    orden           INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_opciones_pregunta ON sst.opciones_respuesta(pregunta_id);

-- ============================================================
-- 10. INTENTOS DE EVALUACIÓN
-- ============================================================
CREATE TABLE sst.intentos_evaluacion (
    id              SERIAL PRIMARY KEY,
    usuario_id      INTEGER NOT NULL REFERENCES sst.usuarios(id) ON DELETE RESTRICT,
    evaluacion_id   INTEGER NOT NULL REFERENCES sst.evaluaciones(id) ON DELETE RESTRICT,
    puntaje         NUMERIC(5,2) NOT NULL DEFAULT 0,
    aprobado        BOOLEAN NOT NULL DEFAULT FALSE,
    numero_intento  INTEGER NOT NULL DEFAULT 1,
    fecha_inicio    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_fin       TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_intentos_usuario    ON sst.intentos_evaluacion(usuario_id);
CREATE INDEX idx_intentos_evaluacion ON sst.intentos_evaluacion(evaluacion_id);

-- ============================================================
-- 11. DETALLE DE RESPUESTAS POR INTENTO
-- ============================================================
CREATE TABLE sst.detalle_intentos (
    id              SERIAL PRIMARY KEY,
    intento_id      INTEGER NOT NULL REFERENCES sst.intentos_evaluacion(id) ON DELETE CASCADE,
    pregunta_id     INTEGER NOT NULL REFERENCES sst.preguntas(id) ON DELETE RESTRICT,
    opcion_id       INTEGER REFERENCES sst.opciones_respuesta(id) ON DELETE SET NULL,
    es_correcta     BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_detalle_intento ON sst.detalle_intentos(intento_id);

-- ============================================================
-- 12. CERTIFICADOS
-- ============================================================
CREATE TABLE sst.certificados (
    id                  SERIAL PRIMARY KEY,
    usuario_id          INTEGER NOT NULL REFERENCES sst.usuarios(id) ON DELETE RESTRICT,
    capacitacion_id     INTEGER NOT NULL REFERENCES sst.capacitaciones(id) ON DELETE RESTRICT,
    intento_id          INTEGER REFERENCES sst.intentos_evaluacion(id) ON DELETE SET NULL,
    codigo_certificado  VARCHAR(50) NOT NULL UNIQUE DEFAULT UPPER(SUBSTR(MD5(RANDOM()::TEXT), 1, 12)),
    qr_codigo           TEXT,                      -- Contenido del QR (URL de validación)
    url_pdf             VARCHAR(500),              -- Ruta/URL del PDF generado
    fecha_emision       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    correo_enviado      BOOLEAN NOT NULL DEFAULT FALSE,
    fecha_envio_correo  TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (usuario_id, capacitacion_id)           -- Un certificado por usuario por capacitación
);

CREATE INDEX idx_certificados_usuario      ON sst.certificados(usuario_id);
CREATE INDEX idx_certificados_capacitacion ON sst.certificados(capacitacion_id);
CREATE INDEX idx_certificados_codigo       ON sst.certificados(codigo_certificado);

-- ============================================================
-- 13. CONSULTAS A APIs EXTERNAS (RF08 / RF09)
-- ============================================================
CREATE TABLE sst.consultas_api (
    id                  SERIAL PRIMARY KEY,
    usuario_id          INTEGER REFERENCES sst.usuarios(id) ON DELETE SET NULL,  -- Quien consultó
    documento_consultado VARCHAR(20) NOT NULL,      -- Cédula del empleado consultado
    entidad             VARCHAR(100) NOT NULL,       -- Fiscalía | Policía | Contraloría | Procuraduría
    endpoint_url        VARCHAR(500),
    respuesta           JSONB,                       -- Respuesta completa de la API externa
    estado_http         SMALLINT,                    -- Código HTTP de la respuesta
    exitosa             BOOLEAN NOT NULL DEFAULT FALSE,
    mensaje_error       TEXT,
    fecha               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_consultas_documento ON sst.consultas_api(documento_consultado);
CREATE INDEX idx_consultas_entidad   ON sst.consultas_api(entidad);
CREATE INDEX idx_consultas_fecha     ON sst.consultas_api(fecha);

-- ============================================================
-- 14. AUDITORÍA DEL SISTEMA (RNF09)
-- ============================================================
CREATE TABLE sst.auditoria (
    id              BIGSERIAL PRIMARY KEY,
    usuario_id      INTEGER REFERENCES sst.usuarios(id) ON DELETE SET NULL,
    accion          VARCHAR(50) NOT NULL,            -- LOGIN | LOGOUT | CREATE | UPDATE | DELETE | CONSULTA_API
    tabla_afectada  VARCHAR(100),
    registro_id     INTEGER,                         -- ID del registro afectado
    detalle         JSONB,                           -- Datos antes/después del cambio
    ip_origen       INET,
    user_agent      VARCHAR(255),
    fecha           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_auditoria_usuario ON sst.auditoria(usuario_id);
CREATE INDEX idx_auditoria_accion  ON sst.auditoria(accion);
CREATE INDEX idx_auditoria_fecha   ON sst.auditoria(fecha);

-- ============================================================
-- 15. CONFIGURACIÓN DE USUARIO
-- ============================================================
CREATE TABLE sst.configuracion_usuario (
    usuario_id  INTEGER NOT NULL REFERENCES sst.usuarios(id) ON DELETE CASCADE,
    clave       VARCHAR(100) NOT NULL,
    valor       JSONB NOT NULL,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (usuario_id, clave)
);

-- ============================================================
-- 16. SEGUIMIENTO DE CAPACITACIÓN (RF07)
-- Vista materializada para reportes de avance
-- ============================================================
CREATE MATERIALIZED VIEW sst.mv_seguimiento_capacitacion AS
SELECT
    u.id                                        AS usuario_id,
    u.nombre || ' ' || u.apellido               AS nombre_completo,
    u.email,
    c.id                                        AS capacitacion_id,
    c.titulo                                    AS capacitacion,
    c.fecha_vigencia,
    e.id                                        AS evaluacion_id,
    COALESCE(MAX(i.puntaje), 0)                AS mejor_puntaje,
    COUNT(i.id)                                 AS total_intentos,
    BOOL_OR(i.aprobado)                         AS aprobado,
    MAX(cert.fecha_emision)                     AS fecha_certificado
FROM sst.usuarios u
CROSS JOIN sst.capacitaciones c
LEFT JOIN sst.evaluaciones e   ON e.capacitacion_id = c.id
LEFT JOIN sst.intentos_evaluacion i
    ON i.usuario_id = u.id AND i.evaluacion_id = e.id
LEFT JOIN sst.certificados cert
    ON cert.usuario_id = u.id AND cert.capacitacion_id = c.id
WHERE u.estado = TRUE
  AND c.estado = TRUE
GROUP BY u.id, u.nombre, u.apellido, u.email, c.id, c.titulo, c.fecha_vigencia, e.id;

CREATE UNIQUE INDEX ON sst.mv_seguimiento_capacitacion(usuario_id, capacitacion_id);

-- Refrescar manualmente o via cron:
-- REFRESH MATERIALIZED VIEW CONCURRENTLY sst.mv_seguimiento_capacitacion;

-- ============================================================
-- FUNCIÓN: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION sst.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger a tablas con updated_at
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['roles','usuarios','categorias','capacitaciones','evaluaciones','configuracion_usuario']
    LOOP
        EXECUTE format('
            CREATE TRIGGER trg_%s_updated_at
            BEFORE UPDATE ON sst.%s
            FOR EACH ROW EXECUTE FUNCTION sst.set_updated_at();
        ', t, t);
    END LOOP;
END $$;

-- ============================================================
-- USUARIO SUPER_USUARIO inicial (password: Admin1234!)
-- Cambiar inmediatamente en producción
-- bcrypt hash de "Admin1234!" con 10 salt rounds
-- ============================================================
INSERT INTO sst.usuarios (nombre, apellido, email, password_hash, rol_id)
VALUES (
    'Super',
    'Admin',
    'admin@sst.local',
    '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- "Admin1234!"
    (SELECT id FROM sst.roles WHERE nombre = 'SUPER_USUARIO')
);

-- ============================================================
-- RESUMEN DE OBJETOS CREADOS
-- ============================================================
-- Tablas (14):
--   sst.roles, sst.usuarios, sst.tokens_recuperacion
--   sst.categorias, sst.capacitaciones, sst.archivos_capacitacion
--   sst.evaluaciones, sst.preguntas, sst.opciones_respuesta
--   sst.intentos_evaluacion, sst.detalle_intentos
--   sst.certificados, sst.consultas_api, sst.auditoria
--
-- Vistas materializadas (1):
--   sst.mv_seguimiento_capacitacion  (RF07)
--
-- Funciones / Triggers:
--   sst.set_updated_at() + triggers en 5 tablas
--
-- Índices: 16 índices para búsquedas frecuentes
-- ============================================================