import React from 'react';
import { cn } from '../../lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({ className, variant = 'default', ...props }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded px-2 py-0.5 text-[10px] font-medium',
        {
          'bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]': variant === 'default',
          'bg-white/50 text-[hsl(var(--muted-foreground))]': variant === 'secondary',
          'bg-emerald-500/10 text-emerald-700': variant === 'success',
          'bg-amber-500/10 text-amber-700': variant === 'warning',
          'bg-red-500/10 text-red-600': variant === 'destructive',
        },
        className
      )}
      {...props}
    />
  );
};
