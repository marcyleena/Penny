export function calcBudgetProgress(budget, spent) {
  if (!budget || budget <= 0) return 0
  return Math.min((spent / budget) * 100, 100)
}

export function calcStatus(budget, spent) {
  if (!budget || budget <= 0) return 'ok'
  const pct = (spent / budget) * 100
  if (pct >= 100) return 'over'
  if (pct >= 80) return 'near'
  return 'ok'
}

export function calcDebtPayoff(balance, rate, minPayment, extra = 0) {
  if (!balance || balance <= 0) return { months: 0, totalInterest: 0, payoffDate: null }
  const monthly = (rate / 100) / 12
  const payment = minPayment + extra
  if (monthly === 0) {
    const months = Math.ceil(balance / payment)
    const d = new Date()
    d.setMonth(d.getMonth() + months)
    return { months, totalInterest: 0, payoffDate: d }
  }
  let bal = balance
  let months = 0
  let totalInterest = 0
  while (bal > 0 && months < 600) {
    const interest = bal * monthly
    totalInterest += interest
    bal = bal + interest - payment
    months++
    if (bal < 0) bal = 0
  }
  const d = new Date()
  d.setMonth(d.getMonth() + months)
  return { months, totalInterest, payoffDate: d }
}

export function calcSinkingFund(target, current, targetDate) {
  if (!targetDate) return 0
  const now = new Date()
  const end = new Date(targetDate)
  const months = Math.max(1,
    (end.getFullYear() - now.getFullYear()) * 12 + (end.getMonth() - now.getMonth())
  )
  return Math.max(0, (target - current) / months)
}

export function snowballOrder(debts) {
  return [...debts].sort((a, b) => a.balance - b.balance)
}

export function avalancheOrder(debts) {
  return [...debts].sort((a, b) => b.rate - a.rate)
}
