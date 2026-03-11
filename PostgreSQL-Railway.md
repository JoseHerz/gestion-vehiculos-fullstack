import { sql } from "bun";

try {
  await sql`
    CREATE TABLE IF NOT EXISTS usuarios (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nombre VARCHAR(100) NOT NULL,
      rol VARCHAR(20) DEFAULT 'USER',
      creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("Tabla 'usuarios' creada correctamente");

  await sql`
    CREATE TABLE IF NOT EXISTS vehiculos (
      id SERIAL PRIMARY KEY,
      marca VARCHAR(100) NOT NULL,
      modelo VARCHAR(100) NOT NULL,
      placa VARCHAR(20) UNIQUE NOT NULL,
      creado_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log("Tabla 'vehiculos' creada correctamente");

  await sql`
    CREATE TABLE IF NOT EXISTS registros (
      id SERIAL PRIMARY KEY,
      vehiculo_id INTEGER REFERENCES vehiculos(id) ON DELETE CASCADE,
      motorista VARCHAR(255) NOT NULL,
      fecha DATE NOT NULL,
      hora TIME NOT NULL,
      kilometraje INTEGER NOT NULL,
      usuario_id INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
      tipo VARCHAR(10) CHECK (tipo IN ('Entrada', 'Salida')) NOT NULL,
      comentario TEXT
    )
  `;
  console.log("Tabla 'registros' creada correctamente");

  try {
    await sql`
      ALTER TABLE usuarios 
      ADD COLUMN rol VARCHAR(20) DEFAULT 'USER'
    `;
    console.log("Columna 'rol' añadida a usuarios");
  } catch (e) {
    if (e.message.includes("already exists")) {
      console.log("Columna 'rol' ya existe en usuarios");
    } else {
      throw e;
    }
  }
  try {
    await sql`
      ALTER TABLE vehiculos 
      ADD CONSTRAINT unique_placa UNIQUE (placa)
    `;
    console.log("Restricción UNIQUE en placa añadida");
  } catch (e) {
    if (e.message.includes("already exists")) {
      console.log("Restricción UNIQUE en placa ya existe");
    } else {
      throw e;
    }
  }
  try {
    await sql`
      INSERT INTO usuarios (username, password, nombre, rol) 
      VALUES ('admin', 'admin123', 'Administrador', 'ADMIN')
      ON CONFLICT (username) DO UPDATE SET rol='ADMIN'
    `;
    console.log("Usuario admin creado/actualizado");
  } catch (e) {
    console.log("Usuario admin ya existe o error:", e.message);
  }

  console.log("Todas las migraciones completadas exitosamente");
} catch (error) {
  console.error("Error al crear las tablas:", error.message);
  process.exit(1);
}
