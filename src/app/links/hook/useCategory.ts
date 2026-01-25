import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import { api } from '@/lib/api';

import { DANGER_TOAST, showToast, SUCCESS_TOAST } from '@/components/Toast';

import { ApiError, ApiResponse } from '@/types/api';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/entities/links';

export const useGetCategories = () => {
  const {
    data: categoriesData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<Category[]>, AxiosError<ApiError>>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Category[]>>('/links/categories');
      return res.data;
    },
  });

  return {
    data: categoriesData?.data || [],
    isLoading,
    error: isError ? 'Failed to fetch categories' : null,
    fetchCategories: refetch,
  };
};

export const useGetCategoryById = () => {
  const [data, setData] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.get<ApiResponse<Category>>(
        `/links/categories/${id}`
      );
      setData(res.data.data);
      return res.data.data;
    } catch (err: unknown) {
      let errorMessage = 'Failed to fetch category';
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

  return { data, isLoading, error, fetchCategory };
};

export const useCreateCategory = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: createCategory,
    mutateAsync: createCategoryAsync,
    isPending: isLoading,
    isError,
  } = useMutation<
    ApiResponse<Category>,
    AxiosError<ApiError>,
    CreateCategoryRequest
  >({
    mutationFn: async (data) => {
      const res = await api.post<ApiResponse<Category>>(
        '/links/categories',
        data
      );
      return res.data;
    },
    onSuccess: () => {
      showToast('Kategori berhasil dibuat', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/links/admin/categories');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal membuat kategori');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: createCategory,
    mutateAsync: createCategoryAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useUpdateCategory = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutateAsync: updateCategoryAsync,
    isPending: isLoading,
    isError,
  } = useMutation<
    ApiResponse<Category>,
    AxiosError<ApiError>,
    { id: string; data: UpdateCategoryRequest }
  >({
    mutationFn: async ({ id, data }) => {
      const res = await api.put<ApiResponse<Category>>(
        `/links/categories/${id}`,
        data
      );
      return res.data;
    },
    onSuccess: () => {
      showToast('Kategori berhasil diupdate', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/links/admin/categories');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal mengupdate kategori');
      showToast(message, DANGER_TOAST);
    },
  });

  const mutateWrapper = async (id: string, data: UpdateCategoryRequest) => {
    return await updateCategoryAsync({ id, data });
  };

  return {
    mutate: mutateWrapper,
    mutateAsync: mutateWrapper,
    isLoading,
    error: isError ? 'Error' : null,
  };
};

export const useDeleteCategory = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  const {
    mutate: deleteCategory,
    mutateAsync: deleteCategoryAsync,
    isPending: isLoading,
    isError,
  } = useMutation<ApiResponse<null>, AxiosError<ApiError>, string>({
    mutationFn: async (id) => {
      const res = await api.delete<ApiResponse<null>>(
        `/links/categories/${id}`
      );
      return res.data;
    },
    onSuccess: () => {
      showToast('Kategori berhasil dihapus', SUCCESS_TOAST);
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      router.push('/links/admin/categories');
    },
    onError: (error) => {
      const message =
        error.response?.data.error ||
        (typeof error.response?.data.message === 'string'
          ? error.response?.data.message
          : 'Gagal menghapus kategori');
      showToast(message, DANGER_TOAST);
    },
  });

  return {
    mutate: deleteCategory,
    mutateAsync: deleteCategoryAsync,
    isLoading,
    error: isError ? 'Error' : null,
  };
};
