import { Boxes } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function InventoryPage() {
  return (
    <PlaceholderPage
      title="Inventory"
      description="Track and adjust stock levels across your locations."
      icon={Boxes}
      cta="Adjust inventory"
    />
  );
}
