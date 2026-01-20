import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { CATEGORIES } from '@/data/categories';

export default function StatsPage({ refreshKey }: { refreshKey?: number }) {
  const [data, setData] = useState<{totalExpense: number, details: any[]}>({ totalExpense: 0, details: [] });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get<any>('/stats/category');
        setData(res);
      } catch (e) {
        console.error(e);
      }
    };
    fetchStats();
  }, [refreshKey]);

  return (
    <div className="px-6 pt-12 pb-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">收支统计</h1>
        <p className="text-slate-500 text-sm">历史总支出分析</p>
      </div>

      {/* 环形统计概览卡片 */}
      <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 flex flex-col items-center">
         <div className="relative w-48 h-48 flex items-center justify-center">
            {/* 简化的圆环 */}
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="#f1f5f9" strokeWidth="16" fill="transparent" />
              {/* 这里只是示意，实际要做动态圆环比较复杂，暂时用静态效果 */}
              <circle cx="96" cy="96" r="80" stroke="#10b981" strokeWidth="16" fill="transparent" strokeDasharray="502" strokeDashoffset="100" className="text-emerald-500" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">总支出</span>
               <span className="text-3xl font-bold text-slate-900">¥{data.totalExpense}</span>
            </div>
         </div>
      </div>

      {/* 分类详情列表 */}
      <div className="space-y-6 pb-20">
        <h3 className="text-lg font-bold text-slate-900">分类支出排行</h3>
        <div className="space-y-4">
          {data.details.map((item, i) => {
            // 尝试匹配本地图标配置
            const categoryConfig = CATEGORIES.find(c => c.id === item.categoryId);
            const icon = categoryConfig?.icon || '💰';
            const color = categoryConfig?.color || '#cbd5e1';

            return (
              <motion.div 
                key={item.categoryId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="space-y-2"
              >
                <div className="flex justify-between items-end">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-semibold text-slate-700">{item.categoryName}</span>
                    <span className="text-xs text-slate-400 font-medium">{item.percentage}%</span>
                  </div>
                  <span className="font-bold text-slate-900">¥{item.amount}</span>
                </div>
                {/* 进度条 */}
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </motion.div>
            );
          })}
          
          {data.details.length === 0 && (
             <div className="text-center text-slate-400 text-sm">暂无支出数据</div>
          )}
        </div>
      </div>
    </div>
  );
}