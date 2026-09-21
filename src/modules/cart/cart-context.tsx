import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export interface CartLineOption {
  optionId: string;
  groupName: string;
  name: string;
  priceDeltaCents: number;
}

export interface CartLine {
  /** Identificador da linha (o mesmo produto pode aparecer em linhas diferentes). */
  lineId: string;
  productId: string;
  slug: string;
  name: string;
  image: string;
  /** Preço unitário travado no momento da adição (produto + opções), em centavos. */
  unitPriceCents: number;
  quantity: number;
  options: CartLineOption[];
  note: string;
}

export interface CartLineWithSubtotal extends CartLine {
  subtotalCents: number;
}

interface CartContextValue {
  lines: CartLineWithSubtotal[];
  itemCount: number;
  subtotalCents: number;
  addLine: (line: Omit<CartLine, "lineId">) => void;
  updateQuantity: (lineId: string, quantity: number) => void;
  removeLine: (lineId: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "joao-burguer:carrinho";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Restaura o carrinho apenas no navegador, após a hidratação.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      /* carrinho inválido: começa vazio */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      /* armazenamento indisponível */
    }
  }, [lines, hydrated]);

  const addLine = useCallback((line: Omit<CartLine, "lineId">) => {
    setLines((current) => [
      ...current,
      { ...line, lineId: crypto.randomUUID() },
    ]);
  }, []);

  const updateQuantity = useCallback((lineId: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((l) => l.lineId !== lineId)
        : current.map((l) => (l.lineId === lineId ? { ...l, quantity } : l)),
    );
  }, []);

  const removeLine = useCallback((lineId: string) => {
    setLines((current) => current.filter((l) => l.lineId !== lineId));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const withSubtotal = lines.map((l) => ({
      ...l,
      subtotalCents: l.unitPriceCents * l.quantity,
    }));
    return {
      lines: withSubtotal,
      itemCount: withSubtotal.reduce((sum, l) => sum + l.quantity, 0),
      subtotalCents: withSubtotal.reduce((sum, l) => sum + l.subtotalCents, 0),
      addLine,
      updateQuantity,
      removeLine,
      clear,
    };
  }, [lines, addLine, updateQuantity, removeLine, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart precisa estar dentro de CartProvider.");
  return ctx;
}
