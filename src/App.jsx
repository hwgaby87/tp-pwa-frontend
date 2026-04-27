import React from 'react'
import { Route, Routes } from 'react-router'
import LoginScreen from './Screens/LoginScreen/LoginScreen'
import RegisterScreen from './Screens/RegisterScreen/RegisterScreen'
import ResetPasswordRequestScreen from './Screens/ResetPasswordRequestScreen/ResetPasswordRequestScreen'
import ResetPasswordScreen from './Screens/ResetPasswordScreen/ResetPasswordScreen'
import AuthContextProvider from './context/AuthContext'
import AuthMiddleware from './Middlewares/AuthMiddleware'
import HomeScreen from './Screens/HomeScreen/HomeScreen'
import WorkspaceScreen from './Screens/WorkspaceScreen/WorkspaceScreen'
import ThemeToggle from './components/ThemeToggle/ThemeToggle'
import LandingScreen from './Screens/LandingScreen/LandingScreen'
import InvitationScreen from './Screens/InvitationScreen/InvitationScreen'
import { Toaster } from 'sonner'

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