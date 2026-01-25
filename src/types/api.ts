export type PaginateData<Data> = {
  data: Data;
  meta: {
    page: number;
    limit: number;
    total_data: number;
    total_page: number;
  };
};

export interface PaginatedApiResponse<DataType> {
  code: number;
  status: boolean;
  message: string;
  data: PaginateData<DataType>;
}

export type ApiResponse<T> = {
  message: string;
  status: boolean;
  code: number;
  data: T;
};

export type ApiError = {
  code: number;
  status: boolean | number;
  message: string;
  error: string;
};

export type UninterceptedApiError = {
  code: number;
  status: boolean;
  message: string | Record<string, string[]>;
};
