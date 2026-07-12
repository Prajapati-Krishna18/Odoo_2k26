/**
 * @file    ApiError.ts
 * @desc    Custom operational error class.
 *
 * Extends the native Error and carries an HTTP status code plus
 * an optional `errors` array for validation failures.
 *
 * The global error middleware catches these and formats them into
 * the standard JSON response shape.
 */

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly success: false = false;
  public readonly errors: unknown[];

  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown[] = [],
    stack?: string
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  // ── Common factory helpers ──────────────────────────────────

  static badRequest(message: string, errors: unknown[] = []): ApiError {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message: string = "Unauthorized"): ApiError {
    return new ApiError(401, message);
  }

  static forbidden(message: string = "Forbidden"): ApiError {
    return new ApiError(403, message);
  }

  static notFound(message: string = "Resource not found"): ApiError {
    return new ApiError(404, message);
  }

  static conflict(message: string): ApiError {
    return new ApiError(409, message);
  }

  static internal(message: string = "Internal server error"): ApiError {
    return new ApiError(500, message);
  }
}
