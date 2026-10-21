import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../../App.css'
import api from '../../api/axios.js'
import TicketOrbitLogo from '../../components/Logo/Logo'

function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const navigate = useNavigate()

  const passwordsMatch =
      confirmPassword.length > 0 && password === confirmPassword

  const passwordsMismatch =
      confirmPassword.length > 0 && password !== confirmPassword

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setSubmitting(true)

    try {
      const response = await api.post('/api/v1/auth/register/public', {
        name,
        email,
        password
      })

      console.log('Registration successful:', response.data)
      setSuccess('Account created successfully! Redirecting to login...')

      setTimeout(() => {
        navigate('/login/public')
      }, 1200)

    } catch (err) {
      if (err.response?.data?.code === 'EMAIL_ALREADY_EXISTS') {
        setError('This email is already registered. Please sign in.')
      } else {
        setError(
            err.response?.data?.message ||
            'Registration failed. Please try again.'
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
              <h2>Create your account</h2>
              <p>Register to start managing your tickets.</p>
            </div>

            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Full name</label>
                <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-email">Email</label>
                <input
                    id="register-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                />
              </div>

              <div className="form-group">
                <label htmlFor="register-password">Password</label>
                <input
                    id="register-password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm password</label>
                <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className={
                      passwordsMatch
                          ? 'password-match'
                          : passwordsMismatch
                              ? 'password-mismatch'
                              : ''
                    }
                    aria-invalid={passwordsMismatch}
                    aria-describedby="password-match-message"
                    required
                />

                {confirmPassword && (
                    <small
                        id="password-match-message"
                        className={
                          passwordsMatch
                              ? 'password-match-text'
                              : 'password-mismatch-text'
                        }
                    >
                      {passwordsMatch
                          ? '✓ Passwords match'
                          : '✕ Passwords do not match'}
                    </small>
                )}
              </div>

              {error && (
                  <div className="auth-error" role="alert">
                    {error}
                  </div>
              )}

              {success && (
                  <div className="auth-success" role="status">
                    {success}
                  </div>
              )}

              <button
                  type="submit"
                  className="auth-button"
                  disabled={submitting || !passwordsMatch}
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            <div className="auth-switch">
              <span>Already have an account?</span>
              <Link to="/login/public">Sign in</Link>
            </div>
          </div>
        </section>
      </main>
  )
}

export default RegisterPage