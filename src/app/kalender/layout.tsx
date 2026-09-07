import { Metadata } from 'next';
import * as React from 'react';

export const metadata: Metadata = {
  title: 'Kalender',
  description: 'Kalender kegiatan JMMI ITS berisi agenda, jadwal acara, lokasi, dan informasi aktivitas organisasi.',
};

export default function KalenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
