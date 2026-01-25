import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { api } from '@/lib/api';

import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';

import { ApiError, ApiResponse } from '@/types/api';
import {
  CreateFolderRequest,
  Folder,
  FolderDetailData,
  UpdateFolderRequest,
} from '@/types/entities/links';

export const useGetFolders = () => {
  // fetchFolders optionally takes a categoryId.
  // We can track query params in state if we want to useQuery properly.
  // But legacy usage might just call fetchFolders(catId).
  // The Admin Lists call it without args, or handle filtering client side?
  // In Admin Folder New Page: fetchFolders() with no args.
  // In Admin Link New Page: fetchFolders() with no args.
  // In Admin Folder List Page? Can't see it now, but likely fetches all.

  // I will assume for now we can fetch all, or support refetch with args if we manually trigger?
  // Actually useQuery is declarative.
  // If I want to support filtering, I should accept it as hook argument.
  // But to support legacy: I'll expose a wrapper that basically sets the query param state.

  const [categoryIdFilter, setCategoryIdFilter] = useState<string | undefined>(
    undefined
  );

  const {
    data: foldersData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<Folder[]>, AxiosError<ApiError>>({
    queryKey: ['folders', categoryIdFilter],
    queryFn: async () => {
      const query = categoryIdFilter
        ? `?category_id=${encodeURIComponent(categoryIdFilter)}`
        : '';
      const res = await api.get<ApiResponse<Folder[]>>(
        `/links/folders${query}`
      );
      return res.data;
    },
    // We might want to keep previous data while fetching?
    placeholderData: (previousData) => previousData,
  });

  const fetchFolders = useCallback(
    (categoryId?: string) => {
      if (categoryId !== categoryIdFilter) {
        setCategoryIdFilter(categoryId);
        // Changing state triggers refetch automatically due to queryKey dependency
      } else {
        refetch();
      }
    },
    [categoryIdFilter, refetch]
  );

  return {
    data: foldersData?.data || [],
    isLoading,
    error: isError ? 'Failed to fetch folders' : null,
    fetchFolders,
  };
};

export const useGetFolderById = () => {
  const [data, setData] = useState<FolderDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFolder = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<FolderDetailData>>(
        `/links/folders/${id}`
      );
      setData(res.data.data);
      return res.data.data;
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch folder';
      if (err instanceof AxiosError && err.response?.data?.message) {
        errorMessage =
          typeof err.response.data.message === 'string'
            ? err.response.data.message
            : (Object.values(err.response.data.message)[0] as string[])[0];
      } else if (err instanceof Error) {
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { data, isLoading, error, fetchFolder };
};

export const useCreateFolder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: createFolder,
    mutateAsync: createFolderAsync,
    isPending: isLoading,
    isError,
  } = useMutation<
    ApiResponse<Folder>,
    AxiosError<ApiError>,
    CreateFolderRequest
  >({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<Folder>>('/links/folders', data);
      return res.data;
    },
    onSuccess: () => {
      showToast('Folder berhasil dibuat', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      router.push('/links/admin/folders');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal membuat folder');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: createFolder,
    mutateAsync: createFolderAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useUpdateFolder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateFolderAsync,
    isPending: isLoading,
    isError,
  } = useMutation<
    ApiResponse<Folder>,
    AxiosError<ApiError>,
    { id: string; data: UpdateFolderRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<ApiResponse<Folder>>(
        `/links/folders/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      showToast('Folder berhasil diupdate', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      router.push('/links/admin/folders');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal mengupdate folder');
      showToast(message, DANGER_TOAST);
    },
  });

  const mutateWrapper = async (id: string, data: UpdateFolderRequest) => {
    return await updateFolderAsync({ id, data });
  };

  return {
    mutate: mutateWrapper,
    mutateAsync: mutateWrapper,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useDeleteFolder = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: deleteFolder,
    mutateAsync: deleteFolderAsync,
    isPending: isLoading,
    isError,
  } = useMutation<ApiResponse<null>, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await api.delete<ApiResponse<null>>(`/links/folders/${id}`);
      return res.data;
    },
    onSuccess: () => {
      showToast('Folder berhasil dihapus', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      router.push('/links/admin/folders');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal menghapus folder');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: deleteFolder,
    mutateAsync: deleteFolderAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};
