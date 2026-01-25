'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import BackButton from '@/components/BackButton';
import Typography from '@/components/Typography';

import { useGetCategories } from '@/app/links/hook/useCategory';
import { useCreateFolder } from '@/app/links/hook/useFolder';

export default function NewFolderPage() {
  const router = useRouter();
  const { mutate: createFolder } = useCreateFolder();
  const { data: categories, fetchCategories } = useGetCategories();

  const [folderTitle, setFolderTitle] = React.useState('');
  const [folderWeight, setFolderWeight] = React.useState('0');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderTitle) {
      alert('Judul folder harus diisi!');
      return;
    }

    const _folderData = {
      title: folderTitle,
      category_id: selectedCategory || null,
      weight: parseInt(folderWeight) || 0,
    };

    try {
      await createFolder(_folderData);
      router.push('/links/admin');
    } catch (error) {
      alert('Terjadi kesalahan saat membuat folder');
    }
  };

  return (
    <>
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <div className='w-full max-w-lg space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <Typography
              as='h2'
              variant='h5'
              className='text-white font-bold tracking-tight'
            >
              Tambah Folder Baru
            </Typography>
            <div className='h-1 w-24 bg-orange-500 mx-auto rounded-full'></div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='space-y-6 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl'
          >
            {/* Category Selection */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Pilih Kategori (Opsional)
              </label>
              <div className='relative'>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none outline-none'
                >
                  <option value='' className='bg-gray-800 text-gray-300'>
                    Tanpa Kategori (Uncategorized)
                  </option>
                  {categories.map((cat) => (
                    <option
                      key={cat.category_id}
                      value={cat.category_id}
                      className='bg-gray-800 text-white'
                    >
                      {cat.title}
                    </option>
                  ))}
                </select>
                <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth={2}
                      d='M19 9l-7 7-7-7'
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Folder Title */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Judul Folder
              </label>
              <div className='relative'>
                <input
                  type='text'
                  value={folderTitle}
                  onChange={(e) => setFolderTitle(e.target.value)}
                  placeholder='Masukkan judul folder'
                  className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
                />
              </div>
            </div>

            {/* Folder Weight */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Weight (urutan prioritas)
              </label>
              <input
                type='number'
                value={folderWeight}
                onChange={(e) => setFolderWeight(e.target.value)}
                placeholder='0'
                className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
              />
              <p className='text-xs text-gray-400 ml-1'>
                Weight lebih tinggi = muncul lebih dulu di Homepage
              </p>
            </div>

            {/* Buttons */}
            <div className='pt-6 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 px-6 rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300'
              >
                Simpan Folder
              </button>
            </div>
          </form>

          <BackButton href='/links/admin' />
        </div>
      </div>
    </>
  );
}
