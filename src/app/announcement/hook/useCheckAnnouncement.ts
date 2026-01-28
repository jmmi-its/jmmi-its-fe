import { useMutation } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import api from '@/lib/api';

import { ApiError } from '@/types/api';

export interface AnnouncementData {
  status: 'passed' | 'failed';
  name?: string;
  codename?: string;
}

export interface CheckStatusPayload {
  nrp: string;
}

export interface AnnouncementResponse {
  status: 'success' | 'error';
  data?: AnnouncementData;
  message?: string;
}

export const useCheckAnnouncement = () => {
  return useMutation<
    AnnouncementResponse,
    AxiosError<ApiError>,
    CheckStatusPayload
  >({
    mutationFn: async (payload) => {
      const { data } = await api.post<AnnouncementResponse>(
        '/announcement/check',
        payload
      );
      return data;
    },
  });
};
