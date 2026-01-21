import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, ChevronLeft, ChevronRight, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function StatsPage({ refreshKey }: { refreshKey?: number }) {
  const [viewType, setViewType] = useState<'month' | 'year'>('month');
  const [date, setDate] = useState(new Date());
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const res = await api.get<any>(`/users/stats?type=${viewType}&year=${year}${viewType === 'month' ? `&month=${month}` : ''}`);
      setData(res);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [date, viewType]);

  const changeDate = (offset: number) => {
    const newDate = new Date(date);
    if (viewType === 'month') {
      newDate.setMonth(newDate.getMonth() + offset);
    } else {
      newDate.setFullYear(newDate.getFullYear() + offset);
    }
    setDate(newDate);
  };

  if (isLoading && !data) return <div className="p-8 text-center text-slate-400">加载中...</div>;

  return (
    <div className="pb-24 px-6 pt-12">
      {/* 顶部切换 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">收支统计</h1>
        <div className="flex bg-slate-100 p-1 rounded-xl">
          <button 
            onClick={() => setViewType('month')}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", viewType === 'month' ? "bg-white shadow-sm text-slate-900" : "text-slate-400")}
          >月</button>
          <button 
            onClick={() => setViewType('year')}
            className={cn("px-4 py-1.5 rounded-lg text-sm font-bold transition-all", viewType === 'year' ? "bg-white shadow-sm text-slate-900" : "text-400")}
          >年</button>
        </div>
      </div>

      {/* 日期选择器 */}
      <div className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-50 rounded-full"><ChevronLeft /></button>
        <div className="flex items-center gap-2 font-bold text-slate-700">
          <Calendar className="w-4 h-4 text-blue-500" />
          {viewType === 'month' ? `${date.getFullYear()}年${date.getMonth() + 1}月` : `${date.getFullYear()}年度`}
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-50 rounded-full"><ChevronRight /></button>
      </div>

      {/* 概览卡片 */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-emerald-50 p-5 rounded-3xl border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-bold">总收入</span>
          </div>
          <div className="text-xl font-black text-emerald-700">¥ {data?.monthlyIncome.toLocaleString()}</div>
        </div>
        <div className="bg-rose-50 p-5 rounded-3xl border border-rose-100">
          <div className="flex items-center gap-2 text-rose-600 mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-bold">总支出</span>
          </div>
          <div className="text-xl font-black text-rose-700">¥ {data?.monthlyExpense.toLocaleString()}</div>
        </div>
      </div>

      {/* 图表展示 */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8">
        <h3 className="font-bold text-slate-800 mb-6">收支对比趋势</h3>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={[
              { name: '收入', value: data?.monthlyIncome, color: '#10b981' },
              { name: '支出', value: data?.monthlyExpense, color: '#f43f5e' }
            ]}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
              <YAxis hide />
              <Tooltip cursor={{fill: 'transparent'}} />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                { [0, 1].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 分类排行榜 */}
      <div className="space-y-4">
        <h3 className="font-bold text-slate-800">支出排行榜</h3>
        {data?.categories.map((cat: any) => (
          <div key={cat.categoryId} className="bg-white p-4 rounded-2xl border border-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-xl">
                 {cat.icon || '💰'}
              </div>
              <div>
                <div className="font-bold text-slate-700">{cat.categoryName}</div>
                <div className="text-[10px] text-slate-400 font-medium">占比 {cat.percentage}%</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-900">¥ {cat.amount.toLocaleString()}</div>
              <div className="w-24 h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: `${cat.percentage}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}