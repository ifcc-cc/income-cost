import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Wallet, TrendingUp, TrendingDown, PlusCircle } from 'lucide-react';
import { Button } from '../components/ui/button';

export default function AssetsPage({ refreshKey }: { refreshKey?: number }) {
  const [stats, setStats] = useState<{ balance: number; monthlyIncome: number; monthlyExpense: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.get<any>('/users/me');
        setStats(data.stats);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  if (isLoading) return <div className="p-8 text-center text-slate-400">加载中...</div>;

  return (
    <div className="pb-20">
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 pt-12 pb-16 text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-blue-100 text-sm font-medium mb-2">净资产</h1>
          <div className="text-4xl font-bold mb-6">
            ¥ {stats?.balance.toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
          
          <div className="grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-400/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <div className="text-xs text-blue-100">本月收入</div>
                <div className="font-semibold">+{stats?.monthlyIncome.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-400/20 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <div className="text-xs text-blue-100">本月支出</div>
                <div className="font-semibold">-{stats?.monthlyExpense.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-slate-500" />
              我的账户
            </h3>
            <Button size="sm" variant="outline" className="text-xs h-8">管理</Button>
          </div>
          
          {/* 这里是账户列表的占位符，后续可以扩展后端来支持多账户 */}
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                  总
                </div>
                <div>
                  <div className="font-medium text-slate-700">总资金账户</div>
                  <div className="text-xs text-slate-400">默认账户</div>
                </div>
              </div>
              <div className="font-semibold text-slate-700">
                ¥ {stats?.balance.toLocaleString()}
              </div>
            </div>
            
            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm font-medium hover:border-blue-300 hover:text-blue-500 transition-colors flex items-center justify-center gap-2">
              <PlusCircle className="w-4 h-4" />
              添加账户 (开发中)
            </button>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <h4 className="text-blue-800 font-medium mb-2 text-sm">资产分析</h4>
          <p className="text-blue-600 text-xs leading-relaxed">
            您的净资产主要由历史收支累积而成。后续版本将支持银行卡、支付宝、微信零钱等独立账户管理。
          </p>
        </div>
      </div>
    </div>
  );
}
