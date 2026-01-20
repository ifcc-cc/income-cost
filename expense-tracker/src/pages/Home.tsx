import { motion } from 'framer-motion';
import { Eye, EyeOff, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';

interface HomePageProps {
  user: any; // 包含基本信息
  refreshKey?: number;
}

export default function HomePage({ user, refreshKey }: HomePageProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [stats, setStats] = useState({ balance: 0, monthlyIncome: 0, monthlyExpense: 0 });
  const [transactions, setTransactions] = useState<any[]>([]);

  // 获取最新数据
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. 获取统计
        const userData = await api.get<any>('/users/me');
        setStats(userData.stats);

        // 2. 获取列表
        const list = await api.get<any[]>('/transactions');
        setTransactions(list);
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
  }, [user, refreshKey]); // 当用户信息变化或刷新Key变化时调用

  // 格式化金额
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: 'CNY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="px-6 pt-12 pb-6 space-y-8">
      
      {/* 头部：欢迎语与头像 */}
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

      {/* 资产总览卡片 */}
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-2xl shadow-slate-900/20 p-6"
      >
        {/* 卡片背景装饰 */}
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
                 <TrendingDown className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-xs text-slate-400">本月收入</div>
                 <div className="text-sm font-semibold text-emerald-100">
                    {showBalance ? `+${stats.monthlyIncome}` : '****'}
                 </div>
               </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 rounded-xl p-3 backdrop-blur-sm">
               <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white">
                 <TrendingUp className="w-4 h-4" />
               </div>
               <div>
                 <div className="text-xs text-slate-400">本月支出</div>
                 <div className="text-sm font-semibold text-white">
                    {showBalance ? `-${stats.monthlyExpense}` : '****'}
                 </div>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 近期交易 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">近期交易</h3>
          <button className="text-sm font-medium text-emerald-600 flex items-center">
            查看全部 <ArrowRight className="w-4 h-4 ml-1" />
          </button>
        </div>

        <div className="space-y-3 pb-20">
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">暂无记录，快去记一笔吧！</div>
          ) : (
            transactions.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl shadow-sm"
              >
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-xl">
                     {/* 简易处理：未来可以根据 categoryId 查找对应的 icon */}
                     💰
                   </div>
                   <div>
                     <div className="font-semibold text-slate-900">{t.categoryName}</div>
                     <div className="text-xs text-slate-400">
                       {new Date(t.date).toLocaleDateString()} {new Date(t.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                       {t.note && ` · ${t.note}`}
                     </div>
                   </div>
                 </div>
                 <div className={cn(
                   "font-bold",
                   t.type === 'income' ? "text-emerald-600" : "text-slate-900"
                 )}>
                   {t.type === 'income' ? '+' : '-'}{t.amount.toFixed(2)}
                 </div>
              </motion.div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}