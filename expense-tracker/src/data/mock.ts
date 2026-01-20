import { Transaction, UserState } from "../types";

export const MOCK_USER: UserState = {
  balance: 12580.00,
  monthlyIncome: 8500.00,
  monthlyExpense: 3245.50,
};

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: '1',
    amount: 32.00,
    type: 'expense',
    categoryId: 'food',
    categoryName: '餐饮美食',
    date: '2026-01-19T12:30:00',
    note: '午餐牛肉面'
  },
  {
    id: '2',
    amount: 1500.00,
    type: 'income',
    categoryId: 'salary',
    categoryName: '兼职收入',
    date: '2026-01-18T18:00:00',
  },
  {
    id: '3',
    amount: 299.00,
    type: 'expense',
    categoryId: 'shopping',
    categoryName: '购物消费',
    date: '2026-01-18T14:20:00',
    note: '优衣库'
  },
  {
    id: '4',
    amount: 45.00,
    type: 'expense',
    categoryId: 'transport',
    categoryName: '交通出行',
    date: '2026-01-17T09:15:00',
    note: '打车去公司'
  },
  {
    id: '5',
    amount: 6800.00,
    type: 'income',
    categoryId: 'salary',
    categoryName: '工资',
    date: '2026-01-15T10:00:00',
  },
];
