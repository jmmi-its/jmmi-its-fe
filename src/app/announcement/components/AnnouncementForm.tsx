'use client';

import { ArrowRight, User } from 'lucide-react';
import * as React from 'react';

type AnnouncementFormProps = {
  onSubmit: (nrp: string) => void;
  isLoading?: boolean;
};

export default function AnnouncementForm({
  onSubmit,
  isLoading = false,
}: AnnouncementFormProps) {
  const [nrp, setNrp] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nrp.trim()) {
      onSubmit(nrp);
    }
  };

  return (
    <div className='w-full animate-in fade-in zoom-in duration-500'>
      <div className='bg-white/90 backdrop-blur-xs rounded-xl p-6 shadow-xl space-y-6'>
        <div className='text-center space-y-2'>
          <h2 className='text-2xl font-bold text-gray-800'>
            Cek Status Kelolosan
          </h2>
          <p className='text-gray-600 text-sm'>
            Masukkan NRP yang Anda gunakan saat pendaftaran.
          </p>
        </div>

        <div className='bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md'>
          <div className='flex'>
            <div className='flex-shrink-0'>
              <svg
                className='h-5 w-5 text-amber-400'
                viewBox='0 0 20 20'
                fill='currentColor'
              >
                <path
                  fillRule='evenodd'
                  d='M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z'
                  clipRule='evenodd'
                />
              </svg>
            </div>
            <div className='ml-3'>
              <p className='text-sm text-amber-700 font-medium'>
                Berdoalah terlebih dahulu, dan semoga mendapatkan hasil yang
                terbaik.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <div className='relative'>
              <div className='absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400'>
                <User className='h-5 w-5' />
              </div>
              <input
                type='text'
                id='nrp'
                className='block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition duration-150 ease-in-out sm:text-sm'
                placeholder='50252xxx'
                value={nrp}
                onChange={(e) => {
                  // Allow only numbers
                  const val = e.target.value.replace(/\D/g, '');
                  setNrp(val);
                }}
                inputMode='numeric'
                required
              />
            </div>
          </div>

          <button
            type='submit'
            disabled={isLoading}
            className='w-full flex items-center justify-center space-x-2 rounded-lg px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-brand-blue-700 to-brand-blue hover:from-brand-blue hover:to-brand-blue-700 disabled:opacity-70 disabled:cursor-not-allowed'
          >
            {isLoading ? <span>Memuat...</span> : <span>Cek Hasil</span>}
            {!isLoading && <ArrowRight className='w-5 h-5 ml-1' />}
          </button>
        </form>

        <div className='text-center space-y-3 pt-4 border-t border-gray-200'>
          <p className='text-sm text-gray-500'>Butuh bantuan? Hubungi kami:</p>
          <div className='flex justify-center flex-wrap gap-4'>
            <a
              href='https://wa.me/62882003312700'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center space-x-1 text-sm font-medium text-brand-green hover:underline'
            >
              <span>CP 1 (🧕 Nadia)</span>
            </a>
            <span className='text-gray-300 hidden sm:inline'>|</span>
            <a
              href='https://wa.me/6288803311560'
              target='_blank'
              rel='noopener noreferrer'
              className='inline-flex items-center space-x-1 text-sm font-medium text-brand-blue hover:underline'
            >
              <span>CP 2 (🤵 Jefri)</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
