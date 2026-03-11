const express = require('express');
const router = express.Router();
const registroController = require('../controllers/registroController');
const verificarToken = require('../middlewares/authMiddleware');

//rutas de registros que ahora requieren token
router.get('/', verificarToken, registroController.getRegistros);
router.post('/', verificarToken, registroController.createRegistro);
router.put('/:id', verificarToken, registroController.updateRegistro);
router.delete('/:id', verificarToken, registroController.deleteRegistro);

module.exports = router;