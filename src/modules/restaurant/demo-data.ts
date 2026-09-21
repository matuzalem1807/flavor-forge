import cover from "@/assets/capa-restaurante.jpg";
import smashDuploBacon from "@/assets/smash-duplo-bacon.jpg";
import batataRustica from "@/assets/batata-rustica.jpg";
import joaoClassico from "@/assets/joao-classico.jpg";
import crispyChicken from "@/assets/crispy-chicken.jpg";
import veggieBeet from "@/assets/veggie-beet.jpg";

import type { Category, Product, Restaurant } from "./types";

/**
 * Dados demonstrativos da Etapa 1. Nas etapas seguintes estes dados passam a
 * vir do banco e ficam editáveis pelo painel administrativo.
 */
export const demoRestaurant: Restaurant = {
  name: "João Burguer",
  description:
    "Hambúrgueres artesanais, pão brioche e ingredientes frescos. Feito na hora, entregue quentinho.",
  logoInitial: "J",
  coverImage: cover,
  address: "Rua das Flores, 128",
  whatsapp: "5511999990000",
  instagram: "joaoburguer",
  averagePrepMinutes: 12,
  status: "aberto",
  rating: 4.9,
  ratingCount: "2.3k",
  primaryColor: "#FF5A1F",
  secondaryColor: "#FFC24B",
};

export const demoCategories: Category[] = [
  { id: "hamburgueres", name: "Hambúrgueres", order: 1, active: true },
  { id: "combos", name: "Combos", order: 2, active: true },
  { id: "porcoes", name: "Porções", order: 3, active: true },
  { id: "bebidas", name: "Bebidas", order: 4, active: true },
  { id: "sobremesas", name: "Sobremesas", order: 5, active: true },
];

export const demoProducts: Product[] = [
  {
    id: "smash-duplo-bacon",
    categoryId: "hamburgueres",
    name: "Smash Duplo Bacon",
    description: "Dois smash, bacon crocante, cheddar",
    image: smashDuploBacon,
    priceCents: 2990,
    promoPriceCents: 2490,
    available: true,
    featured: true,
  },
  {
    id: "batata-rustica",
    categoryId: "porcoes",
    name: "Batata Rústica",
    description: "Com alecrim e parmesão",
    image: batataRustica,
    priceCents: 1890,
    available: true,
    featured: true,
  },
  {
    id: "joao-classico",
    categoryId: "hamburgueres",
    name: "João Clássico",
    description: "Pão brioche, blend 160g, cheddar, alface, tomate e maionese da casa.",
    image: joaoClassico,
    priceCents: 2490,
    available: true,
    featured: false,
    tags: ["+ Adicionais", "Retirada"],
  },
  {
    id: "crispy-chicken",
    categoryId: "hamburgueres",
    name: "Crispy Chicken",
    description: "Frango empanado crocante, maionese de alho, picles e cebola roxa.",
    image: crispyChicken,
    priceCents: 2690,
    available: true,
    featured: false,
    tags: ["Escolha o molho", "Entrega"],
  },
  {
    id: "veggie-beet",
    categoryId: "hamburgueres",
    name: "Veggie Beet",
    description: "Patty de beterraba, abacate e maionese de ervas.",
    image: veggieBeet,
    priceCents: 2790,
    available: false,
    featured: false,
  },
];
