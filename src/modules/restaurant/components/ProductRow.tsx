import { effectivePriceCents, formatBRL, hasPromo } from "../pricing";
import type { Product } from "../types";
import { GlassCard } from "./GlassCard";

export function ProductRow({
  product,
  onAdd,
}: {
  product: Product;
  onAdd: (product: Product) => void;
}) {
  const promo = hasPromo(product);
  const tags = product.available ? (product.tags ?? []) : ["Indisponível"];

  return (
    <GlassCard className={product.available ? "p-3" : "p-3 opacity-55"}>
      <button
        type="button"
        disabled={!product.available}
        onClick={() => onAdd(product)}
        className="flex w-full gap-3 text-left disabled:cursor-not-allowed"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          width={816}
          height={816}
          className="size-24 shrink-0 rounded-xl object-cover outline-1 -outline-offset-1 outline-white/10"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-[15px] leading-tight font-semibold">{product.name}</h3>
            <div className="flex shrink-0 flex-col items-end leading-none">
              {promo && product.available ? (
                <span className="text-[11px] text-cream/40 line-through">
                  {formatBRL(product.priceCents)}
                </span>
              ) : null}
              <span
                className={
                  product.available
                    ? "font-display font-bold text-accent-warm"
                    : "font-display font-bold text-cream/70"
                }
              >
                {formatBRL(effectivePriceCents(product))}
              </span>
            </div>
          </div>
          <p className="mt-0.5 text-[12px] leading-snug text-cream/60">
            {product.description}
          </p>
          {tags.length > 0 ? (
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-white/10 bg-white/10 px-2 py-1 text-[10px] font-medium text-cream/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </button>
    </GlassCard>
  );
}
