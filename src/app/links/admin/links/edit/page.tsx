'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import * as React from 'react';
import { Suspense } from 'react';
import { IoChevronBack } from 'react-icons/io5';

import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetFolders } from '@/app/links/hook/useFolder';
import { useGetLinkById, useUpdateLink } from '@/app/links/hook/useLink';
import { useGetSubheadings } from '@/app/links/hook/useSubheading';

function EditLinkContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const linkId = searchParams.get('id');

  const { data: link, fetchLink, isLoading: isLoadingLink } = useGetLinkById();
  const {
    data: folders,
    fetchFolders,
    isLoading: isLoadingFolders,
  } = useGetFolders();
  const {
    data: subheadings,
    fetchSubheadings,
    isLoading: isLoadingSubheadings,
  } = useGetSubheadings();
  const { mutateAsync: updateLink, isLoading: isUpdating } = useUpdateLink();

  // Form state
  const [selectedFolder, setSelectedFolder] = React.useState<string>('');
  const [useSubheading, setUseSubheading] = React.useState<string>('tidak');
  const [selectedSubheading, setSelectedSubheading] =
    React.useState<string>('');
  const [linkTitle, setLinkTitle] = React.useState<string>('');
  const [linkUrl, setLinkUrl] = React.useState<string>('');

  // Filtered subheadings
  const filteredSubheadings = React.useMemo(() => {
    if (!selectedFolder || selectedFolder === 'umum' || !subheadings) return [];
    return subheadings.filter((sub) => sub.folder_id === selectedFolder);
  }, [selectedFolder, subheadings]);

  React.useEffect(() => {
    if (linkId) {
      fetchLink(linkId);
      fetchFolders();
      fetchSubheadings();
    }
  }, [linkId, fetchLink, fetchFolders, fetchSubheadings]);

  React.useEffect(() => {
    if (link) {
      setLinkTitle(link.title);
      setLinkUrl(link.link);
      setSelectedFolder(link.folder_id || 'umum');
      setUseSubheading(link.subheading_id ? 'ya' : 'tidak');
      setSelectedSubheading(link.subheading_id || '');
    }
  }, [link]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!linkTitle || !linkUrl) {
      alert('Judul link dan URL harus diisi!');
      return;
    }

    if (!linkId) return;

    const linkData = {
      link_id: linkId,
      folder_id: selectedFolder === 'umum' ? null : selectedFolder,
      subheading_id: useSubheading === 'ya' ? selectedSubheading : null,
      title: linkTitle,
      link: linkUrl,
    };

    try {
      await updateLink(linkId, linkData);
      router.push('/links/admin/links');
    } catch (error) {
      alert('Terjadi kesalahan saat update link');
    }
  };

  const isLoading =
    isLoadingLink || isLoadingFolders || isLoadingSubheadings || isUpdating;

  const handleBack = () => {
    router.push('/links/admin/links');
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
              Edit Link
            </Typography>
          </div>

          {/* Form */}
          <form
            onSubmit={handleSubmit}
            className='space-y-4 bg-white/10 p-6 rounded-lg backdrop-blur-sm'
          >
            {/* 1. Link Umum/Departemen Selection */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Link Umum/Departemen
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
                <option value=''>Pilih Lokasi Link</option>
                <option value='umum'>Link Umum</option>
                {folders.map((folder) => (
                  <option key={folder.folder_id} value={folder.folder_id}>
                    {folder.title}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pakai Subheading Toggle */}
            {selectedFolder && selectedFolder !== 'umum' && (
              <div className='space-y-2'>
                <label className='block text-gray-100 text-sm font-medium'>
                  Pakai Subheading atau Tidak
                </label>
                <select
                  value={useSubheading}
                  onChange={(e) => setUseSubheading(e.target.value)}
                  className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white border-none focus:ring-2 focus:ring-blue-500 appearance-none'
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem',
                  }}
                >
                  <option value='tidak'>Tidak</option>
                  <option value='ya'>Ya</option>
                </select>
              </div>
            )}

            {/* 3. Pilih Subheading */}
            {selectedFolder &&
              selectedFolder !== 'umum' &&
              useSubheading === 'ya' && (
                <div className='space-y-2'>
                  <label className='block text-gray-100 text-sm font-medium'>
                    Pilih Subheading
                  </label>
                  <select
                    value={selectedSubheading}
                    onChange={(e) => setSelectedSubheading(e.target.value)}
                    className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white border-none focus:ring-2 focus:ring-blue-500 appearance-none'
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23fff' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 0.5rem center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '1.5em 1.5em',
                      paddingRight: '2.5rem',
                    }}
                  >
                    <option value=''>Pilih Subheading</option>
                    {filteredSubheadings.map((sub) => (
                      <option key={sub.subheading_id} value={sub.subheading_id}>
                        {sub.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            {/* 4. Judul Link */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Judul Link
              </label>
              <input
                type='text'
                value={linkTitle}
                onChange={(e) => setLinkTitle(e.target.value)}
                placeholder='Tambahkan judul link'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* 5. Link URL */}
            <div className='space-y-2'>
              <label className='block text-gray-100 text-sm font-medium'>
                Link yang ingin ditambahkan
              </label>
              <input
                type='url'
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder='Tambahkan link URL'
                className='w-full px-4 py-3 rounded-lg bg-blue-700 text-white placeholder-blue-300 border-none focus:ring-2 focus:ring-blue-500'
              />
            </div>

            {/* Actions */}
            <div className='pt-4 space-y-3'>
              <button
                type='submit'
                className='w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white font-bold py-3 px-6 rounded-lg hover:from-orange-700 hover:to-orange-600 transition-all duration-200'
              >
                Update Link
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

export default function EditLinkPage() {
  return (
    <Suspense fallback={<Loading fullScreen />}>
      <EditLinkContent />
    </Suspense>
  );
}
