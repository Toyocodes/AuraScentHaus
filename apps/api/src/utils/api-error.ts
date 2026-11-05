/** Throw this anywhere; the error-handler middleware turns it into JSON. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
  }

  static badRequest(message = "Bad request", code?: string, details?: unknown) {
    return new ApiError(400, message, code, details);
  }
  static unauthorized(message = "Please sign in to continue") {
    return new ApiError(401, message, "UNAUTHORIZED");
  }
  static forbidden(message = "You don't have permission to do that") {
    return new ApiError(403, message, "FORBIDDEN");
  }
  static notFound(what = "Resource") {
    return new ApiError(404, `${what} not found`, "NOT_FOUND");
  }
  static conflict(message: string, code = "CONFLICT", details?: unknown) {
    return new ApiError(409, message, code, details);
  }
  static tooManyRequests(message = "Too many requests, slow down", details?: unknown) {
    return new ApiError(429, message, "RATE_LIMITED", details);
  }
}
