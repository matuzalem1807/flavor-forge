import type { Restaurant } from "../types";
import { GlassCard } from "./GlassCard";

export function RestaurantHero({ restaurant }: { restaurant: Restaurant }) {
  return (
    <section className="relative z-20 mt-4 px-4">
      <GlassCard className="rounded-3xl p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.6)]">
        <div className="relative">
          <img
            src={restaurant.coverImage}
            alt={`Capa do ${restaurant.name}`}
            width={1024}
            height={768}
            className="aspect-[4/3] w-full rounded-2xl object-cover outline-1 -outline-offset-1 outline-white/10"
          />
          <div className="absolute bottom-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-ink/60 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-md">
            <span className="text-accent-warm">★</span>
            {restaurant.rating.toLocaleString("pt-BR")} · {restaurant.ratingCount} avaliações
          </div>
        </div>

        <div className="mt-4">
          <h1 className="font-display text-3xl leading-[1.05] font-bold tracking-tight">
            {restaurant.name}
          </h1>
          <p className="mt-1.5 text-sm leading-snug text-cream/70">
            {restaurant.description}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2 text-[12px] font-medium text-cream/70">
            <span className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1.5">
              🕒 {restaurant.averagePrepMinutes} min
            </span>
            <span className="rounded-lg border border-white/10 bg-white/10 px-2.5 py-1.5">
              📍 {restaurant.address}
            </span>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <a
              href={`https://wa.me/${restaurant.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-[12px] font-semibold text-cream/80 transition-colors hover:bg-white/20"
            >
              WhatsApp
            </a>
            <a
              href={`https://instagram.com/${restaurant.instagram}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-[12px] font-semibold text-cream/80 transition-colors hover:bg-white/20"
            >
              Instagram
            </a>
          </div>
        </div>
      </GlassCard>
    </section>
  );
}
