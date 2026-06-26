export type Category = {
  id: string;
  name: string;
  categoryId: string;
  limitAmount: number;
  spent: number;
  pct: number;
};

export type TransactionCategory = {
  name: string;
  spent: number;
};

export type BudgetSummary = {
  totalSpent: number;
  totalBudget: number;
  budgetEnabled: boolean;
  remaining: number;
  returns: number;
  owes: number;
  categories: Category[];
  transactionCategories: TransactionCategory[];
};