'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLinksPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/links');
  }, [router]);

  return null;
}
