import type { Category } from "../types";

export function CategoryChips({
  categories,
  activeId,
  onSelect,
}: {
  categories: Category[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <nav className="no-scrollbar relative z-20 mt-5 flex gap-2 overflow-x-auto px-4 pb-1">
      {categories.map((category) => {
        const isActive = category.id === activeId;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onSelect(category.id)}
            className={
              isActive
                ? "shrink-0 rounded-full bg-brand px-4 py-2.5 text-sm font-semibold text-white shadow-[0_8px_24px_-6px_var(--brand-soft)]"
                : "shrink-0 rounded-full border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-cream/80 backdrop-blur-xl transition-colors hover:bg-white/20"
            }
          >
            {category.name}
          </button>
        );
      })}
    </nav>
  );
}
