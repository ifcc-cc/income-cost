import { useState, useEffect } from 'react';
import LoginPage from './pages/Login';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import StatsPage from './pages/Stats';
import AssetsPage from './pages/Assets';
import ProfilePage from './pages/Profile';
import TransactionsPage from './pages/Transactions';
import AddTransaction from './components/AddTransaction';
import { api } from './lib/api';

function App() {
  const [hasLoggedIn, setHasLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('home');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
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
      if (data.id) {
        await api.request(`/transactions/${data.id}`, {
          method: 'PUT',
          body: JSON.stringify(data)
        });
      } else {
        await api.post('/transactions', data);
      }
      setIsAddOpen(false);
      setEditingTransaction(null);
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      alert('保存失败，请重试');
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await api.request(`/transactions/${id}`, { method: 'DELETE' });
      setIsAddOpen(false);
      setEditingTransaction(null);
      setRefreshKey(prev => prev + 1);
    } catch (e) {
      alert('删除失败');
    }
  };

  const handleEditTransaction = (transaction: any) => {
    setEditingTransaction(transaction);
    setIsAddOpen(true);
  };

  if (isLoading) return <div className="flex h-screen items-center justify-center bg-slate-50">加载中...</div>;

  if (!hasLoggedIn) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomePage 
            user={currentUser} 
            refreshKey={refreshKey} 
            onEditTransaction={handleEditTransaction} 
            onDeleteTransaction={handleDeleteTransaction}
            onAllRecordsClick={() => setActiveTab('transactions')}
          />
        );
      case 'stats':
        return (
          <StatsPage 
            refreshKey={refreshKey} 
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'transactions':
        return (
          <TransactionsPage 
            refreshKey={refreshKey}
            onEditTransaction={handleEditTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        );
      case 'assets':
        return <AssetsPage refreshKey={refreshKey} />;
      case 'profile':
        return <ProfilePage user={currentUser} onLogout={handleLogout} onUpdateUser={setCurrentUser} />;
      default:
        return <HomePage user={currentUser} />;
    }
  };

  return (
    <>
      <Layout 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onAddClick={() => {
          setEditingTransaction(null);
          setIsAddOpen(true);
        }}
      >
        {renderContent()}
      </Layout>

      <AddTransaction 
        isOpen={isAddOpen} 
        onClose={() => {
          setIsAddOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        onDelete={handleDeleteTransaction}
        editData={editingTransaction}
      />
    </>
  );
}

export default App