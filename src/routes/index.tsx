import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import {
  demoCategories,
  demoProducts,
  demoRestaurant,
} from "@/modules/restaurant/demo-data";
import { effectivePriceCents } from "@/modules/restaurant/pricing";
import type { Product } from "@/modules/restaurant/types";
import { CartBar } from "@/modules/restaurant/components/CartBar";
import { CategoryChips } from "@/modules/restaurant/components/CategoryChips";
import { FeaturedProductCard } from "@/modules/restaurant/components/FeaturedProductCard";
import { ProductRow } from "@/modules/restaurant/components/ProductRow";
import { RestaurantHero } from "@/modules/restaurant/components/RestaurantHero";
import { RestaurantTopBar } from "@/modules/restaurant/components/RestaurantTopBar";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "João Burguer — Hambúrgueres artesanais com entrega" },
      {
        name: "description",
        content:
          "Cardápio online do João Burguer: smash burgers, combos, porções e bebidas com entrega ou retirada.",
      },
      { property: "og:title", content: "João Burguer — Peça online" },
      {
        property: "og:description",
        content:
          "Smash burgers feitos na hora, entrega em cerca de 12 minutos. Monte seu pedido pelo cardápio.",
      },
    ],
  }),
  component: RestaurantPage,
});

function RestaurantPage() {
  const categories = useMemo(
    () => demoCategories.filter((c) => c.active).sort((a, b) => a.order - b.order),
    [],
  );
  const [activeCategoryId, setActiveCategoryId] = useState(categories[0]!.id);
  const [cart, setCart] = useState<Product[]>([]);

  const featured = demoProducts.filter((p) => p.featured && p.available);
  const listed = demoProducts.filter((p) => p.categoryId === activeCategoryId);

  const totalCents = cart.reduce((sum, p) => sum + effectivePriceCents(p), 0);

  const addToCart = (product: Product) => {
    if (!product.available) return;
    setCart((current) => [...current, product]);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-page font-body text-cream">
      <div className="pointer-events-none absolute -top-24 -left-16 size-72 rounded-full bg-brand/40 blur-3xl" />
      <div className="pointer-events-none absolute top-40 -right-20 size-64 rounded-full bg-accent-warm/30 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/3 size-60 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto w-full max-w-lg">
        <RestaurantTopBar restaurant={demoRestaurant} />
        <RestaurantHero restaurant={demoRestaurant} />

        <CategoryChips
          categories={categories}
          activeId={activeCategoryId}
          onSelect={setActiveCategoryId}
        />

        <section className="relative z-20 mt-5 px-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold tracking-tight">Em destaque</h2>
          </div>
          <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
            {featured.map((product) => (
              <FeaturedProductCard
                key={product.id}
                product={product}
                onAdd={addToCart}
              />
            ))}
          </div>
        </section>

        <section className="relative z-20 mt-6 px-4 pb-32">
          <h2 className="font-display text-lg font-bold tracking-tight">Cardápio</h2>
          <div className="mt-3 space-y-3">
            {listed.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center text-sm text-cream/60">
                Nenhum produto nesta categoria por enquanto.
              </p>
            ) : (
              listed.map((product) => (
                <ProductRow key={product.id} product={product} onAdd={addToCart} />
              ))
            )}
          </div>
        </section>
      </div>

      <CartBar itemCount={cart.length} totalCents={totalCents} />
    </div>
  );
}
