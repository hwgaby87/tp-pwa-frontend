// Punto de entrada principal de la aplicación React
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router'
import AuthContextProvider from './context/AuthContext'
import './global.css'

// Buscamos el elemento con id 'root' en nuestro HTML y renderizamos la app allí
createRoot(document.getElementById('root')).render(
  // BrowserRouter permite que funcionen las rutas (URLs) en la app
  <BrowserRouter>
    // AuthContextProvider envuelve la app para que todos los componentes sepan si el usuario está logueado
    <AuthContextProvider>
      <App />
    </AuthContextProvider>
  </BrowserRouter>
)
