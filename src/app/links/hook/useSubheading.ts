import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { api } from '@/lib/api';

import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';

import { ApiError, ApiResponse } from '@/types/api';
import {
  CreateSubheadingRequest,
  Subheading,
  UpdateSubheadingRequest,
} from '@/types/entities/links';

export const useGetSubheadings = () => {
  const {
    data: subheadingsData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<Subheading[]>, AxiosError<ApiError>>({
    queryKey: ['subheadings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Subheading[]>>(
        '/links/subheadings'
      );
      return res.data;
    },
  });

  return {
    data: subheadingsData?.data || [],
    isLoading,
    error: isError ? 'Failed to fetch subheadings' : null,
    fetchSubheadings: refetch,
  };
};

export const useGetSubheadingById = () => {
  const [data, setData] = useState<Subheading | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSubheading = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Subheading>>(
        `/links/subheadings/${id}`
      );
      setData(res.data.data);
      return res.data.data;
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch subheading';
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

  return { data, isLoading, error, fetchSubheading };
};

export const useCreateSubheading = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: createSubheading,
    mutateAsync: createSubheadingAsync,
    isPending: isLoading,
    isError,
  } = useMutation<
    ApiResponse<Subheading>,
    AxiosError<ApiError>,
    CreateSubheadingRequest
  >({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<Subheading>>(
        '/links/subheadings',
        data
      );
      return res.data;
    },
    onSuccess: () => {
      showToast('Subheading berhasil dibuat', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['subheadings'] });
      router.push('/links/admin/subheadings');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal membuat subheading');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: createSubheading,
    mutateAsync: createSubheadingAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useUpdateSubheading = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateSubheadingAsync,
    isPending: isLoading,
    isError,
  } = useMutation<
    ApiResponse<Subheading>,
    AxiosError<ApiError>,
    { id: string; data: UpdateSubheadingRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<ApiResponse<Subheading>>(
        `/links/subheadings/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      showToast('Subheading berhasil diupdate', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['subheadings'] });
      router.push('/links/admin/subheadings');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal mengupdate subheading');
      showToast(message, DANGER_TOAST);
    },
  });

  const mutateWrapper = async (id: string, data: UpdateSubheadingRequest) => {
    return await updateSubheadingAsync({ id, data });
  };

  return {
    mutate: mutateWrapper,
    mutateAsync: mutateWrapper,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useDeleteSubheading = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: deleteSubheading,
    mutateAsync: deleteSubheadingAsync,
    isPending: isLoading,
    isError,
  } = useMutation<ApiResponse<null>, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await api.delete<ApiResponse<null>>(
        `/links/subheadings/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      showToast('Subheading berhasil dihapus', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['subheadings'] });
      router.push('/links/admin/subheadings');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal menghapus subheading');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: deleteSubheading,
    mutateAsync: deleteSubheadingAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};
