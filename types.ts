export type TransactionType = 'income' | 'expense';
export type DebtType = 'credit_card' | 'loan' | 'mortgage' | 'other';
export type Category = 'Housing' | 'Food' | 'Transpo' | 'Load/Data' | 'Luho' | 'Health' | 'Salary' | 'Side Hustle' | 'Investment' | 'Bills' | 'Other';

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: Category;
}

export interface DebtPayment {
  id: string;
  date: string;
  amount: number;
  remainingBalance: number;
}

export interface Debt {
  id: string;
  name: string;
  balance: number;
  initialBalance: number;
  apr: number;
  minPayment: number;
  type: DebtType;
  payments: DebtPayment[];
}

export interface FinancialState {
  transactions: Transaction[];
  debts: Debt[];
  savingsBalance: number;
}

export interface AiAnalysisResult {
  score: number;
  summary: string;
  actionItems: string[];
}