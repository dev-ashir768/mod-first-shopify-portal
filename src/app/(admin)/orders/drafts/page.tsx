import { FilePen } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function DraftsPage() {
  return (
    <PlaceholderPage
      title="Drafts"
      description="Create draft orders for customers and send invoices to collect payment."
      icon={FilePen}
      cta="Create draft order"
    />
  );
}
