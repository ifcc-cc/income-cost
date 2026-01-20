import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  isLoading?: boolean;
  children?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    
    const variants = {
      primary: "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 border-transparent",
      secondary: "bg-white text-brand-900 border-slate-200 hover:bg-slate-50",
      outline: "bg-transparent border-slate-200 text-slate-600 hover:bg-slate-50",
      ghost: "bg-transparent border-transparent text-slate-600 hover:bg-slate-50/50",
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.97 }}
        className={cn(
          "relative flex items-center justify-center w-full px-6 py-3.5 text-base font-medium transition-colors border rounded-2xl focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-brand-500 disabled:opacity-50 disabled:pointer-events-none",
          variants[variant],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="w-5 h-5 mr-2 animate-spin" />}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";
