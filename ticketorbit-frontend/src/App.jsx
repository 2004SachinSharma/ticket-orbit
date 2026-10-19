import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from './ProtectedRoute'
import DashboardPage from './pages/DashBoardPage'
import AdminPage from './pages/AdminPage'
import MyTicketsPage from "./pages/tickets/MyTicketsPage.jsx";
import CreateTicketPage from "./pages/tickets/CreateTicketPage.jsx";
import TicketDetailPage from "./pages/tickets/TicketDetailPage.jsx";

function App() {
return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login/public" element={<LoginPage />} />
          <Route path="/register/public" element={<RegisterPage />} />
          <Route path="/tickets" element={ <MyTicketsPage /> } />
          <Route path="/tickets/new" element={ <CreateTicketPage /> } />
          <Route path="/tickets/:ticketId" element={ <TicketDetailPage /> } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
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