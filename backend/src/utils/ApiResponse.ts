/**
 * @file    ApiResponse.ts
 * @desc    Standardised success response wrapper.
 *
 * Every successful API response follows this shape:
 * {
 *   success: true,
 *   message: string,
 *   data: T
 * }
 */

export class ApiResponse<T = unknown> {
  public readonly success: boolean;
  public readonly statusCode: number;
  public readonly message: string;
  public readonly data: T;

  constructor(statusCode: number, message: string, data: T) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /** Convenience factory for 200 OK */
  static ok<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(200, message, data);
  }

  /** Convenience factory for 201 Created */
  static created<T>(message: string, data: T): ApiResponse<T> {
    return new ApiResponse(201, message, data);
  }
}
