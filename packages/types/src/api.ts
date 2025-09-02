export interface SuccessResponse<T> {
  success: true;
  data: T;
}

// 有些异常不清楚，所有 code 可空
export interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
