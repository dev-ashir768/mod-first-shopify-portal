import { ShoppingBag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px]">
        <div className="mb-6 flex items-center justify-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-lg bg-brand text-brand-foreground ring-1 ring-black/10">
            <ShoppingBag className="size-5" />
          </span>
          <span className="text-2xl font-bold tracking-tight text-foreground">
            modeFirst
          </span>
        </div>
        <Card>
          <CardContent className="p-8">{children}</CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Help · Privacy · Terms
        </p>
      </div>
    </div>
  );
}
