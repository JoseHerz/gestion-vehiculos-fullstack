import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Temas de PrimeReact
import "primereact/resources/themes/lara-light-indigo/theme.css";     // Tema
import "primereact/resources/primereact.min.css";                     // Core
import "primeicons/primeicons.css";                                   // Iconos
import "primeflex/primeflex.css";                                     // Utilidades de diseño

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)