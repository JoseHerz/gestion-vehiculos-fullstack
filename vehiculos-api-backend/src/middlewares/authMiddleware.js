const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ mensaje: 'Acceso denegado. No se proporcionó un token.' });
    }

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET || 'clave_maestra_secreta');
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ mensaje: 'Token no válido' });
    }
};

module.exports = verificarToken;