import React from 'react';
import { cn } from '../../lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  initials: string;
  size?: 'sm' | 'md';
}

export const Avatar: React.FC<AvatarProps> = ({ initials, size = 'sm', className, ...props }) => {
  return (
    <div
      className={cn(
        'rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center font-semibold shrink-0 backdrop-blur-sm',
        {
          'h-7 w-7 text-[10px]': size === 'sm',
          'h-8 w-8 text-[11px]': size === 'md',
        },
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
};
