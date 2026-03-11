const express = require('express');
const cors = require('cors');
require('dotenv').config();

const vehiculoRoutes = require('./src/routes/vehiculoRoutes');
const registroRoutes = require('./src/routes/registroRoutes');
const authRoutes = require('./src/routes/authRoutes');
const usuarioRoutes = require('./src/routes/usuarioRoutes'); 

const errorHandler = require('./src/middlewares/errorHandler');

const app = express();

// Railway nos asigna el puerto dinámicamente, si no, usamos el 3001 para local
const PORT = process.env.PORT || 3001;

// Configuración de CORS: por ahora abierto, pero listo para restringir al dominio de producción
app.use(cors({
    origin: process.env.FRONTEND_URL || '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); 

// Endpoints principales
app.use('/api/auth', authRoutes);       
app.use('/api/vehiculos', vehiculoRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/usuarios', usuarioRoutes);

// Endpoint de salud para monitorear el despliegue
app.get('/', (req, res) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'API operativa',
    env: process.env.NODE_ENV || 'dev'
  });
});

// Captura de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    mensaje: `Ruta no encontrada: ${req.originalUrl}`
  });
});

// El manejo de errores siempre va al final para capturar fallos en los controladores
app.use(errorHandler);

// Escuchamos en 0.0.0.0 para que el tráfico externo de la nube pueda entrar
app.listen(PORT, '0.0.0.0', () => {
  console.log(`>>> Servidor listo en puerto ${PORT}`);
});