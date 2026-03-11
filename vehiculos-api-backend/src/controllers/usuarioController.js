const pool = require('../config/db'); 

// Obtener todos los usuarios
exports.getUsuarios = async (req, res) => {
    try {
        const query = `
            SELECT id, username, nombre, rol, creado_at 
            FROM usuarios 
            ORDER BY id ASC
        `;
        const result = await pool.query(query);
        
        // Los resultados vienen dentro de la propiedad 'rows'
        res.status(200).json(result.rows);
    } catch (error) {
        console.error("Error al obtener la lista de usuarios:", error.message);
        res.status(500).json({ message: "Error interno del servidor al consultar la base de datos." });
    }
};

// Actualizar información de un usuario
exports.actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, username, rol } = req.body;

    try {
        const query = `
            UPDATE usuarios 
            SET nombre = $1, username = $2, rol = $3 
            WHERE id = $4
            RETURNING id
        `;
        const result = await pool.query(query, [nombre, username, rol, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.status(200).json({ message: "Usuario actualizado correctamente." });
    } catch (error) {
        console.error("Error al actualizar el usuario:", error.message);
        
        // Manejo de error de PostgreSQL para violación de restricción UNIQUE (username duplicado)
        if (error.code === '23505') { 
            return res.status(400).json({ message: "El nombre de usuario ya está registrado por otra persona." });
        }
        
        res.status(500).json({ message: "Error al intentar actualizar el registro." });
    }
};

// Eliminar un usuario
exports.eliminarUsuario = async (req, res) => {
    const { id } = req.params;

    try {
        const query = `
            DELETE FROM usuarios 
            WHERE id = $1
            RETURNING id
        `;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        res.status(200).json({ message: "Usuario eliminado correctamente." });
    } catch (error) {
        console.error("Error al eliminar el usuario:", error.message);
        res.status(500).json({ message: "Error al intentar eliminar el registro." });
    }
};