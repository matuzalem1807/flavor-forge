import type { Restaurant } from "../types";
import { StoreStatusBadge } from "./StoreStatusBadge";

export function RestaurantTopBar({ restaurant }: { restaurant: Restaurant }) {
  return (
    <header className="relative z-20 flex items-center justify-between gap-3 px-4 pt-4">
      <div className="flex min-w-0 items-center gap-2">
        <div className="grid size-9 shrink-0 place-items-center rounded-xl border border-white/15 bg-white/10 font-display text-lg font-bold text-brand backdrop-blur-xl">
          {restaurant.logoInitial}
        </div>
        <span className="truncate text-sm font-semibold tracking-tight">
          {restaurant.name}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <StoreStatusBadge
          status={restaurant.status}
          prepMinutes={restaurant.averagePrepMinutes}
        />
      </div>
    </header>
  );
}
