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

function MyTicketsPage() {
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

  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [categoryId, setCategoryId] = useState('')

  const [categories, setCategories] = useState([])

  useEffect(() => {
    const fetchTickets = async () => {
      setLoading(true)
      setError('')

      try {
        const response = await api.get('/api/v1/tickets', {
          params: {
            pageNumber,
            pageSize,
            sortBy,
            sortDir,
            ...(status && { status }),
            ...(priority && { priority }),
            ...(categoryId && { categoryId }),
          },
        })

        setTickets(response.data.content ?? [])
        setTotalPages(response.data.totalPages ?? 0)
        setTotalElements(response.data.totalElements ?? 0)
      } catch (err) {
        setError(
          err.response?.data?.message ||
            'Tickets could not be loaded. Please try again.'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchTickets()
  }, [pageNumber, pageSize, sortBy, sortDir, status, priority, categoryId])

  // Client-side filter over the loaded page only — the backend doesn't
  // have a search param yet (that's Day 23), so this only narrows what's
  // already fetched, not the full result set.
  const filteredTickets = useMemo(() => {
    const query = search.toLowerCase()
    return tickets.filter(
      (ticket) =>
        ticket.subject?.toLowerCase().includes(query) ||
        String(ticket.id).includes(query) ||
        ticket.categoryName?.toLowerCase().includes(query)
    )
  }, [tickets, search])

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/v1/categories')

        const data = response.data
        const categoryList = Array.isArray(data)
            ? data
            : data?.content ?? []

        setCategories(categoryList)
      } catch (err) {
        console.error('Failed to load categories:', err)
      }
    }

    fetchCategories()
  }, [])

  return (
    <AppShell navItems={getNavItems(user?.role)} activePath="/tickets">
      <header className={styles.header}>
        <div>
          <p className={styles.breadcrumb}>Workspace / My Tickets</p>
          <h1>My Tickets</h1>
          <p className={styles.subtitle}>Track and manage your support requests.</p>
        </div>

        <Button variant="primary" onClick={() => navigate('/tickets/new')}>
          + New Ticket
        </Button>
      </header>

      <section className={styles.stats}>
        <StatCard label="Total Tickets" value={totalElements} description="Your support requests" />
        <StatCard
          label="Current Page"
          value={totalPages === 0 ? 0 : pageNumber + 1}
          description={`Of ${totalPages} pages`}
        />
      </section>

      <section className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h2>All Tickets</h2>
            <p>View and track your submitted tickets.</p>
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
              Category
              <select
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value)
                    setPageNumber(0)
                  }}
              >
                <option value="">All Categories</option>

                {categories.map((category) => (
                    <option key={category.id} value={String(category.id)}>
                      {category.name}
                    </option>
                ))}
              </select>
            </label>

            <label>
              Priority
              <select
                  value={priority}
                  onChange={(event) => {
                    setPriority(event.target.value)
                    setPageNumber(0)
                  }}
              >
                <option value="">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">CRITICAL</option>
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
                <option value="">All Statuses</option>
                <option value="OPEN">Open</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="WAITING_FOR_CUSTOMER">Waiting For Customer</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>

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
          <Spinner label="Loading tickets..." />
        ) : error ? (
          <div className={styles.message}>
            <Alert variant="error">{error}</Alert>
            <Button variant="secondary" size="sm" onClick={() => setPageNumber((page) => page)}>
              Retry
            </Button>
          </div>
        ) : filteredTickets.length === 0 ? (
          <EmptyState
            title={search ? 'No matching tickets' : 'No tickets yet'}
            description={
              search
                ? 'Try a different search term.'
                : 'Create a ticket if you need help from our support team.'
            }
            action={
              !search && (
                <Button variant="primary" onClick={() => navigate('/tickets/new')}>
                  + Create your first ticket
                </Button>
              )
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

export default MyTicketsPage
