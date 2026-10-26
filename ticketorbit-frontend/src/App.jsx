import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import LoginPage from './pages/Login/LoginPage.jsx'
import RegisterPage from './pages/Register/RegisterPage.jsx'
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from './ProtectedRoute'
import DashboardPage from './pages/DashBoardPage'
import AdminTicketAssignmentPage from './pages/AdminTicketAssignmentPage.jsx'
import MyTicketsPage from "./pages/tickets/MyTicketsPage.jsx";
import CreateTicketPage from "./pages/tickets/CreateTicketPage.jsx";
import TicketDetailPage from "./pages/tickets/TicketDetailPage.jsx";
import AgentTicketsPage from "./pages/tickets/AgentTicketPage.jsx";

function App() {
return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login/public" element={ <LoginPage /> } />
          <Route path="/register/public" element={<RegisterPage />  } />
          <Route path="/tickets" element={<ProtectedRoute allowedRoles={['CUSTOMER']} > <MyTicketsPage /> </ProtectedRoute>} />
          <Route path="/tickets/new" element={<ProtectedRoute> <CreateTicketPage /> </ProtectedRoute>} />
          <Route path="/tickets/:ticketId" element={<ProtectedRoute> <TicketDetailPage /> </ProtectedRoute> } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={ <ProtectedRoute> <DashboardPage /> </ProtectedRoute> } />
            <Route path="/tickets/admin" element={ <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTicketAssignmentPage />
            </ProtectedRoute> } />
            <Route path="/tickets/assigned" element={
                <ProtectedRoute allowedRoles={['AGENT']}>
                    <AgentTicketsPage />
                </ProtectedRoute>
            } />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App