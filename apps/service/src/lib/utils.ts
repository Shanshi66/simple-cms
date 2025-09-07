// src/utils/response.ts

import { SuccessResponse, ErrorResponse } from "@repo/types/api";

/**
 * 创建一个成功的响应体
 * @param data - 要发送的数据
 */
export function createSuccessResponse<T>(data: T): SuccessResponse<T> {
  return {
    success: true,
    data,
  };
}

/**
 * 创建一个失败的响应体
 * @param code - 业务错误码
 * @param message - 错误信息
 */
export function createErrorResponse(
  code: string,
  message: string,
): ErrorResponse {
  return {
    success: false,
    error: {
      message,
      code,
    },
  };
}
