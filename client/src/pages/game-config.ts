export type GameConfig = {
  slug: string;
  title: string;
  eyebrow: string;
  description: string;
  sourceUrl: string;
  coverUrl?: string;
  accent: string;
};

export const GAME_CONFIGS: Record<string, GameConfig> = {
  poxel: {
    slug: "poxel",
    title: "Poxel.io",
    eyebrow: "VOXEL COMBAT",
    description: "Drop into a bright block-built arena and play Poxel.io directly from Luna Social.",
    sourceUrl: "https://poxel.io/",
    coverUrl: "/manus-storage/poxel-cover_3dd5a4bc.webp",
    accent: "#59c7ff",
  },
  funkin: {
    slug: "funkin",
    title: "Friday Night Funkin’",
    eyebrow: "RHYTHM BATTLE",
    description: "Follow the beat and keep the arrows moving in this classic browser rhythm game.",
    sourceUrl: "https://ninja-muffin24.itch.io/funkin",
    accent: "#ff6aa8",
  },
  wbwwb: {
    slug: "wbwwb",
    title: "We Become What We Behold",
    eyebrow: "MEDIA CYCLE",
    description: "A short interactive story about news cycles, attention, and the stories we amplify.",
    sourceUrl: "https://ncase.itch.io/wbwwb",
    accent: "#f6c453",
  },
};
