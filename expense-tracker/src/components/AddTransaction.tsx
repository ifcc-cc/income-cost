import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Delete, Check, Edit3, Wallet, Trash2, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { TransactionType, Asset, Transaction } from '@/types';
import { api } from '@/lib/api';
import { DatePicker } from './ui/DatePicker';
import { Picker } from './ui/Picker';

interface AddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  onDelete?: (id: string) => void;
  editData?: Transaction | null;
}

export default function AddTransaction({ isOpen, onClose, onSave, onDelete, editData }: AddTransactionProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [note, setNote] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  
  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const [selectedCategory, setSelectedCategory] = useState(currentCategories[0]);

  useEffect(() => {
    if (isOpen) {
      api.get<Asset[]>('/assets').then(data => {
        setAssets(data);
        if (editData) {
          setType(editData.type);
          setAmount(editData.amount.toString());
          setNote(editData.note || '');
          setDate(new Date(editData.date).toISOString().split('T')[0]);
          setSelectedAssetId(editData.assetId || (data.length > 0 ? data[0].id : ''));
          const cat = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES].find(c => c.id === editData.categoryId);
          if (cat) setSelectedCategory(cat);
        } else {
          setDate(new Date().toISOString().split('T')[0]);
          if (data.length > 0) setSelectedAssetId(data[0].id);
        }
      });
    }
  }, [isOpen, editData]);

  useEffect(() => {
    if (!editData) setSelectedCategory(currentCategories[0]);
  }, [type]);

  useEffect(() => {
    if (!isOpen) {
      setAmount('0');
      setNote('');
      setType('expense');
    }
  }, [isOpen]);

  const handleSave = () => {
    const val = parseFloat(amount);
    if (val === 0 || !selectedAssetId) return;
    onSave({
      id: editData?.id,
      amount: val,
      type,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      assetId: selectedAssetId,
      date: new Date(date).toISOString(),
      note: note.trim(),
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
          className="fixed inset-0 z-[100] bg-slate-50 flex flex-col"
        >
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/80 backdrop-blur-md z-10">
            <button onClick={onClose} className="p-2 -ml-2 text-slate-400"><X /></button>
            <div className="flex bg-slate-200 p-1 rounded-xl">
              <button onClick={() => setType('expense')} className={cn("px-6 py-1.5 rounded-lg text-sm font-bold", type === 'expense' ? "bg-white text-slate-900" : "text-slate-400")}>支出</button>
              <button onClick={() => setType('income')} className={cn("px-6 py-1.5 rounded-lg text-sm font-bold", type === 'income' ? "bg-white text-emerald-600" : "text-slate-400")}>收入</button>
            </div>
            {editData ? (
              <button onClick={() => onDelete?.(editData.id)} className="p-2 text-rose-500"><Trash2 className="w-5 h-5" /></button>
            ) : <div className="w-10" />}
          </div>

          <div className="px-8 py-4 flex flex-col items-end justify-center bg-white border-b border-slate-100 shadow-sm">
            <div className="w-full flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Picker 
                  options={assets.map(a => ({ label: a.name, value: a.id }))}
                  value={selectedAssetId}
                  onChange={setSelectedAssetId}
                  label="选择支付账户"
                  className="bg-slate-100 px-3 py-1.5 rounded-full"
                  triggerIcon={<Wallet className="w-3.5 h-3.5 text-slate-500" />}
                />
                <DatePicker 
                  value={date} 
                  onChange={setDate} 
                  className="bg-slate-100 px-3 py-1.5 rounded-full"
                />
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCategory.color }} />
                <div className="text-sm font-medium text-slate-500">{selectedCategory.name}</div>
              </div>
            </div>
            <div className="text-6xl font-bold tracking-tighter text-slate-900 mb-2">{amount}</div>
            <div className="w-full flex items-center gap-3 py-2 border-t border-slate-50">
               <Edit3 className="w-4 h-4 text-slate-400" />
               <input type="text" value={note} onChange={(e) => setNote(e.target.value)} placeholder="添加备注..." className="flex-1 bg-transparent text-sm outline-none" />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="grid grid-cols-4 gap-y-6">
              {currentCategories.map((cat) => (
                <button key={cat.id} onClick={() => setSelectedCategory(cat)} className="flex flex-col items-center gap-2">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all", selectedCategory.id === cat.id ? "shadow-lg scale-110" : "bg-white opacity-70")} style={{ backgroundColor: selectedCategory.id === cat.id ? cat.color : undefined, color: selectedCategory.id === cat.id ? 'white' : undefined }}>{cat.icon}</div>
                  <span className={cn("text-xs font-medium", selectedCategory.id === cat.id ? "text-slate-900" : "text-slate-400")}>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-2 pb-8 grid grid-cols-4 gap-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0'].map((num) => (
              <button key={num} onClick={() => {
                if (amount === '0' && num !== '.') setAmount(num);
                else setAmount(prev => (num === '.' && prev.includes('.') ? prev : prev + num));
              }} className="h-14 text-2xl text-white rounded-xl font-sans">{num}</button>
            ))}
            <button onClick={() => setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0')} className="h-14 flex items-center justify-center text-white"><Delete /></button>
            <button onClick={handleSave} className="col-span-4 h-14 mt-1 bg-emerald-500 text-white font-bold text-lg rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"><Check className="w-5 h-5" /> {editData ? '更新账单' : '完成记账'}</button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}