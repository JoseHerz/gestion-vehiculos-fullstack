const { Pool } = require('pg');
require('dotenv').config();

// Configuración técnica para Railway
const pool = new Pool({
  // Se prioriza la cadena de conexión completa proporcionada por la plataforma
  connectionString: process.env.DATABASE_URL,
  
  // Configuración de seguridad SSL obligatoria para entornos en la nube
  ssl: {
    rejectUnauthorized: false
  }
});

// Verificación de integridad de la conexión
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('--- FALLO DE CONEXIÓN A BASE DE DATOS ---');
    console.error('Detalle técnico:', err.message);
    console.error('-----------------------------------------');
  } else {
    console.log('>>> Conexión exitosa a PostgreSQL en Railway');
  }
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};