import React from 'react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'dark';
  size?: 'default' | 'sm' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm hover:shadow-md hover:brightness-110 rounded-md': variant === 'default',
            'glass hover:bg-white/70 text-[hsl(var(--foreground))] rounded-md': variant === 'outline',
            'hover:bg-white/40 text-[hsl(var(--foreground))] rounded-md': variant === 'ghost',
            'bg-white/50 text-[hsl(var(--secondary-foreground))] hover:bg-white/70 backdrop-blur-sm rounded-md': variant === 'secondary',
            'bg-[hsl(220,20%,14%)] text-white hover:bg-[hsl(220,20%,20%)] rounded-md': variant === 'dark',
          },
          {
            'h-8 px-3.5 text-xs gap-1.5': size === 'default',
            'h-7 px-2.5 text-[11px] gap-1': size === 'sm',
            'h-8 w-8': size === 'icon',
          },
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
