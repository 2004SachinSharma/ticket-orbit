import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../auth/AuthContext.jsx'
import AppShell from '../../components/layout/AppShell/AppShell.jsx'
import { getNavItems } from '../../components/layout/AppShell/navItems.js'
import Badge from '../../components/ui/Badge/Badge.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Spinner from '../../components/ui/Spinner/Spinner.jsx'
import Alert from '../../components/ui/Alert/Alert.jsx'
import StatusActions from '../../components/tickets/StatusActions/StatusActions.jsx'
import styles from './TicketDetailPage.module.css'

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

function TicketDetailPage() {
  const { ticketId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()


  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [messages, setMessages] = useState([])
  const [messagesLoading, setMessagesLoading] = useState(true)
  const [messageError, setMessageError] = useState('')
  const [messageBody, setMessageBody] = useState('')
  const [messageType, setMessageType] = useState('PUBLIC')
  const [sending, setSending] = useState(false)
  console.log(messages)


  const [priorityUpdating, setPriorityUpdating] = useState(false)
  const [priorityError, setPriorityError] = useState('')
  useEffect(() => {
    const fetchTicket = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get(`/api/v1/tickets/${ticketId}`)
        setTicket(response.data)
      } catch (err) {
        setError(err.response?.data?.message || 'Ticket could not be loaded.')
      } finally {
        setLoading(false)
      }
    }

    fetchTicket()
  }, [ticketId])

  useEffect(() => {
    const fetchMessages = async () => {
      setMessagesLoading(true)
      setMessageError('')

      try {
        const response = await api.get(`/api/v1/tickets/${ticketId}/messages`)
        setMessages(response.data)
      } catch (err) {
        setMessageError(err.response?.data?.message || 'Messages could not be loaded.')
      } finally {
        setMessagesLoading(false)
      }
    }

    if (ticketId) {
      fetchMessages()
    }
  }, [ticketId])

  const handleSendMessage = async (event) => {
    event.preventDefault()
    if (!messageBody.trim()) return

    setSending(true)
    setMessageError('')

    try {
      const response = await api.post(`/api/v1/tickets/${ticketId}/messages`, {
        body: messageBody.trim(),
        type: messageType,
      })

      setMessages((previous) => [...previous, response.data])
      setMessageBody('')
    } catch (err) {
      setMessageError(err.response?.data?.message || 'Message could not be sent.')
    } finally {
      setSending(false)
    }
  }
