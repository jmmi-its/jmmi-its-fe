'use client';

import { usePathname, useRouter } from 'next/navigation';
import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

import { getToken } from '@/lib/cookies';

import AdminSidebar from '@/components/admin/AdminSidebar';
import Loading from '@/components/Loading';
import { showToast, SUCCESS_TOAST, WARNING_TOAST } from '@/components/Toast';

import useAuthStore from '@/stores/useAuthStore';

const FUNGSIO_ALLOWED_PATHS = ['/admin', '/admin/shortlinks', '/admin/kalender', '/admin/links'];

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  const login = useAuthStore.useLogin();
  const logout = useAuthStore.useLogout();
  const stopLoading = useAuthStore.useStopLoading();
  const isAuthed = useAuthStore.useIsAuthed();
  const isLoading = useAuthStore.useIsLoading();
  const user = useAuthStore.useUser();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const token = getToken();
    const storedUser = localStorage.getItem('user-jmmi');

    if (storedUser) {
      try {
        login(JSON.parse(storedUser));
      } catch {
        logout();
      }
    } else if (!token) {
      logout();
    }

    stopLoading();
  }, [isClient, login, logout, stopLoading]);

  useEffect(() => {
    if (isClient && !isLoading && !isAuthed) {
      router.replace('/login');
    }
  }, [isAuthed, isClient, isLoading, router]);

  // Role-based route guard
  useEffect(() => {
    if (!isClient || isLoading || !isAuthed || !user?.role) return;

    const normalizedRole = user.role.toLowerCase();

    if (normalizedRole === 'fungsio') {
      const isAllowed = FUNGSIO_ALLOWED_PATHS.some(
        (allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`)
      );

      if (!isAllowed) {
        showToast(
          'Akses terbatas: Akun Fungsionaris hanya dapat mengakses Dashboard, Shortlink, Kalender, dan Links.',
          WARNING_TOAST
        );
        router.replace('/admin');
      }
    } else if (normalizedRole === 'admin') {
      if (pathname === '/admin/users' || pathname.startsWith('/admin/users/')) {
        showToast(
          'Akses terbatas: Manajemen Akun hanya dapat diakses oleh Superadmin.',
          WARNING_TOAST
        );
        router.replace('/admin');
      }
    }
  }, [isAuthed, isClient, isLoading, pathname, router, user?.role]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', SUCCESS_TOAST);
    router.replace('/login');
  };

  if (!isClient || isLoading) {
    return <Loading fullScreen />;
  }

  if (!isAuthed) {
    return null;
  }

  // Prevent flash of unauthorized content
  const normalizedRole = user?.role?.toLowerCase();
  if (
    normalizedRole === 'fungsio' &&
    !FUNGSIO_ALLOWED_PATHS.some(
      (allowed) => pathname === allowed || pathname.startsWith(`${allowed}/`)
    )
  ) {
    return <Loading fullScreen />;
  }

  if (
    normalizedRole === 'admin' &&
    (pathname === '/admin/users' || pathname.startsWith('/admin/users/'))
  ) {
    return <Loading fullScreen />;
  }

  return (
    <div className='min-h-screen bg-slate-50 font-primary text-slate-800 lg:flex'>
      <AdminSidebar
        userName={user?.name}
        userRole={user?.role}
        onLogout={handleLogout}
      />
      <main className='flex-1 px-4 py-8 sm:px-6 lg:px-10 max-w-7xl mx-auto w-full'>{children}</main>
    </div>
  );
}