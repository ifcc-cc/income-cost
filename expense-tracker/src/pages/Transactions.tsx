import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Edit3, Trash2, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DatePicker } from '../components/ui/DatePicker';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';

const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

const TransactionItem = ({ t, onEdit, onDelete }: { t: any, onEdit: () => void, onDelete: () => void }) => {
  const controls = useAnimation();
  
  const categoryIcon = ALL_CATEGORIES.find(c => c.id === t.categoryId)?.icon || '💰';

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      await controls.start({ x: -120 });
    } else {
      await controls.start({ x: 0 });
    }
  };

  return (
    <div className="relative mb-3">
      <div className="absolute inset-y-0 right-0 w-[120px] flex items-center justify-end gap-2 pr-1 z-0">
        <button onClick={(e) => { e.stopPropagation(); controls.start({ x: 0 }); onEdit(); }} className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90"><Edit3 className="w-5 h-5" /></button>
        <button onClick={(e) => { e.stopPropagation(); controls.start({ x: 0 }); onDelete(); }} className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90"><Trash2 className="w-5 h-5" /></button>
      </div>
      <motion.div
        drag="x" dragConstraints={{ left: -120, right: 0 }} dragElastic={0.1} animate={controls} onDragEnd={handleDragEnd}
        className="relative z-10 flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm touch-pan-y"
      >
         <div className="flex items-center gap-4">
           <div className={cn(
             "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl transition-transform",
             t.type === 'income' ? "bg-emerald-50" : "bg-blue-50"
           )}>
             {categoryIcon}
           </div>
           <div>
             <div className="font-bold text-slate-900">{t.categoryName}</div>
             <div className="flex items-center gap-1.5 mt-0.5">
               {t.asset?.name && <span className="px-1.5 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-500 rounded-md">{t.asset.name}</span>}
               <span className="text-[11px] text-slate-400 font-medium">
                 {new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                 {t.note && ` · ${t.note}`}
               </span>
             </div>
           </div>
         </div>
         <div className={cn("text-lg font-black tracking-tight", t.type === 'income' ? "text-emerald-500" : "text-slate-900")}>
           {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
         </div>
      </motion.div>
    </div>
  );
};

export default function TransactionsPage({ onEditTransaction, onDeleteTransaction, refreshKey }: any) {
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const list = await api.get<any[]>('/transactions');
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);

      let filtered = list.filter(t => {
        const tDate = new Date(t.date);
        return tDate >= start && tDate <= end;
      });

      if (searchQuery.trim()) {
        filtered = filtered.filter(t => 
          t.note?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          t.categoryName?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      setTransactions(filtered.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateB !== dateA) return dateB - dateA;
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }));
    } catch (e) { console.error(e); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchData(); }, [startDate, endDate, searchQuery, refreshKey]);

  return (
    <div className="pb-24 pt-12 px-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">交易流水</h1>
        <p className="text-xs text-slate-400 font-medium mt-1">按自定义时间段或备注查询明细</p>
      </div>

      <div className="space-y-4 mb-8">
        {/* 日期筛选 */}
        <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-100 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">开始日期</label>
              <DatePicker 
                value={startDate} 
                onChange={setStartDate} 
                className="bg-slate-50 border-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">结束日期</label>
              <DatePicker 
                value={endDate} 
                onChange={setEndDate} 
                className="bg-slate-50 border-none"
              />
            </div>
          </div>
        </div>

        {/* 搜索框 */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text"
            placeholder="搜索备注或分类..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-10 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100 transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 rounded-full"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-1">
        {isLoading ? (
          <div className="text-center py-20 text-slate-400">加载中...</div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-20 text-slate-400">本月暂无记录</div>
        ) : (
          transactions.map(t => (
            <TransactionItem key={t.id} t={t} onEdit={() => onEditTransaction(t)} onDelete={() => onDeleteTransaction(t.id)} />
          ))
        )}
      </div>
    </div>
  );
}
