'use client';

import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ArrowLeft, ExternalLink, GripVertical, Pencil, Plus, RefreshCw, Save, Trash2 } from 'lucide-react';

import Button from '@/components/buttons/Button';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';
import { useGetCategories } from '@/app/links/hook/useCategory';
import { useGetLinks } from '@/app/links/hook/useLink';
import { useGetFolders } from '@/app/links/hook/useFolder';
import { useGetSubheadings } from '@/app/links/hook/useSubheading';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Link } from '@/types/entities/links';

const ALL_FOLDER_OPTION = '__all__';
const GENERAL_FOLDER_OPTION = '__general__';
const NO_SUBHEADING_OPTION = '__no_subheading__';

type LinkFormState = {
  title: string;
  link: string;
  folder_id: string;
  subheading_id: string;
};

const EMPTY_FORM: LinkFormState = {
  title: '',
  link: '',
  folder_id: GENERAL_FOLDER_OPTION,
  subheading_id: NO_SUBHEADING_OPTION,
};

type PreviewToolbarButtonProps = {
  icon: typeof ArrowLeft;
  children: string;
  onClick: () => void;
  className?: string;
};

function PreviewToolbarButton({ icon, children, onClick, className }: PreviewToolbarButtonProps) {
  return (
    <Button
      type='button'
      variant='outline'
      size='sm'
      leftIcon={icon}
      onClick={onClick}
      className={cn(
        'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
        className
      )}
    >
      {children}
    </Button>
  );
}

type DashboardActionButtonProps = {
  children: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'outline' | 'ghost';
  leftIcon?: typeof ArrowLeft;
  disabled?: boolean;
  className?: string;
};

