import { useState, useEffect } from 'react';
import LoginPage from './pages/Login';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import StatsPage from './pages/Stats';
import AssetsPage from './pages/Assets';
import AddTransaction from './components/AddTransaction';
import { Button } from './components/ui/button';
import { api } from './lib/api';

function App() {
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // 初始化检查登录状态
  useEffect(() => {
    const checkLogin = async () => {
      try {
        const data = await api.get<any>('/users/me');
        setCurrentUser(data.user);
        setHasLoggedIn(true);
      } catch (e) {
        // Token 无效或过期
        setHasLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setHasLoggedIn(true);
  };
  
  const handleLogout = () => {
    api.clearTokens();
    setHasLoggedIn(false);
    setCurrentUser(null);
  };

  const handleSaveTransaction = async (data: any) => {
    try {
      await api.post('/transactions', {
        amount: data.amount,
        type: data.type,
        categoryId: data.category.id,
        categoryName: data.category.name,
        date: data.date,
        note: data.note || ''
      });
      setIsAddOpen(false);
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      alert('保存失败，请重试');
    }
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50">加载中...</div>;

  if (!hasLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomePage user={currentUser} refreshKey={refreshKey} />;
      case 'stats':
        return <StatsPage refreshKey={refreshKey} />;
      case 'assets':
        return <AssetsPage refreshKey={refreshKey} />;
      case 'profile':
        return (
          <div className="p-8 flex flex-col items-center mt-20 space-y-4">
             <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center text-2xl font-bold text-slate-500">
                {currentUser?.nickname?.[0] || 'U'}
             </div>
             <h2 className="text-xl font-bold">{currentUser?.nickname || '用户'}</h2>
             <p className="text-slate-500">{currentUser?.email}</p>
             <Button variant="outline" onClick={handleLogout}>退出登录</Button>
          </div>
        );
      default:
        return <HomePage user={currentUser} />;
    }
  };

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAddClick={() => setIsAddOpen(true)}
      >
        {renderContent()}
      </Layout>

      <AddTransaction 
        isOpen={isAddOpen} 
        onClose={() => setIsAddOpen(false)}
        onSave={handleSaveTransaction}
      />
    </>
  );
}

export default App