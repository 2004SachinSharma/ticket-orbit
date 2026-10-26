// Sidebar nav items per role, shared by every page using AppShell.
export function getNavItems(role) {
  const items = [{ label: 'Dashboard', icon: '▦', path: '/dashboard' }]

  if (role === 'CUSTOMER') {
    items.push(
      { label: 'My Tickets', icon: '▤', path: '/tickets' },
      { label: 'Create Ticket', icon: '＋', path: '/tickets/new' }
    )
  }

  if (role === 'AGENT') {
    items.push({ label: 'Assigned Tickets', icon: '▤', path: '/tickets/assigned' })
  }

  if (role === 'ADMIN') {
    items.push({ label: 'Ticket Assignment', icon: '⇄', path: '/tickets/admin' })
  }

  return items
}
