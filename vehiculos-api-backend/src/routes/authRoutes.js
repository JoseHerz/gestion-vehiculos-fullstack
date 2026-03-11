const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Autenticación
router.post('/login', authController.login);

// Gestión de Usuarios
router.get('/usuarios', authController.getUsuarios);
router.post('/register', authController.register);
router.delete('/usuarios/:id', authController.eliminarUsuario); // <-- NUEVA
router.put('/usuarios/:id', authController.actualizarUsuario); // <-- NUEVA

module.exports = router;