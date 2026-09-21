import type { Product } from "./types";

export function formatBRL(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

/** Preço efetivo do produto: promocional quando houver, senão o normal. */
export function effectivePriceCents(product: Product): number {
  return product.promoPriceCents ?? product.priceCents;
}

export function hasPromo(product: Product): boolean {
  return typeof product.promoPriceCents === "number";
}
