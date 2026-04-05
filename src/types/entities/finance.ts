export type FinanceTransactionType = 'income' | 'expenses';

export interface FinanceTransaction {
  transaction_id: string;
  type: FinanceTransactionType;
  description: string;
  amount: number;
  transaction_date: string;
  timestamp: string;
}

export interface FinanceReportData {
  total_income: number;
  total_expense: number;
  current_balance: number;
  transactions: FinanceTransaction[];
}
