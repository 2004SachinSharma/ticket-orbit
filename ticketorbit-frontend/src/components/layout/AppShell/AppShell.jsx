import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../auth/AuthContext.jsx'
import TicketOrbitLogo from '../../Logo/Logo.jsx'
import styles from './AppShell.module.css'

/**
 * Shared sidebar + content shell for every page behind login.
 * `navItems`: [{ label, icon, path, exact }] — rendered as sidebar links.
 * `activePath`: current route, used to highlight the active nav item.
 */
function AppShell({ navItems, activePath, children }) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login/public', { replace: true })
  }

  return (
    <div className={`to-app ${styles.shell}`}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <TicketOrbitLogo />
          <span>TicketOrbit</span>
        </div>

        <p className={styles.navLabel}>WORKSPACE</p>

        <nav className={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.path}
              type="button"
              className={`${styles.navLink} ${activePath === item.path ? styles.navLinkActive : ''}`}
              onClick={() => navigate(item.path)}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className={styles.sidebarBottom}>
          <div className={styles.avatar}>{user?.name?.[0] || '?'}</div>
          <div className={styles.userBlock}>
            <strong>{user?.name || 'Account'}</strong>
            <span>{user?.role || ''}</span>
          </div>
          <button
            type="button"
            className={styles.logoutButton}
            onClick={handleLogout}
            title="Log out"
            aria-label="Log out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </aside>

      <main className={styles.main}>{children}</main>
    </div>
  )
}

export default AppShell
