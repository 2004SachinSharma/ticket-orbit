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

const STATUSES = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'CLOSED',
]

const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

function AgentTicketsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tickets, setTickets] = useState([])
  const [categories, setCategories] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [categoryError, setCategoryError] = useState('')

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

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryError('')
        const response = await api.get('/api/v1/categories')
        const data = response.data
        // Support either a plain array or a Spring Page-style response.
        setCategories(Array.isArray(data) ? data : (data.content ?? []))
      } catch (err) {
        setCategoryError(
            err.response?.data?.message || 'Categories could not be loaded.',
        )
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchAssignedTickets = async () => {
      setLoading(true)
      setError('')

      try {
        // GET /tickets is scoped by the backend to the authenticated agent.
        const response = await api.get('/api/v1/tickets', {
          params: {
            pageNumber,
            pageSize,
            sortBy,
            sortDir,
            ...(status && { status }),
            ...(priority && { priority }),
            ...(categoryId && { categoryId }),
            ...(search && { q: search }),
            ...(from && { from: `${from}T00:00:00` }),
            ...(to && { to: `${to}T23:59:59` }),
          },
        })

        setTickets(response.data.content ?? [])
        setTotalPages(response.data.totalPages ?? 0)
        setTotalElements(response.data.totalElements ?? 0)
      } catch (err) {
        setError(
            err.response?.data?.message ||
            'Assigned tickets could not be loaded. Please try again.',
        )
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedTickets()
  }, [pageNumber, pageSize, sortBy, sortDir, status, priority, categoryId, search, from, to])

  const resetPageAndSetFilter = (setter, value) => {
    setter(value)
    setPageNumber(0)
  }

  return (
      <AppShell navItems={getNavItems(user?.role)} activePath="/tickets/assigned">
        <header className={styles.header}>
          <div>
            <p className={styles.breadcrumb}>Workspace / Assigned Tickets</p>
            <h1>Assigned Tickets</h1>
            <p className={styles.subtitle}>
              Tickets routed to you, newest activity first.
            </p>
          </div>
        </header>

        <section className={styles.stats}>
          <StatCard
              label="Total Assigned"
              value={totalElements}
              description="Matching the selected filters"
          />
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
            <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPageNumber(0) }}
                className={styles.date}
            />
            <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPageNumber(0) }}
                className={styles.date}
            />
          </div>

          <div className={styles.toolbar}>
            <div className={styles.toolbarGroup}>

              <label>
                Category
                <select
                    value={categoryId}
                    onChange={(event) =>
                        resetPageAndSetFilter(setCategoryId, event.target.value)
                    }
                >
                  <option value="">All categories</option>
                  {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                  ))}
                </select>
              </label>

              <label>
                Priority
                <select
                    value={priority}
                    onChange={(event) =>
                        resetPageAndSetFilter(setPriority, event.target.value)
                    }
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
                    onChange={(event) =>
                        resetPageAndSetFilter(setStatus, event.target.value)
                    }
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

          {categoryError && (
              <div className={styles.message}>
                <Alert variant="error">{categoryError}</Alert>
              </div>
          )}

          {loading ? (
              <Spinner label="Loading assigned tickets..." />
          ) : error ? (
              <div className={styles.message}>
                <Alert variant="error">{error}</Alert>
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPageNumber((page) => page)}
                >
                  Retry
                </Button>
              </div>
          ) : tickets.length === 0 ? (
              <EmptyState
                  title={search ? 'No matching tickets' : 'Nothing assigned to you yet'}
                  description={
                    search
                        ? 'Try a different search term or adjust the filters.'
                        : 'New tickets will show up here once an admin assigns them to you.'
                  }
              />
          ) : (
              <TicketTable
                  tickets={tickets}
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
