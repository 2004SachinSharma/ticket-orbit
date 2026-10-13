import { Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext'

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth()

    if (loading) {
        return ( <div>

            <p>Checking session...</p>
        </div>)
    }

    if (!user) {
        return <Navigate to="/login/public" replace />
    }

    return children //If all fine then return the page which was requested i.e. dashboard page or any protected page
}

export default ProtectedRoute