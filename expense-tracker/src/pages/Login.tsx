import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Lock, User, ArrowRight, Wallet } from 'lucide-react';
import { api } from '@/lib/api';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function LoginPage({ onLoginSuccess }: LoginProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nickname: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { placeholder, value, type } = e.target;
    
    if (placeholder === '昵称') setFormData(prev => ({...prev, nickname: value}));
    else if (type === 'email') setFormData(prev => ({...prev, email: value}));
    else if (placeholder === '密码') setFormData(prev => ({...prev, password: value}));
    else if (placeholder === '确认密码') setFormData(prev => ({...prev, confirmPassword: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        // 登录
        const res = await api.post<any>('/auth/login', {
          email: formData.email,
          password: formData.password
        });
        api.setTokens(res.accessToken, res.refreshToken);
        onLoginSuccess(res.user);
      } else {
        // 注册
        if (formData.password !== formData.confirmPassword) {
          alert("两次密码不一致");
          return;
        }
        await api.post('/auth/register', {
          email: formData.email,
          password: formData.password,
          nickname: formData.nickname
        });
        alert('注册成功，请登录');
        setIsLogin(true);
      }
    } catch (err: any) {
      alert(err.message || '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 flex flex-col justify-center px-6">
      {/* 背景装饰 - 弥散光 */}
      <div className="absolute top-[-10%] right-[-20%] w-[80%] h-[50%] rounded-full bg-brand-200/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-20%] w-[80%] h-[50%] rounded-full bg-blue-200/30 blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-sm mx-auto"
      >
        {/* Logo 区 */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-6 rounded-3xl bg-gradient-to-tr from-brand-400 to-brand-600 text-white shadow-xl shadow-brand-500/20">
            <Wallet className="w-8 h-8" />
          </div>
          <motion.h1 
            key={isLogin ? "login-title" : "reg-title"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-slate-900 tracking-tight"
          >
            {isLogin ? "欢迎回来" : "创建账户"}
          </motion.h1>
          <p className="mt-3 text-slate-500">
            {isLogin ? "登录以管理您的财富" : "开启您的极简理财之旅"}
          </p>
        </div>

        {/* 表单区 - 使用 Glass 效果 */}
        <div className="p-1">
            <AnimatePresence mode="wait">
              <motion.form
                key={isLogin ? "login" : "register"}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
                onSubmit={handleSubmit}
              >
                {!isLogin && (
                  <Input 
                    placeholder="昵称" 
                    icon={<User className="w-5 h-5" />} 
                    onChange={handleChange}
                    required
                  />
                )}
                <Input 
                  type="email" 
                  placeholder="电子邮箱" 
                  icon={<Mail className="w-5 h-5" />} 
                  onChange={handleChange}
                  required
                />
                <Input 
                  type="password" 
                  placeholder="密码" 
                  icon={<Lock className="w-5 h-5" />} 
                  onChange={handleChange}
                  required
                />

                {!isLogin && (
                   <Input 
                   type="password" 
                   placeholder="确认密码" 
                   icon={<Lock className="w-5 h-5" />} 
                   onChange={handleChange}
                   required
                 />
                )}
                
                <div className="pt-2">
                  <Button type="submit" isLoading={isLoading} className="w-full text-lg shadow-brand-500/40">
                    {isLogin ? "登 录" : "注 册"} <ArrowRight className="w-5 h-5 ml-2 opacity-80" />
                  </Button>
                </div>
              </motion.form>
            </AnimatePresence>
        </div>

        {/* 底部切换 */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-500">
            {isLogin ? "还没有账号？" : "已有账号？"}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-semibold text-brand-600 hover:text-brand-700 transition-colors"
            >
              {isLogin ? "立即注册" : "直接登录"}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
