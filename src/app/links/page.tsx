'use client';

import * as React from 'react';

import FolderCard from '@/components/links/FolderCard';
import LinkButton from '@/components/links/LinkButton';
import ProfileHeader from '@/components/links/ProfileHeader';
import Loading from '@/components/Loading';
import Typography from '@/components/Typography';

import { useGetLinksHomepage } from '@/app/links/hook/useLink';

import { Folder } from '@/types/entities/links';

export default function LinksPage() {
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
              <LinkButton
                title='Transparansi Keuangan'
                url='/finance'
                variant='general'
                newTab={false}
              />
                <LinkButton
                  title='Kalender Kegiatan'
                url='/kalender'
                variant='general'
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
