import Link from "next/link";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import type { OrderDTO } from "@aurascenthaus/shared";
import { Button } from "@/components/ui/button";
import { formatNaira } from "@/lib/format";
import { PaymentMessage } from "./payment-message";

interface PaymentResultProps {
  /** From `useVerifyPayment(reference).data`. Leave out while it's loading or not connected. */
  order?: OrderDTO | null;
  error?: string | null;
}

/** What the shopper sees after Paystack sends them back to /checkout/callback. */
export function PaymentResult({ order, error }: PaymentResultProps) {
  if (error) {
    return <PaymentMessage icon={<XCircle className="text-destructive" />} title="We couldn't verify your payment" body={error} />;
  }

  if (!order) {
    return (
      <PaymentMessage
        icon={<Clock />}
        title="Checking your payment…"
        body="This takes a few seconds. Please don't close this page."
      />
    );
  }

  const status = order.payment?.status;

  if (status === "SUCCESS") {
    return (
      <PaymentMessage
        icon={<CheckCircle2 className="text-emerald-600" />}
        title="Thank you! Your order is confirmed"
        body={`Order ${order.orderNumber} · ${formatNaira(order.total)}. A confirmation email is on its way.`}
        action={
          <Button asChild>
            <Link href={`/account/orders/${order.id}`}>View order</Link>
          </Button>
        }
      />
    );
  }

  if (status === "FAILED" || status === "ABANDONED") {
    return (
      <PaymentMessage
        icon={<XCircle className="text-destructive" />}
        title="Payment was not completed"
        body="No money was taken. Your bag is still saved, so you can try again."
        action={
          <Button asChild>
            <Link href="/checkout">Try again</Link>
          </Button>
        }
      />
    );
  }

  return (
    <PaymentMessage
      icon={<Clock />}
      title="Payment is processing"
      body="We'll email you as soon as Paystack confirms it. You can check your orders page in a minute."
      action={
        <Button variant="outline" asChild>
          <Link href="/account/orders">My orders</Link>
        </Button>
      }
    />
  );
}
