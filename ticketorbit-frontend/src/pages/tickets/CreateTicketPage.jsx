import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import AppShell from '../../components/layout/AppShell/AppShell.jsx'
import { getNavItems } from '../../components/layout/AppShell/navItems.js'
import Button from '../../components/ui/Button/Button.jsx'
import Alert from '../../components/ui/Alert/Alert.jsx'
import styles from './CreateTicketPage.module.css'

const HELP_STEPS = [
  { title: 'Ticket submitted', body: 'Your request is added to our support queue.' },
  { title: 'Team review', body: 'Our team reviews and assigns your ticket.' },
  { title: 'Resolution', body: 'Track updates and replies from My Tickets.' },
]

function CreateTicketPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [categories, setCategories] = useState([])
  const [loadingCategories, setLoadingCategories] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    subject: '',
    categoryId: '',
    priority: 'MEDIUM',
    description: '',
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/v1/categories')
        setCategories(response.data)
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Categories could not be loaded. Please refresh the page.'
        )
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((previous) => ({ ...previous, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.categoryId) {
      setError('Please select a category.')
      return
    }

    setSubmitting(true)

    try {
      await api.post('/api/v1/tickets', {
        subject: form.subject.trim(),
        description: form.description.trim(),
        categoryId: Number(form.categoryId),
        priority: form.priority,
      })

      navigate('/tickets')
    } catch (err) {
      const data = err.response?.data
      setError(
        data?.fieldErrors?.length
          ? data.fieldErrors.map((field) => field.message).join(', ')
          : data?.message || 'Failed to create ticket. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell navItems={getNavItems(user?.role)} activePath="/tickets/new">
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Workspace / Create Ticket</p>
          <h1>Create a Ticket</h1>
          <p className={styles.subtitle}>
            Describe your issue and our support team will help you.
          </p>
        </div>

        <Button variant="secondary" onClick={() => navigate('/tickets')}>
          Cancel
        </Button>
      </header>

      <div className={styles.content}>
        <section className={styles.formCard}>
          <h2>Ticket Information</h2>
          <p className={styles.formCardNote}>Fields marked with * are required.</p>

          <Alert variant="error">{error}</Alert>

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="subject">Subject *</label>
              <input
                id="subject"
                name="subject"
                type="text"
                placeholder="Briefly describe your issue"
                value={form.subject}
                onChange={handleChange}
                maxLength={255}
                required
              />
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.field}>
                <label htmlFor="categoryId">Category *</label>
                <select
                  id="categoryId"
                  name="categoryId"
                  value={form.categoryId}
                  onChange={handleChange}
                  required
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Loading categories...' : 'Select category'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label htmlFor="priority">Priority *</label>
                <select
                  id="priority"
                  name="priority"
                  value={form.priority}
                  onChange={handleChange}
                  required
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>

            <div className={styles.field}>
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                placeholder="Explain the issue, what happened, and any steps you've already tried..."
                value={form.description}
                onChange={handleChange}
                rows={7}
                required
              />
              <small>Please provide enough detail to help us understand your issue.</small>
            </div>

            <div className={styles.actions}>
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate('/tickets')}
                disabled={submitting}
              >
                Cancel
              </Button>

              <Button type="submit" variant="primary" disabled={submitting || loadingCategories}>
                {submitting ? 'Submitting...' : 'Submit Ticket →'}
              </Button>
            </div>
          </form>
        </section>

        <aside className={styles.helpCard}>
          <h3>What happens next?</h3>

          {HELP_STEPS.map((step, index) => (
            <div className={styles.helpStep} key={step.title}>
              <span>{index + 1}</span>
              <div>
                <strong>{step.title}</strong>
                <p>{step.body}</p>
              </div>
            </div>
          ))}

          <hr />

          <h4>Need help?</h4>
          <p>Include relevant details in your description so our team can assist you faster.</p>
        </aside>
      </div>
    </AppShell>
  )
}

export default CreateTicketPage
