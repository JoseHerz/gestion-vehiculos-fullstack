const db = require('../config/db');

const getVehiculos = async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM vehiculos ORDER BY creado_at DESC');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener vehículos', error: error.message });
  }
};

const createVehiculo = async (req, res) => {
  const { marca, modelo, placa } = req.body;
  try {
    const query = 'INSERT INTO vehiculos (marca, modelo, placa) VALUES ($1, $2, $3) RETURNING *';
    const { rows } = await db.query(query, [marca, modelo, placa]);
    res.status(201).json(rows[0]);
  } catch (error) {
    res.status(400).json({ mensaje: 'Error al crear vehículo', error: error.message });
  }
};

const updateVehiculo = async (req, res) => {
  const { id } = req.params;
  const { marca, modelo, placa } = req.body;
  try {
    const query = 'UPDATE vehiculos SET marca = $1, modelo = $2, placa = $3 WHERE id = $4 RETURNING *';
    const { rows } = await db.query(query, [marca, modelo, placa, id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar', error: error.message });
  }
};

const deleteVehiculo = async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM vehiculos WHERE id = $1', [id]);
    res.json({ mensaje: 'Vehículo eliminado' });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar', error: error.message });
  }
};

module.exports = { getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo };