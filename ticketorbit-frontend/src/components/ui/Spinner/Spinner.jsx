import styles from './Spinner.module.css'

function Spinner({ label }) {
  return (
    <div className={styles.wrap}>
      <span className={styles.spinner} aria-hidden="true" />
      {label && <span>{label}</span>}
    </div>
  )
}

export default Spinner
