'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { IoChevronBack } from 'react-icons/io5';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetCategories } from '@/app/links/hook/useCategory';

import { Category } from '@/types/entities/links';

export default function CategoriesListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const { data: categories, isLoading, fetchCategories } = useGetCategories();
  const [filteredCategories, setFilteredCategories] = React.useState<
    Category[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  React.useEffect(() => {
    if (categories) {
      const filtered = categories.filter((cat) =>
        cat.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCategories(filtered);
    }
  }, [searchQuery, categories]);

  const handleItemClick = (item: Category) => {
    if (action === 'edit') {
      router.push(`/links/admin/categories/edit?id=${item.category_id}`);
    } else if (action === 'delete') {
      router.push(`/links/admin/categories/delete?id=${item.category_id}`);
    }
  };

  const pageTitle =
    action === 'edit'
      ? 'Pilih Kategori untuk Diedit'
      : 'Pilih Kategori untuk Dihapus';

  return (
    <>
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12 h-screen'>
        <div className='w-full max-w-md flex flex-col h-full'>
          <div className='bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg px-6 py-4 shadow-md text-center mb-6 shrink-0'>
            <Typography as='h2' variant='h5' className='text-white font-bold'>
              {pageTitle}
            </Typography>
          </div>

          <div className='mb-4 shrink-0'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari kategori...'
              className='w-full px-4 py-3 rounded-lg bg-blue-700/80 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm'
            />
          </div>

          <div className='flex-1 overflow-y-auto space-y-3 min-h-0 mb-6 pr-2 custom-scrollbar'>
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <Loading className='border-white/20 border-t-white' />
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className='text-center text-gray-300 py-4'>
                Tidak ada data ditemukan.
              </div>
            ) : (
              filteredCategories.map((item) => (
                <button
                  key={item.category_id}
                  onClick={() => handleItemClick(item)}
                  className='w-full text-left bg-white/10 hover:bg-white/20 p-4 rounded-lg transition-all duration-200 flex justify-between items-center group border border-white/5 shadow-sm'
                >
                  <div className='min-w-0'>
                    <Typography
                      className='text-white font-medium group-hover:text-amber-300 transition-colors truncate'
                      variant='body'
                    >
                      {item.title}
                    </Typography>
                    <Typography className='text-gray-400 text-xs mt-1'>
                      Weight: {item.weight}
                    </Typography>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className='shrink-0 pt-2'>
            <button
              onClick={() => router.push('/links/admin')}
              className='w-full text-white py-3 hover:bg-white/10 rounded-lg transition-colors flex items-center justify-center gap-2'
            >
              <IoChevronBack className='w-5 h-5' />
              <Typography as='span' variant='body' weight='medium'>
                Kembali
              </Typography>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
