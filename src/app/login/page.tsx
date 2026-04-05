'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Button from '@/components/buttons/Button';
import useAuthStore from '@/stores/useAuthStore';
import LinksLayoutWrapper from '@/components/links/LinksLayoutWrapper';
import { useAdminLogin } from '../admin/hook/useAdmin';
import { showToast, DANGER_TOAST, SUCCESS_TOAST } from '@/components/Toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isClient, setIsClient] = useState(false);

  const login = useAuthStore.useLogin();
  const isAuthed = useAuthStore.useIsAuthed();
  const { mutate: adminLogin, isPending } = useAdminLogin();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (isAuthed && isClient) {
      router.push('/admin');
    }
  }, [isAuthed, isClient, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      showToast('Email and password are required', DANGER_TOAST);
      return;
    }

    adminLogin(
      { email, password },
      {
        onSuccess: (data) => {
          const userData = {
            id: data.id,
            email: data.email,
            name: data.name,
            role: 'ADMIN',
            access_token: data.access_token,
            refresh_token: data.refresh_token,
          };
          login(userData);
          showToast('Login successful! Redirecting...', SUCCESS_TOAST);
          router.replace('/admin');
        },
        onError: (error: any) => {
          const message =
            error.response?.data?.message || 'Login failed. Please try again.';
          showToast(message, DANGER_TOAST);
        },
      }
    );
  };

  if (!isClient) {
    return null;
  }

  return (
    <LinksLayoutWrapper>
      <div className='flex min-h-screen items-center justify-center px-4'>
        <div className='w-full max-w-md'>
        <div className='mb-8 text-center'>
          <h1 className='text-3xl font-bold text-white'>Admin Login</h1>
          <p className='mt-2 text-slate-200'>
            Manage financial data and transactions
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className='rounded-lg bg-white p-8 shadow-lg'
        >
          <div className='mb-6'>
            <label htmlFor='email' className='block text-sm font-medium text-slate-700'>
              Email Address
            </label>
            <input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder='Enter your email'
              className='mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-300'
            />
          </div>

          <div className='mb-8'>
            <label htmlFor='password' className='block text-sm font-medium text-slate-700'>
              Password
            </label>
            <input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder='••••••••'
              className='mt-2 w-full rounded-md border border-slate-300 bg-slate-50 px-4 py-2 text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-300'
            />
          </div>

          <Button
            type='submit'
            variant='primary'
            className='w-full'
            isLoading={isPending}
            disabled={isPending}
          >
            {isPending ? 'Logging in...' : 'Login'}
          </Button>
        </form>

        <div className='mt-6 text-center'>
          <p className='text-sm text-white'>
            with love from BPI Ekselensi 2026
          </p>
        </div>
        </div>
      </div>
    </LinksLayoutWrapper>
  );
}
