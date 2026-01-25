import * as React from 'react';

import NextImage from '@/components/NextImage';

/**
 * Shared layout wrapper for Links and About pages
 * Provides the background image and decorations
 */
export default function LinksLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='relative min-h-screen bg-[url(/images/links/background.png)] bg-cover bg-center overflow-hidden font-primary'>
      {/* Background decorations */}
      <div className='absolute inset-0 pointer-events-none'>
        <NextImage
          src='/images/links/top-left-decoration.png'
          alt='Top left decoration'
          width={500}
          height={500}
          className='absolute -top-32 -left-20 w-84 sm:w-100 md:w-120'
        />
        <NextImage
          src='/images/links/bottom-left-decoration.png'
          alt='Bottom left decoration'
          width={500}
          height={500}
          className='absolute -bottom-20 -right-40 w-84 sm:w-100 md:w-120'
        />
      </div>
      {children}
    </div>
  );
}
