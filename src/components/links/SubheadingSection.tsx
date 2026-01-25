import * as React from 'react';

import LinkButton from '@/components/links/LinkButton';
import Typography from '@/components/Typography';

import { Link } from '@/types/entities/links';

interface SubheadingSectionProps {
  title: string;
  links: Link[];
}

/**
 * SubheadingSection component for grouping links under a subheading
 * Used in folder detail pages
 */
export default function SubheadingSection({
  title,
  links,
}: SubheadingSectionProps) {
  // Sort links by weight in descending order
  const sortedLinks = [...links].sort((a, b) => b.weight - a.weight);

  return (
    <div className='w-full space-y-4'>
      {/* Subheading title */}
      <div className='relative flex items-center justify-center my-6'>
        <div className='h-px bg-white/30 flex-1'></div>
        <Typography
          as='h3'
          variant='h6'
          className='px-4 text-center text-white'
          weight='medium'
        >
          {title}
        </Typography>
        <div className='h-px bg-white/30 flex-1'></div>
      </div>

      {/* Links under this subheading */}
      <div className='space-y-3'>
        {sortedLinks.map((link) => (
          <LinkButton
            key={link.link_id}
            title={link.title}
            url={link.link}
            variant='blue'
          />
        ))}
      </div>
    </div>
  );
}
