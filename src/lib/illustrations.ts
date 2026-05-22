import type { Category } from "./types";

export interface Illustration {
  src: string;
  alt: string;
}

const BY_CATEGORY: Record<Category, Illustration> = {
  theater: { src: "/illustrations/theater.png", alt: "Stage with spotlight" },
  opera: { src: "/illustrations/opera.png", alt: "Opera singer" },
  ballet: { src: "/illustrations/ballet.png", alt: "Ballet dancer" },
  dance: { src: "/illustrations/ballet.png", alt: "Dancer" },
  concert: { src: "/illustrations/seats.png", alt: "Concert seats" },
  other: { src: "/illustrations/curtain.png", alt: "Theater curtain" },
};

export function illustrationForCategory(c: Category): Illustration {
  return BY_CATEGORY[c] ?? BY_CATEGORY.other;
}

export const CURTAIN: Illustration = {
  src: "/illustrations/curtain.png",
  alt: "Theater curtain",
};

export const SEATS: Illustration = {
  src: "/illustrations/seats.png",
  alt: "Theater seats",
};

export const TICKETS: Illustration = {
  src: "/illustrations/tickets.png",
  alt: "Tickets",
};
