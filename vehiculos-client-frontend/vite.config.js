import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // 1. Desactiva los mapas de código para producción para proteger el código fuente
    sourcemap: false,
    // 2. Asegura que el código se compacte y se eliminen los console.log para dificultar el rastreo y mejorar la seguridad
    minify: 'terser',
    terserOptions: {
      compress: {
        // Elimina todos los console.log en producción para mayor limpieza y seguridad
        drop_console: true,
        drop_debugger: true,
      },
    },
    // 3. Divide el código en trozos más pequeños para mejorar la carga y dificultar el rastreo
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
})