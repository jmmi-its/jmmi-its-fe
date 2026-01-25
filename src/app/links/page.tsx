'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import FolderCard from '@/components/links/FolderCard';
import LinkButton from '@/components/links/LinkButton';
import ProfileHeader from '@/components/links/ProfileHeader';
import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetLinksHomepage } from '@/app/links/hook/useLink';

import { Folder } from '@/types/entities/links';

export default function LinksPage() {
  const router = useRouter();

  const {
    data: homepageData,
    isLoading,
    fetchLinksHomepage,
  } = useGetLinksHomepage();
  const linksData = React.useMemo(() => {
    if (!homepageData)
      return { general_links: [], folders: [], categories: [] };
    return {
      general_links: homepageData.general_links || [],
      folders: homepageData.folders || [],
      categories: homepageData.categories || [],
    };
  }, [homepageData]);

  React.useEffect(() => {
    fetchLinksHomepage();
  }, [fetchLinksHomepage]);

  const handleSettingsClick = () => {
    router.push('/links/admin');
  };

  const { general_links, folders, categories } = linksData;

  // Group folders by category
  const foldersByCategory = React.useMemo(() => {
    const grouped: Record<string, Folder[]> = {};
    const uncategorized: Folder[] = [];

    folders.forEach((folder) => {
      if (folder.category_id) {
        if (!grouped[folder.category_id]) {
          grouped[folder.category_id] = [];
        }
        grouped[folder.category_id].push(folder);
      } else {
        uncategorized.push(folder);
      }
    });

    return { grouped, uncategorized };
  }, [folders]);

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        {/* Settings icon (top right) */}
        <div className='absolute top-4 right-4 sm:top-6 sm:right-6'>
          <button
            onClick={handleSettingsClick}
            className='text-white hover:text-gray-300 transition-colors'
          >
            <svg
              className='w-6 h-6'
              fill='none'
              stroke='currentColor'
              viewBox='0 0 24 24'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
              />
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M15 12a3 3 0 11-6 0 3 3 0 016 0z'
              />
            </svg>
          </button>
        </div>

        {/* Profile section with reusable component */}
        <ProfileHeader />

        {/* Content container */}
        <div className='w-full max-w-md space-y-8'>
          {/* Static About Link */}
          <div className='space-y-4'>
            <div className='space-y-3'>
              <LinkButton
                title='Tentang Kabinet Ekselensi'
                url='/about'
                variant='orange'
                newTab={false}
              />
            </div>
          </div>

          {/* General Links section */}
          {general_links.length > 0 && (
            <div className='space-y-4'>
              <div className='space-y-3'>
                {general_links.map((link) => (
                  <LinkButton
                    key={link.link_id}
                    title={link.title}
                    url={link.link}
                    variant='blue'
                  />
                ))}
              </div>
            </div>
          )}

          {/* Category Sections */}
          {categories.map((category) => {
            const categoryFolders =
              foldersByCategory.grouped[category.category_id];
            if (!categoryFolders || categoryFolders.length === 0) return null;

            return (
              <div key={category.category_id} className='space-y-4'>
                <div className='relative flex items-center justify-center my-6'>
                  <div className='absolute border-t border-white/30 w-full'></div>
                  <div className='relative bg-brand-green px-4'>
                    <Typography
                      as='h2'
                      variant='h6'
                      className='text-center text-white'
                      weight='medium'
                    >
                      {category.title}
                    </Typography>
                  </div>
                </div>
                <div className='space-y-3'>
                  {categoryFolders.map((folder) => (
                    <FolderCard
                      key={folder.folder_id}
                      title={folder.title}
                      folderId={folder.folder_id}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {/* Uncategorized Folders */}
          {foldersByCategory.uncategorized.length > 0 && (
            <div className='space-y-4'>
              <div className='relative flex items-center justify-center my-6'>
                <div className='absolute border-t border-white/30 w-full'></div>
                <div className='relative bg-brand-green px-4'>
                  <Typography
                    as='h2'
                    variant='h6'
                    className='text-center text-white'
                    weight='medium'
                  >
                    Lainnya
                  </Typography>
                </div>
              </div>
              <div className='space-y-3'>
                {foldersByCategory.uncategorized.map((folder) => (
                  <FolderCard
                    key={folder.folder_id}
                    title={folder.title}
                    folderId={folder.folder_id}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bottom spacing */}
        <div className='h-12'></div>
      </div>
    </>
  );
}
