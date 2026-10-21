import { useState } from 'react'
import { Link, useNavigate  } from 'react-router-dom'
import '../../App.css'
import api from '../../api/axios.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import TicketOrbitLogo from '../../components/Logo/Logo.jsx'

function LoginPage({ onRegister }) {
  const { setUser } = useAuth()
  const {user} = useAuth()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  console.log('name is '+ user?.name)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const response = await api.post('/api/v1/auth/login/public', {
        email: email.trim(),
        password,
      })

      localStorage.setItem('token', response.data.token)
      setUser(response.data.user)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const status = err.response?.status

      if (status === 401 || status === 400) {
        setError('Invalid username or password.')
      } else {
        setError(
            err.response?.data?.message ||
            'Unable to sign in right now. Please try again.'
        )
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="app">
      <section className="auth-container">
        <div className="brand-section">
         <TicketOrbitLogo />

          <h1>TicketOrbit</h1>

          <p>
            Manage support tickets efficiently.
            <br />
            Resolve issues. Keep customers moving.
          </p>

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

            {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
            )}

            <button
                type="submit"
                className="auth-button"
                disabled={submitting}
            >
              {submitting ? 'Signing in...' : 'Sign in'}
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