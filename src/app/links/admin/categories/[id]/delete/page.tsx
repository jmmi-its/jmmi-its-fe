'use client';

import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import {
  useDeleteCategory,
  useGetCategoryById,
} from '@/app/links/hook/useCategory';

export default function DeleteCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;

  const {
    data: category,
    fetchCategory,
    isLoading: isLoadingData,
  } = useGetCategoryById();
  const { mutateAsync: deleteCategory, isLoading: isDeleting } =
    useDeleteCategory();

  React.useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
    }
  }, [categoryId, fetchCategory]);

  const handleDelete = async () => {
    // console.log('Deleting category:', categoryId);
    try {
      await deleteCategory(categoryId);
      router.push('/links/admin');
    } catch (error) {
      alert('Terjadi kesalahan saat menghapus kategori');
    }
  };

  const isLoading = isLoadingData;
  const categoryTitle = category?.title || '';

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className='min-h-screen flex items-center justify-center p-4'>
      <div className='relative z-10 w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-xl'>
        <div className='text-center mb-6'>
          <Typography
            as='h2'
            variant='h4'
            className='text-red-400 font-bold mb-2'
          >
            Hapus Kategori?
          </Typography>
          <div className='w-16 h-1 bg-red-500 mx-auto rounded-full'></div>
        </div>

        <div className='space-y-4 mb-8 text-center'>
          <Typography className='text-gray-100'>
            Apakah Anda yakin ingin menghapus kategori ini?
          </Typography>

          <div className='bg-black/20 rounded-lg px-4 py-3 border border-white/5'>
            <Typography className='text-white font-medium text-lg'>
              {categoryTitle}
            </Typography>
          </div>

          <Typography className='text-red-200 text-sm'>
            ⚠️ Folder yang ada di dalam kategori ini mungkin akan menjadi
            'Lainnya' atau perlu dipindahkan.
          </Typography>
        </div>

        <div className='flex flex-col gap-3'>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className='w-full bg-gradient-to-r from-red-600 to-red-500 text-white font-bold py-3 px-6 rounded-lg hover:from-red-700 hover:to-red-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-red-900/20'
          >
            {isDeleting ? 'Menghapus...' : 'Ya, Hapus Permanen'}
          </button>

          <button
            onClick={() => router.push('/links/admin')}
            disabled={isDeleting}
            className='w-full bg-white/10 text-white font-medium py-3 px-6 rounded-lg hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
          >
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}
