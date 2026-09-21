import type { StoreStatus } from "../types";

const labels: Record<StoreStatus, string> = {
  aberto: "Aberto",
  fechado: "Fechado",
  pausado: "Pausado",
};

const dotClasses: Record<StoreStatus, string> = {
  aberto: "bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.7)]",
  fechado: "bg-cream/40",
  pausado: "bg-accent-warm shadow-[0_0_8px_2px_rgba(255,194,75,0.6)]",
};

export function StoreStatusBadge({
  status,
  prepMinutes,
}: {
  status: StoreStatus;
  prepMinutes: number;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-semibold backdrop-blur-xl">
      <span className={`size-2 rounded-full ${dotClasses[status]}`} />
      {labels[status]}
      {status === "aberto" ? ` · ${prepMinutes} min` : null}
    </span>
  );
}
