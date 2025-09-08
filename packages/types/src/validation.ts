// Validation-related error types

export interface ValidationError extends Error {
  field?: string;
  code: string;
}

export interface APIError extends Error {
  statusCode: number;
  code: string;
}
