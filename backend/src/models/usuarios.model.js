const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    contrasenna: {
        type: String,
        required: true
    },
    tipoUsuario: {
        type: String,
        enum: ['cliente', 'admin'],
        default: 'cliente'
    },
    telefono: {
        type: String,
        default: '',
        trim: true
    },
    fechaNacimiento: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Usuario', usuarioSchema);