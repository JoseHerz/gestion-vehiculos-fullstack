import axios from 'axios';

// Definición de la URL base
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Este log te permitirá ver en la consola del navegador (F12) 
// si el frontend está usando la URL de Railway o el localhost.
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