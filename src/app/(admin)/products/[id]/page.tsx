"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { ProductForm } from "@/components/products/product-form";
import { apiErrorMessage } from "@/lib/auth-api";
import { getProduct, type ProductDetailRow } from "@/lib/admin-api";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = React.useState<ProductDetailRow | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    getProduct(id)
      .then((p) => {
        if (cancelled) return;
        setProduct(p);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(apiErrorMessage(err, "Couldn't load product."));
        toast.error(apiErrorMessage(err, "Couldn't load product."));
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-24 text-muted-foreground">
        <p>{error ?? "Product not found."}</p>
      </div>
    );
  }

  return <ProductForm product={product} />;
}
