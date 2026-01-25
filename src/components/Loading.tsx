import React from 'react';

import { cn } from '@/lib/utils';

type LoadingProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullScreen?: boolean;
};

export default function Loading({
  className,
  size = 'md',
  fullScreen = false,
}: LoadingProps) {
  const sizeClasses = {
    sm: 'w-5 h-5 border-2',
    md: 'w-8 h-8 border-[3px]',
    lg: 'w-12 h-12 border-4',
    xl: 'w-16 h-16 border-[5px]',
  };

  const spinner = (
    <div
      className={cn(
        'relative animate-spin rounded-full border-primary-200 border-t-primary-600',
        sizeClasses[size],
        className
      )}
    >
      <div className='absolute inset-0 rounded-full border-primary-200 opacity-20'></div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className='fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md transition-all duration-300'>
        <div className='relative flex flex-col items-center justify-center gap-4 p-8 rounded-2xl bg-white/5 shadow-2xl ring-1 ring-white/20'>
          {/* Decorative background glow */}
          <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary-500/30 blur-2xl rounded-full animate-pulse'></div>

          {spinner}

          <p className='animate-pulse text-sm font-semibold tracking-widest text-primary-700 uppercase'>
            Loading
          </p>
        </div>
      </div>
    );
  }

  return spinner;
}
