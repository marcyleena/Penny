export function formatCurrency(amount, currency = 'USD') {
  const symbols = {
    USD: '$', GBP: '£', EUR: '€', CAD: 'C$', AUD: 'A$',
    ZAR: 'R', NGN: '₦',
  }
  const sym = symbols[currency] || currency + ' '
  const abs = Math.abs(Number(amount) || 0)
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return (amount < 0 ? '-' : '') + sym + formatted
}

export function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatShortDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatMonth(year, month) {
  const d = new Date(year, month - 1, 1)
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
}

export function todayISO() {
  return new Date().toISOString().split('T')[0]
}

export function monthYear() {
  const d = new Date()
  return { month: d.getMonth() + 1, year: d.getFullYear() }
}
