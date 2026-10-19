import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import './TicketDetailPage.css'
import {useAuth} from "../../auth/AuthContext.jsx";
import TicketOrbitLogo from "../../components/logo.jsx";

function TicketDetailPage() {
    const { ticketId } = useParams()
    const navigate = useNavigate()
    const {user} = useAuth()

    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    useEffect(() => {
        const fetchTicket = async () => {
            setLoading(true)
            setError('')

            try {
                const response = await api.get(`/api/v1/tickets/${ticketId}`)
                setTicket(response.data)
            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    'Ticket load nahi ho paya.'
                )
            } finally {
                setLoading(false)
            }
        }
console.log("llllloooo",ticketId)
        fetchTicket()
    }, [ticketId])

    const formatDate = (date) => {
        if (!date) return '—'

        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        })
    }

    const formatLabel = (value) =>
        value?.replaceAll('_', ' ') || '—'

    if (loading) {
        return <div style={{ padding: '32px' }}>Loading ticket...</div>
    }

    if (error || !ticket) {
        return (
            <div style={{ padding: '32px' }}>
                <p role="alert">{error || 'Ticket not found.'}</p>
                <button onClick={() => navigate('/tickets')}>
                    Back to My Tickets
                </button>
            </div>
        )
    }

    return (
        <div className="ticket-detail-layout">
            <aside className="ticket-detail-sidebar">
                <TicketOrbitLogo />
                <p>WORKSPACE</p>

                <button onClick={() => navigate('/tickets')}>
                    My Tickets
                </button>

                <button onClick={() => navigate('/tickets/new')}>
                    + Create Ticket
                </button>
            </aside>

            <main className="ticket-detail-main">
                <button
                    className="ticket-back-button"
                    onClick={() => navigate('/tickets')}
                >
                    ← Back to My Tickets
                </button>

                <header className="ticket-detail-header">
                    <div>
                        <p className="ticket-breadcrumb">
                            Workspace / My Tickets / #{ticket.id}
                        </p>

                        <h1>{ticket.subject}</h1>

                        <p className="ticket-detail-subtitle">
                            Ticket #{ticket.id} · Created {formatDate(ticket.createdAt)}
                        </p>
                    </div>

                    <span className={`detail-status status-${ticket.status?.toLowerCase()}`}>
            {formatLabel(ticket.status)}
          </span>
                </header>

                <div className="ticket-detail-grid">
                    <section className="ticket-conversation-card">
                        <div className="ticket-section-heading">
                            <h2>Ticket Description</h2>
                            <span>Original request</span>
                        </div>

                        <div className="ticket-description">
                            {ticket.description}
                        </div>

                        <div className="ticket-created-note">
                            <span className="ticket-user-avatar">{user?.name[0]}</span>

                            <div>
                                <strong>Submitted by you</strong>
                                <p>{formatDate(ticket.createdAt)}</p>
                            </div>
                        </div>

                        <div className="ticket-info-notice">
                            <strong>Need to add more information?</strong>
                            <p>
                                Conversation replies will be available once the ticket
                                messaging feature is implemented.
                            </p>
                        </div>
                    </section>

                    <aside className="ticket-details-card">
                        <h2>Ticket Details</h2>

                        <div className="ticket-detail-field">
                            <span>Ticket ID</span>
                            <strong>#{ticket.id}</strong>
                        </div>

                        <div className="ticket-detail-field">
                            <span>Category</span>
                            <strong>{ticket.categoryName || '—'}</strong>
                        </div>

                        <div className="ticket-detail-field">
                            <span>Priority</span>
                            <strong className={`detail-priority priority-${ticket.priority?.toLowerCase()}`}>
                                {formatLabel(ticket.priority)}
                            </strong>
                        </div>

                        <div className="ticket-detail-field">
                            <span>Status</span>
                            <strong>{formatLabel(ticket.status)}</strong>
                        </div>

                        <div className="ticket-detail-field">
                            <span>Created</span>
                            <strong>{formatDate(ticket.createdAt)}</strong>
                        </div>

                        <div className="ticket-detail-field">
                            <span>Last Updated</span>
                            <strong>{formatDate(ticket.updatedAt)}</strong>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}

export default TicketDetailPage