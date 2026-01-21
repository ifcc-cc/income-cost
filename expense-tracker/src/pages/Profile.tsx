import { useState } from 'react';
import { api } from '../lib/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { User, Shield, LogOut, ChevronRight, Camera, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfilePage({ user, onLogout, onUpdateUser }: { user: any, onLogout: () => void, onUpdateUser: (u: any) => void }) {
  const [view, setView] = useState<'main' | 'edit-profile' | 'change-password'>('main');
  const [nickname, setNickname] = useState(user.nickname || '');
  const [passwords, setPasswords] = useState({ old: '', new: '' });

  const handleUpdateProfile = async () => {
    try {
      const updated = await api.request('/users/me', { 
        method: 'PUT', 
        body: JSON.stringify({ nickname }) 
      });
      onUpdateUser(updated);
      setView('main');
    } catch (e: any) { alert(e.message); }
  };

  const handleChangePassword = async () => {
    try {
      await api.post('/users/change-password', { 
        oldPassword: passwords.old, 
        newPassword: passwords.new 
      });
      alert('密码修改成功');
      setView('main');
    } catch (e: any) { alert(e.message); }
  };

  return (
    <div className="relative min-h-screen bg-slate-50">
      <AnimatePresence mode="wait">
        {view === 'main' && (
          <motion.div 
            key="main"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="pb-24 pt-12 px-6"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-8">我的</h1>
            
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center mb-8">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center text-3xl font-black text-blue-600 mb-4">
                {user?.nickname?.[0] || 'U'}
              </div>
              <h2 className="text-xl font-bold text-slate-900">{user?.nickname}</h2>
              <p className="text-sm text-slate-400 font-medium">{user?.email}</p>
            </div>

            <div className="space-y-3">
              <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-50 overflow-hidden">
                <button onClick={() => setView('edit-profile')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 text-blue-500 rounded-xl"><User className="w-5 h-5" /></div>
                    <span className="font-bold text-slate-700">编辑资料</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
                <button onClick={() => setView('change-password')} className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-amber-50 text-amber-500 rounded-xl"><Shield className="w-5 h-5" /></div>
                    <span className="font-bold text-slate-700">修改登录密码</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300" />
                </button>
              </div>
              
              <button onClick={onLogout} className="w-full flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-2xl font-bold hover:bg-rose-100 transition-colors">
                <LogOut className="w-5 h-5" /> 退出登录
              </button>
            </div>
          </motion.div>
        )}

        {view === 'edit-profile' && (
          <motion.div key="edit" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pt-12 px-6">
            <button onClick={() => setView('main')} className="flex items-center gap-2 text-slate-400 mb-6 font-bold"><ArrowLeft className="w-5 h-5" /> 返回</button>
            <h2 className="text-2xl font-bold mb-8">编辑资料</h2>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6">
               <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-bold text-slate-400">{nickname[0] || 'U'}</div>
                    <button className="absolute bottom-0 right-0 bg-white p-1.5 rounded-full shadow-md border border-slate-100"><Camera className="w-4 h-4 text-blue-500" /></button>
                  </div>
               </div>
               <div>
                 <label className="text-xs font-bold text-slate-400 mb-2 block ml-1">昵称</label>
                 <Input value={nickname} onChange={e => setNickname(e.target.value)} className="h-14 bg-slate-50 border-none rounded-2xl" />
               </div>
               <Button onClick={handleUpdateProfile} className="h-14 bg-blue-600">保存修改</Button>
            </div>
          </motion.div>
        )}

        {view === 'change-password' && (
          <motion.div key="pass" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="pt-12 px-6">
            <button onClick={() => setView('main')} className="flex items-center gap-2 text-slate-400 mb-6 font-bold"><ArrowLeft className="w-5 h-5" /> 返回</button>
            <h2 className="text-2xl font-bold mb-8">修改密码</h2>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 space-y-6">
               <Input type="password" placeholder="原密码" className="h-14 bg-slate-50 border-none rounded-2xl" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} />
               <Input type="password" placeholder="新密码" className="h-14 bg-slate-50 border-none rounded-2xl" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
               <Button onClick={handleChangePassword} className="h-14 bg-blue-600">重置密码</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
