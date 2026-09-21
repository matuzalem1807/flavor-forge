/** Tipos do domínio do restaurante (cardápio público). */

export type StoreStatus = "aberto" | "fechado" | "pausado";

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  logoInitial: string;
  coverImage: string;
  address: string;
  whatsapp: string;
  instagram: string;
  averagePrepMinutes: number;
  status: StoreStatus;
  rating: number;
  ratingCount: string;
  /** Cores da identidade visual (configuráveis no painel na Etapa 14). */
  primaryColor: string;
  secondaryColor: string;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  order: number;
  active: boolean;
}

export interface Product {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  /** Preço em centavos, para evitar problemas de precisão. */
  priceCents: number;
  /** Preço promocional em centavos, quando houver promoção ativa. */
  promoPriceCents?: number | undefined;
  available: boolean;
  featured: boolean;
  /** Etiquetas curtas exibidas no card (ex.: "+ Adicionais"). */
  tags?: string[];
  order: number;
}
