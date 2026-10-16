import { Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'

function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth()

    if (loading) {
        return <div><p>Checking session...</p></div>
    }

    if (!user) {
        return <Navigate to="/login/public" replace />
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" replace />
    }

    return children
}

export default ProtectedRoute