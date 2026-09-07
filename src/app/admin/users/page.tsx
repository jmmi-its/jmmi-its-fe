'use client';

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Edit,
  KeyRound,
  Mail,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  User,
  Users,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';

import { cn } from '@/lib/utils';

import Button from '@/components/buttons/Button';
import Loading from '@/components/Loading';
import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';

import useAuthStore from '@/stores/useAuthStore';

import {
  AdminUser,
  useCreateUser,
  useDeleteUser,
  useGetAllUsers,
  UserRole,
  useUpdateUser,
} from '../hook/useUsers';

const ROLE_CONFIG: Record<
  UserRole,
  {
    label: string;
    description: string;
    permissions: string[];
    badgeClass: string;
    bgClass: string;
    borderClass: string;
    icon: typeof Shield;
  }
> = {
  superadmin: {
    label: 'Superadmin',
    description: 'Akses penuh ke semua fitur dan manajemen seluruh akun pengurus.',
    permissions: ['Semua Fitur Admin', 'Keuangan', 'Manajemen Pengguna', 'Shortlink, Kalender, Links'],
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    bgClass: 'bg-amber-500/10 text-amber-700',
    borderClass: 'border-amber-200',
    icon: ShieldAlert,
  },
  admin: {
    label: 'Admin',
    description: 'Akses seluruh operasional admin termasuk keuangan dan kalender.',
    permissions: ['Dashboard & Laporan', 'Manajemen Keuangan', 'Shortlink', 'Kalender & Links'],
    badgeClass: 'bg-sky-100 text-sky-800 border-sky-300',
    bgClass: 'bg-sky-500/10 text-sky-700',
    borderClass: 'border-sky-200',
    icon: ShieldCheck,
  },
  fungsio: {
    label: 'Fungsionaris',
    description: 'Akses fokus operasional pengurus untuk Shortlink, Kalender, dan Links.',
    permissions: ['Shortlink (URL Shortener)', 'Kalender Acara', 'Manajemen Links/Bio'],
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    bgClass: 'bg-emerald-500/10 text-emerald-700',
    borderClass: 'border-emerald-200',
    icon: Shield,
  },
};

