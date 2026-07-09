import { Megaphone } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function MarketingPage() {
  return (
    <PlaceholderPage
      title="Marketing"
      description="Create campaigns and automations to reach your customers. Connect this page to your marketing API."
      icon={Megaphone}
      cta="Create campaign"
    />
  );
}
