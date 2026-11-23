import { useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios.js'
import { useAuth } from '../../auth/AuthContext.jsx'
import AppShell from '../../components/layout/AppShell/AppShell.jsx'
import { getNavItems } from '../../components/layout/AppShell/navItems.js'
import StatCard from '../../components/ui/StatCard/StatCard.jsx'
import Spinner from '../../components/ui/Spinner/Spinner.jsx'
import Alert from '../../components/ui/Alert/Alert.jsx'
import EmptyState from '../../components/ui/EmptyState/EmptyState.jsx'
import Button from '../../components/ui/Button/Button.jsx'
import Pagination from '../../components/ui/Pagination/Pagination.jsx'
import TicketTable from '../../components/tickets/TicketTable/TicketTable.jsx'
import styles from './TicketListPage.module.css'

const STATUSES = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'RESOLVED', 'CLOSED']
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

/**
 * Read-only drill-down from AdminUserManagementPage: "View Tickets" on an
 * agent row lands here. Uses the admin-only `assignedTo` filter on
 * GET /tickets (built Day 22) — no new backend endpoint required.
 * Reassigning still happens on AdminTicketAssignmentPage, not here.
 */
function AdminAgentTicketsPage() {
  const navigate = useNavigate()
  const { agentId } = useParams()
  const location = useLocation()
  const { user } = useAuth()

  const agentName = location.state?.agentName || `Agent #${agentId}`

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize] = useState(10)
  const [sortDir, setSortDir] = useState('desc')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  useEffect(() => {
    const fetchAgentTickets = async () => {
      setLoading(true)
      setError('')
      try {
        const response = await api.get('/api/v1/tickets', {
          params: {
            assignedTo: agentId,
            pageNumber,
            pageSize,
            sortBy: 'createdAt',
            sortDir,
            ...(status && { status }),
            ...(priority && { priority }),
          },
        })

        setTickets(response.data.content ?? [])
        setTotalPages(response.data.totalPages ?? 0)
        setTotalElements(response.data.totalElements ?? 0)
      } catch (err) {
        setError(err.response?.data?.message || `Tickets for ${agentName} could not be loaded.`)
      } finally {
        setLoading(false)
      }
    }

    fetchAgentTickets()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agentId, pageNumber, pageSize, sortDir, status, priority])

  return (
    <AppShell navItems={getNavItems(user?.role)} activePath="/admin/users">
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Admin Workspace / User Management / {agentName}</p>
          <h1>{agentName}'s Assigned Tickets</h1>
          <p className={styles.subtitle}>
            Read-only view — reassign tickets from the Ticket Assignment page.
          </p>
        </div>

        <Button variant="secondary" onClick={() => navigate('/admin/users')}>
          ← Back to Users
        </Button>
      </header>

      <section className={styles.stats}>
        <StatCard label="Total Assigned" value={totalElements} description="Matching the selected filters" />
        <StatCard
          label="Current Page"
          value={totalPages === 0 ? 0 : pageNumber + 1}
          description={`Of ${totalPages} pages`}
        />
      </section>

      {error && <Alert variant="error">{error}</Alert>}

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>Assigned Queue</h2>
            <p>Tickets currently assigned to {agentName}.</p>
          </div>
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <label>
              Priority
              <select
                value={priority}
                onChange={(event) => {
                  setPriority(event.target.value)
                  setPageNumber(0)
                }}
              >
                <option value="">All priorities</option>
                {PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Status
              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPageNumber(0)
                }}
              >
                <option value="">All statuses</option>
                {STATUSES.map((item) => (
                  <option key={item} value={item}>
                    {item.replaceAll('_', ' ')}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Sort order
              <select
                value={sortDir}
                onChange={(event) => {
                  setSortDir(event.target.value)
                  setPageNumber(0)
                }}
              >
                <option value="desc">Newest first</option>
                <option value="asc">Oldest first</option>
              </select>
            </label>
          </div>
        </div>

        {loading ? (
          <Spinner label="Loading assigned tickets..." />
        ) : error && tickets.length === 0 ? (
          <div className={styles.message}>
            <Alert variant="error">{error}</Alert>
            <Button variant="secondary" size="sm" onClick={() => setPageNumber((page) => page)}>
              Retry
            </Button>
          </div>
        ) : tickets.length === 0 ? (
          <EmptyState
            title="No tickets assigned"
            description={`${agentName} has no tickets matching these filters.`}
          />
        ) : (
          <TicketTable
            tickets={tickets}
            onView={(ticket) => navigate(`/tickets/${ticket.id}`)}
            subtitle={(ticket) => (ticket.createdByName ? `By ${ticket.createdByName}` : '')}
          />
        )}

        {!loading && !error && (
          <Pagination
            pageNumber={pageNumber}
            totalPages={totalPages}
            totalElements={totalElements}
            pageSize={pageSize}
            onChange={setPageNumber}
          />
        )}
      </section>
    </AppShell>
  )
}

export default AdminAgentTicketsPage
