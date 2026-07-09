import { Tag } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function DiscountsPage() {
  return (
    <PlaceholderPage
      title="Discounts"
      description="Manage discount codes and automatic discounts for your store."
      icon={Tag}
      cta="Create discount"
    />
  );
}
