import cover from "@/assets/capa-restaurante.jpg";
import smashDuploBacon from "@/assets/smash-duplo-bacon.jpg";
import batataRustica from "@/assets/batata-rustica.jpg";
import joaoClassico from "@/assets/joao-classico.jpg";
import crispyChicken from "@/assets/crispy-chicken.jpg";
import veggieBeet from "@/assets/veggie-beet.jpg";

/**
 * Mapa de imagens do protótipo. O banco guarda apenas uma chave (image_key);
 * na Etapa 11 (gestão de cardápio) as imagens passam a ser enviadas pelo painel.
 */
const imageByKey: Record<string, string> = {
  "capa-restaurante": cover,
  "smash-duplo-bacon": smashDuploBacon,
  "batata-rustica": batataRustica,
  "joao-classico": joaoClassico,
  "crispy-chicken": crispyChicken,
  "veggie-beet": veggieBeet,
};

export function resolveImage(key: string | null | undefined): string {
  if (!key) return cover;
  return imageByKey[key] ?? cover;
}
