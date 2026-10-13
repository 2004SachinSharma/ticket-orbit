import { useState } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import '../App.css'
import api from '../api/axios'
import { useAuth } from '../auth/AuthContext'

function LoginPage({ onRegister }) {
  const { setUser } = useAuth()
  const {user} = useAuth()
  console.log('name is '+ user?.name)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const handleSubmit = async (event) => {
    event.preventDefault()

    const response = await api.post('/api/v1/auth/login/public',
      {
        email: email,
        password: password
      })
    localStorage.setItem('token', response.data.token)
    setUser(response.data.user)
    navigate('/dashboard')

    console.log('something here ', response.data.user.name)

    console.log('Login submitted:', {
      email,
      password,
    })
  }

  return (
    <main className="app">
      <section className="auth-container">
        <div className="brand-section">
          <div className="brand-logo">TO</div>

          <h1>TicketOrbit</h1>

          <p>
            Manage support tickets efficiently.
            <br />
            Resolve issues. Keep customers moving.
          </p>

          <h3> Hello <span style={{ color: 'red',fontFamily:'monospace',fontStyle:'italic' }} >{user?.name || 'Guest'} </span></h3>
        </div>

        <div className="auth-card">
          <div className="auth-header">
            <h2>Welcome back</h2>

            <p>Sign in to continue to TicketOrbit.</p>
          </div>

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>

              <input
                id="email"
                name="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>

              <input
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="auth-button">
              Sign in
            </button>
          </form>

          <div className="auth-switch">
            <span>Don't have an account?</span>

            <Link to="/register/public">Create account</Link>
          </div>
        </div>
      </section>
    </main>
  )
}

export default LoginPage