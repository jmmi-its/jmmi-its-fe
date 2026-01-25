'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import BackButton from '@/components/BackButton';
import Typography from '@/components/Typography';

import { useCreateCategory } from '@/app/links/hook/useCategory';

export default function NewCategoryPage() {
  const router = useRouter();
  const { mutateAsync: createCategory } = useCreateCategory();

  const [categoryTitle, setCategoryTitle] = React.useState('');
  const [categoryWeight, setCategoryWeight] = React.useState('0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryTitle) {
      alert('Judul kategori harus diisi!');
      return;
    }

    const categoryData = {
      title: categoryTitle,
      weight: parseInt(categoryWeight) || 0,
    };

    // console.log('Creating category:', categoryData);

    try {
      await createCategory(categoryData);
      router.push('/links/admin');
    } catch (error) {
      alert('Terjadi kesalahan saat membuat kategori');
    }
  };

  return (
    <>
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <div className='w-full max-w-lg space-y-8'>
          <div className='text-center space-y-2'>
            <Typography
              as='h2'
              variant='h4'
              className='text-white font-bold tracking-tight'
            >
              Tambah Kategori Baru
            </Typography>
            <div className='h-1 w-24 bg-orange-500 mx-auto rounded-full'></div>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-6 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl'
          >
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Judul Kategori
              </label>
              <input
                type='text'
                value={categoryTitle}
                onChange={(e) => setCategoryTitle(e.target.value)}
                placeholder='Masukkan judul kategori (misal: Departemen)'
                className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Weight (urutan prioritas)
              </label>
              <input
                type='number'
                value={categoryWeight}
                onChange={(e) => setCategoryWeight(e.target.value)}
                placeholder='0'
                className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
              />
              <p className='text-xs text-gray-400 ml-1'>
                Weight lebih tinggi = muncul lebih dulu di Homepage
              </p>
            </div>

            <div className='pt-6 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 px-6 rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300'
              >
                Simpan Kategori
              </button>
            </div>
          </form>

          <BackButton href='/links/admin' />
        </div>
      </div>
    </>
  );
}
