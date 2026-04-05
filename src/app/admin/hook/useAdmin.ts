import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  id: string;
  email: string;
  name: string;
  access_token: string;
  refresh_token: string;
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await api.post<{
        status: boolean;
        message: string;
        data: LoginResponse;
      }>('/auth/login', credentials);
      return response.data.data;
    },
  });
}

export function useVerifyAdminToken(token?: string) {
  return useQuery({
    queryKey: ['verify-admin', token],
    queryFn: async () => {
      if (!token) return null;
      const response = await api.post<{
        status: boolean;
        message: string;
        data: {
          id: string;
          email: string;
          name: string;
        };
      }>('/auth/verify', undefined, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data.data;
    },
    enabled: !!token,
  });
}
