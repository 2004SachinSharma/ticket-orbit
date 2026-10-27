import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios.js'
import { useAuth } from '../auth/AuthContext.jsx'
import AppShell from '../components/layout/AppShell/AppShell.jsx'
import { getNavItems } from '../components/layout/AppShell/navItems.js'
import StatCard from '../components/ui/StatCard/StatCard.jsx'
import Spinner from '../components/ui/Spinner/Spinner.jsx'
import Alert from '../components/ui/Alert/Alert.jsx'
import EmptyState from '../components/ui/EmptyState/EmptyState.jsx'
import Button from '../components/ui/Button/Button.jsx'
import Pagination from '../components/ui/Pagination/Pagination.jsx'
import TicketTable from '../components/tickets/TicketTable/TicketTable.jsx'
import listStyles from './tickets/TicketListPage.module.css'
import styles from './AdminTicketAssignmentPage.module.css'

const TICKETS_ENDPOINT = '/api/v1/tickets'
const AGENTS_ENDPOINT = '/api/v1/users?role=AGENT'
const assignTicketEndpoint = (ticketId) => `/api/v1/tickets/${ticketId}/assign`

const STATUSES = [
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_FOR_CUSTOMER',
  'RESOLVED',
  'CLOSED',
]
const PRIORITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']

const resolveAgentIdByName = (assignedToName, agentList) => {
  if (!assignedToName || !agentList.length) return ''
  const found = agentList.find((a) => (a.name || a.fullName) === assignedToName)
  return found ? String(found.id) : ''
}

function AdminTicketAssignmentPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [tickets, setTickets] = useState([])
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [error, setError] = useState('')
  const [agentsError, setAgentsError] = useState('')
  const [success, setSuccess] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [priorityFilter, setPriorityFilter] = useState('ALL')
  const [categoryIdFilter, setCategoryIdFilter] = useState('ALL')
  const [categories, setCategories] = useState([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [categoriesError, setCategoriesError] = useState('')
  const [assignmentDrafts, setAssignmentDrafts] = useState({})
  const [savingTicketId, setSavingTicketId] = useState(null)

  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize] = useState(10)
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortDir, setSortDir] = useState('desc')
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchAgents = async () => {
    setAgentsLoading(true)
    setAgentsError('')
    try {
      const response = await api.get(AGENTS_ENDPOINT)
      const data = response.data
      const rows = Array.isArray(data) ? data : data?.content ?? data?.users ?? []
      const filteredAgents = rows.filter((agent) => !agent.role || agent.role === 'AGENT')
      setAgents(filteredAgents)
      return filteredAgents
    } catch (err) {
      setAgentsError(
          err.response?.data?.message || 'Agent list could not be loaded.'
      )
      return []
    } finally {
      setAgentsLoading(false)
    }
  }

  const fetchTickets = async (currentAgents = []) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(TICKETS_ENDPOINT, {
        params: {
          pageNumber,
          pageSize,
          sortBy,
          sortDir,
          ...(statusFilter !== 'ALL' && { status: statusFilter }),
          ...(priorityFilter !== 'ALL' && { priority: priorityFilter }),
          ...(categoryIdFilter !== 'ALL' && { categoryId: categoryIdFilter }),
          ...(search && { q: search }),
          ...(from && { from: `${from}T00:00:00` }),
          ...(to && { to: `${to}T23:59:59` }),
        },
      })

      const pageData = response.data
      const rows = pageData?.content ?? []

      setTickets(rows)
      setTotalPages(pageData?.totalPages ?? 0)
      setTotalElements(pageData?.totalElements ?? 0)

      setAssignmentDrafts((previous) => {
        const next = { ...previous }
        rows.forEach((ticket) => {
          next[ticket.id] = resolveAgentIdByName(ticket.assignedToName, currentAgents)
        })
        return next
      })
    } catch (err) {
      setError(
          err.response?.data?.message ||
          'Tickets could not be loaded. Check the backend connection and retry.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoriesError('')
        const response = await api.get('/api/v1/categories')
        const data = response.data
        setCategories(Array.isArray(data) ? data : data?.content ?? data?.categories ?? [])
      } catch (err) {
        setCategoriesError(
            err.response?.data?.message || 'Categories could not be loaded.',
        )
      }
    }

    fetchCategories()
  }, [])

  useEffect(() => {
    let isMounted = true
    const init = async () => {
      const loadedAgents = await fetchAgents()
      if (isMounted) {
        await fetchTickets(loadedAgents)
      }
    }
    init()
    return () => {
      isMounted = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNumber, sortBy, sortDir, statusFilter, priorityFilter, categoryIdFilter, search, from, to])

  const handleRefresh = async () => {
    const loadedAgents = await fetchAgents()
    await fetchTickets(loadedAgents)
  }

  const handleAssignmentChange = (ticketId, agentId) => {
    setAssignmentDrafts((previous) => ({ ...previous, [ticketId]: agentId }))
    setSuccess('')
    setError('')
  }

  const handleAssign = async (ticket) => {
    if (ticket.status === 'RESOLVED' || ticket.status === 'CLOSED') {
      setError(`Ticket #${ticket.id} is resolved/closed, it can't be reassigned.`)
      return
    }

    const agentId = assignmentDrafts[ticket.id]
    if (!agentId) {
      setError(`Select an agent for ticket #${ticket.id} first.`)
      setSuccess('')
      return
    }

    setSavingTicketId(ticket.id)
    setError('')
    setSuccess('')
    try {
      const res = await api.patch(assignTicketEndpoint(ticket.id), {
        agentId: Number(agentId),
      })

      const updatedAgent = agents.find((a) => String(a.id) === String(agentId))
      const updatedAgentName = updatedAgent?.name || updatedAgent?.fullName || 'Assigned Agent'

      setSuccess(`Ticket #${ticket.id} assigned successfully.`)

      setTickets((prevTickets) =>
          prevTickets.map((t) =>
              t.id === ticket.id
                  ? {
                    ...t,
                    assignedToName: res.data?.assignedToName || updatedAgentName,
                    status: res.data?.status || 'ASSIGNED',
                  }
                  : t
          )
      )
    } catch (err) {
      setError(err.response?.data?.message || `Ticket #${ticket.id} could not be assigned.`)
    } finally {
      setSavingTicketId(null)
    }
  }
  

  const unassignedCount = tickets.filter((ticket) => !ticket.assignedToName).length
  const assignedCount = tickets.length - unassignedCount

  const assignmentColumn = {
    header: 'Assign to Agent',
    render: (ticket) => {
      const initialAgentId = resolveAgentIdByName(ticket.assignedToName, agents)
      const selectedAgentId = assignmentDrafts[ticket.id] ?? initialAgentId
      const changed = String(selectedAgentId) !== String(initialAgentId) && selectedAgentId !== ''
      const saving = savingTicketId === ticket.id
      const isCompletedStatus = ticket.status === 'RESOLVED' || ticket.status === 'CLOSED'

      return (
          <div className={styles.assignmentControl}>
            <select
                className={styles.assignmentSelect}
                value={selectedAgentId}
                onChange={(event) => handleAssignmentChange(ticket.id, event.target.value)}
                disabled={agentsLoading || agents.length === 0 || saving || isCompletedStatus}
                aria-label={`Select agent for ticket ${ticket.id}`}
            >
              <option value="">
                {ticket.assignedToName ? ticket.assignedToName : 'Unassigned'}
              </option>
              {agents.map((agent) => (
                  <option key={agent.id} value={String(agent.id)}>
                    {agent.name || agent.fullName || agent.email || `Agent #${agent.id}`}
                  </option>
              ))}
            </select>

            <Button
                variant={changed && !isCompletedStatus ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => handleAssign(ticket)}
                disabled={!selectedAgentId || saving || agentsLoading || !changed || isCompletedStatus}
            >
              {saving ? 'Saving…' : isCompletedStatus ? 'Locked' : ticket.assignedToName ? 'Reassign' : 'Assign'}
            </Button>
          </div>
      )
    },
  }

  return (
      <AppShell navItems={getNavItems(user?.role)} activePath="/tickets/admin">
        <header className={listStyles.header}>
          <div>
            <p className={listStyles.breadcrumb}>Admin Workspace / Ticket Assignment</p>
            <h1>Ticket Assignment</h1>
            <p className={listStyles.subtitle}>
              Assign incoming support tickets or rebalance workload across agents.
            </p>
          </div>

          <Button variant="secondary" onClick={handleRefresh} disabled={loading || agentsLoading}>
            ↻ Refresh Data
          </Button>
        </header>

        <section className={listStyles.stats}>
          <StatCard label="Total Tickets" value={totalElements} description="System support requests" />
          <StatCard label="Assigned" value={assignedCount} description="On current page" tone="accent" />
          <StatCard label="Unassigned" value={unassignedCount} description="Need agent on this page" tone="warn" />
        </section>

        {success && <Alert variant="success">{success}</Alert>}
        {error && <Alert variant="error">{error}</Alert>}
        {agentsError && <Alert variant="error">{agentsError}</Alert>}
        {categoriesError && <Alert variant="error">{categoriesError}</Alert>}

        <section className={listStyles.card}>
          <div className={listStyles.cardHeader}>
            <div>
              <h2>All Tickets</h2>
              <p>Select an agent from the dropdown and save changes.</p>
            </div>
            <input
                className={listStyles.search}
                type="search"
                placeholder="Search by ID, subject, creator..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Search tickets"
            />
            <input
                type="date"
                value={from}
                onChange={(e) => { setFrom(e.target.value); setPageNumber(0) }}
                className={listStyles.date}
            />
            <input
                type="date"
                value={to}
                onChange={(e) => { setTo(e.target.value); setPageNumber(0) }}
                className={listStyles.date}

            />
          </div>

          <div className={listStyles.toolbar}>
            <div className={listStyles.toolbarGroup}>
              <label>
                Filter category
                <select
                    value={categoryIdFilter}
                    onChange={(event) => {
                      setCategoryIdFilter(event.target.value)
                      setPageNumber(0)
                    }}
                >
                  <option value="ALL">All Categories</option>
                  {categories.map((category) => (
                      <option key={category.id} value={String(category.id)}>
                        {category.name || category.categoryName || `Category #${category.id}`}
                      </option>
                  ))}
                </select>
              </label>

              <label>
                Filter priority
                <select
                    value={priorityFilter}
                    onChange={(event) => {
                      setPriorityFilter(event.target.value)
                      setPageNumber(0)
                    }}
                >
                  <option value="ALL">All Priorities</option>
                  {PRIORITIES.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                  ))}
                </select>
              </label>

              <label>
                Filter status
                <select
                    value={statusFilter}
                    onChange={(event) => {
                      setStatusFilter(event.target.value)
                      setPageNumber(0)
                    }}
                >
                  <option value="ALL">All Statuses</option>
                  {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll('_', ' ')}
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

            <span className={listStyles.resultCount}>
            Showing {tickets.length} of {tickets.length} on page
          </span>
          </div>

          {loading ? (
              <Spinner label="Loading support queue..." />
          ) : error && tickets.length === 0 ? (
              <div className={listStyles.message}>
                <Alert variant="error">{error}</Alert>
                <Button variant="secondary" size="sm" onClick={handleRefresh}>
                  Retry Connection
                </Button>
              </div>
          ) : tickets.length === 0 ? (
              <EmptyState
                  icon="🔍"
                  title="No matching tickets found"
                  description="Try resetting filters or search criteria."
              />
          ) : (
              <TicketTable
                  tickets={tickets}
                  onView={(ticket) => navigate(`/tickets/${ticket.id}`)}
                  subtitle={(ticket) => (ticket.createdByName ? `By ${ticket.createdByName}` : '')}
                  extraColumn={assignmentColumn}
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

export default AdminTicketAssignmentPage
