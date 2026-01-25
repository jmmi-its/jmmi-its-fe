import * as React from 'react';

import { cn } from '@/lib/utils';

export enum TypographyVariant {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6,
  title,
  body,
  label,
}

enum FontVariant {
  marquisette,
  zabal,
}

enum FontWeight {
  regular,
  medium,
  bold,
}

type TypographyProps<T extends React.ElementType> = {
  as?: T;
  className?: string;
  weight?: keyof typeof FontWeight;
  font?: keyof typeof FontVariant;
  variant?: keyof typeof TypographyVariant;
  children: React.ReactNode;
};

export default function Typography<T extends React.ElementType>({
  as,
  children,
  weight = 'regular',
  className,
  font = 'zabal',
  variant = 'title',
  ...props
}: TypographyProps<T> &
  Omit<React.ComponentProps<T>, keyof TypographyProps<T>>) {
  const Component = as || 'p';
  return (
    <Component
      className={cn(
        // *=============== Font Type ==================
        [
          font === 'marquisette' && [
            'font-heading',
            [
              weight === 'regular' && 'font-normal',
              weight === 'medium' && 'font-normal',
              weight === 'bold' && 'font-normal',
            ],
          ],
          font === 'zabal' && [
            'font-body',
            [
              weight === 'regular' && 'font-normal',
              weight === 'medium' && 'font-medium',
              weight === 'bold' && 'font-bold',
            ],
          ],
        ],
        // *=============== Font Variants ==================
        [
          variant === 'h1' && [
            'text-2xl leading-tight sm:text-5xl sm:leading-tight md:text-6xl md:leading-tight lg:text-7xl lg:leading-tight',
          ],
          variant === 'h2' && [
            'text-xl leading-tight sm:text-4xl sm:leading-tight md:text-5xl md:leading-tight lg:text-6xl lg:leading-tight',
          ],
          variant === 'h3' && [
            'text-lg leading-tight sm:text-3xl sm:leading-tight md:text-4xl md:leading-tight lg:text-5xl lg:leading-tight',
          ],
          variant === 'h4' && [
            'text-base leading-snug sm:text-2xl sm:leading-snug md:text-3xl md:leading-snug lg:text-4xl lg:leading-snug',
          ],
          variant === 'h5' && [
            'text-sm leading-snug sm:text-xl sm:leading-snug md:text-2xl md:leading-snug lg:text-3xl lg:leading-snug',
          ],
          variant === 'h6' && [
            'text-xs leading-normal sm:text-lg sm:leading-normal md:text-xl md:leading-normal lg:text-2xl lg:leading-normal',
          ],
          variant === 'title' && [
            'text-xs leading-normal sm:text-sm sm:leading-normal md:text-base md:leading-normal lg:text-lg lg:leading-normal',
          ],
          variant === 'body' && [
            'text-xs leading-relaxed sm:text-sm sm:leading-relaxed md:text-base md:leading-relaxed',
          ],
          variant === 'label' && [
            'text-[10px] leading-normal sm:text-xs sm:leading-normal md:text-sm md:leading-normal',
          ],
        ],
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
