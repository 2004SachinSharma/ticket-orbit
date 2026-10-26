import styles from './StatCard.module.css'

function StatCard({ label, value, description, tone }) {
  return (
    <div className={`${styles.card} ${tone ? styles[tone] : ''}`}>
      <span className={styles.label}>{label}</span>
      <strong>{value}</strong>
      {description && <span className={styles.description}>{description}</span>}
    </div>
  )
}

export default StatCard
