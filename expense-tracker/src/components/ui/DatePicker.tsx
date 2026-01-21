import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, X, Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  className?: string;
}

export function DatePicker({ value, onChange, label, className }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentViewDate, setCurrentViewDate] = useState(new Date(value || new Date()));

  // 计算日历数据
  const calendarData = useMemo(() => {
    const year = currentViewDate.getFullYear();
    const month = currentViewDate.getMonth();
    
    // 该月第一天
    const firstDay = new Date(year, month, 1);
    // 第一天是周几 (0-6, 0是周日)
    const startDay = firstDay.getDay();
    // 该月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    // 填充空白
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  }, [currentViewDate]);

  const handleDateSelect = (date: Date) => {
    // 修复时区偏差：手动拼接本地日期字符串
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const formatted = `${y}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const changeMonth = (offset: number) => {
    const next = new Date(currentViewDate);
    next.setMonth(next.getMonth() + offset);
    setCurrentViewDate(next);
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}` === value;
  };

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  return (
    <>
      {/* 触发器 */}
      <div 
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 bg-slate-50 rounded-2xl p-3 cursor-pointer border border-transparent active:scale-95 transition-all",
          className
        )}
      >
        <CalendarIcon className="w-4 h-4 text-blue-500" />
        <span className="text-xs font-bold text-slate-700">
          {value || '选择日期'}
        </span>
      </div>

      {/* 底部弹窗 */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[200] flex items-end justify-center">
            {/* 遮罩层 */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            {/* 抽屉内容 */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-[2.5rem] p-6 pb-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900">{label || '选择日期'}</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 日历头部 */}
              <div className="flex items-center justify-between mb-4 px-2">
                <span className="font-black text-slate-800">
                  {currentViewDate.getFullYear()}年 {currentViewDate.getMonth() + 1}月
                </span>
                <div className="flex gap-2">
                  <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100"><ChevronLeft className="w-4 h-4" /></button>
                  <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-50 rounded-xl border border-slate-100"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              {/* 星期表头 */}
              <div className="grid grid-cols-7 mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                  <div key={d} className="text-center text-[10px] font-black text-slate-300 uppercase">{d}</div>
                ))}
              </div>

              {/* 日期网格 */}
              <div className="grid grid-cols-7 gap-1">
                {calendarData.map((date, i) => (
                  <div key={i} className="aspect-square flex items-center justify-center">
                    {date ? (
                      <button 
                        onClick={() => handleDateSelect(date)}
                        className={cn(
                          "w-full h-full rounded-2xl text-sm font-bold transition-all flex flex-col items-center justify-center relative",
                          isSelected(date) 
                            ? "bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110" 
                            : "hover:bg-slate-50 text-slate-700",
                          isToday(date) && !isSelected(date) && "text-blue-600"
                        )}
                      >
                        {date.getDate()}
                        {isToday(date) && (
                          <div className={cn("w-1 h-1 rounded-full absolute bottom-1.5", isSelected(date) ? "bg-white" : "bg-blue-600")} />
                        )}
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
