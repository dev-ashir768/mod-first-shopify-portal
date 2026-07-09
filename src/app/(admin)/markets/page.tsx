import { Globe } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function MarketsPage() {
  return (
    <PlaceholderPage
      title="Markets"
      description="Manage the regions and currencies where you sell."
      icon={Globe}
      cta="Add market"
    />
  );
}
