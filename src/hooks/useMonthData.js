import { useMemo } from 'react'
import { useStorage } from './useStorage'

export function useMonthData(year, month) {
  const [transactions] = useStorage('penny_transactions', [])
  const [budgets] = useStorage('penny_budgets', {})
  const [incomes] = useStorage('penny_incomes', [])

  return useMemo(() => {
    const key = `${year}-${String(month).padStart(2, '0')}`

    const monthTx = transactions.filter(tx => tx.date?.startsWith(key))
    const expenses = monthTx.filter(tx => tx.type === 'expense')
    const incomesTx = monthTx.filter(tx => tx.type === 'income')

    const totalSpent = expenses.reduce((s, t) => s + (t.amount || 0), 0)
    const totalIncome = incomesTx.reduce((s, t) => s + (t.amount || 0), 0)
    const remaining = totalIncome - totalSpent

    const byCategory = {}
    expenses.forEach(tx => {
      byCategory[tx.category] = (byCategory[tx.category] || 0) + tx.amount
    })

    const budgetKey = key
    const monthBudgets = budgets[budgetKey] || budgets['default'] || {}

    return { monthTx, expenses, incomesTx, totalSpent, totalIncome, remaining, byCategory, monthBudgets }
  }, [transactions, budgets, incomes, year, month])
}
