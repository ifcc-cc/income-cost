import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Check, Edit3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { TransactionType } from '@/types';

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function AddTransaction({ isOpen, onClose, onSave }: AddTransactionProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  
  // 根据类型决定当前显示的分类列表
  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const [selectedCategory, setSelectedCategory] = useState(currentCategories[0]);

  // 当类型改变时，重置选中的分类为当前列表的第一个
  useEffect(() => {
    setSelectedCategory(currentCategories[0]);
  }, [type]);

  // 关闭时重置状态
  useEffect(() => {
    if (!isOpen) {
      setAmount('0');
      setNote('');
      setType('expense');
    }
  }, [isOpen]);

  const handleNumberClick = (num: string) => {
    if (amount === '0' && num !== '.') {
      setAmount(num);
    } else {
      if (num === '.' && amount.includes('.')) return;
      if (amount.includes('.') && amount.split('.')[1].length >= 2) return;
      setAmount(prev => prev + num);
    }
  };

  const handleDelete = () => {
    setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const handleSave = () => {
    const val = parseFloat(amount);
    if (val === 0) return;
    onSave({
      amount: val,
      type,
      category: selectedCategory,
      date: new Date().toISOString(),
      note: note.trim(), // 包含备注
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
        >
          {/* 顶部栏 */}
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 backdrop-blur-md z-10">
            <button onClick={onClose} className="p-2 -ml-2 text-slate-400 hover:text-slate-900 transition-colors">
              <X className="w-6 h-6" />
            </button>
            <div className="flex bg-slate-200 p-1 rounded-xl">
              <button 
                onClick={() => setType('expense')}
                className={cn(
                  "px-6 py-1.5 rounded-lg text-sm font-bold transition-all duration-200",
                  type === 'expense' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                支出
              </button>
              <button 
                onClick={() => setType('income')}
                className={cn(
                  "px-6 py-1.5 rounded-lg text-sm font-bold transition-all duration-200",
                  type === 'income' ? "bg-white text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                收入
              </button>
            </div>
            <div className="w-10" /> {/* 占位平衡 */}
          </div>

          {/* 金额与备注展示区 */}
          <div className="px-8 py-6 flex flex-col items-end justify-center bg-white border-b border-slate-100 shadow-sm relative z-0">
            <div className="flex items-center gap-2 mb-1">
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: selectedCategory.color }} 
              />
              <div className="text-sm font-medium text-slate-500">{selectedCategory.name}</div>
            </div>
            
            <div className="text-6xl font-bold tracking-tighter text-slate-900 mb-4">
              {amount}
            </div>

            {/* 备注输入框 */}
            <div className="w-full flex items-center gap-3 py-2 border-t border-slate-50">
               <Edit3 className="w-4 h-4 text-slate-400" />
               <input 
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="添加备注（选填）..."
                  className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-300 text-slate-700 caret-brand-500"
               />
            </div>
          </div>

          {/* 分类网格 - 可滚动 */}
          <div className="flex-1 overflow-y-auto px-6 py-6 bg-slate-50">
            <motion.div 
               key={type} // 加上 key 让切换时有淡入淡出效果
               initial={{ opacity: 0, y: 10 }}
               animate={{ opacity: 1, y: 0 }}
               transition={{ duration: 0.2 }}
               className="grid grid-cols-4 gap-y-6"
            >
              {currentCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat)}
                  className="flex flex-col items-center gap-2 group"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-300 shadow-sm",
                      selectedCategory.id === cat.id 
                        ? "shadow-lg scale-110 ring-2 ring-offset-2 ring-offset-slate-50 ring-transparent" 
                        : "bg-white grayscale-[1] opacity-70 group-hover:grayscale-0 group-hover:opacity-100"
                    )}
                    style={{ 
                      backgroundColor: selectedCategory.id === cat.id ? cat.color : undefined,
                      color: selectedCategory.id === cat.id ? 'white' : undefined 
                    }}
                  >
                    {cat.icon}
                  </motion.div>
                  <span className={cn(
                    "text-xs font-medium transition-colors",
                    selectedCategory.id === cat.id ? "text-slate-900" : "text-slate-400"
                  )}>
                    {cat.name}
                  </span>
                </button>
              ))}
            </motion.div>
          </div>

          {/* 数字键盘 */}
          <div className="bg-slate-900 p-2 pb-8 grid grid-cols-4 gap-1 z-10 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumberClick(num)}
                className="h-14 text-2xl font-medium text-white hover:bg-white/10 active:bg-white/20 rounded-xl transition-colors font-sans"
              >
                {num}
              </button>
            ))}
            <button
              onClick={handleDelete}
              className="h-14 flex items-center justify-center text-white hover:bg-white/10 rounded-xl"
            >
              <Delete className="w-6 h-6" />
            </button>
            <button
              onClick={handleSave}
              className="col-span-4 h-14 mt-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <Check className="w-5 h-5" /> 完成
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}