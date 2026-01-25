import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import * as React from 'react';

import { cn } from '@/lib/utils';

export default function Forbidden() {
  return (
    <div className='flex min-h-screen flex-col items-center justify-center text-center'>
      <div className='rounded-full bg-red-100 p-6 text-red-600 dark:bg-red-900/20 dark:text-red-400'>
        <ShieldAlert size={64} />
      </div>
      <h1 className='mt-6 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl'>
        Access Denied
      </h1>
      <p className='mt-4 text-base text-gray-600 dark:text-gray-400'>
        You do not have permission to access this page.
      </p>
      <div className='mt-10'>
        <Link
          href='/'
          className={cn(
            'rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-primary-600',
            'transition-all duration-200 hover:scale-105 active:scale-95'
          )}
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
