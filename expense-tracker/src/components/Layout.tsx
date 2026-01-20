import React from 'react';
import { Home, PieChart, Plus, Wallet, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAddClick: () => void;
}

export default function Layout({ children, activeTab, onTabChange, onAddClick }: LayoutProps) {
  const tabs = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'stats', icon: PieChart, label: '统计' },
    { id: 'add', icon: Plus, label: '记账', isAction: true }, // 特殊处理
    { id: 'assets', icon: Wallet, label: '资产' },
    { id: 'profile', icon: User, label: '我的' },
  ];

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 overflow-hidden">
      {/* 主内容区域 - 可滚动 */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-24">
        {children}
      </main>

      {/* 底部导航栏容器 */}
      <div className="fixed bottom-0 left-0 right-0 p-4 z-50 pointer-events-none">
        {/* 玻璃拟态导航条 */}
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 shadow-2xl shadow-slate-200/50 rounded-3xl flex items-center justify-between px-2 py-3">
            
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              if (tab.isAction) {
                return (
                  <div key={tab.id} className="relative -mt-12 px-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={onAddClick}
                      className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-900 text-white shadow-lg shadow-slate-900/30 border-4 border-slate-50"
                    >
                      <Plus className="w-7 h-7" />
                    </motion.button>
                  </div>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className="relative flex flex-col items-center justify-center flex-1 py-1 gap-1"
                >
                  {isActive && (
                    <motion.div
                      layoutId="nav-pill"
                      className="absolute inset-0 bg-slate-100 rounded-xl -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <Icon 
                    className={cn(
                      "w-6 h-6 transition-colors duration-300",
                      isActive ? "text-slate-900" : "text-slate-400"
                    )} 
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  <span className={cn(
                    "text-[10px] font-medium transition-colors duration-300",
                     isActive ? "text-slate-900" : "text-slate-400"
                  )}>
                    {tab.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
