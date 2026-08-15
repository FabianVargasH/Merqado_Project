const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarios.model');

async function protect(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msj: 'Token es requerido' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const usuario = await Usuario.findById(decoded.id).select('-contrasenna');

        if (!usuario) {
            return res.status(401).json({ msj: 'Usuario no válido' });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        res.status(401).json({ msj: 'Token inválido o vencido' });
    }
}

module.exports = protect;