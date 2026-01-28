'use client';

import { CheckCircle2, XCircle } from 'lucide-react';
import * as React from 'react';
import { FaWhatsapp } from 'react-icons/fa';

import { AnnouncementData } from '@/app/announcement/hook/useCheckAnnouncement';

// Static Content Configuration
const STATIC_CONTENT = {
  passed: {
    groupLink: 'https://chat.whatsapp.com/Ld2svqqCVpk3NczadlIEIz', // Ganti dengan link grup asli
    skLink: 'https://its.id/m/SKLOLOSINTERVIEWJMMIITS2026', // Ganti dengan link SK asli
  },
  failed: {
    motivation: 'Kegagalan adalah kesuksesan yang tertunda. Tetap semangat!',
    skLink: 'https://its.id/m/SKLOLOSINTERVIEWJMMIITS2026', // Ganti dengan link SK asli
  },
};

type ResultCardProps = {
  data: AnnouncementData;
};

export default function ResultCard({ data }: ResultCardProps) {
  const isPassed = data.status === 'passed';

  return (
    <div className='w-full animate-in fade-in slide-in-from-bottom-5 duration-700'>
      <div className='relative bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden border border-white/20'>
        {/* Header Status */}
        <div
          className={`px-6 py-6 text-center ${
            isPassed ? 'bg-emerald-50' : 'bg-rose-50'
          }`}
        >
          <div className='flex justify-center mb-3'>
            {isPassed ? (
              <CheckCircle2 className='w-16 h-16 text-emerald-500' />
            ) : (
              <XCircle className='w-16 h-16 text-rose-500' />
            )}
          </div>
          <h2
            className={`text-2xl font-bold ${
              isPassed ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {isPassed
              ? 'Selamat! Anda Lolos Staff Muda JMMI ITS 2026'
              : 'Mohon Maaf, Anda Dinyatakan Tidak Lolos Staff Muda JMMI ITS 2026'}
          </h2>
          {isPassed && (
            <p className='text-gray-700 mt-2 font-medium'>Halo, {data.name}</p>
          )}
        </div>

        {/* Content Body */}
        <div className='p-6 space-y-6'>
          {isPassed ? (
            <div className='space-y-4'>
              <div className='text-center p-4 bg-gray-50 rounded-lg border border-gray-100'>
                <p className='text-xs text-gray-500 uppercase tracking-wide font-semibold'>
                  Codename Anda
                </p>
                <p className='text-3xl font-mono font-bold text-gray-800 mt-1 tracking-wider'>
                  {data.codename || 'N/A'}
                </p>
              </div>
              <p className='text-center text-sm text-gray-600'>
                Selamat bergabung dengan keluarga besar JMMI ITS 2026. Silakan
                bergabung ke grup WhatsApp melalui tombol di bawah ini.
              </p>
            </div>
          ) : (
            <div className='space-y-4 text-center'>
              <p className='text-gray-700 italic text-base'>
                "{STATIC_CONTENT.failed.motivation}"
              </p>
              <p className='text-sm text-gray-500'>
                Masih ada kesempatan lain untuk berkembang. Tetaplah menjadi
                bagian penggerak dari Masjid Manarul Ilmi ITS, semoga sukses di
                masa depan Anda
              </p>
            </div>
          )}

          {/* Actions - Using style similar to LinkButton */}
          <div className='space-y-3'>
            {isPassed && (
              <>
                <div className='bg-amber-50 border-l-4 border-amber-500 p-4 rounded-r-md text-left'>
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
                      <p className='text-sm text-amber-700'>
                        <span className='font-bold'>Penting:</span> Mohon untuk
                        tidak membagikan link grup ini kepada siapapun.
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href={STATIC_CONTENT.passed.groupLink}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block'
                >
                  <button className='w-full flex items-center justify-center space-x-2 rounded-lg px-6 py-3 font-medium text-white shadow-md transition-all duration-200 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-600'>
                    <FaWhatsapp className='w-5 h-5' />
                    <span>Gabung Grup WhatsApp</span>
                  </button>
                </a>
              </>
            )}

            <a
              href={
                isPassed
                  ? STATIC_CONTENT.passed.skLink
                  : STATIC_CONTENT.failed.skLink
              }
              target='_blank'
              rel='noopener noreferrer'
              className='block'
            >
              <button className='w-full flex items-center justify-center space-x-2 rounded-lg px-6 py-3 font-medium text-gray-700 bg-white border border-gray-200 shadow-sm transition-all duration-200 hover:bg-gray-50 hover:shadow-md hover:scale-[1.02] active:scale-[0.98]'>
                <span>Unduh SK Pengumuman</span>
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
