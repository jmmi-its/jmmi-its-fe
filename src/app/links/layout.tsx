import * as React from 'react';

import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LinksLayoutWrapper>{children}</LinksLayoutWrapper>;
}
