'use client';

import { useParams, useRouter } from 'next/navigation';
import * as React from 'react';
import { FaFolder, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { IoChevronBack } from 'react-icons/io5';

import LinkButton from '@/components/links/LinkButton';
import SubheadingSection from '@/components/links/SubheadingSection';
import NextImage from '@/components/NextImage';
import Typography from '@/components/Typography';

import { useGetFolderById } from '@/app/links/hook/useFolder';

import { Link, SubheadingWithLinks } from '@/types/entities/links';

export default function FolderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const folderId = params.folderId as string;

  const {
    data: folderData,
    isLoading: isLoadingData,
    fetchFolder,
  } = useGetFolderById();
  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    if (folderId) {
      const loadData = async () => {
        const data = await fetchFolder(folderId);
        if (!data) setNotFound(true);
      };
      loadData();
    }
  }, [folderId, fetchFolder]);

  const isLoading = isLoadingData;

  if (isLoading) {
    return (
      <div className='min-h-screen flex items-center justify-center'>
        <Typography className='text-white'>Loading...</Typography>
      </div>
    );
  }

  if (notFound || !folderData?.folder) {
    return (
      <div className='min-h-screen flex items-center justify-center flex-col gap-4'>
        <Typography className='text-white'>Folder not found</Typography>
        <button
          onClick={() => router.push('/links')}
          className='text-white hover:text-gray-300'
        >
          Back to Links
        </button>
      </div>
    );
  }

  const { folder, subheadings, direct_links } = folderData;

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        {/* Settings icon (top right) */}
        <div className='absolute top-4 right-4 sm:top-6 sm:right-6'>
          <button className='text-white hover:text-gray-300 transition-colors'>
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

        {/* Profile section */}
        <div className='flex flex-col items-center mb-8 sm:mb-10'>
          {/* Profile image placeholder - circular */}
          <div className='w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white mb-3 overflow-hidden shadow-lg'>
            <NextImage
              src='/images/logo.png'
              alt="Jama'ah Masjid Manarul Ilmi"
              width={96}
              height={96}
              className='w-full h-full object-cover'
              useSkeleton
            />
          </div>

          {/* Organization name */}
          <Typography
            as='h1'
            variant='body'
            className='text-white text-center mb-2'
            weight='medium'
          >
            Jama'ah Masjid Manarul Ilmi
          </Typography>

          {/* Badge */}
          <div className='bg-gradient-to-r from-orange-600 to-orange-500 px-4 py-1 rounded shadow-md mb-3'>
            <Typography
              as='span'
              variant='label'
              className='text-white font-bold'
            >
              Kabinet Ekselensi
            </Typography>
          </div>

          {/* Social media icons */}
          <div className='flex gap-4 items-center text-white'>
            <button className='hover:text-gray-300 transition-colors'>
              <FaFolder className='w-5 h-5' />
            </button>
            <button className='hover:text-gray-300 transition-colors'>
              <FaInstagram className='w-5 h-5' />
            </button>
            <button className='hover:text-gray-300 transition-colors'>
              <FaLinkedin className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Content container */}
        <div className='w-full max-w-md space-y-8'>
          {/* Folder title */}
          <div className='bg-gradient-to-r from-orange-600 to-orange-500 rounded-lg px-6 py-4 shadow-md text-center'>
            <Typography as='h2' variant='h5' className='text-white font-bold'>
              {folder.title}
            </Typography>
          </div>

          {/* Subheadings with links */}
          {subheadings.length > 0 && (
            <div className='space-y-8'>
              {subheadings.map((subheading: SubheadingWithLinks) => (
                <SubheadingSection
                  key={subheading.subheading_id}
                  title={subheading.title}
                  links={subheading.links}
                />
              ))}
            </div>
          )}

          {/* Direct links (not under any subheading) */}
          {direct_links.length > 0 && (
            <div className='space-y-3'>
              {direct_links.map((link: Link) => (
                <LinkButton
                  key={link.link_id}
                  title={link.title}
                  url={link.link}
                  variant='blue'
                />
              ))}
            </div>
          )}

          {/* Back button */}
          <div className='pt-4'>
            <a
              href='/links'
              className='flex items-center justify-center gap-2 text-white hover:text-gray-300 transition-colors'
            >
              <IoChevronBack className='w-5 h-5' />
              <Typography as='span' variant='body' weight='medium'>
                Kembali
              </Typography>
            </a>
          </div>
        </div>

        {/* Bottom spacing */}
        <div className='h-12'></div>
      </div>
    </>
  );
}
