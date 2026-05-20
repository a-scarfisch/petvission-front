import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from '@/modules/auth/components/LoginForm'
import RegisterForm from '@/modules/auth/components/RegisterForm'
import PrivateRoute from '@/modules/core/components/PrivateRoute'
import ClientDashboard from '@/modules/client/components/ClientDashboard'
import { ClientProvider } from '@/modules/client/states/ClientContext'
import MascotaList from '@/modules/mascotas/components/MascotaList'
import MisCitas from '@/modules/client/components/MisCitas'


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginForm />} />
        
        <Route path="/register" element={<RegisterForm />} />
        
        
        {/* Rutas cliente envueltas en ClientProvider */}
        <Route
          path="/client/*"
          element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientProvider>
                <Routes>
                  {/* dentro de <Routes> del client*/}
                  <Route path="mascotas" element={<MascotaList />} />
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="citas" element={<MisCitas />} />
                </Routes>
              </ClientProvider>
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