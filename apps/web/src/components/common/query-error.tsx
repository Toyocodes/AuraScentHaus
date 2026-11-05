"use client";

import { Button } from "@/components/ui/button";
import { getErrorMessage } from "@/hooks/helper/errors";
import { EmptyState } from "./empty-state";

interface QueryErrorProps {
  error: unknown;
  title?: string;
  onRetry?: () => void;
  className?: string;
}

/** A failed request: the reason, plus "Try again". */
export function QueryError({ error, title = "This didn't load", onRetry, className }: QueryErrorProps) {
  return (
    <EmptyState
      className={className}
      title={title}
      description={getErrorMessage(error)}
      action={
        onRetry && (
          <Button variant="outline" onClick={onRetry}>
            Try again
          </Button>
        )
      }
    />
  );
}
