import { FileText } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function ContentPage() {
  return (
    <PlaceholderPage
      title="Content"
      description="Manage blog posts, pages, and media files for your storefront."
      icon={FileText}
      cta="Add content"
    />
  );
}
