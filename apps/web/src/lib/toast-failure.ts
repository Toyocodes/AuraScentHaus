import { toast } from "sonner";
import { getErrorMessage } from "@/hooks/helper/errors";

/**
 * For saving from a form: show why it failed, then rethrow so the form knows not to
 * reset or close (the form wraps its handler in `quietly`).
 *
 *   await createCategory.mutateAsync(input).catch(toastAndRethrow("We couldn't add this category."));
 */
export function toastAndRethrow(fallback: string) {
  return (error: unknown): never => {
    toast.error(getErrorMessage(error, fallback));
    throw error;
  };
}

/** For one-off buttons: show why it failed. */
export function toastFailure(fallback: string) {
  return (error: unknown) => {
    toast.error(getErrorMessage(error, fallback));
  };
}
