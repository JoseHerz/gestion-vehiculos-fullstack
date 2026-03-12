/* eslint-disable no-undef */
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración para que Railway pueda acceder al sitio
  server: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    allowedHosts: true
  },
  
  // Configuración para el modo preview en la nube
  preview: {
    host: true,
    port: process.env.PORT ? parseInt(process.env.PORT) : 8080,
    allowedHosts: true
  },

  build: {
    // 1. Desactiva mapas de código para proteger tu lógica
    sourcemap: false,
    
    // 2. Minificación agresiva con Terser
    minify: 'terser',
    terserOptions: {
      compress: {
        // Elimina console.logs y debuggers en producción
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // 3. Optimización de fragmentos
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})