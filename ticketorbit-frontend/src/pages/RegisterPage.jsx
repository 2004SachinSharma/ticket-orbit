import { useState } from 'react'
import { Link } from 'react-router-dom'
import '../App.css'
import api from "../api/axios.js";


function RegisterPage({ onLogin }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()


       const response = await api.post('/api/v1/auth/register/public',
           {
             name:name,
             email: email,
             password: password
           })

    console.log('Response is: ',response.data)

    console.log('Registration submitted:', {
      name,
      email,
      password,
      confirmPassword,
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
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

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

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm password</label>

              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>

            <button type="submit" className="auth-button">
              Create account
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