export default function UserManagementPage() {
  const currentUser = useAuthStore.useUser();
  const { data: users = [], isLoading, refetch, isFetching } = useGetAllUsers();
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser();

  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [deletingUser, setDeletingUser] = useState<AdminUser | null>(null);

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('fungsio');
  const [changePassword, setChangePassword] = useState(false);

  // Statistics
  const stats = useMemo(() => {
    const total = users.length;
    const superadmins = users.filter((u) => u.role === 'superadmin').length;
    const admins = users.filter((u) => u.role === 'admin').length;
    const fungsio = users.filter((u) => u.role === 'fungsio').length;
    return { total, superadmins, admins, fungsio };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  const openAddModal = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('fungsio');
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormPassword('');
    setChangePassword(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formName.trim() || !formEmail.trim() || !formPassword.trim()) {
      showToast('Mohon lengkapi semua field yang diperlukan', DANGER_TOAST);
      return;
    }

    if (formPassword.length < 6) {
      showToast('Password minimal 6 karakter', DANGER_TOAST);
      return;
    }

    createUser(
      {
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole,
      },
      {
        onSuccess: () => {
          showToast(`Akun ${formName} (${ROLE_CONFIG[formRole].label}) berhasil dibuat!`, SUCCESS_TOAST);
          setIsAddModalOpen(false);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Gagal menambahkan akun.';
          showToast(msg, DANGER_TOAST);
        },
      }
    );
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!formName.trim() || !formEmail.trim()) {
      showToast('Nama dan email wajib diisi', DANGER_TOAST);
      return;
    }

    if (changePassword && formPassword && formPassword.length < 6) {
      showToast('Password baru minimal 6 karakter', DANGER_TOAST);
      return;
    }

    updateUser(
      {
        id: editingUser.id,
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        password: changePassword && formPassword ? formPassword : undefined,
      },
      {
        onSuccess: () => {
          showToast('Data akun berhasil diperbarui!', SUCCESS_TOAST);
          setEditingUser(null);
        },
        onError: (err: any) => {
          const msg = err.response?.data?.message || 'Gagal memperbarui akun.';
          showToast(msg, DANGER_TOAST);
        },
      }
    );
  };

  const handleDeleteSubmit = () => {
    if (!deletingUser) return;

    deleteUser(deletingUser.id, {
      onSuccess: () => {
        showToast(`Akun ${deletingUser.name} berhasil dihapus.`, SUCCESS_TOAST);
        setDeletingUser(null);
      },
      onError: (err: any) => {
        const msg = err.response?.data?.message || 'Gagal menghapus akun.';
        showToast(msg, DANGER_TOAST);
      },
    });
  };

  if (isLoading) {
    return <Loading fullScreen />;
  }

  return (
    <div className='space-y-8 pb-12'>
      {/* Header */}
      <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <div className='flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#146637]'>
            <ShieldAlert className='h-4 w-4' />
            <span>Kontrol Akses Superadmin</span>
          </div>
          <h1 className='mt-1 font-sora text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight'>
            Manajemen Pengguna & Hak Akses
          </h1>
          <p className='mt-1 font-hanken text-sm text-slate-600 max-w-2xl'>
            Kelola akun pengurus JMMI ITS, tetapkan hak akses akun fungsionaris, admin, atau superadmin.
          </p>
        </div>

        <div className='flex items-center gap-2'>
          <Button
            type='button'
            variant='outline'
            onClick={() => refetch()}
            disabled={isFetching}
            className='h-11 rounded-2xl border-gray-200 bg-white px-3.5 text-slate-700 hover:bg-gray-50'
            title='Muat Ulang Data'
          >
            <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin text-[#146637]')} />
          </Button>

          <Button
            type='button'
            variant='primary'
            onClick={openAddModal}
            className='h-11 rounded-2xl bg-[#146637] px-5 font-sora text-sm font-semibold text-white hover:bg-[#0e4a28] shadow-md hover:shadow-lg transition-all'
          >
            <Plus className='mr-2 h-4 w-4' />
            Tambah Pengguna
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
        <div className='rounded-[22px] border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <p className='font-sora text-xs font-bold uppercase tracking-wider text-slate-500'>
              Total Akun
            </p>
            <div className='rounded-xl bg-slate-100 p-2.5 text-slate-700'>
              <Users className='h-5 w-5' />
            </div>
          </div>
          <p className='mt-3 font-sora text-3xl font-extrabold text-slate-900'>{stats.total}</p>
          <p className='mt-1 font-hanken text-xs text-slate-500'>Pengurus terdaftar dalam sistem</p>
        </div>

        <div className='rounded-[22px] border border-amber-100 bg-amber-50/40 p-5 shadow-sm hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <p className='font-sora text-xs font-bold uppercase tracking-wider text-amber-700'>
              Superadmin
            </p>
            <div className='rounded-xl bg-amber-500/15 p-2.5 text-amber-700'>
              <ShieldAlert className='h-5 w-5' />
            </div>
          </div>
          <p className='mt-3 font-sora text-3xl font-extrabold text-amber-900'>{stats.superadmins}</p>
          <p className='mt-1 font-hanken text-xs text-amber-700/80'>Akses penuh + kelola akun</p>
        </div>

        <div className='rounded-[22px] border border-sky-100 bg-sky-50/40 p-5 shadow-sm hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <p className='font-sora text-xs font-bold uppercase tracking-wider text-sky-700'>
              Admin
            </p>
            <div className='rounded-xl bg-sky-500/15 p-2.5 text-sky-700'>
              <ShieldCheck className='h-5 w-5' />
            </div>
          </div>
          <p className='mt-3 font-sora text-3xl font-extrabold text-sky-900'>{stats.admins}</p>
          <p className='mt-1 font-hanken text-xs text-sky-700/80'>Dashboard, keuangan & operasional</p>
        </div>

        <div className='rounded-[22px] border border-emerald-100 bg-emerald-50/40 p-5 shadow-sm hover:shadow-md transition-all'>
          <div className='flex items-center justify-between'>
            <p className='font-sora text-xs font-bold uppercase tracking-wider text-emerald-700'>
              Fungsionaris
            </p>
            <div className='rounded-xl bg-emerald-500/15 p-2.5 text-emerald-700'>
              <Shield className='h-5 w-5' />
            </div>
          </div>
          <p className='mt-3 font-sora text-3xl font-extrabold text-emerald-900'>{stats.fungsio}</p>
          <p className='mt-1 font-hanken text-xs text-emerald-700/80'>Shortlink, Kalender & Links</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className='rounded-[25px] border border-gray-100 bg-white p-4 shadow-sm sm:p-5'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          {/* Search input */}
          <div className='relative flex-1 max-w-md'>
            <Search className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Cari nama atau email pengguna...'
              className='w-full rounded-2xl border border-gray-200 bg-gray-50/60 pl-11 pr-4 py-2.5 font-hanken text-sm text-slate-800 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20 transition-all'
            />
            {searchQuery && (
              <button
                type='button'
                onClick={() => setSearchQuery('')}
                className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-slate-600'
              >
                <X className='h-4 w-4' />
              </button>
            )}
          </div>

          {/* Role Filter Tabs */}
          <div className='flex flex-wrap items-center gap-1.5 rounded-2xl bg-gray-100 p-1.5'>
            <button
              type='button'
              onClick={() => setRoleFilter('all')}
              className={cn(
                'rounded-xl px-3 py-1.5 font-sora text-xs font-semibold transition-all',
                roleFilter === 'all'
                  ? 'bg-white text-[#146637] shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Semua ({stats.total})
            </button>
            <button
              type='button'
              onClick={() => setRoleFilter('superadmin')}
              className={cn(
                'rounded-xl px-3 py-1.5 font-sora text-xs font-semibold transition-all',
                roleFilter === 'superadmin'
                  ? 'bg-white text-amber-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Superadmin ({stats.superadmins})
            </button>
            <button
              type='button'
              onClick={() => setRoleFilter('admin')}
              className={cn(
                'rounded-xl px-3 py-1.5 font-sora text-xs font-semibold transition-all',
                roleFilter === 'admin'
                  ? 'bg-white text-sky-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Admin ({stats.admins})
            </button>
            <button
              type='button'
              onClick={() => setRoleFilter('fungsio')}
              className={cn(
                'rounded-xl px-3 py-1.5 font-sora text-xs font-semibold transition-all',
                roleFilter === 'fungsio'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              )}
            >
              Fungsio ({stats.fungsio})
            </button>
          </div>
        </div>
      </div>

      {/* Users Table / List */}
      <div className='overflow-hidden rounded-[25px] border border-gray-100 bg-white shadow-md'>
        {filteredUsers.length === 0 ? (
          <div className='p-12 text-center'>
            <div className='mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-400'>
              <Users className='h-7 w-7' />
            </div>
            <h3 className='mt-4 font-sora text-base font-bold text-slate-800'>Tidak Ada Pengguna Ditemukan</h3>
            <p className='mt-1 font-hanken text-sm text-slate-500'>
              {searchQuery || roleFilter !== 'all'
                ? 'Tidak ada akun yang cocok dengan filter atau kata kunci pencarian.'
                : 'Belum ada akun pengurus yang terdaftar.'}
            </p>
          </div>
        ) : (
          <div className='overflow-x-auto'>
            <table className='w-full text-left'>
              <thead>
                <tr className='border-b border-gray-100 bg-gray-50/75 text-[11px] font-bold uppercase tracking-wider text-slate-500 font-sora'>
                  <th className='py-4 px-6'>Pengurus</th>
                  <th className='py-4 px-6'>Peran (Role)</th>
                  <th className='py-4 px-6'>Izin Akses Fitur</th>
                  <th className='py-4 px-6'>Terdaftar</th>
                  <th className='py-4 px-6 text-right'>Aksi</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-gray-100 font-hanken text-sm'>
                {filteredUsers.map((user) => {
                  const roleInfo = ROLE_CONFIG[user.role] || ROLE_CONFIG.admin;
                  const isCurrentAccount = currentUser?.email === user.email;
                  const formattedDate = new Date(user.createdAt).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <tr
                      key={user.id}
                      className={cn(
                        'hover:bg-slate-50/60 transition-colors',
                        isCurrentAccount && 'bg-emerald-50/20'
                      )}
                    >
                      {/* Name & Email */}
                      <td className='py-4 px-6'>
                        <div className='flex items-center gap-3.5'>
                          <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#146637]/10 font-sora font-extrabold text-[#146637]'>
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className='min-w-0'>
                            <div className='flex items-center gap-2'>
                              <p className='font-sora font-bold text-slate-900 truncate'>{user.name}</p>
                              {isCurrentAccount && (
                                <span className='rounded-full bg-[#146637]/15 px-2 py-0.5 font-sora text-[10px] font-bold uppercase tracking-wider text-[#146637]'>
                                  Anda
                                </span>
                              )}
                            </div>
                            <div className='flex items-center gap-1.5 text-xs text-slate-500 mt-0.5'>
                              <Mail className='h-3 w-3 text-slate-400' />
                              <span className='truncate'>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className='py-4 px-6'>
                        <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-sora text-xs font-bold uppercase tracking-wider shadow-2xs', roleInfo.badgeClass)}>
                          <roleInfo.icon className='h-3.5 w-3.5' />
                          <span>{roleInfo.label}</span>
                        </div>
                      </td>

                      {/* Permissions List */}
                      <td className='py-4 px-6'>
                        <div className='flex flex-wrap gap-1.5 max-w-sm'>
                          {roleInfo.permissions.map((perm) => (
                            <span
                              key={perm}
                              className='rounded-md bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-slate-700'
                            >
                              {perm}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Created Date */}
                      <td className='py-4 px-6 text-slate-500 text-xs whitespace-nowrap'>
                        <div className='flex items-center gap-1.5'>
                          <Calendar className='h-3.5 w-3.5 text-slate-400' />
                          <span>{formattedDate}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className='py-4 px-6 text-right whitespace-nowrap'>
                        <div className='flex items-center justify-end gap-1'>
                          <button
                            type='button'
                            onClick={() => openEditModal(user)}
                            className='inline-flex h-9 w-9 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors'
                            title='Edit Pengguna'
                          >
                            <Edit className='h-4 w-4' />
                          </button>

                          <button
                            type='button'
                            onClick={() => setDeletingUser(user)}
                            disabled={isCurrentAccount}
                            className={cn(
                              'inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                              isCurrentAccount
                                ? 'cursor-not-allowed opacity-30 text-gray-400'
                                : 'text-rose-500 hover:bg-rose-50 hover:text-rose-700'
                            )}
                            title={isCurrentAccount ? 'Tidak dapat menghapus akun sendiri' : 'Hapus Pengguna'}
                          >
                            <Trash2 className='h-4 w-4' />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL: Tambah Pengguna Baru */}
      {isAddModalOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity'
            onClick={() => !isCreating && setIsAddModalOpen(false)}
          />

          <div className='relative w-full max-w-lg rounded-[25px] border border-gray-100 bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
              <div>
                <h3 className='font-sora text-xl font-bold text-slate-900'>Tambah Pengguna Baru</h3>
                <p className='font-hanken text-xs text-slate-500 mt-0.5'>
                  Buat akun baru untuk pengurus atau fungsionaris JMMI.
                </p>
              </div>
              <button
                type='button'
                onClick={() => !isCreating && setIsAddModalOpen(false)}
                className='rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-slate-700'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className='mt-6 space-y-5'>
              {/* Nama */}
              <div className='space-y-1.5'>
                <label className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                  Nama Lengkap <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <User className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder='Contoh: Fadhil Rahman'
                    className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 font-hanken text-sm text-slate-800 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20'
                  />
                </div>
              </div>

              {/* Email */}
              <div className='space-y-1.5'>
                <label className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                  Email Address <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='email'
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder='fadhil@jmmi.com'
                    className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 font-hanken text-sm text-slate-800 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20'
                  />
                </div>
              </div>

              {/* Password */}
              <div className='space-y-1.5'>
                <label className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                  Password <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <KeyRound className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='password'
                    required
                    minLength={6}
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    placeholder='Minimal 6 karakter'
                    className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 font-hanken text-sm text-slate-800 placeholder:text-gray-400 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20'
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className='space-y-2'>
                <label className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                  Pilih Peran Akun (Role) <span className='text-rose-500'>*</span>
                </label>
                <div className='grid gap-2.5'>
                  {(Object.keys(ROLE_CONFIG) as UserRole[]).map((roleKey) => {
                    const r = ROLE_CONFIG[roleKey];
                    const isSelected = formRole === roleKey;
                    return (
                      <div
                        key={roleKey}
                        onClick={() => setFormRole(roleKey)}
                        className={cn(
                          'cursor-pointer rounded-2xl border p-3.5 transition-all flex items-start gap-3',
                          isSelected
                            ? 'border-[#146637] bg-[#146637]/5 ring-1 ring-[#146637]'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                            isSelected
                              ? 'border-[#146637] bg-[#146637] text-white'
                              : 'border-gray-300 bg-white'
                          )}
                        >
                          {isSelected && <CheckCircle2 className='h-3.5 w-3.5' />}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-2'>
                            <p className='font-sora text-xs font-bold text-slate-900'>{r.label}</p>
                            <span
                              className={cn(
                                'rounded-full border px-2 py-0.2 font-sora text-[9px] font-bold uppercase tracking-wider',
                                r.badgeClass
                              )}
                            >
                              {r.label}
                            </span>
                          </div>
                          <p className='mt-0.5 font-hanken text-xs text-slate-500'>{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Actions */}
              <div className='mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={isCreating}
                  onClick={() => setIsAddModalOpen(false)}
                  className='rounded-xl border-gray-200 px-4 text-xs font-semibold text-slate-700 hover:bg-gray-50'
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={isCreating}
                  className='rounded-xl bg-[#146637] px-5 text-xs font-semibold text-white hover:bg-[#0e4a28]'
                >
                  {isCreating ? 'Menyimpan...' : 'Tambah Pengguna'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Edit Pengguna */}
      {editingUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity'
            onClick={() => !isUpdating && setEditingUser(null)}
          />

          <div className='relative w-full max-w-lg rounded-[25px] border border-gray-100 bg-white p-6 sm:p-8 shadow-2xl z-10 max-h-[90vh] overflow-y-auto'>
            <div className='flex items-center justify-between border-b border-gray-100 pb-4'>
              <div>
                <h3 className='font-sora text-xl font-bold text-slate-900'>Edit Pengguna</h3>
                <p className='font-hanken text-xs text-slate-500 mt-0.5'>
                  Perbarui informasi profil dan hak akses akun.
                </p>
              </div>
              <button
                type='button'
                onClick={() => !isUpdating && setEditingUser(null)}
                className='rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-slate-700'
              >
                <X className='h-5 w-5' />
              </button>
            </div>

            <form onSubmit={handleUpdateSubmit} className='mt-6 space-y-5'>
              {/* Nama */}
              <div className='space-y-1.5'>
                <label className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                  Nama Lengkap <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <User className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='text'
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 font-hanken text-sm text-slate-800 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20'
                  />
                </div>
              </div>

              {/* Email */}
              <div className='space-y-1.5'>
                <label className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                  Email Address <span className='text-rose-500'>*</span>
                </label>
                <div className='relative'>
                  <Mail className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                  <input
                    type='email'
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className='w-full rounded-2xl border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3 font-hanken text-sm text-slate-800 focus:border-[#146637] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#146637]/20'
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className='space-y-2'>
                <label className='block font-sora text-xs font-semibold uppercase tracking-wider text-slate-700'>
                  Ubah Peran Akun (Role) <span className='text-rose-500'>*</span>
                </label>
                <div className='grid gap-2.5'>
                  {(Object.keys(ROLE_CONFIG) as UserRole[]).map((roleKey) => {
                    const r = ROLE_CONFIG[roleKey];
                    const isSelected = formRole === roleKey;
                    return (
                      <div
                        key={roleKey}
                        onClick={() => setFormRole(roleKey)}
                        className={cn(
                          'cursor-pointer rounded-2xl border p-3.5 transition-all flex items-start gap-3',
                          isSelected
                            ? 'border-[#146637] bg-[#146637]/5 ring-1 ring-[#146637]'
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                        )}
                      >
                        <div
                          className={cn(
                            'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                            isSelected
                              ? 'border-[#146637] bg-[#146637] text-white'
                              : 'border-gray-300 bg-white'
                          )}
                        >
                          {isSelected && <CheckCircle2 className='h-3.5 w-3.5' />}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <div className='flex items-center gap-2'>
                            <p className='font-sora text-xs font-bold text-slate-900'>{r.label}</p>
                            <span
                              className={cn(
                                'rounded-full border px-2 py-0.2 font-sora text-[9px] font-bold uppercase tracking-wider',
                                r.badgeClass
                              )}
                            >
                              {r.label}
                            </span>
                          </div>
                          <p className='mt-0.5 font-hanken text-xs text-slate-500'>{r.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Ganti Password Opsional */}
              <div className='rounded-2xl border border-gray-100 bg-gray-50/60 p-4 space-y-3'>
                <label className='flex items-center gap-2.5 cursor-pointer'>
                  <input
                    type='checkbox'
                    checked={changePassword}
                    onChange={(e) => setChangePassword(e.target.checked)}
                    className='h-4 w-4 rounded-sm border-gray-300 text-[#146637] focus:ring-[#146637]'
                  />
                  <span className='font-sora text-xs font-bold text-slate-800'>
                    Ganti Password Pengguna
                  </span>
                </label>

                {changePassword && (
                  <div className='pt-2'>
                    <div className='relative'>
                      <KeyRound className='absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400' />
                      <input
                        type='password'
                        minLength={6}
                        value={formPassword}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder='Masukkan password baru (minimal 6 karakter)'
                        className='w-full rounded-2xl border border-gray-200 bg-white pl-11 pr-4 py-2.5 font-hanken text-sm text-slate-800 placeholder:text-gray-400 focus:border-[#146637] focus:outline-none focus:ring-2 focus:ring-[#146637]/20'
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className='mt-6 flex items-center justify-end gap-3 pt-4 border-t border-gray-100'>
                <Button
                  type='button'
                  variant='outline'
                  disabled={isUpdating}
                  onClick={() => setEditingUser(null)}
                  className='rounded-xl border-gray-200 px-4 text-xs font-semibold text-slate-700 hover:bg-gray-50'
                >
                  Batal
                </Button>
                <Button
                  type='submit'
                  variant='primary'
                  disabled={isUpdating}
                  className='rounded-xl bg-[#146637] px-5 text-xs font-semibold text-white hover:bg-[#0e4a28]'
                >
                  {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Konfirmasi Hapus */}
      {deletingUser && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
          <div
            className='fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity'
            onClick={() => !isDeleting && setDeletingUser(null)}
          />

          <div className='relative w-full max-w-md rounded-[25px] border border-gray-100 bg-white p-6 sm:p-8 shadow-2xl z-10'>
            <div className='flex items-center gap-3.5 text-rose-600'>
              <div className='rounded-2xl bg-rose-50 p-3'>
                <AlertCircle className='h-6 w-6 text-rose-600' />
              </div>
              <div>
                <h3 className='font-sora text-lg font-bold text-slate-900'>Hapus Akun Pengguna</h3>
                <p className='font-hanken text-xs text-slate-500'>Tindakan ini tidak dapat dibatalkan.</p>
              </div>
            </div>

            <p className='mt-4 font-hanken text-sm text-slate-600'>
              Apakah Anda yakin ingin menghapus akun{' '}
              <span className='font-bold text-slate-900'>{deletingUser.name}</span> (
              {deletingUser.email})? Pengurus ini tidak akan dapat login lagi ke panel admin.
            </p>

            <div className='mt-6 flex items-center justify-end gap-3'>
              <Button
                type='button'
                variant='outline'
                disabled={isDeleting}
                onClick={() => setDeletingUser(null)}
                className='rounded-xl border-gray-200 px-4 text-xs font-semibold text-slate-700 hover:bg-gray-50'
              >
                Batal
              </Button>
              <Button
                type='button'
                variant='primary'
                disabled={isDeleting}
                onClick={handleDeleteSubmit}
                className='rounded-xl bg-rose-600 px-5 text-xs font-semibold text-white hover:bg-rose-700'
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Akun'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
