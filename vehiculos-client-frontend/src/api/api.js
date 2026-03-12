import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
    baseURL: BASE_URL,
    timeout: 10000 // 10 segundos de espera máxima
});

// Inyección de Seguridad
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

// Interceptor de Respuestas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // 1. Error de Conexión (El servidor no responde o URL incorrecta)
        if (!error.response) {
            console.error("CRÍTICO: No hay respuesta del servidor.");
            console.error("Intentando conectar a:", BASE_URL);
            console.error("Verifica si el Backend en Railway está encendido.");
        }

        // 2. Sesión Expirada o No Autorizada (401)
        if (error.response && error.response.status === 401) {
            console.warn("Sesión inválida o expirada. Redirigiendo...");
            localStorage.clear();
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);

export default api;