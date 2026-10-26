import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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

function AgentTicketsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize] = useState(5)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      setLoading(true)
      setError('')

      try {
        // Same endpoint as MyTicketsPage. GET /tickets is auto-scoped by
        // role on the backend — an AGENT calling this only gets tickets
        // assigned to them, no separate "assigned" endpoint needed.
        const response = await api.get('/api/v1/tickets', {
          params: { pageNumber, pageSize, sortBy, sortDir },
        })

        setTickets(response.data.content ?? [])
        setTotalPages(response.data.totalPages ?? 0)
        setTotalElements(response.data.totalElements ?? 0)
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Assigned tickets could not be loaded. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedTickets()
  }, [pageNumber, pageSize, sortBy, sortDir])

  // Client-side filter over the loaded page only — no server-side search
  // param exists yet (Day 23), same limitation as MyTicketsPage.
  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase()
    return tickets.filter(
      (ticket) =>
        ticket.subject?.toLowerCase().includes(query) ||
        String(ticket.id).includes(query) ||
        ticket.categoryName?.toLowerCase().includes(query)
    )
  }, [tickets, search])

  return (
    <AppShell navItems={getNavItems(user?.role)} activePath="/tickets/assigned">
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Workspace / Assigned Tickets</p>
          <h1>Assigned Tickets</h1>
          <p className={styles.subtitle}>Tickets routed to you, newest activity first.</p>
        </div>
      </header>

      <section className={styles.stats}>
        <StatCard label="Total Assigned" value={totalElements} description="Across all statuses" />
        <StatCard
          label="Current Page"
          value={totalPages === 0 ? 0 : pageNumber + 1}
          description={`Of ${totalPages} pages`}
        />
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>My Queue</h2>
            <p>Tickets currently assigned to you.</p>
          </div>

          <input
            className={styles.search}
            type="search"
            placeholder="Search tickets..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        <div className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <label>
              Sort by
              <select
                value={sortBy}
                onChange={(event) => {
                  setSortBy(event.target.value)
                  setPageNumber(0)
                }}
              >
                <option value="createdAt">Created date</option>
                <option value="updatedAt">Updated date</option>
                <option value="subject">Subject</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
              </select>
            </label>

            <label>
              Direction
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
        ) : error ? (
          <div className={styles.message}>
            <Alert variant="error">{error}</Alert>
            <Button variant="secondary" size="sm" onClick={() => setPageNumber((page) => page)}>
              Retry
            </Button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            title={search ? 'No matching tickets' : 'Nothing assigned to you yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'New tickets will show up here once an admin assigns them to you.'
            }
          />
        ) : (
          <TicketTable
            tickets={filteredTickets}
            onView={(ticket) => navigate(`/tickets/${ticket.id}`)}
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

export default AgentTicketsPage
