export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string; // 使用 Lucide 图标名称
  color: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  date: string;
  note?: string;
}

export interface UserState {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}
