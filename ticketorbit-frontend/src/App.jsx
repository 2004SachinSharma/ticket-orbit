import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from './ProtectedRoute'
import DashboardPage from './pages/DashBoardPage'
import AdminPage from './pages/AdminPage'

function App() {
return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login/public" element={<LoginPage />} />
          <Route path="/register/public" element={<RegisterPage />} />

          <Route path="/" element={<Navigate to="/login/public" replace />} />

            <Route path="*" element={<Navigate to="/login/public" replace />} />
            <Route path="/dashboard" element={ <ProtectedRoute> <DashboardPage /> </ProtectedRoute> } />
            <Route path="/admin" element={ <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminPage />
            </ProtectedRoute> } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App