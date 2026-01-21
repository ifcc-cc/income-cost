import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Option {
  label: string;
  value: string;
}

interface PickerProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
  triggerIcon?: React.ReactNode;
}

export function Picker({ options, value, onChange, label, placeholder, className, triggerIcon }: PickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(o => o.value === value);

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <>
      {/* 触发器 */}
      <div 
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center justify-between gap-2 bg-slate-50 rounded-2xl p-3 cursor-pointer border border-transparent active:scale-95 transition-all",
          className
        )}
      >
        <div className="flex items-center gap-2">
          {triggerIcon}
          <span className="text-xs font-bold text-slate-700">
            {selectedOption ? selectedOption.label : placeholder || '请选择'}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </div>

      {/* 底部抽屉 */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[210] flex items-end justify-center">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md bg-white rounded-t-[2.5rem] p-6 pb-12 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-black text-slate-900">{label || '请选择'}</h3>
                <button onClick={() => setIsOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between p-4 rounded-2xl transition-all",
                      value === option.value 
                        ? "bg-blue-50 text-blue-600 font-black" 
                        : "hover:bg-slate-50 text-slate-600 font-bold"
                    )}
                  >
                    {option.label}
                    {value === option.value && <Check className="w-5 h-5" />}
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
