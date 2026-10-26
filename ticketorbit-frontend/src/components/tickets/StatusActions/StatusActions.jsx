import { useState } from 'react'
import api from '../../../api/axios.js'
import Button from '../../ui/Button/Button.jsx'
import Alert from '../../ui/Alert/Alert.jsx'
import styles from './StatusActions.module.css'

// Mirrors TicketStatus.ALLOWED_TRANSITIONS on the backend. The
// OPEN -> ASSIGNED move is deliberately left out here: that one needs an
// agentId and happens on the admin assignment page, not this generic
// status PATCH.
const STAFF_TRANSITIONS = {
  ASSIGNED: ['IN_PROGRESS'],
  IN_PROGRESS: ['WAITING_FOR_CUSTOMER', 'RESOLVED'],
  WAITING_FOR_CUSTOMER: ['IN_PROGRESS'],
}

const STATUS_LABEL = {
  IN_PROGRESS: 'Move to In Progress',
  WAITING_FOR_CUSTOMER: 'Waiting on Customer',
  RESOLVED: 'Mark Resolved',
}

/**
 * Role- and current-status-aware action buttons for a ticket:
 * - AGENT/ADMIN: legal next statuses from STAFF_TRANSITIONS, via
 *   PATCH /tickets/{id}/status
 * - CUSTOMER: Close / Reopen, via POST /tickets/{id}/close|reopen,
 *   only ever legal from RESOLVED.
 *
 * On a 409 (illegal transition) the backend's own message is shown
 * as-is, not reworded.
 */
function StatusActions({ ticket, role, onUpdated }) {
  const [busyAction, setBusyAction] = useState('')
  const [error, setError] = useState('')

  const runAction = async (actionKey, request) => {
    setBusyAction(actionKey)
    setError('')

    try {
      const response = await request()
      onUpdated(response.data)
    } catch (err) {
      setError(err.response?.data?.message || 'Action could not be completed.')
    } finally {
      setBusyAction('')
    }
  }

  if (role === 'CUSTOMER') {
    if (ticket.status !== 'RESOLVED') return null

    return (
      <div className={styles.actions}>
        {error && <Alert variant="error">{error}</Alert>}
        <div className={styles.buttonRow}>
          <Button
            variant="primary"
            size="sm"
            disabled={busyAction !== ''}
            onClick={() =>
              runAction('close', () => api.post(`/api/v1/tickets/${ticket.id}/close`))
            }
          >
            {busyAction === 'close' ? 'Closing…' : 'Close Ticket'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            disabled={busyAction !== ''}
            onClick={() =>
              runAction('reopen', () => api.post(`/api/v1/tickets/${ticket.id}/reopen`))
            }
          >
            {busyAction === 'reopen' ? 'Reopening…' : 'Reopen Ticket'}
          </Button>
        </div>
      </div>
    )
  }

  if (role === 'AGENT' || role === 'ADMIN') {
    const nextStatuses = STAFF_TRANSITIONS[ticket.status] || []
    if (nextStatuses.length === 0) return null

    return (
      <div className={styles.actions}>
        {error && <Alert variant="error">{error}</Alert>}
        <div className={styles.buttonRow}>
          {nextStatuses.map((status) => (
            <Button
              key={status}
              variant={status === 'RESOLVED' ? 'primary' : 'secondary'}
              size="sm"
              disabled={busyAction !== ''}
              onClick={() =>
                runAction(status, () =>
                  api.patch(`/api/v1/tickets/${ticket.id}/status`, { status })
                )
              }
            >
              {busyAction === status ? 'Updating…' : STATUS_LABEL[status]}
            </Button>
          ))}
        </div>
      </div>
    )
  }

  return null
}

export default StatusActions
