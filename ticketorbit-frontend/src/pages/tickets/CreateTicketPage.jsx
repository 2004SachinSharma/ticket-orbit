import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios.js'
import './CreateTicketPage.css'
import TicketOrbitLogo from "../../components/Logo/Logo.jsx";

function CreateTicketPage() {
    const navigate = useNavigate()

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

        setForm((previous) => ({
            ...previous,
            [name]: value,
        }))
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
        <div className="create-ticket-layout">
            <aside className="create-ticket-sidebar">
                <TicketOrbitLogo />

                <p>WORKSPACE</p>

                <button onClick={() => navigate('/tickets')}>
                    My Tickets
                </button>

                <button className="active">
                    + Create Ticket
                </button>
            </aside>

            <main className="create-ticket-main">
                <header className="create-ticket-header">
                    <div>
                        <p>Workspace / Create Ticket</p>
                        <h1>Create a Ticket</h1>
                        <span>
              Describe your issue and our support team will help you.
            </span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/tickets')}
                    >
                        Cancel
                    </button>
                </header>

                <div className="create-ticket-content">
                    <section className="create-ticket-form-card">
                        <h2>Ticket Information</h2>
                        <p>Fields marked with * are required.</p>

                        {error && (
                            <div className="create-ticket-error" role="alert">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="form-field">
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

                            <div className="form-row">
                                <div className="form-field">
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
                                            {loadingCategories
                                                ? 'Loading categories...'
                                                : 'Select category'}
                                        </option>

                                        {categories.map((category) => (
                                            <option
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-field">
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

                            <div className="form-field">
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

                                <small>
                                    Please provide enough detail to help us understand your issue.
                                </small>
                            </div>

                            <div className="create-ticket-actions">
                                <button
                                    type="button"
                                    onClick={() => navigate('/tickets')}
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={submitting || loadingCategories}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Ticket →'}
                                </button>
                            </div>
                        </form>
                    </section>

                    <aside className="create-ticket-help-card">
                        <h3>What happens next?</h3>

                        <div className="help-step">
                            <span>1</span>
                            <div>
                                <strong>Ticket submitted</strong>
                                <p>Your request is added to our support queue.</p>
                            </div>
                        </div>

                        <div className="help-step">
                            <span>2</span>
                            <div>
                                <strong>Team review</strong>
                                <p>Our team reviews and assigns your ticket.</p>
                            </div>
                        </div>

                        <div className="help-step">
                            <span>3</span>
                            <div>
                                <strong>Resolution</strong>
                                <p>Track updates and replies from My Tickets.</p>
                            </div>
                        </div>

                        <hr />

                        <h4>Need help?</h4>
                        <p>Include relevant details in your description so our team can assist you faster.</p>
                    </aside>
                </div>
            </main>
        </div>
    )
}

export default CreateTicketPage