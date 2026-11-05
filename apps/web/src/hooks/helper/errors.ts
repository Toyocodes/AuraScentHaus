import { isAxiosError } from "axios";
import type { FieldValues, Path, UseFormSetError } from "react-hook-form";
import type { ApiErrorBody } from "@aurascenthaus/shared";

type FieldErrors = Record<string, string[]>;

/** A human-readable message from any error thrown by a hook. */
export function getErrorMessage(error: unknown, fallback = "Something went wrong. Please try again."): string {
  if (isAxiosError<ApiErrorBody>(error)) {
    if (!error.response) return "Can't reach the server. Check your connection.";
    return error.response.data?.error?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

/**
 * Field errors from a 422 response, keyed by dot path ("email", "address.city").
 * Pass to `applyFieldErrors` to show them on a react-hook-form form.
 */
export function getFieldErrors(error: unknown): FieldErrors {
  if (!isAxiosError<ApiErrorBody>(error)) return {};
  const details = error.response?.data?.error?.details as { fieldErrors?: FieldErrors } | undefined;
  return details?.fieldErrors ?? {};
}

/** The HTTP status of a failed request, if there was a response. */
export function getErrorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/**
 * Put API field errors onto a react-hook-form form:
 *   onError: (err) => applyFieldErrors(form.setError, err)
 * Dot paths ("address.city") match react-hook-form's nested field names.
 */
export function applyFieldErrors<T extends FieldValues>(setError: UseFormSetError<T>, error: unknown): void {
  for (const [path, messages] of Object.entries(getFieldErrors(error))) {
    setError(path as Path<T>, { type: "server", message: messages[0] });
  }
}
