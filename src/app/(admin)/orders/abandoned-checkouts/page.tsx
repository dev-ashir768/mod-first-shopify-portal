import { ShoppingCart } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function AbandonedCheckoutsPage() {
  return (
    <PlaceholderPage
      title="Abandoned checkouts"
      description="Recover sales by sending reminders to customers who left items in their cart."
      icon={ShoppingCart}
      cta="Set up recovery email"
    />
  );
}
