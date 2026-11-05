import type { ReactNode } from "react";

interface PaymentMessageProps {
  icon: ReactNode;
  title: string;
  body?: ReactNode;
  action?: ReactNode;
}

export function PaymentMessage({ icon, title, body, action }: PaymentMessageProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-16 text-center [&>svg]:size-12">
      {icon}
      <h1 className="text-3xl">{title}</h1>
      {body && <p className="text-muted-foreground">{body}</p>}
      {action}
    </div>
  );
}
