import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Substitui espaços por -
    .replace(/[^\w-]+/g, "") // Remove caracteres não alfanuméricos exceto -
    .replace(/--+/g, "-") // Substitui múltiplos - por um único -
    .replace(/^-+/, "") // Remove - do início
    .replace(/-+$/, ""); // Remove - do final
}

