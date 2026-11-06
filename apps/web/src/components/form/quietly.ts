/**
 * Wrap a form's submit handler: if saving fails, the form simply stays as it is, keeping what
 * was typed. The connected parent has already shown the error (see `toastAndRethrow`).
 *
 *   form.handleSubmit(quietly(async (values) => { await onSubmit?.(values); form.reset(); }))
 */
export function quietly<T>(handler: (values: T) => unknown) {
  return async (values: T) => {
    try {
      await handler(values);
    } catch {
      // Already reported by the parent.
    }
  };
}
