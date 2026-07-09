import { create } from "zustand";
import { products as seed, type Product } from "@/lib/mock-data";
import type { ProductValues } from "@/lib/validations";

interface ProductState {
  products: Product[];
  addProduct: (values: ProductValues) => void;
  removeProducts: (ids: string[]) => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: seed,
  addProduct: (values) =>
    set((state) => ({
      products: [
        {
          id: `p${Date.now()}`,
          title: values.title,
          status: values.status,
          inventory: values.inventory,
          variants: 1,
          category: values.category,
          vendor: values.vendor,
          price: values.price,
        },
        ...state.products,
      ],
    })),
  removeProducts: (ids) =>
    set((state) => ({
      products: state.products.filter((p) => !ids.includes(p.id)),
    })),
}));
