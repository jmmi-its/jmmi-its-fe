'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { cn } from '@/lib/utils';

interface FolderCardProps {
  title: string;
  folderId: string;
  className?: string;
}

/**
 * FolderCard component for displaying folder buttons
 * Navigates to folder detail page when clicked
 */
export default function FolderCard({
  title,
  folderId,
  className,
}: FolderCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/links/view?id=${folderId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={cn(
        // Base styles
        'w-full rounded-lg px-6 py-4 text-center font-medium text-white shadow-md transition-all duration-200',
        'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
        // Orange/terracotta background matching design
        'bg-gradient-to-r from-brand-red-700 to-brand-red hover:from-brand-red-700 hover:to-brand-red-700',
        className
      )}
    >
      <span className='text-sm sm:text-base md:text-lg'>{title}</span>
    </button>
  );
}
