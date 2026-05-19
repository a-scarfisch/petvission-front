import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LoginForm from '@/modules/auth/components/LoginForm'
import RegisterForm from '@/modules/auth/components/RegisterForm'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App