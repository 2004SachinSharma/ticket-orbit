import {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'
import api from '../../api/axios.js'
import './MyTicketPage.css'
import {useAuth} from "../../auth/AuthContext.jsx";
import TicketOrbitLogo from "../../components/logo.jsx";

function MyTicketsPage() {
    const navigate = useNavigate()
    const {user} = useAuth()

    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const [pageNumber, setPageNumber] = useState(0)
    const [pageSize] = useState(3)
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortDir, setSortDir] = useState('desc')
    const [totalPages, setTotalPages] = useState(0)
    const [totalElements, setTotalElements] = useState(0)
    const [search, setSearch] = useState('')

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
                        sortDir
                    },
                })
console.log(response.data)
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
    }, [pageNumber, pageSize, sortBy, sortDir])

    const filteredTickets = tickets.filter((ticket) => {
        const query = search.toLowerCase()

        return (
            ticket.subject?.toLowerCase().includes(query) ||
            String(ticket.id).includes(query) ||
            ticket.categoryName?.toLowerCase().includes(query)
        )
    })

    const formatDate = (date) => {
        if (!date) return '—'

        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        })
    }

    const getStatusClass = (status) => {
        switch (status) {
            case 'OPEN':
                return 'status-open'
            case 'IN_PROGRESS':
                return 'status-progress'
            case 'WAITING_FOR_CUSTOMER':
                return 'status-waiting'
            case 'RESOLVED':
                return 'status-resolved'
            case 'CLOSED':
                return 'status-closed'
            case 'ASSIGNED':
                return 'status-assigned'
            default:
                return ''
        }
    }

    const getPriorityClass = (priority) => {
        return `priority-${priority?.toLowerCase() || 'medium'}`
    }

    const formatLabel = (value) =>
        value?.replaceAll('_', ' ') || '—'

    const startItem = totalElements === 0
        ? 0
        : pageNumber * pageSize + 1

    const endItem = Math.min(
        (pageNumber + 1) * pageSize,
        totalElements
    )

    return (
        <div className="tickets-layout">
            <aside className="tickets-sidebar">
                <div className="tickets-brand">
                <TicketOrbitLogo />
                    <span>TicketOrbit</span>
                </div>

                <p className="sidebar-label">WORKSPACE</p>

                <button className="sidebar-link active">
                    <span>▤</span> My Tickets
                </button>

                <button
                    className="sidebar-link"
                    onClick={() => navigate('/tickets/new')}
                >
                    <span>＋</span> Create Ticket
                </button>

                <div className="sidebar-bottom">
                    <div className="sidebar-avatar">{user?.name[0]}</div>
                    <div className="sidebar-user">
                        <strong>My Account</strong>
                        <span style={{
                            color: "skyblue",
                            fontSize: 15,
                            borderRadius: "20px",
                        }}>{user?.name}</span>
                    </div>
                </div>
            </aside>

            <main className="tickets-main">
                <header className="tickets-header">
                    <div>
                        <p className="breadcrumb">Workspace / My Tickets</p>
                        <h1>My Tickets</h1>
                        <p className="page-subtitle">
                            Track and manage your support requests.
                        </p>
                    </div>

                    <button
                        className="create-ticket-btn"
                        onClick={() => navigate('/tickets/new')}
                    >
                        + New Ticket
                    </button>
                </header>

                <section className="tickets-stats">
                    <div className="stat-card">
                        <span className="stat-label">Total Tickets</span>
                        <strong>{totalElements}</strong>
                        <span className="stat-description">Your support requests</span>
                    </div>

                    <div className="stat-card">
                        <span className="stat-label">Current Page</span>
                        <strong>{totalPages === 0 ? 0 : pageNumber + 1}</strong>
                        <span className="stat-description">
                  Of {totalPages} pages
                </span>
                    </div>
                </section>

                <section className="tickets-card">
                    <div className="tickets-card-header">
                        <div>
                            <h2>All Tickets</h2>
                            <p>View and track your submitted tickets.</p>
                        </div>

                        <input
                            className="ticket-search"
                            type="search"
                            placeholder="Search tickets..."
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                        />
                    </div>

                    <div className="tickets-toolbar">
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

                    {loading ? (
                        <div className="tickets-message">Loading tickets...</div>
                    ) : error ? (
                        <div className="tickets-message error-message">
                            {error}
                            <button onClick={() => setPageNumber((page) => page)}>
                                Retry
                            </button>
                        </div>
                    ) : filteredTickets.length === 0 ? (
                        <div className="tickets-empty">
                            <div className="empty-icon">▤</div>
                            <h3>
                                {search ? 'No matching tickets' : 'No tickets yet'}
                            </h3>
                            <p>
                                {search
                                    ? 'Try a different search term.'
                                    : 'Create a ticket if you need help from our support team.'}
                            </p>

                            {!search && (
                                <button
                                    className="create-ticket-btn"
                                    onClick={() => navigate('/tickets/new')}
                                >
                                    + Create your first ticket
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="tickets-table-wrapper">
                            <table className="tickets-table">
                                <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>Category</th>
                                    <th>Priority</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Action</th>
                                </tr>
                                </thead>

                                <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>
                                            <div className="ticket-subject">
                                                <strong>{ticket.subject}</strong>
                                                <span>#{ticket.id}</span>
                                            </div>
                                        </td>

                                        <td>{ticket.categoryName || '—'}</td>

                                        <td>
                            <span className={`priority-badge ${getPriorityClass(ticket.priority)}`}>
                              {formatLabel(ticket.priority)}
                            </span>
                                        </td>

                                        <td>
                            <span className={`status-badge ${getStatusClass(ticket.status)}`}>
                              {formatLabel(ticket.status)}
                            </span>
                                        </td>

                                        <td>{formatDate(ticket.createdAt)}</td>

                                        <td>
                                            <button
                                                className="view-ticket-btn"
                                                onClick={() => {
                                                    if (ticket?.id) {
                                                        navigate(`/tickets/${ticket.id}`);
                                                        console.log(ticket.id);
                                                    } else {
                                                        console.error("Ticket ID missing hai!", ticket);
                                                    }
                                                }}
                                            >
                                                View →
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {!loading && !error && totalPages > 0 && (
                        <footer className="tickets-pagination">
                  <span>
                    Showing {startItem}–{endItem} of {totalElements} tickets
                  </span>

                            <div className="pagination-buttons">
                                <button
                                    disabled={pageNumber === 0}
                                    onClick={() => setPageNumber((page) => page - 1)}
                                >
                                    Previous
                                </button>

                                <span>
                      Page {pageNumber + 1} of {totalPages}
                    </span>

                                <button
                                    disabled={pageNumber >= totalPages - 1}
                                    onClick={() => setPageNumber((page) => page + 1)}
                                >
                                    Next
                                </button>
                            </div>
                        </footer>
                    )}
                </section>
            </main>
        </div>
    )
}

export default MyTicketsPage