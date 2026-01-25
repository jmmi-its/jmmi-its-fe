'use client';

import { useRouter } from 'next/navigation';
import * as React from 'react';

import { getToken, removeToken } from '@/lib/cookies';

import Forbidden from '@/components/Forbidden';
import Loading from '@/components/Loading';
import { DANGER_TOAST, showToast } from '@/components/Toast';

import useAuthStore from '@/stores/useAuthStore';

import { User } from '@/types/entities/user';

export interface WithAuthProps {
  user: User;
}

const USER_ROUTE = '/dashboard';
const ADMIN_ROUTE = '/admin';

export enum RouteRole {
  /**
  Dapat diakses hanya ketika user belum login (Umum)
   */
  public,
  /**
   * Dapat diakses semuanya
   */
  optional,
  /**
   * For all authenticated user
   * will push to login if user is not authenticated
   */
  user,
  /**
   * For all authenticated admin
   * will push to login if user is not authenticated
   */
  admin,
}

/**
 * Add role-based access control to a component
 *
 * @see https://react-typescript-cheatsheet.netlify.app/docs/hoc/full_example/
 * @see https://github.com/mxthevs/nextjs-auth/blob/main/src/components/withAuth.tsx
 */
export default function withAuth<T extends WithAuthProps>(
  Component: React.FC<T>,
  routeRole: keyof typeof RouteRole,
  options: {
    withCache?: boolean;
  } = {
    withCache: true,
  }
) {
  const ComponentWithAuth = (props: Omit<T, keyof WithAuthProps>) => {
    const router = useRouter();

    //#region  //*=========== STORE ===========
    const isAuthed = useAuthStore.useIsAuthed();
    const isLoading = useAuthStore.useIsLoading();
    const login = useAuthStore.useLogin();
    const logout = useAuthStore.useLogout();
    const stopLoading = useAuthStore.useStopLoading();
    const user = useAuthStore.useUser();
    //#endregion  //*======== STORE ===========

    // console.log(isAuthed);
    // console.log(user?.account_id);
    // console.log(routeRole);

    const checkAuth = React.useCallback(() => {
      const token = getToken();

      if (isAuthed || options.withCache) {
        // If the user is already authenticated or caching is enabled, get user details from local storage
        const storedUser = localStorage.getItem('user-ise');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          login(parsedUser);
          stopLoading();
          return;
        }
      }

      if (!token) {
        // Logout if user was previously authenticated
        if (isAuthed) {
          logout();
        }
        stopLoading();
        return;
      }
      const loadUser = async () => {
        try {
          // call local storage with useAuthStore in useUser
          const res = useAuthStore.useUser();
          if (!res) {
            showToast('Invalid login session', DANGER_TOAST);
            throw new Error('Invalid login session');
          }
          const userData = {
            ...res,
            token: token,
          };

          login(userData);
        } catch (_error) {
          // Error during user load - logout and clear token
          logout();
          removeToken();
        } finally {
          stopLoading();
        }
      };

      if (!isAuthed || options.withCache) {
        loadUser();
      }
    }, [isAuthed, login, logout, stopLoading]);
    React.useEffect(() => {
      checkAuth();

      window.addEventListener('focus', checkAuth);
      return () => {
        window.removeEventListener('focus', checkAuth);
      };
    }, [checkAuth]);

    React.useEffect(() => {
      const Redirect = async () => {
        if (isAuthed) {
          if (routeRole === 'public') {
            router.push('/');
          }
          if (routeRole === 'admin') {
            if (user?.role !== 'ADMIN') {
              showToast("You don't have access to this page!", DANGER_TOAST);
              router.replace(USER_ROUTE);
            }
          }
          if (routeRole === 'user') {
            if (user?.role === 'ADMIN') {
              showToast("You don't have access to this page!", DANGER_TOAST);
              router.replace(ADMIN_ROUTE);
            }
          }
        } else {
          if (
            routeRole !== 'public' &&
            routeRole !== 'optional' &&
            routeRole !== 'admin' &&
            routeRole !== 'user'
          ) {
            router.push('/auth/login');
          } else {
            if (
              routeRole !== 'public' &&
              routeRole !== 'optional' &&
              routeRole !== 'admin' &&
              routeRole !== 'user'
            ) {
              showToast("You don't have access to this page!", DANGER_TOAST);
              router.push('/auth/login');
            } else if (routeRole === 'admin' || routeRole === 'user') {
              showToast("You don't have access to this page!", DANGER_TOAST);
              router.push('/auth/login');
            }
          }
        }
      };

      if (!isLoading) {
        Redirect();
      }
    }, [isAuthed, isLoading, router, user?.role]);

    if (
      (isLoading || !isAuthed) &&
      routeRole !== 'public' &&
      routeRole !== 'optional'
    ) {
      return <Loading />;
    }

    if (isAuthed) {
      if (routeRole === 'admin') {
        if (user?.role !== 'ADMIN') {
          showToast("You don't have access to this page!", DANGER_TOAST);
          router.replace(USER_ROUTE);
          return <Forbidden />;
        }
      }

      if (routeRole === 'user' && user?.role === 'ADMIN') {
        router.push('/');
        return <Forbidden />;
      }
    }

    return <Component {...(props as T)} user={user} />;
  };

  return ComponentWithAuth;
}
