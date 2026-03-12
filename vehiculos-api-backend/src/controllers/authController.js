const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Obtener todos los usuarios para el GridView
const getUsuarios = async (req, res) => {
    try {
        const { rows } = await db.query('SELECT id, nombre, username, rol, creado_at FROM usuarios ORDER BY creado_at DESC');
        res.json(rows);
    } catch (error) {
        console.error("ERROR AL OBTENER USUARIOS:", error);
        res.status(500).json({ mensaje: 'Error al obtener usuarios' });
    }
};

// 2. Registrar nuevo usuario
const register = async (req, res) => {
    const { nombre, username, password, rol } = req.body;
    try {
        // Encriptación de la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const { rows } = await db.query(
            'INSERT INTO usuarios (nombre, username, password, rol) VALUES ($1, $2, $3, $4) RETURNING id, username',
            [nombre, username, hashedPassword, (rol || 'USER').toUpperCase()]
        );
        res.status(201).json({ mensaje: 'Usuario creado con éxito', usuario: rows[0] });
    } catch (error) {
        console.error("ERROR EN REGISTRO:", error);
        res.status(500).json({ mensaje: 'Error al registrar usuario' });
    }
};

// 3. Eliminar usuario
const eliminarUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM usuarios WHERE id = $1', [id]);
        res.json({ mensaje: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error("ERROR AL ELIMINAR:", error);
        res.status(500).json({ mensaje: 'Error al eliminar el usuario' });
    }
};

// 4. Actualizar usuario (sin cambiar contraseña)
const actualizarUsuario = async (req, res) => {
    const { id } = req.params;
    const { nombre, username, rol } = req.body;
    try {
        await db.query(
            'UPDATE usuarios SET nombre = $1, username = $2, rol = $3 WHERE id = $4',
            [nombre, username, (rol || 'USER').toUpperCase(), id]
        );
        res.json({ mensaje: 'Usuario actualizado correctamente' });
    } catch (error) {
        console.error("ERROR AL ACTUALIZAR:", error);
        res.status(500).json({ mensaje: 'Error al actualizar el usuario' });
    }
};

// 5. Login de acceso
const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        // Buscamos al usuario por su identificador único
        const { rows } = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);
        
        if (rows.length === 0) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        const usuario = rows[0];
        
        // Comparación del hash (importante el trim si el campo en DB es CHAR)
        const validPassword = await bcrypt.compare(password, usuario.password.trim());
        
        if (!validPassword) {
            return res.status(401).json({ mensaje: 'Credenciales inválidas' });
        }

        // Generación del JSON Web Token
        const token = jwt.sign(
            { id: usuario.id, username: usuario.username, rol: usuario.rol },
            process.env.JWT_SECRET || 'clave_maestra_secreta',
            { expiresIn: '8h' }
        );

        res.json({
            token,
            usuario: {
                id: usuario.id,
                username: usuario.username,
                nombre: usuario.nombre,
                rol: (usuario.rol || 'USER').toUpperCase() 
            }
        });
    } catch (error) {
        console.error("ERROR EN LOGIN:", error);
        res.status(500).json({ mensaje: 'Error interno del servidor' });
    }
};

module.exports = { login, getUsuarios, register, eliminarUsuario, actualizarUsuario };