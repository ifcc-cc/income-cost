import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight, Wallet, CreditCard, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/data/categories';
import { motion, AnimatePresence } from 'framer-motion';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316'];
const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export default function StatsPage({ refreshKey, onEditTransaction }: { refreshKey?: number, onEditTransaction?: (t: any) => void, onDeleteTransaction?: (id: string) => void }) {
  const [activeType, setActiveType] = useState<'expense' | 'income'>('expense');
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [categoryDetail, setCategoryDetail] = useState<any[]>([]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const res = await api.get<any>(`/users/stats?type=${viewType}&year=${year}${viewType === 'month' ? `&month=${month}` : ''}`);
      setData(res);
    } catch (error) { console.error(error); }
    finally { setIsLoading(false); }
  };

  const fetchCategoryDetail = async (cat: any) => {
    try {
      const year = date.getFullYear();
      const month = viewType === 'month' ? date.getMonth() + 1 : undefined;
      const res = await api.get<any[]>(`/users/stats/category/${cat.categoryId}?type=${activeType}&year=${year}${month ? `&month=${month}` : ''}`);
      setCategoryDetail(res);
      setSelectedCategory(cat);
    } catch (e) { console.error(e); }
  };

  useEffect(() => { fetchStats(); }, [date, viewType, refreshKey]);

  const changeDate = (offset: number) => {
    const newDate = new Date(date);
    if (viewType === 'month') newDate.setMonth(newDate.getMonth() + offset);
    else newDate.setFullYear(newDate.getFullYear() + offset);
    setDate(newDate);
  };

  if (isLoading && !data) return <div className="p-8 text-center text-slate-400">加载中...</div>;

  const currentCategories = activeType === 'expense' ? data?.expenseCategories : data?.incomeCategories;

  return (
    <div className="relative min-h-screen bg-slate-50">
      <AnimatePresence mode="wait">
        {!selectedCategory ? (
          <motion.div 
            key="stats-main" 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="pb-24 px-6 pt-12"
          >
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900">收支统计</h1>
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button onClick={() => setViewType('month')} className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", viewType === 'month' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>月</button>
                <button onClick={() => setViewType('year')} className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", viewType === 'year' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}>年</button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
              <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-full"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
              <div className="flex items-center gap-2 font-bold text-slate-700">
                <Calendar className="w-4 h-4 text-blue-500" />
                {viewType === 'month' ? `${date.getFullYear()}年${date.getMonth() + 1}月` : `${date.getFullYear()}年度`}
              </div>
              <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-full"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <button onClick={() => setActiveType('income')} className={cn("p-5 rounded-3xl border transition-all text-left active:scale-95", activeType === 'income' ? "bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/20" : "bg-white border-slate-100 opacity-60")}>
                <div className="flex items-center gap-2 text-emerald-600 mb-1"><Wallet className="w-4 h-4" /><span className="text-xs font-bold">收入总额</span></div>
                <div className="text-xl font-black text-emerald-700">¥ {data?.monthlyIncome.toLocaleString()}</div>
              </button>
              <button onClick={() => setActiveType('expense')} className={cn("p-5 rounded-3xl border transition-all text-left active:scale-95", activeType === 'expense' ? "bg-rose-50 border-rose-100 ring-2 ring-rose-500/20" : "bg-white border-slate-100 opacity-60")}>
                <div className="flex items-center gap-2 text-rose-600 mb-1"><CreditCard className="w-4 h-4" /><span className="text-xs font-bold">支出总额</span></div>
                <div className="text-xl font-black text-rose-700">¥ {data?.monthlyExpense.toLocaleString()}</div>
              </button>
            </div>

            {/* 精美环形图卡片 */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm mb-8 relative">
              <h3 className="font-bold text-slate-800 mb-2">{activeType === 'expense' ? '支出' : '收入'}构成</h3>
              <div className="h-72 w-full relative">
                {currentCategories && currentCategories.length > 0 ? (
                  <>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         Total {activeType === 'expense' ? 'Cost' : 'Income'}
                       </span>
                       <span className="text-2xl font-black text-slate-900 mt-1">
                         ¥{(activeType === 'expense' ? data?.monthlyExpense : data?.monthlyIncome).toLocaleString()}
                       </span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={currentCategories} 
                          cx="50%" 
                          cy="50%" 
                          innerRadius={75} 
                          outerRadius={95} 
                          paddingAngle={6} 
                          cornerRadius={10}
                          dataKey="amount" 
                          nameKey="categoryName"
                          stroke="none"
                        >
                          {currentCategories.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} formatter={(v: any) => `¥${v.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                ) : <div className="h-full flex items-center justify-center text-slate-400 text-sm">暂无数据</div>}
              </div>
              
              {/* 自定义精美图例 */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 mt-2 px-4">
                {currentCategories?.slice(0, 6).map((cat: any, index: number) => (
                  <div key={cat.categoryId} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-[11px] font-bold text-slate-500">{cat.categoryName}</span>
                    </div>
                    <span className="text-[10px] font-black text-slate-400">{cat.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800">分类排行榜</h3>
              {currentCategories?.map((cat: any, index: number) => {
                const icon = ALL_CATEGORIES.find(c => c.id === cat.categoryId)?.icon || '💰';
                return (
                  <button key={cat.categoryId} onClick={() => fetchCategoryDetail(cat)} className="w-full bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between active:scale-[0.98]">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl text-white" style={{ backgroundColor: COLORS[index % COLORS.length] }}>{icon}</div>
                      <div className="text-left">
                        <div className="font-bold text-slate-700">{cat.categoryName}</div>
                        <div className="text-[10px] text-slate-400">占比 {cat.percentage}%</div>
                      </div>
                    </div>
                    <div className="text-right font-black text-slate-900">¥ {cat.amount.toLocaleString()}</div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="stats-detail" 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }} 
            exit={{ opacity: 0, x: 20 }} 
            transition={{ duration: 0.15, ease: "easeOut" }} 
            className="min-h-screen bg-slate-50 pb-24 pt-8 px-6"
          >
            <button onClick={() => setSelectedCategory(null)} className="flex items-center gap-2 text-slate-400 mb-6 font-black hover:text-slate-600 transition-colors"><ArrowLeft className="w-5 h-5" /> 返回统计</button>
            
            <div className="bg-white p-5 rounded-3xl shadow-lg border border-slate-100 mb-8 flex items-center justify-between relative overflow-hidden">
               <div className="flex items-center gap-3 z-10">
                 <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl">{ALL_CATEGORIES.find(c => c.id === selectedCategory.categoryId)?.icon || '💰'}</div>
                 <div className="text-left">
                   <h2 className="text-lg font-black text-slate-900 leading-none">{selectedCategory.categoryName}</h2>
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">累计{activeType === 'expense' ? '支出' : '收入'}</span>
                 </div>
               </div>
               <div className="text-xl font-black text-slate-900 z-10">¥ {selectedCategory.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
               <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full blur-3xl opacity-40" />
            </div>

            <div className="space-y-3">
              {categoryDetail.map((t, i) => (
                <motion.div key={t.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }} onClick={() => onEditTransaction?.(t)} className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm active:scale-[0.98] transition-all cursor-pointer">
                   <div className="space-y-0.5">
                     <span className="text-[10px] font-black text-slate-400">{new Date(t.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                     <div className="font-black text-slate-800 text-lg">¥ {t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
                     {t.note && <div className="text-[10px] text-slate-400 font-medium">{t.note}</div>}
                   </div>
                   <div className="flex flex-col items-end">
                     {t.asset?.name && (
                       <div className="px-3 py-1 bg-blue-50 text-blue-500 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100/50">{t.asset.name}</div>
                     )}
                   </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
