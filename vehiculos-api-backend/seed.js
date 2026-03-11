const { Pool } = require('pg');

const pool = new Pool({
  host: 'mainline.proxy.rlwy.net',
  port: 55781,
  user: 'postgres',
  password: 'pfrAsYVSvuhuLpAHjUBUqooXryYAfDHH',
  database: 'railway',
  ssl: { rejectUnauthorized: false }
});

const ejecutarSincronizacion = async () => {
  try {
    console.log('Iniciando limpieza y carga de datos...');

    // 1. Limpieza total de tablas y reinicio de contadores ID
    await pool.query('TRUNCATE registros, vehiculos RESTART IDENTITY CASCADE');
    console.log('Tablas limpiadas con éxito.');

    // 2. Inserción de vehículos y captura de IDs generados por la BD
    const resVehiculos = await pool.query(`
      INSERT INTO vehiculos (marca, modelo, placa) VALUES 
      ('Toyota', 'Hilux', 'P-123ABC'),
      ('Nissan', 'Frontier', 'P-456DEF'),
      ('Mitsubishi', 'L200', 'P-789GHI'),
      ('Ford', 'Ranger', 'P-555AAA'),
      ('Hino', '300 Series', 'C-888BBB'),
      ('Isuzu', 'D-Max', 'P-999CCC')
      RETURNING id;
    `);

    const ids = resVehiculos.rows.map(v => v.id);
    console.log('Vehículos creados.');

    // 3. Inserción de 20 registros vinculados a los IDs dinámicos
    const registrosSQL = `
      INSERT INTO registros (vehiculo_id, motorista, fecha, hora, kilometraje, tipo, comentario) VALUES 
      (${ids[0]}, 'Jose Hernandez', '2026-03-01', '07:00:00', 45000, 'Salida', 'Ruta Norte'),
      (${ids[0]}, 'Jose Hernandez', '2026-03-01', '18:00:00', 45210, 'Entrada', 'Sin novedad'),
      (${ids[1]}, 'Carlos Ruiz', '2026-03-02', '08:30:00', 12100, 'Salida', 'Entrega mercaderia'),
      (${ids[1]}, 'Carlos Ruiz', '2026-03-02', '16:00:00', 12250, 'Entrada', 'Finalizado'),
      (${ids[2]}, 'Ana Lopez', '2026-03-03', '09:00:00', 33500, 'Salida', 'Administrativo'),
      (${ids[2]}, 'Ana Lopez', '2026-03-03', '11:00:00', 33520, 'Entrada', 'Tramite'),
      (${ids[3]}, 'Mario Gomez', '2026-03-04', '06:00:00', 8900, 'Salida', 'Viaje largo'),
      (${ids[3]}, 'Mario Gomez', '2026-03-04', '20:00:00', 9450, 'Entrada', 'Tanque lleno'),
      (${ids[4]}, 'Roberto Sosa', '2026-03-05', '07:15:00', 55200, 'Salida', 'Carga pesada'),
      (${ids[4]}, 'Roberto Sosa', '2026-03-05', '19:00:00', 55380, 'Entrada', 'Limpieza'),
      (${ids[5]}, 'Elena Rivas', '2026-03-06', '08:00:00', 1500, 'Salida', 'Rodaje'),
      (${ids[5]}, 'Elena Rivas', '2026-03-06', '14:00:00', 1650, 'Entrada', 'Revision OK'),
      (${ids[0]}, 'Jose Hernandez', '2026-03-07', '07:00:00', 45210, 'Salida', 'Ruta Sur'),
      (${ids[0]}, 'Jose Hernandez', '2026-03-07', '17:45:00', 45400, 'Entrada', 'Llantas OK'),
      (${ids[1]}, 'Carlos Ruiz', '2026-03-08', '09:00:00', 12250, 'Salida', 'Envio especial'),
      (${ids[1]}, 'Carlos Ruiz', '2026-03-08', '15:30:00', 12380, 'Entrada', 'Entregado'),
      (${ids[2]}, 'Ana Lopez', '2026-03-09', '10:00:00', 33520, 'Salida', 'Supervision'),
      (${ids[2]}, 'Ana Lopez', '2026-03-09', '18:00:00', 33700, 'Entrada', 'Sin fallas'),
      (${ids[3]}, 'Mario Gomez', '2026-03-10', '06:30:00', 9450, 'Salida', 'Ruta Este'),
      (${ids[3]}, 'Mario Gomez', '2026-03-10', '16:00:00', 9700, 'Entrada', 'Aceite pendiente');
    `;

    await pool.query(registrosSQL);
    console.log('20 Registros inyectados con éxito.');
    console.log('Estado del Backend: 80% Completado.');

  } catch (err) {
    console.error('Error durante la ejecucion:', err.message);
  } finally {
    await pool.end();
  }
};

ejecutarSincronizacion();