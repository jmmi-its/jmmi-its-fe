'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

type LinkButtonVariant = 'general' | 'orange' | 'blue';

interface LinkButtonProps {
  title: string;
  url: string;
  variant?: LinkButtonVariant;
  className?: string;
  newTab?: boolean;
}

/**
 * LinkButton component for displaying individual links
 * Opens link in new tab when clicked by default
 */
export default function LinkButton({
  title,
  url,
  variant = 'blue',
  className,
  newTab = true,
}: LinkButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (newTab) {
      window.open(url, '_blank', 'noopener,noreferrer');
    } else {
      router.push(url);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base styles
        'w-full rounded-lg px-6 py-4 text-center font-medium text-white shadow-md transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        // Variant styles
        variant === 'orange' &&
          'bg-gradient-to-r from-brand-red-700 to-brand-red hover:from-brand-red hover:to-brand-red-700',
        variant === 'blue' &&
          'bg-gradient-to-r from-brand-blue-700 to-brand-blue hover:from-brand-blue hover:to-brand-blue-700',
        variant === 'general' &&
          'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-800 hover:to-gray-700',
        className
      )}
    >
      <span className='text-sm sm:text-base md:text-lg'>{title}</span>
    </button>
  );
}
