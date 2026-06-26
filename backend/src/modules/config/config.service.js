import pool from '../../config/db.js'

const DEFAULTS_SISTEMA = {
  nombre_empresa: 'SST Enterprise',
  color_primario: '#000000',
  color_secundario: '#006c49',
}

pool.query(`
  CREATE TABLE IF NOT EXISTS sst.configuracion_sistema (
    clave       VARCHAR(100) PRIMARY KEY,
    valor       TEXT NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  )
`).catch(() => {})

export const getSistema = async () => {
  const { rows } = await pool.query('SELECT clave, valor FROM sst.configuracion_sistema')
  const result = { ...DEFAULTS_SISTEMA }
  rows.forEach(r => { result[r.clave] = r.valor })
  return result
}

export const setSistema = async (config) => {
  const keys = Object.keys(config)
  if (!keys.length) return getSistema()
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const key of keys) {
      await client.query(
        `INSERT INTO sst.configuracion_sistema (clave, valor) VALUES ($1, $2)
         ON CONFLICT (clave) DO UPDATE SET valor = $2, updated_at = NOW()`,
        [key, String(config[key])]
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
  return getSistema()
}

export const getConfig = async (usuario_id) => {
  const { rows } = await pool.query(
    'SELECT clave, valor FROM sst.configuracion_usuario WHERE usuario_id = $1',
    [usuario_id]
  )
  
  const config = {}
  rows.forEach(row => {
    config[row.clave] = row.valor
  })
  
  return config
}

export const setConfig = async (usuario_id, config) => {
  // config is an object with multiple keys
  const keys = Object.keys(config)
  if (keys.length === 0) return {}

  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    for (const key of keys) {
      const value = config[key]
      await client.query(
        `INSERT INTO sst.configuracion_usuario (usuario_id, clave, valor)
         VALUES ($1, $2, $3)
         ON CONFLICT (usuario_id, clave) DO UPDATE SET valor = $3`,
        [usuario_id, key, value]
      )
    }
    await client.query('COMMIT')
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }

  return await getConfig(usuario_id)
}
