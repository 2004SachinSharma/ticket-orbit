import { useAuth } from '../auth/AuthContext'


 function DashboardPage(){
    const {user} = useAuth()

    return (
        <div>
            <h1>{user?.name}</h1>
        </div>
    )
}
export default DashboardPage;
