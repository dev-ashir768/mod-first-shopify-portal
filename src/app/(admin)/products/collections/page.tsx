import { Layers } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function CollectionsPage() {
  return (
    <PlaceholderPage
      title="Collections"
      description="Group your products into collections to make them easier to find."
      icon={Layers}
      cta="Create collection"
    />
  );
}
