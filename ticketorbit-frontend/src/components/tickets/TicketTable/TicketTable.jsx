import styles from './TicketTable.module.css'
import Badge from '../../ui/Badge/Badge.jsx'
import Button from '../../ui/Button/Button.jsx'

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * One reusable ticket list table, used by MyTicketsPage, AgentTicketPage
 * and AdminTicketAssignmentPage instead of each page having its own copy.
 *
 * - `subtitle(ticket)`: optional small text under the subject (e.g. "By <customer>" for admin).
 * - `extraColumn`: optional { header, render(ticket) } for a column before "Created"
 *   (used by the admin page for the agent-assignment control).
 */
function TicketTable({ tickets, onView, subtitle, extraColumn }) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Category</th>
            <th>Priority</th>
            <th>Status</th>
            {extraColumn && <th>{extraColumn.header}</th>}
            <th>Created</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {tickets.map((ticket) => (
            <tr key={ticket.id}>
              <td>
                <div className={styles.subject}>
                  <strong>{ticket.subject || 'Untitled ticket'}</strong>
                  <span>
                    #{ticket.id}
                    {subtitle ? ` · ${subtitle(ticket)}` : ''}
                  </span>
                </div>
              </td>

              <td>{ticket.categoryName || '—'}</td>

              <td>
                <Badge kind="priority" value={ticket.priority} />
              </td>

              <td>
                <Badge kind="status" value={ticket.status} />
              </td>

              {extraColumn && <td>{extraColumn.render(ticket)}</td>}

              <td>{formatDate(ticket.createdAt)}</td>

              <td>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onView(ticket)}
                >
                  View →
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default TicketTable
