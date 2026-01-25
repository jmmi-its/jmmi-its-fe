import { createSelectorHooks } from 'auto-zustand-selectors-hook';
import { produce } from 'immer';
import { create } from 'zustand';

import {
  removeRefreshToken,
  removeToken,
  setRefreshToken,
  setToken,
} from '@/lib/cookies';

import { User, withTokens } from '@/types/entities/user';

type AuthStoreType = {
  user: User | null;
  isAuthed: boolean;
  isLoading: boolean;
  login: (user: User & withTokens) => void;
  logout: () => void;
  stopLoading: () => void;
};

const useAuthStoreBase = create<AuthStoreType>((set) => ({
  user: null,
  isAuthed: false,
  isLoading: true,
  login: (user) => {
    localStorage.setItem('user-jmmi', JSON.stringify(user));
    setToken(user.access_token);
    setRefreshToken(user.refresh_token);
    set(
      produce<AuthStoreType>((state) => {
        state.isAuthed = true;
        state.user = user;
      })
    );
  },
  logout: () => {
    localStorage.removeItem('user-jmmi');
    removeToken();
    removeRefreshToken();
    set(
      produce<AuthStoreType>((state) => {
        state.isAuthed = false;
        state.user = null;
      })
    );
  },
  stopLoading: () => {
    set(
      produce<AuthStoreType>((state) => {
        state.isLoading = false;
      })
    );
  },
}));

const useAuthStore = createSelectorHooks(useAuthStoreBase);

export default useAuthStore;
