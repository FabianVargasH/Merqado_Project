const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuarios.model');
const protect = require('../middleware/auth.middleware');
const router = express.Router();

const generarToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '1d' });
};

// POST /api/usuarios/registro
router.post('/registro', async (req, res) => {
    try {
        const { nombre, correo, contrasenna, tipoUsuario } = req.body;

        if (!nombre || !correo || !contrasenna) {
            return res.status(400).json({
                msj: 'Nombre, correo y contraseña son obligatorios'
            });
        }

        const existe = await Usuario.findOne({ correo });
        if (existe) {
            return res.status(409).json({
                msj: 'Ya existe un usuario registrado con ese correo'
            });
        }

        const salt = await bcrypt.genSalt(10);
        const contrasennaHash = await bcrypt.hash(contrasenna, salt);

        const usuario = await Usuario.create({
            nombre,
            correo,
            contrasenna: contrasennaHash,
            tipoUsuario: tipoUsuario === 'admin' ? 'admin' : 'cliente'
        });

        res.status(201).json({
            msj: 'Usuario registrado correctamente',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipoUsuario: usuario.tipoUsuario
            },
            token: generarToken(usuario._id)
        });
    } catch (error) {
        res.status(500).json({
            msj: 'Error al registrar el usuario',
            error: error.message
        });
    }
});

// POST /api/usuarios/login
router.post('/login', async (req, res) => {
    try {
        const { correo, contrasenna } = req.body;

        if (!correo || !contrasenna) {
            return res.status(400).json({
                msj: 'Correo y contraseña son obligatorios'
            });
        }

        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(401).json({ msj: 'Credenciales inválidas' });
        }

        const coincide = await bcrypt.compare(contrasenna, usuario.contrasenna);
        if (!coincide) {
            return res.status(401).json({ msj: 'Credenciales inválidas' });
        }

        res.status(200).json({
            msj: 'Inicio de sesión exitoso',
            usuario: {
                id: usuario._id,
                nombre: usuario.nombre,
                correo: usuario.correo,
                tipoUsuario: usuario.tipoUsuario
            },
            token: generarToken(usuario._id)
        });
    } catch (error) {
        res.status(500).json({
            msj: 'Error al iniciar sesión',
            error: error.message
        });
    }
});

// GET /api/usuarios/perfil (ruta protegida, requiere token válido)
router.get('/perfil', protect, async (req, res) => {
    res.status(200).json({
        usuario: req.usuario
    });
});

module.exports = router;