import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import LoginForm from '@/modules/auth/components/LoginForm'
import RegisterForm from '@/modules/auth/components/RegisterForm'
import PrivateRoute from '@/modules/core/components/PrivateRoute'
import ClientDashboard from '@/modules/client/components/ClientDashboard'
import { ClientProvider } from '@/modules/client/states/ClientContext'
import MascotaList from '@/modules/mascotas/components/MascotaList'
import MisCitas from '@/modules/client/components/MisCitas'
import Agendamiento from '@/modules/client/components/Agendamiento'
import VetDashboard from '@/modules/vet/components/VetDashboard'
import { VetProvider } from '@/modules/vet/states/VetContext'
import VetCitas from '@/modules/vet/components/VetCitas'
import VetHorarios from '@/modules/vet/components/VetHorarios'
import AdminDashboard from '@/modules/admin/components/AdminDashboard'
import { AdminProvider } from '@/modules/admin/states/AdminContext'
import AdminUsuarios from '@/modules/admin/components/AdminUsuarios'
import AdminCitas from '@/modules/admin/components/AdminCitas'
import LandingPage from '@/modules/landing/components/LandingPage'
import MiPerfil from '@/modules/client/components/MiPerfil'
import MisReservas from '@/modules/client/components/MisReservas'
import NuevaMascota from '@/modules/mascotas/components/NuevaMascota'
import MiConfiguracion from '@/modules/client/components/MiConfiguracion'


function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/login" element={<LoginForm />} />

        <Route path="/register" element={<RegisterForm />} />

        <Route path="/" element={<LandingPage />} />

        {/* Rutas cliente envueltas en ClientProvider */}
        <Route
          path="/client/*"
          element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientProvider>
                <Routes>
                  {/* dentro de <Routes> del client*/}
                  <Route path="mascotas" element={<MascotaList />} />
                  <Route path="mascotas/nueva" element={<NuevaMascota />} />
                  <Route path="dashboard" element={<ClientDashboard />} />
                  <Route path="citas" element={<MisCitas />} />
                  <Route path="citas/nueva" element={<Agendamiento />} />
                  <Route path="reservas" element={<MisReservas />} />
                  <Route path="configuracion" element={<MiConfiguracion />} />
                  <Route path="perfil" element={<MiPerfil />} />
                </Routes>
              </ClientProvider>
            </PrivateRoute>
          }
        />

        <Route
          path="/vet/*"
          element={
            <PrivateRoute allowedRoles={['VETERINARIO']}>
              <VetProvider>
                <Routes>
                  <Route path="dashboard" element={<VetDashboard />} />
                  <Route path="citas" element={<VetCitas />} />
                  <Route path="horarios" element={<VetHorarios />} />
                </Routes>
              </VetProvider>
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/*"
          element={
            <PrivateRoute allowedRoles={['ADMINISTRADOR']}>
              <AdminProvider>
                <Routes>
                  <Route path="dashboard" element={<AdminDashboard />} />
                  <Route path="usuarios" element={<AdminUsuarios />} />
                  <Route path="citas" element={<AdminCitas />} />

                </Routes>
              </AdminProvider>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App