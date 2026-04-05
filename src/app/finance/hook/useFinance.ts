import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { api } from '@/lib/api';

import { ApiError, ApiResponse } from '@/types/api';
import { FinanceReportData } from '@/types/entities/finance';

export const useGetFinanceReport = () => {
  const {
    data: reportData,
    isLoading,
    isError,
    refetch,
  } = useQuery<ApiResponse<FinanceReportData>, AxiosError<ApiError>>({
    queryKey: ['finance-report'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<FinanceReportData>>('/finance/report');
      return res.data;
    },
  });

  return {
    data: reportData?.data,
    isLoading,
    error: isError ? 'Failed to fetch finance report' : null,
    fetchFinanceReport: refetch,
  };
};
