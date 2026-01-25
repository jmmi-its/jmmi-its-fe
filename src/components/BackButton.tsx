'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';
import { IoChevronBack } from 'react-icons/io5';

interface BackButtonProps {
  href?: string;
  label?: string;
  className?: string;
}

export default function BackButton({
  href = '/links',
  label = 'Kembali',
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(href);
  };

  return (
    <div className={`mt-8 mb-8 ${className || ''}`}>
      <button
        onClick={handleClick}
        className='flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold tracking-wide transition-colors group'
      >
        <div className='p-1 rounded-full bg-transparent group-hover:bg-amber-400/10 transition-colors'>
          <IoChevronBack className='w-5 h-5' />
        </div>
        <span>{label}</span>
      </button>
    </div>
  );
}
