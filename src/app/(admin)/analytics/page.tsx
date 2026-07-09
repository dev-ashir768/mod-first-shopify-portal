import { BarChart3 } from "lucide-react";
import { PlaceholderPage } from "@/components/placeholder-page";

export default function AnalyticsPage() {
  return (
    <PlaceholderPage
      title="Analytics"
      description="Track sales, sessions, and conversion over time. Hook this up to your analytics API."
      icon={BarChart3}
      cta="View reports"
    />
  );
}
