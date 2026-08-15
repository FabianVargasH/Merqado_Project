const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.status(200).json({
        msj: 'API de cursos funcionando correctamente' 
    });
});

app.post('/api/test', (req, res) => {
    res.json({
        msj: 'Datos recibidos correctamente',
        body: req.body
    });
});

const usuariosRoutes = require('./routes/usuarios.route');
app.use('/api/usuarios', usuariosRoutes);

connectDB();

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});