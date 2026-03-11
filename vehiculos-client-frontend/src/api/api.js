import axios from 'axios';

// Variable de entorno protegida
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL 
});

// Interceptor para añadir el token en cada petición
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            // Estándar Bearer Token para seguridad en el Backend
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar errores globales (como token expirado)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Si el servidor responde 401 (No autorizado), limpiamos sesión
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            // Redirigimos al login de forma segura
            if (window.location.pathname !== '/login') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export default api;