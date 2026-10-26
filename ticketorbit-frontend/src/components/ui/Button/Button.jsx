import styles from './Button.module.css'

/**
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size: 'md' | 'sm'
 */
function Button({ variant = 'secondary', size = 'md', className = '', ...rest }) {
  const classes = [styles.btn, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(' ')

  return <button className={classes} {...rest} />
}

export default Button
