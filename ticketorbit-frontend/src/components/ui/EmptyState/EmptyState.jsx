import styles from './EmptyState.module.css'

function EmptyState({ icon = '▤', title, description, action }) {
  return (
    <div className={styles.empty}>
      <div className={styles.icon}>{icon}</div>
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {action}
    </div>
  )
}

export default EmptyState
