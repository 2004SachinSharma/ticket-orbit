import {useEffect, useState} from 'react'
import {useNavigate, useParams} from 'react-router-dom'
import api from '../../api/axios'
import './TicketDetailPage.css'
import {useAuth} from "../../auth/AuthContext.jsx";
import TicketOrbitLogo from "../../components/Logo/logo.jsx";

function TicketDetailPage() {
    const {ticketId} = useParams()
    const navigate = useNavigate()
    const {user} = useAuth()

    const [ticket, setTicket] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')


    const [messages, setMessages] = useState([])
    const [messagesLoading, setMessagesLoading] = useState(true)
    const [messageError, setMessageError] = useState('')
    const [messageBody, setMessageBody] = useState('')
    const [messageType, setMessageType] = useState('PUBLIC')
    const [sending, setSending] = useState(false)

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
        console.log("llllloooo", ticketId)
        fetchTicket()
    }, [ticketId])

    useEffect(() => {
        const fetchMessages = async () => {
            setMessagesLoading(true)
            setMessageError('')

            try {
                const response = await api.get(
                    `/api/v1/tickets/${ticketId}/messages`
                )
                setMessages(response.data)
            } catch (err) {
                setMessageError(
                    err.response?.data?.message || 'Messages load nahi ho paye.'
                )
            } finally {
                setMessagesLoading(false)
            }
        }

        if (ticketId) {
            fetchMessages()
        }
    }, [ticketId])

    const handleSendMessage = async (e) => {
        e.preventDefault()

        if (!messageBody.trim()) return

        setSending(true)
        setMessageError('')

        try {
            const response = await api.post(
                `/api/v1/tickets/${ticketId}/messages`,
                {
                    body: messageBody.trim(),
                    type: messageType,
                }
            )

            setMessages((previous) => [...previous, response.data])
            setMessageBody('')
        } catch (err) {
            setMessageError(
                err.response?.data?.message || 'Message send nahi ho paya.'
            )
        } finally {
            setSending(false)
        }
    }
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
        return <div style={{padding: '32px'}}>Loading ticket...</div>
    }

    if (error || !ticket) {
        return (
            <div style={{padding: '32px'}}>
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
                <TicketOrbitLogo/>
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
                        <div className="ticket-messages-section">
                            <div className="ticket-section-heading">
                                <h2>Conversation</h2>
                                <span>{messages.length} messages</span>
                            </div>

                            {messagesLoading ? (
                                <p>Loading messages...</p>
                            ) : messageError && messages.length === 0 ? (
                                <p role="alert">{messageError}</p>
                            ) : messages.length === 0 ? (
                                <p>No messages yet. Start the conversation below.</p>
                            ) : (
                                <div className="ticket-messages-list">
                                    {messages.map((message) => (
                                        <article className="ticket-message" key={message.id}>
                                            <div className="ticket-message-header">
                                                <strong>{message.senderName}</strong>
                                                <span>{formatDate(message.createdAt)}</span>
                                            </div>

                                            {message.type === 'INTERNAL_NOTE' && (
                                                <span className="internal-note-label">
                            Internal Note
                        </span>
                                            )}

                                            <p>{message.body}</p>
                                        </article>
                                    ))}
                                </div>
                            )}

                            {messageError && messages.length > 0 && (
                                <p role="alert">{messageError}</p>
                            )}

                            <form onSubmit={handleSendMessage} className="ticket-message-form">
                                <label htmlFor="messageBody">Your message</label>

                                <textarea
                                    id="messageBody"
                                    value={messageBody}
                                    onChange={(e) => setMessageBody(e.target.value)}
                                    placeholder="Write your reply..."
                                    rows={4}
                                    maxLength={5000}
                                    required
                                />

                                {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
                                    <div>
                                        <label htmlFor="messageType">Message type</label>
                                        <select
                                            id="messageType"
                                            value={messageType}
                                            onChange={(e) => setMessageType(e.target.value)}
                                        >
                                            <option value="PUBLIC">Public Reply</option>
                                            <option value="INTERNAL_NOTE">Internal Note</option>
                                        </select>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={sending || !messageBody.trim()}
                                >
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
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