const handlePriorityChange = async (event) => {
  const newPriority = event.target.value

  if (!newPriority || newPriority === ticket.priority) return

  setPriorityUpdating(true)
  setPriorityError('')

  try {
    const response = await api.patch(
      `/api/v1/tickets/${ticketId}/priority`,
  { priority: newPriority },
)

  setTicket((previous) => ({
    ...previous,
    ...response.data,
  }))
} catch (err) {
  setPriorityError(
      err.response?.data?.message || 'Priority could not be updated.',
  )
} finally {
  setPriorityUpdating(false)
}
}


  if (loading) {
    return (
      <AppShell navItems={getNavItems(user?.role)} activePath="">
        <Spinner label="Loading ticket..." />
      </AppShell>
    )
  }

  if (error || !ticket) {
    return (
      <AppShell navItems={getNavItems(user?.role)} activePath="">
        <Alert variant="error">{error || 'Ticket not found.'}</Alert>
        <Button variant="secondary" onClick={() => navigate('/tickets')}>
          Back
        </Button>
      </AppShell>
    )
  }

  return (
    <AppShell navItems={getNavItems(user?.role)} activePath="">
      <Button variant="ghost" size="sm" className={styles.backButton} onClick={() => navigate(-1)}>
        ← Back
      </Button>

      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Workspace / Tickets / #{ticket.id}</p>
          <h1>{ticket.subject}</h1>
          <p className={styles.subtitle}>
            Ticket #{ticket.id} · Created {formatDate(ticket.createdAt)}
          </p>
        </div>

        <Badge kind="status" value={ticket.status} />
      </header>

      <div className={styles.grid}>
        <section className={styles.conversationCard}>
          <div className={styles.sectionHeading}>
            <h2>Ticket Description</h2>
            <span>Original request</span>
          </div>

          <div className={styles.description}>{ticket.description}</div>

          <div className={styles.messagesSection}>
            <div className={styles.sectionHeading}>
              <h2>Conversation</h2>
              <span>{messages.length} messages</span>
            </div>

            {messagesLoading ? (
              <Spinner label="Loading messages..." />
            ) : messageError && messages.length === 0 ? (
              <Alert variant="error">{messageError}</Alert>
            ) : messages.length === 0 ? (
              <p className={styles.mutedText}>No messages yet. Start the conversation below.</p>
            ) : (
              <div className={styles.messagesList}>
                {messages.map((message) => (
                  <article className={message?.role === user?.role ? styles.messageYou: styles.message} key={message.id}>
                    <div className={styles.profileLetter}>{message?.senderName[0]}</div>
                    <div className={styles.messageHeader}>
                      <strong>{message?.role === user?.role ? 'You'  :  message?.senderName + '(' + message.role +')'}</strong>
                      <span>{formatDate(message.createdAt)}</span>
                    </div>

                    {message.type === 'INTERNAL_NOTE' && (
                      <span className={styles.internalNoteLabel}>Internal Note</span>
                    )}

                    <p>{message.body}</p>
                  </article>
                ))}
              </div>
            )}

            {messageError && messages.length > 0 && <Alert variant="error">{messageError}</Alert>}

            <form onSubmit={handleSendMessage} className={styles.messageForm}>
              <label htmlFor="messageBody">Your message</label>

              <textarea
                id="messageBody"
                value={messageBody}
                onChange={(event) => setMessageBody(event.target.value)}
                placeholder="Write your reply..."
                rows={4}
                maxLength={5000}
                required
              />

              {(user?.role === 'AGENT' || user?.role === 'ADMIN') && (
                <div className={styles.messageTypeField}>
                  <label htmlFor="messageType">Message type</label>
                  <select
                    id="messageType"
                    value={messageType}
                    onChange={(event) => setMessageType(event.target.value)}
                  >
                    <option value="PUBLIC">Public Reply</option>
                    <option value="INTERNAL_NOTE">Internal Note</option>
                  </select>
                </div>
              )}

              <Button type="submit" variant="primary" disabled={sending || !messageBody.trim()}>
                {sending ? 'Sending...' : 'Send Message'}
              </Button>
            </form>
          </div>
        </section>

        <aside className={styles.detailsCard}>
          <h2>Ticket Details</h2>

          <div className={styles.detailField}>
            <span>Ticket ID</span>
            <strong>#{ticket.id}</strong>
          </div>

          <div className={styles.detailField}>
            <span>Category</span>
            <strong>{ticket.categoryName || '—'}</strong>
          </div>


          <div className={styles.detailField}>
            <span>Priority</span>

            {user?.role === 'ADMIN' || user?.role === 'AGENT' ? (
                <select
                    className={styles.prioritySelect}
                    value={ticket.priority}
                    onChange={handlePriorityChange}
                    disabled={priorityUpdating}
                    aria-label="Ticket priority">

                  <option value="LOW" >Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">CRITICAL</option>
                </select>
            ) : (
                <Badge kind="priority" value={ticket.priority} />
            )}
          </div>

          {priorityError && (
              <Alert variant="error">{priorityError}</Alert>
          )}



          <div className={styles.detailField}>
            <span>Status</span>
            <Badge kind="status" value={ticket.status} />
          </div>

          {ticket.assignedToName !== undefined && (
            <div className={styles.detailField}>
              <span>Assigned to</span>
              <strong>{ticket.assignedToName || 'Unassigned'}</strong>
            </div>
          )}

          <div className={styles.detailField}>
            <span>Created</span>
            <strong>{formatDate(ticket.createdAt)}</strong>
          </div>

          <div className={styles.detailField}>
            <span>Last Updated</span>
            <strong>{formatDate(ticket.updatedAt)}</strong>
          </div>

          <StatusActions ticket={ticket} role={user?.role} onUpdated={setTicket} />
        </aside>
      </div>
    </AppShell>
  )
}

export default TicketDetailPage
