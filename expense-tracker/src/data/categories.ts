import { Category } from "../types";

// 支出分类
export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: '餐饮', icon: '🍜', color: '#FF9500' },
  { id: 'shopping', name: '购物', icon: '🛍️', color: '#FF2D55' },
  { id: 'transport', name: '交通', icon: '🚕', color: '#007AFF' },
  { id: 'daily', name: '日用', icon: '🏠', color: '#5856D6' },
  { id: 'entertainment', name: '娱乐', icon: '🎮', color: '#AF52DE' },
  { id: 'medical', name: '医疗', icon: '🏥', color: '#FF3B30' },
  { id: 'education', name: '教育', icon: '📚', color: '#5AC8FA' },
  { id: 'social', name: '社交', icon: '🥂', color: '#FFCC00' },
  { id: 'other-expense', name: '其他', icon: '💸', color: '#8E8E93' },
];

// 收入分类
export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: '工资', icon: '💰', color: '#34C759' },
  { id: 'part-time', name: '兼职', icon: '🔨', color: '#00C7BE' },
  { id: 'investment', name: '理财', icon: '📈', color: '#30B0C7' },
  { id: 'gift', name: '礼金', icon: '🧧', color: '#FF3B30' },
  { id: 'bonus', name: '奖金', icon: '💎', color: '#AF52DE' },
  { id: 'other-income', name: '其他', icon: '✨', color: '#8E8E93' },
];

// 默认导出全部供统计页使用（暂时兼容）
export const CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];