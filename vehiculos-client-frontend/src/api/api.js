import axios from 'axios';

// URL por defecto para producción (Railway)
const RAILWAY_API_URL = 'https://backend-vehiculos-ppf-production.up.railway.app/api';

// En desarrollo local, debemos apuntar al backend local (cuando exista)
const LOCAL_API_URL = 'http://localhost:3001/api';

// Definimos la URL base usando:
// 1) la variable de entorno VITE_API_URL si está definida
// 2) en modo desarrollo, LOCAL_API_URL
// 3) en modo producción, RAILWAY_API_URL
const BASE_URL = import.meta.env.VITE_API_URL || (import.meta.env.MODE === 'development' ? LOCAL_API_URL : RAILWAY_API_URL);

// Este log te permitirá ver en la consola del navegador (F12)
// qué URL se está usando para las peticiones.
console.log("Conectando con la API en:", BASE_URL);

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000 
});

// Interceptor de Peticiones (Seguridad)
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de Respuestas (Gestión de errores)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!error.response) {
            console.error("Error de conexión: El servidor no responde.");
        }

        if (error.response && error.response.status === 401) {
            localStorage.clear();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;