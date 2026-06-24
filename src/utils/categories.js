export const DEFAULT_CATEGORIES = [
  // Fixed Needs
  'Rent/Mortgage', 'Utilities', 'Insurance', 'Phone', 'Internet',
  'Subscriptions', 'Transport/Car', 'Loan Payments',
  // Variable Needs
  'Groceries', 'Fuel', 'Healthcare', 'Childcare', 'Personal hygiene',
  // Beauty and Maintenance
  'Hair', 'Nails', 'Skincare and makeup', 'Waxing and brow care', 'Beauty appointments',
  // Wellness
  'Gym/fitness', 'Yoga/pilates', 'Therapy/counseling', 'Supplements and vitamins',
  // Clothing and Styling
  'Clothes', 'Shoes', 'Accessories', 'Alterations and tailoring',
  // Goals
  'Emergency fund', 'Savings goals', 'Debt payoff', 'Investing',
  // Fun
  'Dining out', 'Entertainment', 'Travel', 'Gifts', 'Shopping',
  // Family
  'School fees', 'Kids activities', 'Family expenses',
  // Business
  'Business expenses', 'Tools and software', 'Education and courses', 'Marketing',
]

export const CATEGORY_GROUPS = {
  'Fixed Needs': ['Rent/Mortgage', 'Utilities', 'Insurance', 'Phone', 'Internet', 'Subscriptions', 'Transport/Car', 'Loan Payments'],
  'Variable Needs': ['Groceries', 'Fuel', 'Healthcare', 'Childcare', 'Personal hygiene'],
  'Beauty and Maintenance': ['Hair', 'Nails', 'Skincare and makeup', 'Waxing and brow care', 'Beauty appointments'],
  'Wellness': ['Gym/fitness', 'Yoga/pilates', 'Therapy/counseling', 'Supplements and vitamins'],
  'Clothing and Styling': ['Clothes', 'Shoes', 'Accessories', 'Alterations and tailoring'],
  'Goals': ['Emergency fund', 'Savings goals', 'Debt payoff', 'Investing'],
  'Fun': ['Dining out', 'Entertainment', 'Travel', 'Gifts', 'Shopping'],
  'Family': ['School fees', 'Kids activities', 'Family expenses'],
  'Business': ['Business expenses', 'Tools and software', 'Education and courses', 'Marketing'],
}

export const FOUR_BUCKETS = {
  'Fixed Needs': ['Rent/Mortgage', 'Utilities', 'Insurance', 'Phone', 'Internet', 'Subscriptions', 'Transport/Car', 'Loan Payments'],
  'Variable Needs': ['Groceries', 'Fuel', 'Healthcare', 'Childcare', 'Personal hygiene', 'Hair', 'Nails', 'Skincare and makeup', 'Waxing and brow care', 'Beauty appointments', 'Gym/fitness', 'Yoga/pilates', 'Therapy/counseling', 'Supplements and vitamins'],
  'Goals': ['Emergency fund', 'Savings goals', 'Debt payoff', 'Investing'],
  'Fun': ['Dining out', 'Entertainment', 'Travel', 'Gifts', 'Shopping', 'Clothes', 'Shoes', 'Accessories', 'Alterations and tailoring', 'School fees', 'Kids activities', 'Family expenses'],
}

export const BUCKET_COLORS = {
  'Fixed Needs': '#7C3AED',
  'Variable Needs': '#0D9488',
  'Goals': '#EC4899',
  'Fun': '#F59E0B',
}

export function bucketForCategory(cat) {
  for (const [bucket, cats] of Object.entries(FOUR_BUCKETS)) {
    if (cats.includes(cat)) return bucket
  }
  return 'Variable Needs'
}
