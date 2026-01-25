'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import BackButton from '@/components/BackButton';
import ProfileHeader from '@/components/links/ProfileHeader';
import Typography from '@/components/Typography';

export default function AdminLinksPage() {
  const router = useRouter();

  const menuGroups = [
    {
      title: 'Manajemen Kategori',
      items: [
        { id: 'tambah-kategori', label: 'Tambah Kategori', type: 'add' },
        { id: 'edit-category', label: 'Edit Kategori', type: 'edit' },
        { id: 'hapus-category', label: 'Hapus Kategori', type: 'delete' },
      ],
    },
    {
      title: 'Manajemen Folder',
      items: [
        { id: 'tambah-folder', label: 'Tambah Folder', type: 'add' },
        { id: 'edit-folder', label: 'Edit Folder', type: 'edit' },
        { id: 'hapus-folder', label: 'Hapus Folder', type: 'delete' },
      ],
    },
    {
      title: 'Manajemen Subheading',
      items: [
        { id: 'tambah-subheading', label: 'Tambah Subheading', type: 'add' },
        { id: 'edit-subheading', label: 'Edit Subheading', type: 'edit' },
        { id: 'hapus-subheading', label: 'Hapus Subheading', type: 'delete' },
      ],
    },
    {
      title: 'Manajemen Link',
      items: [
        { id: 'tambah-link', label: 'Tambah Link', type: 'add' },
        { id: 'edit-link', label: 'Edit Link', type: 'edit' },
        { id: 'hapus-link', label: 'Hapus Link', type: 'delete' },
      ],
    },
  ];

  const handleMenuClick = async (action: string) => {
    // Navigate to Add Pages
    if (action === 'tambah-link') {
      router.push('/links/admin/links/new');
      return;
    }
    if (action === 'tambah-folder') {
      router.push('/links/admin/folders/new');
      return;
    }
    if (action === 'tambah-subheading') {
      router.push('/links/admin/subheadings/new');
      return;
    }
    if (action === 'tambah-kategori') {
      router.push('/links/admin/categories/new');
      return;
    }

    // Navigate to List Pages with Action (Edit/Delete)
    if (action === 'edit-link') {
      router.push('/links/admin/links?action=edit');
      return;
    }
    if (action === 'edit-folder') {
      router.push('/links/admin/folders?action=edit');
      return;
    }
    if (action === 'edit-subheading') {
      router.push('/links/admin/subheadings?action=edit');
      return;
    }
    if (action === 'edit-category') {
      router.push('/links/admin/categories?action=edit');
      return;
    }

    if (action === 'hapus-link') {
      router.push('/links/admin/links?action=delete');
      return;
    }
    if (action === 'hapus-folder') {
      router.push('/links/admin/folders?action=delete');
      return;
    }
    if (action === 'hapus-subheading') {
      router.push('/links/admin/subheadings?action=delete');
      return;
    }
    if (action === 'hapus-category') {
      router.push('/links/admin/categories?action=delete');
      return;
    }
  };

  return (
    <>
      {/* Main Content */}
      <div className='relative z-10 flex flex-col items-center px-4 py-8 sm:py-12'>
        {/* Profile section with reusable component */}
        <ProfileHeader />

        {/* Content container */}
        <div className='w-full max-w-lg space-y-8'>
          {/* Admin title */}
          <div className='text-center space-y-2'>
            <Typography
              as='h2'
              variant='h5'
              className='text-white font-bold tracking-tight'
            >
              Dashboard Administrasi
            </Typography>
            <div className='h-1 w-24 bg-orange-500 mx-auto rounded-full'></div>
          </div>

          {/* Menu Groups */}
          <div className='space-y-6'>
            {menuGroups.map((group) => (
              <div
                key={group.title}
                className='bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4 hover:bg-white/10 transition-colors duration-300'
              >
                <div className='flex items-center gap-3'>
                  <div className='h-8 w-1 bg-orange-500 rounded-full'></div>
                  <Typography
                    as='h3'
                    variant='body'
                    className='text-white font-semibold text-lg'
                  >
                    {group.title}
                  </Typography>
                </div>

                <div className='grid gap-3'>
                  {group.items.map((button) => (
                    <button
                      key={button.id}
                      onClick={() => handleMenuClick(button.id)}
                      className={`w-full relative overflow-hidden group rounded-xl px-5 py-3 text-left transition-all duration-300 hover:scale-[1.01] hover:shadow-lg border border-white/5 ${
                        button.type === 'delete'
                          ? 'bg-red-500/10 hover:bg-red-500/20 text-red-100 hover:border-red-500/30'
                          : button.type === 'edit'
                          ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-100 hover:border-amber-500/30'
                          : 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-100 hover:border-blue-500/30'
                      }`}
                    >
                      <div className='flex items-center justify-between'>
                        <span className='font-medium'>{button.label}</span>
                        <svg
                          className={`w-5 h-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-x-2 group-hover:translate-x-0 ${
                            button.type === 'delete'
                              ? 'text-red-400'
                              : button.type === 'edit'
                              ? 'text-amber-400'
                              : 'text-blue-400'
                          }`}
                          fill='none'
                          stroke='currentColor'
                          viewBox='0 0 24 24'
                        >
                          <path
                            strokeLinecap='round'
                            strokeLinejoin='round'
                            strokeWidth={2}
                            d='M9 5l7 7-7 7'
                          />
                        </svg>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Back button */}
          <BackButton />
        </div>

        {/* Bottom spacing */}
        <div className='h-12'></div>
      </div>
    </>
  );
}
