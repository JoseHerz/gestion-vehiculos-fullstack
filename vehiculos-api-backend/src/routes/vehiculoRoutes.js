const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculoController');
const verificarToken = require('../middlewares/authMiddleware'); 

router.get('/', verificarToken, vehiculoController.getVehiculos);
router.post('/', verificarToken, vehiculoController.createVehiculo);
router.put('/:id', verificarToken, vehiculoController.updateVehiculo);
router.delete('/:id', verificarToken, vehiculoController.deleteVehiculo);

module.exports = router;