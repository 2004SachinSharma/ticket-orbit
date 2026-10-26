import { useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import AppShell from '../components/layout/AppShell/AppShell.jsx'
import { getNavItems } from '../components/layout/AppShell/navItems.js'
import Button from '../components/ui/Button/Button.jsx'
import styles from './DashBoardPage.module.css'

const ROLE_COPY = {
  CUSTOMER: {
    heading: 'Track your support tickets',
    body: 'See the status of everything you have raised, or open a new ticket if something is still broken.',
    ctaLabel: 'Go to My Tickets',
    ctaPath: '/tickets',
  },
  AGENT: {
    heading: 'Your assigned queue',
    body: 'Jump into the tickets routed to you and keep the conversation moving.',
    ctaLabel: 'Go to Assigned Tickets',
    ctaPath: '/tickets/assigned',
  },
  ADMIN: {
    heading: 'Keep the queue balanced',
    body: 'Assign incoming tickets to agents and rebalance workload as it comes in.',
    ctaLabel: 'Go to Ticket Assignment',
    ctaPath: '/tickets/admin',
  },
}

function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const copy = ROLE_COPY[user?.role] || ROLE_COPY.CUSTOMER

  return (
    <AppShell navItems={getNavItems(user?.role)} activePath="/dashboard">
      <header className={styles.header}>
        <p className={styles.breadcrumb}>Workspace / Dashboard</p>
        <h1>Welcome, {user?.name}</h1>
        <p className={styles.subtitle}>{copy.heading}</p>
      </header>

      <section className={styles.card}>
        <p>{copy.body}</p>
        <Button variant="primary" onClick={() => navigate(copy.ctaPath)}>
          {copy.ctaLabel} →
        </Button>
      </section>
    </AppShell>
  )
}

export default DashboardPage
