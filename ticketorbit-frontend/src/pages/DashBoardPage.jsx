import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

function DashboardPage() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/login', { replace: true })
    }

    return ( <div> <h1>Welcome, {user?.name}!</h1>

            <button onClick={handleLogout}>
                Logout
            </button>
        </div>


    )
}

export default DashboardPage
