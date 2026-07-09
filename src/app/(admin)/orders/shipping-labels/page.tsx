import { Truck } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function ShippingLabelsPage() {
  return (
    <PlaceholderPage
      title="Shipping labels"
      description="Buy and print shipping labels for your unfulfilled orders."
      icon={Truck}
      cta="Buy shipping label"
    />
  );
}
