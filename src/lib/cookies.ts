import Cookies from 'universal-cookie';

const cookies = new Cookies();

function getTokenFromStorage(): string {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    const storedUser = window.localStorage.getItem('user-jmmi');
    if (!storedUser) {
      return '';
    }

    const parsedUser = JSON.parse(storedUser) as { access_token?: string };
    return parsedUser.access_token || '';
  } catch {
    return '';
  }
}

// Access Token
export const getToken = (): string => cookies.get('jmmi-its') || getTokenFromStorage();

export const setToken = (token: string) => {
  cookies.set('jmmi-its', token, { path: '/' });
};

export const removeToken = () => cookies.remove('jmmi-its', { path: '/' });

// Refresh Token
export const getRefreshToken = (): string => cookies.get('jmmi-its-refresh');

export const setRefreshToken = (token: string) => {
  cookies.set('jmmi-its-refresh', token, { path: '/' });
};

export const removeRefreshToken = () =>
  cookies.remove('jmmi-its-refresh', { path: '/' });
