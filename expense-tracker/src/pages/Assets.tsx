import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { Wallet, TrendingUp, TrendingDown, PlusCircle, Trash2, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Picker } from '../components/ui/Picker';
import { Asset } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssetsPage({ refreshKey }: { refreshKey?: number }) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [stats, setStats] = useState<{ balance: number; monthlyIncome: number; monthlyExpense: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  
  // 新资产表单状态
  const [newAsset, setNewAsset] = useState({
    name: '',
    type: 'bank' as Asset['type'],
    balance: '',
    color: '#3B82F6'
  });

  const fetchData = async () => {
    try {
      const [assetsData, meData] = await Promise.all([
        api.get<Asset[]>('/api/assets'),
        api.get<any>('/users/me')
      ]);
      setAssets(assetsData);
      setStats(meData.stats);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [refreshKey]);

  const handleOpenEdit = (asset: Asset) => {
    setEditingAssetId(asset.id);
    setNewAsset({
      name: asset.name,
      type: asset.type,
      balance: asset.balance.toString(),
      color: asset.color || '#3B82F6'
    });
    setIsAddModalOpen(true);
  };

  const handleSaveAsset = async () => {
    if (!newAsset.name || !newAsset.balance) return;
    try {
      const payload = {
        ...newAsset,
        balance: parseFloat(newAsset.balance)
      };
      if (editingAssetId) {
        await api.request(`/api/assets/${editingAssetId}`, { 
          method: 'PUT', 
          body: JSON.stringify(payload) 
        });
      } else {
        await api.post('/api/assets/', payload);
      }
      setIsAddModalOpen(false);
      setEditingAssetId(null);
      setNewAsset({ name: '', type: 'bank', balance: '', color: '#3B82F6' });
      fetchData();
    } catch (error) {
      alert('保存失败');
    }
  };

  const handleDeleteAsset = async (id: string) => {
    if (!confirm('确定要删除该资产吗？相关账单将失去关联。')) return;
    try {
      await api.request(`/api/assets/${id}`, { method: 'DELETE' });
      fetchData();
    } catch (error) {
      alert('删除失败');
    }
  };

  if (isLoading && assets.length === 0) return <div className="p-8 text-center text-slate-400">加载中...</div>;

  return (
    <div className="pb-20">
      <header className="bg-gradient-to-r from-blue-600 to-blue-500 p-6 pt-12 pb-16 text-white rounded-b-3xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-blue-100 text-sm font-medium mb-2">总资产</h1>
          <div className="text-4xl font-bold mb-6">
            ¥ {(stats?.balance || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2 })}
          </div>
          
          <div className="grid grid-cols-2 gap-4 bg-white/10 p-4 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-400/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-300" />
              </div>
              <div>
                <div className="text-xs text-blue-100">本月收入</div>
                <div className="font-semibold">+{(stats?.monthlyIncome || 0).toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-400/20 rounded-lg">
                <TrendingDown className="w-5 h-5 text-red-300" />
              </div>
              <div>
                <div className="text-xs text-blue-100">本月支出</div>
                <div className="font-semibold">-{(stats?.monthlyExpense || 0).toLocaleString()}</div>
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
              账户列表
            </h3>
            <Button size="sm" variant="ghost" onClick={() => setIsAddModalOpen(true)} className="text-blue-500 font-bold">
               <PlusCircle className="w-4 h-4 mr-1" /> 新增
            </Button>
          </div>
          
          <div className="space-y-3">
            {assets.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">暂无资产，请点击右上角新增</div>
            )}
            {assets.map(asset => (
              <div 
                key={asset.id} 
                onClick={() => handleOpenEdit(asset)}
                className="group flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-all cursor-pointer active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: asset.color || '#3B82F6' }}
                  >
                    {asset.name[0]}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-700">{asset.name}</div>
                    <div className="text-xs text-slate-400">{asset.type === 'bank' ? '银行卡' : asset.type === 'stock' ? '股票' : '其他'}</div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-bold text-slate-900">¥ {asset.balance.toLocaleString()}</div>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteAsset(asset.id);
                    }}
                    className="p-2 text-slate-300 hover:text-red-500 transition-all active:scale-90"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 新增/编辑资产弹窗 */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-slate-800">{editingAssetId ? '修改财富来源' : '添加财富来源'}</h2>
                <button onClick={() => { setIsAddModalOpen(false); setEditingAssetId(null); }} className="p-2 text-slate-400"><X /></button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-500 mb-1 block">账户名称</label>
                  <input 
                    type="text" 
                    placeholder="如：招商银行、腾讯股票"
                    className="w-full p-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    value={newAsset.name}
                    onChange={e => setNewAsset({...newAsset, name: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-500 mb-1 block">账户类型</label>
                    <Picker 
                      options={[
                        { label: '银行账户', value: 'bank' },
                        { label: '股票账户', value: 'stock' },
                        { label: '基金账户', value: 'fund' },
                        { label: '现金', value: 'cash' },
                        { label: '其他', value: 'other' }
                      ]}
                      value={newAsset.type}
                      onChange={(val) => setNewAsset({...newAsset, type: val as any})}
                      label="账户类型"
                      className="bg-slate-50 border-none p-3"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-500 mb-1 block">初始余额</label>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full p-3 bg-slate-50 border-none rounded-xl outline-none"
                      value={newAsset.balance}
                      onChange={e => setNewAsset({...newAsset, balance: e.target.value})}
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <Button onClick={handleSaveAsset} className="bg-blue-600 hover:bg-blue-700 text-white py-4">保存修改</Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
