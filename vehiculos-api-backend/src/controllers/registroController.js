const db = require('../config/db');

// 1. OBTENER REGISTROS
const getRegistros = async (req, res) => {
  const { fecha, vehiculo_id, motorista } = req.query;
  let query = 'SELECT r.*, v.placa FROM registros r JOIN vehiculos v ON r.vehiculo_id = v.id WHERE 1=1';
  const values = [];

  if (fecha && fecha !== 'null') {
    values.push(fecha);
    query += ` AND r.fecha = $${values.length}`;
  }
  if (vehiculo_id && vehiculo_id !== 'null') {
    values.push(vehiculo_id);
    query += ` AND r.vehiculo_id = $${values.length}`;
  }
  if (motorista && motorista !== 'null') {
    values.push(`%${motorista}%`);
    query += ` AND r.motorista ILIKE $${values.length}`;
  }

  // Ordenamos por ID
  query += ' ORDER BY r.id DESC';

  try {
    const { rows } = await db.query(query, values);
    res.json(rows);
  } catch (error) {
    console.error("Error en GET:", error.message);
    res.status(500).json({ mensaje: 'Error al obtener registros', error: error.message });
  }
};

// 2. CREAR REGISTRO
const createRegistro = async (req, res) => {
  const { vehiculo_id, motorista, fecha, hora, kilometraje, tipo, comentario } = req.body;
  try {
    const query = 'INSERT INTO registros (vehiculo_id, motorista, fecha, hora, kilometraje, tipo, comentario) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    const { rows } = await db.query(query, [vehiculo_id, motorista, fecha, hora, kilometraje, tipo, comentario]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error("Error en POST:", error.message);
    res.status(500).json({ mensaje: 'Error al registrar', error: error.message });
  }
};

// 3. ACTUALIZAR REGISTRO
const updateRegistro = async (req, res) => {
  const { id } = req.params;
  const { vehiculo_id, motorista, fecha, hora, kilometraje, tipo, comentario } = req.body;
  try {
    const query = 'UPDATE registros SET vehiculo_id = $1, motorista = $2, fecha = $3, hora = $4, kilometraje = $5, tipo = $6, comentario = $7 WHERE id = $8 RETURNING *';
    const { rows } = await db.query(query, [vehiculo_id, motorista, fecha, hora, kilometraje, tipo, comentario, id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar', error: error.message });
  }
};

// 4. ELIMINAR REGISTRO
const deleteRegistro = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM registros WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json({ mensaje: 'Registro eliminado con éxito' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
  }
};

// EXPORTAR TODAS LAS FUNCIONES (Ahora sí están todas definidas)
module.exports = { getRegistros, createRegistro, updateRegistro, deleteRegistro };