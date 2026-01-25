'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Suspense } from 'react';
import { IoChevronBack } from 'react-icons/io5';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetFolders } from '@/app/links/hook/useFolder';
import {
  useGetSubheadingById,
  useUpdateSubheading,
} from '@/app/links/hook/useSubheading';

function EditSubheadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subheadingId = searchParams.get('id');

  const {
    data: subheading,
    fetchSubheading,
    isLoading: isLoadingSubheading,
  } = useGetSubheadingById();
  const {
    data: folders,
    fetchFolders,
    isLoading: isLoadingFolders,
  } = useGetFolders();
  const { mutate: updateSubheading, isLoading: isUpdating } =
    useUpdateSubheading();

  const [selectedFolder, setSelectedFolder] = React.useState<string>('');
  const [subheadingTitle, setSubheadingTitle] = React.useState<string>('');
  const [subheadingWeight, setSubheadingWeight] = React.useState<string>('0');

  React.useEffect(() => {
    if (subheadingId) {
      fetchSubheading(subheadingId);
      fetchFolders();
    }
  }, [subheadingId, fetchSubheading, fetchFolders]);

  React.useEffect(() => {
    if (subheading) {
      setSubheadingTitle(subheading.title);
      setSubheadingWeight(subheading.weight.toString());
      setSelectedFolder(subheading.folder_id);
    }
  }, [subheading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFolder || !subheadingTitle) {
      alert('Folder dan judul subheading harus diisi!');
      return;
    }

    if (!subheadingId) return;

    const subheadingData = {
      subheading_id: subheadingId,
      folder_id: selectedFolder,
      title: subheadingTitle,
      weight: parseInt(subheadingWeight) || 0,
    };

    try {
      await updateSubheading(subheadingId, subheadingData);
      router.push('/links/admin/subheadings');
    } catch (error) {
      alert('Terjadi kesalahan saat update subheading');
    }
  };

  const isLoading = isLoadingSubheading || isLoadingFolders || isUpdating;

  const handleBack = () => {
    router.push('/links/admin/subheadings');
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <div className='w-full max-w-md space-y-8'>
          {/* Header */}
          <div className='bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg px-6 py-4 shadow-md text-center'>
            <Typography as='h2' variant='h5' className='text-white font-bold'>
              Edit Subheading
            </Typography>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='space-y-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm'
          >
            {/* Folder Selection */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Pilih Folder
              </label>
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white border-none focus:ring-2 focus:ring-blue-500 appearance-none'
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: 'right 0.5rem center',
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: '1.5em 1.5em',
                  paddingRight: '2.5rem',
                }}
              >
                <option value=''>Pilih Folder</option>
                {folders.map((folder) => (
                  <option key={folder.folder_id} value={folder.folder_id}>
                    {folder.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Subheading Title */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Judul Subheading
              </label>
              <input
                type='text'
                value={subheadingTitle}
                onChange={(e) => setSubheadingTitle(e.target.value)}
                placeholder='Masukkan judul subheading'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Weight */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Weight (urutan prioritas)
              </label>
              <input
                type='number'
                value={subheadingWeight}
                onChange={(e) => setSubheadingWeight(e.target.value)}
                placeholder='0'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
              <p className='text-xs text-gray-300'>
                Weight lebih tinggi = muncul lebih dulu
              </p>
            </div>

            {/* Actions */}
            <div className='pt-4 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-200'
              >
                Update Subheading
              </button>

              <button
                type='button'
                onClick={handleBack}
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

export default function EditSubheadingPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <EditSubheadingContent />
    </Suspense>
  );
}
