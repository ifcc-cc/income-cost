export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Asset {
  id: string;
  name: string;
  type: 'bank' | 'stock' | 'fund' | 'cash' | 'other';
  balance: number;
  icon?: string;
  color?: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  date: string;
  note?: string;
  assetId?: string;
  asset?: Asset;
}

export interface UserState {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
}
