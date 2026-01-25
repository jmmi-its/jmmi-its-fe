'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Suspense } from 'react';
import { IoChevronBack } from 'react-icons/io5';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import {
  useGetCategoryById,
  useUpdateCategory,
} from '@/app/links/hook/useCategory';

function EditCategoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryId = searchParams.get('id');

  const {
    data: category,
    fetchCategory,
    isLoading: isLoadingData,
  } = useGetCategoryById();
  const { mutateAsync: updateCategory, isLoading: isUpdating } =
    useUpdateCategory();

  const [categoryTitle, setCategoryTitle] = React.useState('');
  const [categoryWeight, setCategoryWeight] = React.useState('0');

  React.useEffect(() => {
    if (categoryId) {
      fetchCategory(categoryId);
    }
  }, [categoryId, fetchCategory]);

  React.useEffect(() => {
    if (category) {
      setCategoryTitle(category.title);
      setCategoryWeight(category.weight.toString());
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!categoryTitle) {
      alert('Judul kategori harus diisi!');
      return;
    }

    if (!categoryId) return;

    const categoryData = {
      category_id: categoryId,
      title: categoryTitle,
      weight: parseInt(categoryWeight) || 0,
    };

    try {
      await updateCategory(categoryId, categoryData);
      router.push('/links/admin/categories');
    } catch (error) {
      alert('Terjadi kesalahan saat update kategori');
    }
  };

  const isLoading = isLoadingData || isUpdating;

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        <div className='w-full max-w-md space-y-8'>
          <div className='bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg px-6 py-4 shadow-md text-center'>
            <Typography as='h2' variant='h5' className='text-white font-bold'>
              Edit Kategori
            </Typography>
          </div>

          <form
            onSubmit={handleSubmit}
            className='space-y-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm'
          >
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Judul Kategori
              </label>
              <input
                type='text'
                value={categoryTitle}
                onChange={(e) => setCategoryTitle(e.target.value)}
                placeholder='Masukkan judul kategori'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Weight (urutan prioritas)
              </label>
              <input
                type='number'
                value={categoryWeight}
                onChange={(e) => setCategoryWeight(e.target.value)}
                placeholder='0'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
              <p className='text-xs text-gray-300'>
                Weight lebih tinggi = muncul lebih dulu di Homepage
              </p>
            </div>

            <div className='pt-4 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-200'
              >
                Update Kategori
              </button>

              <button
                type='button'
                onClick={() => router.push('/links/admin/categories')}
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

export default function EditCategoryPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <EditCategoryContent />
    </Suspense>
  );
}
