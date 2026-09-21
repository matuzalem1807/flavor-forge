import { effectivePriceCents, formatBRL, hasPromo } from "../pricing";
import type { Product } from "../types";
import { GlassCard } from "./GlassCard";

export function FeaturedProductCard({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  const promo = hasPromo(product);

  return (
    <GlassCard className="w-56 shrink-0 p-3">
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        width={816}
        height={816}
        className="aspect-square w-full rounded-xl object-cover outline-1 -outline-offset-1 outline-white/10"
      />
      <div className="mt-3">
        <h3 className="text-[15px] leading-tight font-semibold">{product.name}</h3>
        <p className="mt-0.5 text-[12px] text-cream/60">{product.description}</p>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-baseline gap-1.5">
          {promo ? (
            <span className="text-[12px] text-cream/40 line-through">
              {formatBRL(product.priceCents)}
            </span>
          ) : null}
          <span
            className={
              promo
                ? "font-display text-lg font-bold text-accent-warm"
                : "font-display text-lg font-bold"
            }
          >
            {formatBRL(effectivePriceCents(product))}
          </span>
        </div>
        <button
          type="button"
          aria-label={`Adicionar ${product.name}`}
          onClick={() => onAdd(product)}
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand text-lg font-bold text-white shadow-[0_8px_20px_-6px_var(--brand-soft)] transition-transform active:scale-90"
        >
          +
        </button>
      </div>
    </GlassCard>
  );
}
