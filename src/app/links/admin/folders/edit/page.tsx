'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Suspense } from 'react';
import { IoChevronBack } from 'react-icons/io5';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetCategories } from '@/app/links/hook/useCategory';
import { useGetFolderById, useUpdateFolder } from '@/app/links/hook/useFolder';

function EditFolderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const folderId = searchParams.get('id');

  const {
    data: folderData,
    fetchFolder,
    isLoading: isLoadingFolder,
  } = useGetFolderById();
  const {
    data: categories,
    fetchCategories,
    isLoading: isLoadingCategories,
  } = useGetCategories();
  const { mutate: updateFolder, isLoading: isUpdating } = useUpdateFolder();

  const [folderTitle, setFolderTitle] = React.useState<string>('');
  const [folderWeight, setFolderWeight] = React.useState<string>('0');
  const [selectedCategory, setSelectedCategory] = React.useState<string>('');

  React.useEffect(() => {
    if (folderId) {
      fetchFolder(folderId);
      fetchCategories();
    }
  }, [folderId, fetchFolder, fetchCategories]);

  React.useEffect(() => {
    if (folderData && folderData.folder) {
      setFolderTitle(folderData.folder.title);
      setFolderWeight(folderData.folder.weight.toString());
      setSelectedCategory(folderData.folder.category_id || '');
    }
  }, [folderData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!folderTitle) {
      alert('Judul folder harus diisi!');
      return;
    }

    if (!folderId) return;

    const _folderData = {
      folder_id: folderId,
      title: folderTitle,
      category_id: selectedCategory || null,
      weight: parseInt(folderWeight) || 0,
    };

    try {
      await updateFolder(folderId, _folderData);
      router.push('/links/admin/folders');
    } catch (error) {
      alert('Terjadi kesalahan saat update folder');
    }
  };

  const isLoading = isLoadingFolder || isLoadingCategories || isUpdating;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* Header */}
          <div className='bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg px-6 py-4 shadow-md text-center'>
            <Typography as='h2' variant='h5' className='text-white font-bold'>
              Edit Folder
            </Typography>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='space-y-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm'
          >
            {/* Category Selection */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Pilih Kategori (Opsional)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white border-none focus:ring-2 focus:ring-blue-500 appearance-none'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value=''>Tanpa Kategori (Uncategorized)</option>
                {categories.map((cat) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Folder Title */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Judul Folder
              </label>
              <input
                type='text'
                value={folderTitle}
                onChange={(e) => setFolderTitle(e.target.value)}
                placeholder='Masukkan judul folder'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Folder Weight */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Weight (urutan prioritas)
              </label>
              <input
                type='number'
                value={folderWeight}
                onChange={(e) => setFolderWeight(e.target.value)}
                placeholder='0'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
              <p className='text-xs text-gray-300'>
                Weight lebih tinggi = muncul lebih dulu di Homepage
              </p>
            </div>

            {/* Buttons */}
            <div className='pt-4 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-200'
              >
                Update Folder
              </button>

              <button
                type='button'
                onClick={() => router.push('/links/admin/folders')}
                className='w-full text-white py-2 hover:text-gray-300 transition-colors flex items-center justify-center gap-2'
              >
                <IoChevronBack className='w-5 h-5' />
                <span>Kembali</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default function EditFolderPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <EditFolderContent />
    </Suspense>
  );
}
