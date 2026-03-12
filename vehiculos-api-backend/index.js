const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importar Rutas
const vehiculoRoutes = require('./src/routes/vehiculoRoutes');
const registroRoutes = require('./src/routes/registroRoutes');
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes');

// Importar Middleware de Error
const errorHandler = require('./src/middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 8080;

// --- Middlewares Globales ---
// Ajuste de CORS para permitir cabeceras de autenticación en producción
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
})); 

app.use(express.json()); 

// --- Definición de Rutas de la API ---
app.use('/api/auth', authRoutes);       
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Ruta base para verificación de estado (Health Check)
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API de Control de Vehículos Operativa' 
  });
});

// --- Manejo de Rutas No Encontradas (404) ---
app.use((req, res, next) => {
  res.status(404).json({
    mensaje: `La ruta ${req.originalUrl} no existe en este servidor.`
  });
});

// --- Middleware de manejo de errores ---
app.use(errorHandler);

// --- Iniciar Servidor ---
// Se añade '0.0.0.0' para que Railway pueda asignar el tráfico correctamente

app.listen(PORT, '0.0.0.0', () => {
  console.log('-------------------------------------------');
  console.log(`Servidor iniciado correctamente`);
  console.log(`Puerto: ${PORT}`);
  console.log(`Entorno: ${process.env.NODE_ENV || 'producción'}`);
  console.log('-------------------------------------------');
});