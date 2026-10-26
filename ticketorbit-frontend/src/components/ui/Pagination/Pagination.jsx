import styles from './Pagination.module.css'
import Button from '../Button/Button.jsx'

function Pagination({ pageNumber, totalPages, totalElements, pageSize, onChange }) {
  if (totalPages === 0) return null

  const startItem = totalElements === 0 ? 0 : pageNumber * pageSize + 1
  const endItem = Math.min((pageNumber + 1) * pageSize, totalElements)

  return (
    <footer className={styles.pagination}>
      <span>
        Showing {startItem}–{endItem} of {totalElements}
      </span>

      <div className={styles.buttons}>
        <Button
          variant="secondary"
          size="sm"
          disabled={pageNumber === 0}
          onClick={() => onChange(pageNumber - 1)}
        >
          Previous
        </Button>

        <span className={styles.pageOf}>
          Page {pageNumber + 1} of {totalPages}
        </span>

        <Button
          variant="secondary"
          size="sm"
          disabled={pageNumber >= totalPages - 1}
          onClick={() => onChange(pageNumber + 1)}
        >
          Next
        </Button>
      </div>
    </footer>
  )
}

export default Pagination
