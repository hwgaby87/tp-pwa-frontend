import React from 'react'
import { Route, Routes } from 'react-router'
import { 
  LoginScreen, 
  RegisterScreen, 
  ResetPasswordRequestScreen, 
  ResetPasswordScreen, 
  HomeScreen, 
  WorkspaceScreen, 
  LandingScreen, 
  InvitationScreen 
} from './screens'
import AuthContextProvider from './context/AuthContext'
import AuthMiddleware from './middlewares/AuthMiddleware'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'
import { Toaster } from 'sonner'

/**
 * Componente principal de la aplicación que gestiona las rutas y el proveedor de autenticación.
 * 
 * @component
 * @returns {JSX.Element} El árbol de componentes de la aplicación con rutas configuradas.
 */
const App = () => {
  return (
    <>
      <Toaster 
        position="top-center" 
        richColors 
        closeButton 
        toastOptions={{
          style: {
            fontFamily: 'Outfit, sans-serif',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: '0 8px 24px var(--shadow-color)',
          },
        }}
      />
      <Routes>
      <Route path='/login' element={<LoginScreen />} />
      <Route path='/register' element={<RegisterScreen />} />
      <Route path='/' element={<LandingScreen />} />
      <Route 
        path="/reset-password-request" 
        element={<ResetPasswordRequestScreen/>}
      />
      <Route 
        path="/reset-password/:reset_password_token" 
        element={<ResetPasswordScreen/>}
      />
      <Route 
        path="/invitation" 
        element={<InvitationScreen/>}
      />
      <Route element={<AuthMiddleware/>}>
        <Route 
          path='/home' 
          element={<HomeScreen/>}
        />
        <Route 
          path='/workspace/:workspace_id' 
          element={<WorkspaceScreen/>}
        />
        <Route 
          path='/workspace/:workspace_id/channel/:channel_id' 
          element={<WorkspaceScreen/>}
        />
        <Route 
          path='/workspace/:workspace_id/dm/:member_id' 
          element={<WorkspaceScreen/>}
        />
      </Route>
    </Routes>
    </>
  )
}

export default App