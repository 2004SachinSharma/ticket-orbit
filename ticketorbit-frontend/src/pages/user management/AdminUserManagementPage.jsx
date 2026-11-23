import { useEffect, useState } from 'react'
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
import listStyles from '../tickets/TicketListPage.module.css'
import styles from './AdminUserManagementPage.module.css'

const USERS_ENDPOINT = '/api/v1/admin/users'
const toggleActiveEndpoint = (id) => `/api/v1/admin/users/${id}/active`
const updateRoleEndpoint = (id) => `/api/v1/admin/users/${id}/role`

/**
 * Admin-only page: manage AGENT and ADMIN accounts.
 * - Tabs switch the mandatory `role` query param (backend only accepts
 *   one role at a time for GET /admin/users).
 * - Role change and active-toggle call the two separate PATCH endpoints
 *   (Day 33 backend: /active and /role are split, not one combined PATCH).
 * - An agent row's "View Tickets" button drills into their assigned-ticket
 *   queue via the existing admin-only `assignedTo` filter on GET /tickets
 *   (built Day 22) — no new backend endpoint needed for that.
 */
function AdminUserManagementPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [roleTab, setRoleTab] = useState('AGENT') // 'AGENT' | 'ADMIN'
  const [activeFilter, setActiveFilter] = useState('ALL') // 'ALL' | 'true' | 'false'
  const [sortDir, setSortDir] = useState('asc')

  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [pageNumber, setPageNumber] = useState(0)
  const [pageSize] = useState(10)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const [roleDrafts, setRoleDrafts] = useState({})
  const [savingUserId, setSavingUserId] = useState(null)

  const fetchUsers = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(USERS_ENDPOINT, {
        params: {
          role: roleTab,
          pageNumber,
          pageSize,
          sortDir,
          ...(activeFilter !== 'ALL' && { active: activeFilter }),
        },
      })

      const pageData = response.data
      const rows = pageData?.content ?? []
      setUsers(rows)
      setTotalPages(pageData?.totalPages ?? 0)
      setTotalElements(pageData?.totalElements ?? 0)
      setRoleDrafts((previous) => {
        const next = { ...previous }
        rows.forEach((row) => {
          next[row.id] = row.role
        })
        return next
      })
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Users could not be loaded. Check the backend connection and retry.'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleTab, activeFilter, sortDir, pageNumber])

  const handleTabChange = (tab) => {
    if (tab === roleTab) return
    setRoleTab(tab)
    setPageNumber(0)
    setSuccess('')
    setError('')
  }

  const handleRoleDraftChange = (userId, role) => {
    setRoleDrafts((previous) => ({ ...previous, [userId]: role }))
    setSuccess('')
    setError('')
  }

  const handleRoleSave = async (targetUser) => {
    const newRole = roleDrafts[targetUser.id]
    if (newRole === targetUser.role) return

    const confirmed = window.confirm(
      `Change ${targetUser.name}'s role from ${targetUser.role} to ${newRole}?`
    )
    if (!confirmed) return

    setSavingUserId(targetUser.id)
    setError('')
    setSuccess('')
    try {
      await api.patch(updateRoleEndpoint(targetUser.id), { role: newRole })
      setSuccess(`${targetUser.name}'s role updated to ${newRole}.`)
      // The user now belongs to the other role tab, so refetch this tab's list.
      await fetchUsers()
    } catch (err) {
      setError(err.response?.data?.message || `Could not update ${targetUser.name}'s role.`)
      setRoleDrafts((previous) => ({ ...previous, [targetUser.id]: targetUser.role }))
    } finally {
      setSavingUserId(null)
    }
  }

  const handleToggleActive = async (targetUser) => {
    const nextActive = !targetUser.active
    const action = nextActive ? 'activate' : 'deactivate'
    const confirmed = window.confirm(`Are you sure you want to ${action} ${targetUser.name}?`)
    if (!confirmed) return

    setSavingUserId(targetUser.id)
    setError('')
    setSuccess('')
    try {
      const res = await api.patch(toggleActiveEndpoint(targetUser.id), { active: nextActive })
      setUsers((previous) =>
        previous.map((row) =>
          row.id === targetUser.id ? { ...row, active: res.data?.active ?? nextActive } : row
        )
      )
      setSuccess(`${targetUser.name} ${nextActive ? 'activated' : 'deactivated'}.`)
    } catch (err) {
      setError(err.response?.data?.message || `Could not update ${targetUser.name}'s status.`)
    } finally {
      setSavingUserId(null)
    }
  }

  const activeCount = users.filter((row) => row.active).length
  const inactiveCount = users.length - activeCount

  return (
    <AppShell navItems={getNavItems(user?.role)} activePath="/admin/users">
      <header className={listStyles.header}>
        <div>
          <p className={listStyles.breadcrumb}>Admin Workspace / User Management</p>
          <h1>User Management</h1>
          <p className={listStyles.subtitle}>
            Manage agent and admin accounts — activate, deactivate, promote or demote.
          </p>
        </div>

        <Button variant="secondary" onClick={fetchUsers} disabled={loading}>
          ↻ Refresh
        </Button>
      </header>

      <section className={listStyles.stats}>
        <StatCard label="Total" value={totalElements} description={`${roleTab}s in the system`} />
        <StatCard label="Active (this page)" value={activeCount} tone="accent" />
        <StatCard label="Inactive (this page)" value={inactiveCount} tone="warn" />
      </section>

      {success && <Alert variant="success">{success}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      <section className={listStyles.card}>
        <div className={listStyles.cardHeader}>
          <div>
            <h2>All {roleTab === 'AGENT' ? 'Agents' : 'Admins'}</h2>
            <p>Switch tabs to manage the other role.</p>
          </div>

          <div className={styles.tabs}>
            <button
              type="button"
              className={`${styles.tab} ${roleTab === 'AGENT' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('AGENT')}
            >
              Agents
            </button>
            <button
              type="button"
              className={`${styles.tab} ${roleTab === 'ADMIN' ? styles.tabActive : ''}`}
              onClick={() => handleTabChange('ADMIN')}
            >
              Admins
            </button>
          </div>
        </div>

        <div className={listStyles.toolbar}>
          <div className={listStyles.toolbarGroup}>
            <label>
              Status
              <select
                value={activeFilter}
                onChange={(event) => {
                  setActiveFilter(event.target.value)
                  setPageNumber(0)
                }}
              >
                <option value="ALL">All</option>
                <option value="true">Active only</option>
                <option value="false">Inactive only</option>
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
                <option value="asc">Oldest first</option>
                <option value="desc">Newest first</option>
              </select>
            </label>
          </div>

          <span className={listStyles.resultCount}>
            Showing {users.length} of {totalElements}
          </span>
        </div>

        {loading ? (
          <Spinner label="Loading users..." />
        ) : error && users.length === 0 ? (
          <div className={listStyles.message}>
            <Alert variant="error">{error}</Alert>
            <Button variant="secondary" size="sm" onClick={fetchUsers}>
              Retry Connection
            </Button>
          </div>
        ) : users.length === 0 ? (
          <EmptyState
            icon="👤"
            title={`No ${roleTab.toLowerCase()}s found`}
            description="Try switching tabs or clearing the status filter."
          />
        ) : (
          <div className={styles.wrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((targetUser) => {
                  const isSelf = targetUser.id === user?.id
                  const draftRole = roleDrafts[targetUser.id] ?? targetUser.role
                  const roleChanged = draftRole !== targetUser.role
                  const saving = savingUserId === targetUser.id

                  return (
                    <tr key={targetUser.id}>
                      <td>
                        <div className={styles.userCell}>
                          <strong>{targetUser.name}</strong>
                          <span>{targetUser.email}</span>
                        </div>
                      </td>

                      <td>
                        <div className={styles.roleControl}>
                          <select
                            className={styles.roleSelect}
                            value={draftRole}
                            onChange={(event) => handleRoleDraftChange(targetUser.id, event.target.value)}
                            disabled={isSelf || saving}
                            aria-label={`Change role for ${targetUser.name}`}
                            title={isSelf ? "You can't change your own role" : ''}
                          >
                            <option value="AGENT">AGENT</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>

                          {roleChanged && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleRoleSave(targetUser)}
                              disabled={saving}
                            >
                              {saving ? 'Saving…' : 'Save'}
                            </Button>
                          )}
                        </div>
                      </td>

                      <td>
                        <div className={styles.statusControl}>
                          <button
                            type="button"
                            className={`${styles.toggle} ${targetUser.active ? styles.toggleOn : ''}`}
                            onClick={() => handleToggleActive(targetUser)}
                            disabled={isSelf || saving}
                            aria-pressed={targetUser.active}
                            aria-label={`${targetUser.active ? 'Deactivate' : 'Activate'} ${targetUser.name}`}
                            title={isSelf ? "You can't change your own status" : ''}
                          >
                            <span className={styles.toggleThumb} />
                          </button>
                          <span className={styles.statusLabel}>
                            {targetUser.active ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </td>

                      <td>
                        {targetUser.role === 'AGENT' ? (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() =>
                              navigate(`/tickets/admin/agent/${targetUser.id}`, {
                                state: { agentName: targetUser.name },
                              })
                            }
                          >
                            View Tickets →
                          </Button>
                        ) : (
                          <span className={styles.noAction}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
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

export default AdminUserManagementPage
