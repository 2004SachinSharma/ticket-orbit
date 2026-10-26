import styles from './Badge.module.css'

const STATUS_CLASS = {
  OPEN: 'slate',
  ASSIGNED: 'slate',
  IN_PROGRESS: 'blue',
  WAITING_FOR_CUSTOMER: 'purple',
  RESOLVED: 'green',
  CLOSED: 'muted',
}

const PRIORITY_CLASS = {
  LOW: 'slate',
  MEDIUM: 'amber',
  HIGH: 'amber',
  CRITICAL: 'red',
}

const formatLabel = (value) => (value ? value.replaceAll('_', ' ') : '—')

/**
 * One badge component for both ticket status and priority — same
 * visual language, color picked by `kind` + `value`.
 */
function Badge({ kind, value }) {
  const tone = kind === 'priority' ? PRIORITY_CLASS[value] : STATUS_CLASS[value]

  return (
    <span className={`${styles.badge} ${styles[tone || 'slate']}`}>
      {formatLabel(value)}
    </span>
  )
}

export default Badge
