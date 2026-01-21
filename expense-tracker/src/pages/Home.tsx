import { motion, PanInfo, useAnimation } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowRight, Edit3, Trash2, Wallet, CreditCard } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface HomePageProps {
  user: any;
  refreshKey?: number;
  onEditTransaction?: (t: any) => void;
  onDeleteTransaction?: (id: string) => void;
  onAllRecordsClick?: () => void;
}

const TransactionItem = ({ t, onEdit, onDelete }: { t: any, onEdit: () => void, onDelete: () => void }) => {
  const controls = useAnimation();
  const [isOpen, setIsOpen] = useState(false);

  const handleDragEnd = async (_: any, info: PanInfo) => {
    if (info.offset.x < -50) {
      await controls.start({ x: -120 });
      setIsOpen(true);
    } else {
      await controls.start({ x: 0 });
      setIsOpen(false);
    }
  };

  return (
    <div className="relative mb-3">
      {/* 背景操作层 */}
      <div className="absolute inset-y-0 right-0 w-[120px] flex items-center justify-end gap-2 pr-1 z-0">
        <button 
          onClick={(e) => { e.stopPropagation(); controls.start({ x: 0 }); setIsOpen(false); onEdit(); }}
          className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        >
          <Edit3 className="w-5 h-5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); controls.start({ x: 0 }); setIsOpen(false); onDelete(); }}
          className="w-12 h-12 bg-rose-500 text-white rounded-full flex items-center justify-center shadow-md active:scale-90 transition-transform"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* 前景内容卡片 */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 0 }}
        dragElastic={0.1}
        animate={controls}
        onDragEnd={handleDragEnd}
        onClick={() => { if(isOpen) { controls.start({ x: 0 }); setIsOpen(false); } }}
        className="relative z-10 flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm touch-pan-y"
        style={{ x: 0 }}
      >
         <div className="flex items-center gap-4 pointer-events-none">
           <div className={cn(
             "w-12 h-12 rounded-2xl flex items-center justify-center text-xl transition-transform",
             t.type === 'income' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
           )}>
             {t.type === 'income' ? <Wallet className="w-6 h-6" /> : <CreditCard className="w-6 h-6" />}
           </div>
           <div>
             <div className="font-bold text-slate-900">{t.categoryName}</div>
             <div className="flex items-center gap-1.5 mt-0.5">
               {t.asset?.name && (
                 <span className="px-1.5 py-0.5 bg-blue-50 text-[10px] font-bold text-blue-500 rounded-md">
                   {t.asset.name}
                 </span>
               )}
               <span className="text-[11px] text-slate-400 font-medium">
                 {new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                 {t.note && ` · ${t.note}`}
               </span>
             </div>
           </div>
         </div>
         <div className={cn(
           "text-lg font-black tracking-tight pointer-events-none",
           t.type === 'income' ? "text-emerald-500" : "text-slate-900"
         )}>
           {t.type === 'income' ? '+' : '-'}{t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
         </div>
      </motion.div>
    </div>
  );
};

export default function HomePage({ user, refreshKey, onEditTransaction, onDeleteTransaction, onAllRecordsClick }: HomePageProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [stats, setStats] = useState({ balance: 0, monthlyIncome: 0, monthlyExpense: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);

  // 获取最新数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await api.get<any>('/users/me');
        setStats(userData.stats);
        const list = await api.get<any[]>('/transactions');
        // 前端双重排序：先比日期，日期相同比录入时间
        const sortedList = list.sort((a, b) => {
          const dateA = new Date(a.date).getTime();
          const dateB = new Date(b.date).getTime();
          if (dateB !== dateA) return dateB - dateA;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        setTransactions(sortedList);
      } catch (e) { console.error(e); }
    };
    fetchData();
  }, [user, refreshKey]);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }).format(amount);
  };

  return (
    <div className="px-6 pt-12 pb-6 space-y-8 overflow-hidden">
      
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-slate-500">{new Date().toLocaleDateString()}</h2>
          <h1 className="text-2xl font-bold text-slate-900">
            {new Date().getHours() < 12 ? '早上好' : new Date().getHours() < 18 ? '下午好' : '晚上好'}，
            {user?.nickname}
          </h1>
        </div>
        <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden flex items-center justify-center text-slate-500 font-bold">
           {user?.nickname?.[0]}
        </div>
      </div>

      {/* 资产卡片 */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/20 p-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-2 opacity-80">
            <span className="text-sm font-medium">总资产</span>
            <button onClick={() => setShowBalance(!showBalance)} className="p-1">
              {showBalance ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </button>
          </div>
          <div className="mb-8">
             <div className="text-4xl font-bold tracking-tight">
               {showBalance ? formatMoney(stats.balance) : '****'}
             </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
               <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                 <Wallet className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-xs text-slate-400">本月收入</div>
                 <div className="text-sm font-semibold text-emerald-100">{showBalance ? `+${stats.monthlyIncome}` : '****'}</div>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                 <CreditCard className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-xs text-slate-400">本月支出</div>
                 <div className="text-sm font-semibold text-white">{showBalance ? `-${stats.monthlyExpense}` : '****'}</div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 近期交易列表 */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-black text-slate-900 tracking-tight">近期交易</h3>
          <button 
            onClick={onAllRecordsClick}
            className="group flex items-center gap-1.5 px-4 py-2 bg-slate-100/50 hover:bg-slate-100 text-slate-500 hover:text-slate-900 rounded-full text-xs font-bold transition-all active:scale-95"
          >
            全部记录
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="pb-24">
          {transactions.length === 0 ? (
            <div className="bg-white/50 border-2 border-dashed border-slate-100 rounded-[2rem] py-12 flex flex-col items-center justify-center text-slate-400">
               <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-2">💰</div>
               <span className="text-sm font-medium">暂无记录，快去记一笔吧！</span>
            </div>
          ) : (
            transactions.map((t) => (
              <TransactionItem 
                key={t.id} 
                t={t} 
                onEdit={() => onEditTransaction?.(t)} 
                onDelete={() => onDeleteTransaction?.(t.id)} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}