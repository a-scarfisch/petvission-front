import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from '@/modules/auth/components/LoginForm'
import RegisterForm from '@/modules/auth/components/RegisterForm'
import PrivateRoute from '@/modules/core/components/PrivateRoute'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />

        <Route
          path="/client/dashboard"
          element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <div>Dashboard Cliente</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/vet/dashboard"
          element={
            <PrivateRoute allowedRoles={['VETERINARIO']}>
              <div>Dashboard Veterinario</div>
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute allowedRoles={['ADMINISTRADOR']}>
              <div>Dashboard Admin</div>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App