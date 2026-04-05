import { useMutation, useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

interface FinanceTransaction {
  transaction_id: string;
  type: 'income' | 'expenses';
  description: string;
  amount: number;
  transaction_date: string;
  timestamp: string;
}

interface CreateTransactionRequest {
  type: 'income' | 'expenses';
  description: string;
  amount: number;
  transaction_at: string;
}

export function useGetAllFinanceTransactions() {
  return useQuery({
    queryKey: ['finance-transactions-admin'],
    queryFn: async () => {
      const response = await api.get<{
        status: boolean;
        message: string;
        data: FinanceTransaction[];
      }>('/finance/admin/transactions');
      return response.data.data;
    },
  });
}

export function useCreateFinanceTransaction() {
  return useMutation({
    mutationFn: async (data: CreateTransactionRequest) => {
      const response = await api.post<{
        status: boolean;
        message: string;
        data: FinanceTransaction;
      }>('/finance/admin/transactions', data);
      return response.data.data;
    },
  });
}

export function useUpdateFinanceTransaction() {
  return useMutation({
    mutationFn: async (data: {
      id: string;
      type?: 'income' | 'expenses';
      description?: string;
      amount?: number;
      transaction_at?: string;
    }) => {
      const { id, ...updateData } = data;
      const response = await api.put<{
        status: boolean;
        message: string;
        data: FinanceTransaction;
      }>(`/finance/admin/transactions/${id}`, updateData);
      return response.data.data;
    },
  });
}

export function useDeleteFinanceTransaction() {
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/finance/admin/transactions/${id}`);
      return true;
    },
  });
}
