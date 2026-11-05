import { Globe, Store } from "lucide-react";
import { ORDER_CHANNEL_LABELS, type OrderChannel } from "@aurascenthaus/shared";
import { Badge } from "@/components/ui/badge";

/** "Online" or "In store", with an icon so it doesn't rely on colour. */
export function OrderChannelBadge({ channel }: { channel: OrderChannel }) {
  const Icon = channel === "IN_STORE" ? Store : Globe;
  return (
    <Badge variant="outline" className="gap-1 font-normal">
      <Icon /> {ORDER_CHANNEL_LABELS[channel]}
    </Badge>
  );
}