function DashboardActionButton({
  children,
  onClick,
  type = 'button',
  variant = 'outline',
  leftIcon: LeftIcon,
  disabled,
  className,
}: DashboardActionButtonProps) {
  return (
    <Button
      type={type}
      variant={variant}
      size='sm'
      leftIcon={LeftIcon}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
}

export default function AdminLinksDashboardPage() {
  const queryClient = useQueryClient();
  const previewFrameRef = useRef<HTMLIFrameElement | null>(null);

  const { data: categories = [] } = useGetCategories();
  const { data: links, isLoading: isLoadingLinks } = useGetLinks();
  const { data: folders = [] } = useGetFolders();
  const { data: subheadings = [] } = useGetSubheadings();

  const [draftLinks, setDraftLinks] = useState<Link[]>([]);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>(ALL_FOLDER_OPTION);
  const [selectedSubheading, setSelectedSubheading] = useState<string>(ALL_FOLDER_OPTION);
  const [search, setSearch] = useState('');
  const [formState, setFormState] = useState<LinkFormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSavingOrder, setIsSavingOrder] = useState(false);
  const [previewVersion, setPreviewVersion] = useState(0);
  const [newCategoryTitle, setNewCategoryTitle] = useState('');
  const [newFolderTitle, setNewFolderTitle] = useState('');
  const [newFolderCategoryId, setNewFolderCategoryId] = useState('');
  const [newSubheadingTitle, setNewSubheadingTitle] = useState('');
  const [newSubheadingFolderId, setNewSubheadingFolderId] = useState('');
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isCreatingSubheading, setIsCreatingSubheading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const sortedOriginalLinks = useMemo(() => {
    return [...(links ?? [])].sort((a, b) => b.weight - a.weight);
  }, [links]);

  const previewKey = useMemo(() => {
    const linkStamp = sortedOriginalLinks
      .map((item) => `${item.link_id}:${item.weight}:${item.timestamp}`)
      .join('|');
    const categoryStamp = categories
      .map((item) => `${item.category_id}:${item.timestamp}`)
      .join('|');
    const folderStamp = folders
      .map((item) => `${item.folder_id}:${item.timestamp}`)
      .join('|');
    const subheadingStamp = subheadings
      .map((item) => `${item.subheading_id}:${item.timestamp}`)
      .join('|');

    return [linkStamp, categoryStamp, folderStamp, subheadingStamp, previewVersion].join('::');
  }, [categories, folders, previewVersion, sortedOriginalLinks, subheadings]);

  useEffect(() => {
    if (draftLinks.length === 0 || draftLinks.length !== sortedOriginalLinks.length) {
      setDraftLinks(sortedOriginalLinks);
    }
  }, [sortedOriginalLinks]);

  const filteredSubheadings = useMemo(() => {
    if (selectedFolder === ALL_FOLDER_OPTION || selectedFolder === GENERAL_FOLDER_OPTION) {
      return [];
    }

    return subheadings.filter((subheading) => subheading.folder_id === selectedFolder);
  }, [selectedFolder, subheadings]);

  const formSubheadings = useMemo(() => {
    if (formState.folder_id === GENERAL_FOLDER_OPTION) {
      return [];
    }

    return subheadings.filter((subheading) => subheading.folder_id === formState.folder_id);
  }, [formState.folder_id, subheadings]);

  const visibleLinks = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return draftLinks.filter((link) => {
      const matchFolder =
        selectedFolder === ALL_FOLDER_OPTION
          ? true
          : selectedFolder === GENERAL_FOLDER_OPTION
          ? link.folder_id === null
          : link.folder_id === selectedFolder;

      const matchSubheading =
        selectedSubheading === ALL_FOLDER_OPTION
          ? true
          : selectedSubheading === NO_SUBHEADING_OPTION
          ? link.subheading_id === null
          : link.subheading_id === selectedSubheading;

      const matchSearch =
        keyword.length === 0 ||
        link.title.toLowerCase().includes(keyword) ||
        link.link.toLowerCase().includes(keyword);

      return matchFolder && matchSubheading && matchSearch;
    });
  }, [draftLinks, search, selectedFolder, selectedSubheading]);

  const isOrderDirty = useMemo(() => {
    if (draftLinks.length !== sortedOriginalLinks.length) {
      return true;
    }

    for (let i = 0; i < draftLinks.length; i += 1) {
      if (draftLinks[i]?.link_id !== sortedOriginalLinks[i]?.link_id) {
        return true;
      }
    }

    return false;
  }, [draftLinks, sortedOriginalLinks]);

  const totalPages = Math.ceil(visibleLinks.length / itemsPerPage);
  const paginatedLinks = visibleLinks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedFolder, selectedSubheading]);

  const getFolderLabel = (folderId: string | null) => {
    if (!folderId) return 'Umum';
    return folders.find((folder) => folder.folder_id === folderId)?.title || 'Folder tidak ditemukan';
  };

  const getSubheadingLabel = (subheadingId: string | null) => {
    if (!subheadingId) return 'Tanpa subheading';
    return (
      subheadings.find((subheading) => subheading.subheading_id === subheadingId)?.title ||
      'Subheading tidak ditemukan'
    );
  };

  const resetForm = () => {
    setFormState(EMPTY_FORM);
    setEditingId(null);
  };

  const handleOpenEdit = (item: Link) => {
    setEditingId(item.link_id);
    setFormState({
      title: item.title,
      link: item.link,
      folder_id: item.folder_id ?? GENERAL_FOLDER_OPTION,
      subheading_id: item.subheading_id ?? NO_SUBHEADING_OPTION,
    });
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm('Hapus link ini?');
    if (!shouldDelete) return;

    try {
      await api.delete(`/links/items/${id}`);
      showToast('Link berhasil dihapus', SUCCESS_TOAST);
      await queryClient.invalidateQueries({ queryKey: ['links'] });
      await queryClient.invalidateQueries({ queryKey: ['links-homepage'] });
    } catch {
      showToast('Gagal menghapus link', DANGER_TOAST);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!formState.title.trim() || !formState.link.trim()) {
      showToast('Judul dan URL wajib diisi', DANGER_TOAST);
      return;
    }

    try {
      new URL(formState.link);
    } catch {
      showToast('Format URL tidak valid', DANGER_TOAST);
      return;
    }

    setIsSubmitting(true);

    const payload = {
      title: formState.title.trim(),
      link: formState.link.trim(),
      folder_id: formState.folder_id === GENERAL_FOLDER_OPTION ? null : formState.folder_id,
      subheading_id:
        formState.folder_id === GENERAL_FOLDER_OPTION ||
        formState.subheading_id === NO_SUBHEADING_OPTION
          ? null
          : formState.subheading_id,
      weight: editingId
        ? draftLinks.find((item) => item.link_id === editingId)?.weight ?? draftLinks.length + 1
        : draftLinks.length + 1,
    };

    try {
      if (editingId) {
        await api.put(`/links/items/${editingId}`, payload);
        showToast('Link berhasil diperbarui', SUCCESS_TOAST);
      } else {
        await api.post('/links/items', payload);
        showToast('Link berhasil ditambahkan', SUCCESS_TOAST);
      }

      resetForm();
      await queryClient.invalidateQueries({ queryKey: ['links'] });
      await queryClient.invalidateQueries({ queryKey: ['links-homepage'] });
    } catch {
      showToast('Gagal menyimpan link', DANGER_TOAST);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reorderVisibleLinks = (fromId: string, toId: string) => {
    const currentVisible = [...visibleLinks];
    const fromIndex = currentVisible.findIndex((item) => item.link_id === fromId);
    const toIndex = currentVisible.findIndex((item) => item.link_id === toId);
    const fromItem = currentVisible[fromIndex];
    const toItem = currentVisible[toIndex];

    if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
      return;
    }

    if (fromItem?.folder_id !== toItem?.folder_id) {
      showToast('Urutan hanya bisa diubah di dalam folder yang sama', DANGER_TOAST);
      return;
    }

    const [moved] = currentVisible.splice(fromIndex, 1);
    currentVisible.splice(toIndex, 0, moved);

    const visibleIds = new Set(visibleLinks.map((item) => item.link_id));
    let visibleCursor = 0;

    const merged = draftLinks.map((item) => {
      if (!visibleIds.has(item.link_id)) {
        return item;
      }

      const next = currentVisible[visibleCursor];
      visibleCursor += 1;
      return next;
    });

    setDraftLinks(merged);
  };

  const handleSaveOrder = async () => {
    if (!isOrderDirty) return;

    setIsSavingOrder(true);

    try {
      const total = draftLinks.length;
      await Promise.all(
        draftLinks.map((item, index) =>
          api.put(`/links/items/${item.link_id}`, {
            weight: total - index,
          })
        )
      );

      showToast('Urutan link berhasil disimpan', SUCCESS_TOAST);
      await queryClient.invalidateQueries({ queryKey: ['links'] });
      await queryClient.invalidateQueries({ queryKey: ['links-homepage'] });
    } catch {
      showToast('Gagal menyimpan urutan link', DANGER_TOAST);
    } finally {
      setIsSavingOrder(false);
    }
  };

  const handleBackToLinksHome = () => {
    if (!previewFrameRef.current) return;

    previewFrameRef.current.src = `/links?preview=${encodeURIComponent(previewKey)}`;
  };

  const handleCreateCategory = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newCategoryTitle.trim()) {
      showToast('Nama kategori wajib diisi', DANGER_TOAST);
      return;
    }

    setIsCreatingCategory(true);
    try {
      await api.post('/links/categories', {
        title: newCategoryTitle.trim(),
        weight: categories.length + 1,
      });
      showToast('Kategori berhasil ditambahkan', SUCCESS_TOAST);
      setNewCategoryTitle('');
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      await queryClient.invalidateQueries({ queryKey: ['links-homepage'] });
    } catch {
      showToast('Gagal menambahkan kategori', DANGER_TOAST);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  const handleCreateFolder = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newFolderTitle.trim() || !newFolderCategoryId) {
      showToast('Nama folder dan kategori wajib dipilih', DANGER_TOAST);
      return;
    }

    setIsCreatingFolder(true);
    try {
      await api.post('/links/folders', {
        title: newFolderTitle.trim(),
        category_id: newFolderCategoryId,
        weight: folders.length + 1,
      });
      showToast('Folder berhasil ditambahkan', SUCCESS_TOAST);
      setNewFolderTitle('');
      await queryClient.invalidateQueries({ queryKey: ['folders'] });
      await queryClient.invalidateQueries({ queryKey: ['links-homepage'] });
    } catch {
      showToast('Gagal menambahkan folder', DANGER_TOAST);
    } finally {
      setIsCreatingFolder(false);
    }
  };

  const handleCreateSubheading = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!newSubheadingTitle.trim() || !newSubheadingFolderId) {
      showToast('Nama subheading dan folder wajib dipilih', DANGER_TOAST);
      return;
    }

    setIsCreatingSubheading(true);
    try {
      const selectedFolderSubheadings = subheadings.filter(
        (subheading) => subheading.folder_id === newSubheadingFolderId
      );

      await api.post('/links/subheadings', {
        title: newSubheadingTitle.trim(),
        folder_id: newSubheadingFolderId,
        weight: selectedFolderSubheadings.length + 1,
      });
      showToast('Subheading berhasil ditambahkan', SUCCESS_TOAST);
      setNewSubheadingTitle('');
      await queryClient.invalidateQueries({ queryKey: ['subheadings'] });
    } catch {
      showToast('Gagal menambahkan subheading', DANGER_TOAST);
    } finally {
      setIsCreatingSubheading(false);
    }
  };

  return (
    <div className='space-y-6'>
      <div className='flex flex-wrap items-end justify-between gap-4 rounded-2xl bg-gradient-to-r from-brand-green-700 to-brand-green-500 p-6 text-white shadow-lg'>
        <div>
          <h1 className='text-2xl font-bold tracking-tight'>Dashboard Link</h1>
          <p className='mt-2 text-sm text-white/80'>
            Kelola link seperti Linktree: tambah cepat, ubah, hapus, dan drag-and-drop urutan.
          </p>
        </div>
      </div>

      <section className='rounded-2xl bg-white p-5 shadow'>
        <div className='mb-4'>
          <h2 className='text-lg font-semibold text-slate-900'>Pengaturan Cepat Struktur Link</h2>
          <p className='text-sm text-slate-500'>
            Tambahkan kategori, folder, dan subheading langsung dari satu halaman.
          </p>
        </div>

        <div className='grid gap-4 lg:grid-cols-3'>
          <form onSubmit={handleCreateCategory} className='rounded-xl border border-slate-200 p-4'>
            <h3 className='text-sm font-semibold text-slate-900'>Tambah Kategori</h3>
            <p className='mt-1 text-xs text-slate-500'>
              Kategori dipakai untuk mengelompokkan folder agar lebih rapi pada halaman awal.
            </p>

            <div className='mt-4 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                Nama Kategori
              </label>
              <input
                type='text'
                value={newCategoryTitle}
                onChange={(event) => setNewCategoryTitle(event.target.value)}
                placeholder='Contoh: Akademik'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
              />
            </div>

            <DashboardActionButton
              type='submit'
              variant='outline'
              disabled={isCreatingCategory}
              className='mt-4 w-full justify-center'
            >
              {isCreatingCategory ? 'Menyimpan...' : 'Simpan Kategori'}
            </DashboardActionButton>
          </form>

          <form onSubmit={handleCreateFolder} className='rounded-xl border border-slate-200 p-4'>
            <h3 className='text-sm font-semibold text-slate-900'>Tambah Folder</h3>
            <p className='mt-1 text-xs text-slate-500'>
              Folder menyimpan kumpulan link di dalam kategori tertentu.
            </p>

            <div className='mt-4 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                Kategori
              </label>
              <select
                value={newFolderCategoryId}
                onChange={(event) => setNewFolderCategoryId(event.target.value)}
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
              >
                <option value=''>Pilih kategori</option>
                {categories.map((category) => (
                  <option key={category.category_id} value={category.category_id}>
                    {category.title}
                  </option>
                ))}
              </select>
            </div>

            <div className='mt-3 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                Nama Folder
              </label>
              <input
                type='text'
                value={newFolderTitle}
                onChange={(event) => setNewFolderTitle(event.target.value)}
                placeholder='Contoh: Departemen Media'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                disabled={categories.length === 0}
              />
            </div>

            <DashboardActionButton
              type='submit'
              variant='outline'
              disabled={isCreatingFolder || categories.length === 0}
              className='mt-4 w-full justify-center'
            >
              {isCreatingFolder ? 'Menyimpan...' : 'Simpan Folder'}
            </DashboardActionButton>
          </form>

          <form onSubmit={handleCreateSubheading} className='rounded-xl border border-slate-200 p-4'>
            <h3 className='text-sm font-semibold text-slate-900'>Tambah Subheading</h3>
            <p className='mt-1 text-xs text-slate-500'>
              Subheading membantu memecah link dalam folder jadi beberapa bagian.
            </p>

            <div className='mt-4 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                Folder
              </label>
              <select
                value={newSubheadingFolderId}
                onChange={(event) => setNewSubheadingFolderId(event.target.value)}
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
              >
                <option value=''>Pilih folder</option>
                {folders.map((folder) => (
                  <option key={folder.folder_id} value={folder.folder_id}>
                    {folder.title}
                  </option>
                ))}
              </select>
            </div>

            <div className='mt-3 space-y-2'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>
                Nama Subheading
              </label>
              <input
                type='text'
                value={newSubheadingTitle}
                onChange={(event) => setNewSubheadingTitle(event.target.value)}
                placeholder='Contoh: Form dan Dokumen'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
                disabled={folders.length === 0}
              />
            </div>

            <DashboardActionButton
              type='submit'
              variant='outline'
              disabled={isCreatingSubheading || folders.length === 0}
              className='mt-4 w-full justify-center'
            >
              {isCreatingSubheading ? 'Menyimpan...' : 'Simpan Subheading'}
            </DashboardActionButton>
          </form>
        </div>
      </section>

      <div className='grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]'>
        <section className='min-w-0 space-y-4 rounded-xl bg-white p-5 shadow'>
          <div className='flex flex-col items-stretch gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between'>
            <div className='min-w-0 md:flex-1'>
              <p className='text-sm font-semibold text-slate-900'>Atur Urutan Link</p>
              <p className='text-xs text-slate-500'>
                Drag link hanya di dalam folder yang sama. Link umum tidak bisa ditukar dengan link folder lain.
              </p>
            </div>

            <DashboardActionButton
              onClick={handleSaveOrder}
              disabled={!isOrderDirty || isSavingOrder}
              leftIcon={Save}
              className='w-full justify-center border-brand-green-200 bg-white text-brand-green-700 hover:bg-brand-green-50 md:w-auto'
            >
              {isSavingOrder ? 'Menyimpan urutan...' : 'Simpan Urutan'}
            </DashboardActionButton>
          </div>

          {isOrderDirty && (
            <div className='flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-900'>
              <AlertCircle className='mt-0.5 h-4 w-4 shrink-0' />
              <p className='text-sm'>
                Ada perubahan urutan yang belum disimpan. Klik tombol Simpan Urutan di card ini untuk menerapkan perubahan.
              </p>
            </div>
          )}

          <div className='grid gap-3 md:grid-cols-3'>
            <input
              type='text'
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder='Cari judul / URL...'
              className='rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
            />

            <select
              value={selectedFolder}
              onChange={(event) => {
                setSelectedFolder(event.target.value);
                setSelectedSubheading(ALL_FOLDER_OPTION);
              }}
              className='rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
            >
              <option value={ALL_FOLDER_OPTION}>Semua Folder</option>
              <option value={GENERAL_FOLDER_OPTION}>Link Umum</option>
              {folders.map((folder) => (
                <option key={folder.folder_id} value={folder.folder_id}>
                  {folder.title}
                </option>
              ))}
            </select>

            <select
              value={selectedSubheading}
              onChange={(event) => setSelectedSubheading(event.target.value)}
              disabled={selectedFolder === GENERAL_FOLDER_OPTION}
              className='rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500 disabled:bg-slate-100'
            >
              <option value={ALL_FOLDER_OPTION}>Semua Subheading</option>
              <option value={NO_SUBHEADING_OPTION}>Tanpa Subheading</option>
              {filteredSubheadings.map((subheading) => (
                <option key={subheading.subheading_id} value={subheading.subheading_id}>
                  {subheading.title}
                </option>
              ))}
            </select>
          </div>

          {isLoadingLinks ? (
            <div className='rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500'>
              Memuat data link...
            </div>
          ) : visibleLinks.length === 0 ? (
            <div className='rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500'>
              Tidak ada link pada filter ini.
            </div>
          ) : (
            <div className='space-y-3'>
              {paginatedLinks.map((item) => (
                <article
                  key={item.link_id}
                  draggable
                  onDragStart={() => setDraggingId(item.link_id)}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (!draggingId) return;
                    reorderVisibleLinks(draggingId, item.link_id);
                    setDraggingId(null);
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className='rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-brand-green-400 hover:bg-white'
                >
                  <div className='flex flex-wrap items-start justify-between gap-3'>
                    <div className='flex min-w-0 flex-1 gap-3'>
                      <div className='mt-0.5 rounded-lg bg-slate-200 p-2 text-slate-500'>
                        <GripVertical className='h-4 w-4' />
                      </div>

                      <div className='min-w-0 flex-1'>
                        <p className='truncate text-sm font-semibold text-slate-900'>{item.title}</p>
                        <p className='mt-1 truncate text-xs text-slate-500'>{item.link}</p>
                        <div className='mt-2 flex flex-wrap gap-2 text-[11px]'>
                          <span className='rounded-full bg-brand-green-100 px-2 py-1 font-medium text-brand-green-800'>
                            {getFolderLabel(item.folder_id)}
                          </span>
                          <span className='rounded-full bg-slate-200 px-2 py-1 font-medium text-slate-700'>
                            {getSubheadingLabel(item.subheading_id)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className='flex w-full flex-wrap gap-2 md:w-auto md:flex-nowrap'>
                      <DashboardActionButton
                        onClick={() => handleOpenEdit(item)}
                        leftIcon={Pencil}
                        className='flex-1 justify-center md:flex-none'
                      >
                        Ubah
                      </DashboardActionButton>
                      <DashboardActionButton
                        onClick={() => handleDelete(item.link_id)}
                        leftIcon={Trash2}
                        className='flex-1 justify-center border-red-300 text-red-700 hover:bg-red-50 md:flex-none'
                      >
                        Hapus
                      </DashboardActionButton>
                    </div>
                  </div>
                </article>
              ))}

              {totalPages > 1 && (
                <div className='flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 mt-4 rounded-xl'>
                  <span className='text-sm text-slate-500'>
                    Halaman {currentPage} dari {totalPages}
                  </span>
                  <div className='flex gap-2'>
                    <DashboardActionButton
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      Sebelumnya
                    </DashboardActionButton>
                    <DashboardActionButton
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Selanjutnya
                    </DashboardActionButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        <section className='min-w-0 rounded-2xl bg-white p-5 shadow'>
          <div className='mb-4 flex items-center justify-between'>
            <h2 className='text-lg font-semibold text-slate-900'>
              {editingId ? 'Ubah Link' : 'Tambah Link'}
            </h2>
            {editingId ? (
              <DashboardActionButton type='button' variant='ghost' onClick={resetForm}>
                Batal Ubah
              </DashboardActionButton>
            ) : (
              <Plus className='h-4 w-4 text-slate-400' />
            )}
          </div>

          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-1.5'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Judul</label>
              <input
                type='text'
                value={formState.title}
                onChange={(event) =>
                  setFormState((previous) => ({ ...previous, title: event.target.value }))
                }
                placeholder='Contoh: Form Pendaftaran'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>URL</label>
              <input
                type='url'
                value={formState.link}
                onChange={(event) =>
                  setFormState((previous) => ({ ...previous, link: event.target.value }))
                }
                placeholder='https://...'
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
              />
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Folder</label>
              <select
                value={formState.folder_id}
                onChange={(event) => {
                  const folderValue = event.target.value;
                  setFormState((previous) => ({
                    ...previous,
                    folder_id: folderValue,
                    subheading_id: NO_SUBHEADING_OPTION,
                  }));
                }}
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500'
              >
                <option value={GENERAL_FOLDER_OPTION}>Link Umum</option>
                {folders.map((folder) => (
                  <option key={folder.folder_id} value={folder.folder_id}>
                    {folder.title}
                  </option>
                ))}
              </select>
            </div>

            <div className='space-y-1.5'>
              <label className='text-xs font-semibold uppercase tracking-wider text-slate-500'>Subheading</label>
              <select
                value={formState.subheading_id}
                onChange={(event) =>
                  setFormState((previous) => ({ ...previous, subheading_id: event.target.value }))
                }
                disabled={formState.folder_id === GENERAL_FOLDER_OPTION}
                className='w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-brand-green-500 disabled:bg-slate-100'
              >
                <option value={NO_SUBHEADING_OPTION}>Tanpa subheading</option>
                {formSubheadings.map((subheading) => (
                  <option key={subheading.subheading_id} value={subheading.subheading_id}>
                    {subheading.title}
                  </option>
                ))}
              </select>
            </div>

            <DashboardActionButton type='submit' variant='primary' disabled={isSubmitting} className='w-full justify-center'>
              {isSubmitting
                ? editingId
                  ? 'Menyimpan perubahan...'
                  : 'Menambahkan link...'
                : editingId
                ? 'Simpan Perubahan'
                : 'Tambah Link'}
            </DashboardActionButton>
          </form>
        </section>
      </div>

      <section className='min-w-0 rounded-2xl bg-white p-5 shadow'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Pratinjau Halaman Link</h2>
            <p className='text-sm text-slate-500'>
              Pratinjau langsung halaman publik link dari dashboard admin.
            </p>
          </div>

          <div className='flex w-full flex-wrap gap-2 md:w-auto'>
            <PreviewToolbarButton
              icon={ArrowLeft}
              onClick={handleBackToLinksHome}
              className='w-full justify-center md:w-auto'
            >
              Kembali ke Awal
            </PreviewToolbarButton>

            <PreviewToolbarButton
              icon={RefreshCw}
              onClick={() => setPreviewVersion((value) => value + 1)}
              className='w-full justify-center md:w-auto'
            >
              Muat Ulang Pratinjau
            </PreviewToolbarButton>

            <PreviewToolbarButton
              icon={ExternalLink}
              onClick={() => window.open('/links', '_blank', 'noopener,noreferrer')}
              className='w-full justify-center md:w-auto'
            >
              Buka Halaman
            </PreviewToolbarButton>
          </div>
        </div>

        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100'>
          <iframe
            ref={previewFrameRef}
            key={previewKey}
            title='Pratinjau halaman link'
            src={`/links?preview=${encodeURIComponent(previewKey)}`}
            className='h-[720px] w-full bg-white'
          />
        </div>
      </section>
    </div>
  );
}
