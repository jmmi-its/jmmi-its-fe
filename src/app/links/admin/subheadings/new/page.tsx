'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import BackButton from '@/components/BackButton';
import Typography from '@/components/Typography';

import { useGetFolders } from '@/app/links/hook/useFolder';
import { useCreateSubheading } from '@/app/links/hook/useSubheading';

export default function AddSubheadingPage() {
  const router = useRouter();

  const { mutateAsync: createSubheading } = useCreateSubheading();
  const { data: folders, fetchFolders } = useGetFolders();

  const [selectedFolder, setSelectedFolder] = React.useState<string>('');
  const [subheadingTitle, setSubheadingTitle] = React.useState<string>('');
  const [subheadingWeight, setSubheadingWeight] = React.useState<string>('0');

  React.useEffect(() => {
    fetchFolders();
  }, [fetchFolders]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFolder || !subheadingTitle) {
      alert('Folder dan judul subheading harus diisi!');
      return;
    }

    const subheadingData = {
      folder_id: selectedFolder,
      title: subheadingTitle,
      weight: parseInt(subheadingWeight) || 0,
    };

    // console.log('Submitting subheading:', subheadingData);

    try {
      const response = await createSubheading(subheadingData);
      if (response.status) {
        router.push('/links/admin');
      } else {
        alert(response.message || 'Gagal membuat subheading');
      }
    } catch (error) {
      alert('Terjadi kesalahan saat membuat subheading');
    }
  };

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <div className='w-full max-w-lg space-y-8'>
          {/* Header */}
          <div className='text-center space-y-2'>
            <Typography
              as='h2'
              variant='h4'
              className='text-white font-bold tracking-tight'
            >
              Tambah Subheading
            </Typography>
            <div className='h-1 w-24 bg-orange-500 mx-auto rounded-full'></div>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='space-y-6 bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl'
          >
            {/* Folder Selection */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Pilih Folder
              </label>
              <div className='relative'>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className='w-full px-4 py-3 rounded-xl bg-white/5 text-white border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors appearance-none outline-none'
                >
                  <option value='' className='bg-gray-800 text-gray-300'>
                    Pilih Folder
                  </option>
                  {folders.map((folder) => (
                    <option
                      key={folder.folder_id}
                      value={folder.folder_id}
                      className='bg-gray-800 text-white'
                    >
                      {folder.title}
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

            {/* Subheading Title */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Judul Subheading
              </label>
              <input
                type='text'
                value={subheadingTitle}
                onChange={(e) => setSubheadingTitle(e.target.value)}
                placeholder='Masukkan judul subheading'
                className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
              />
            </div>

            {/* Weight */}
            <div className='space-y-2'>
              <label className='block text-gray-200 text-sm font-medium ml-1'>
                Weight (urutan prioritas)
              </label>
              <input
                type='number'
                value={subheadingWeight}
                onChange={(e) => setSubheadingWeight(e.target.value)}
                placeholder='0'
                className='w-full px-4 py-3 rounded-xl bg-white/5 text-white placeholder-white/30 border border-white/10 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors outline-none'
              />
              <p className='text-xs text-gray-400 ml-1'>
                Weight lebih tinggi = muncul lebih dulu
              </p>
            </div>

            {/* Actions */}
            <div className='pt-6 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3.5 px-6 rounded-xl hover:from-orange-700 hover:to-orange-600 hover:shadow-lg hover:translate-y-[-2px] transition-all duration-300'
              >
                Submit
              </button>
            </div>
          </form>

          <BackButton href='/links/admin' />
        </div>
      </div>
    </>
  );
}
