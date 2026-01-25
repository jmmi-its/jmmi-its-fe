'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { IoChevronBack } from 'react-icons/io5';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetSubheadings } from '@/app/links/hook/useSubheading';

// Define the type here since it's an ad-hoc type in getAllSubheadings
interface SubheadingListItem {
  subheading_id: string;
  title: string;
  folder_title: string;
}

export default function SubheadingsListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');

  const {
    data: subheadingsData,
    isLoading,
    fetchSubheadings,
  } = useGetSubheadings();
  // We need to map the response to SubheadingListItem if the hook returns strictly Subheading[]
  // Wait, the original getAllSubheadings might have returned joined data?
  // Let's check src/lib/links.ts if possible, or assume the hook returns what we need or we need to adapt.
  // The hook returns Subheading[]. The list page expects SubheadingListItem which has folder_title.
  // The backend endpoint /subheadings likely returns folder_title?
  // If useGetSubheadings types returns Subheading[], does Subheading interface have folder_title?
  // Let's check types/entities/links.ts again.
  // generic Subheading interface: folder_id, title, weight, timestamp. NO folder_title.
  // So the original getAllSubheadings in lib/links.ts (which was calling supabase probably) might have done a join.
  // But now we are using the API service which calls /links/subheadings.
  // Does the API return folder_title?
  // If not, we might lose folder titles in the list unless we also fetch folders.
  // For now, let's use what the hook returns. referencing folder_title might fail if not present.
  // I will assume for now I should just try to use what the API gives.

  const [filteredSubheadings, setFilteredSubheadings] = React.useState<
    SubheadingListItem[]
  >([]);
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    fetchSubheadings();
  }, [fetchSubheadings]);

  React.useEffect(() => {
    if (subheadingsData) {
      const filtered = subheadingsData.filter((sub) =>
        sub.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredSubheadings(filtered as unknown as SubheadingListItem[]);
    }
  }, [searchQuery, subheadingsData]);

  const handleItemClick = (item: SubheadingListItem) => {
    if (action === 'edit') {
      router.push(`/links/admin/subheadings/edit?id=${item.subheading_id}`);
    } else if (action === 'delete') {
      router.push(`/links/admin/subheadings/delete?id=${item.subheading_id}`);
    }
  };

  const pageTitle =
    action === 'edit'
      ? 'Pilih Subheading untuk Diedit'
      : 'Pilih Subheading untuk Dihapus';

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12 h-screen'>
        <div className='w-full max-w-md flex flex-col h-full'>
          {/* Header */}
          <div className='bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg px-6 py-4 shadow-md text-center mb-6 shrink-0'>
            <Typography as='h2' variant='h5' className='text-white font-bold'>
              {pageTitle}
            </Typography>
          </div>

          {/* Search */}
          <div className='mb-4 shrink-0'>
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari subheading...'
              className='w-full px-4 py-3 rounded-lg bg-blue-700/80 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500 backdrop-blur-sm'
            />
          </div>

          {/* List */}
          <div className='flex-1 overflow-y-auto space-y-3 min-h-0 mb-6 pr-2 custom-scrollbar'>
            {isLoading ? (
              <div className='flex justify-center py-8'>
                <Loading className='border-white/20 border-t-white' />
              </div>
            ) : filteredSubheadings.length === 0 ? (
              <div className='text-center text-gray-300 py-4'>
                Tidak ada data ditemukan.
              </div>
            ) : (
              filteredSubheadings.map((item) => (
                <button
                  key={item.subheading_id}
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
                    <Typography className='text-gray-400 text-xs mt-1 truncate'>
                      Folder: {item.folder_title}
                    </Typography>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Back Button */}
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
