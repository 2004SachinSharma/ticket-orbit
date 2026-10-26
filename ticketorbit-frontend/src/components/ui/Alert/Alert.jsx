import styles from './Alert.module.css'

/** variant: 'error' | 'success' */
function Alert({ variant = 'error', children, action }) {
  if (!children) return null

  return (
    <div className={`${styles.alert} ${styles[variant]}`} role={variant === 'error' ? 'alert' : 'status'}>
      <span>{children}</span>
      {action}
    </div>
  )
}

export default Alert
