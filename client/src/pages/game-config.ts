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

export type HubGame = GameConfig & { mode: "embedded" | "external"; genre: string };

export const HUB_GAMES: HubGame[] = [
  { slug: "shell-shockers", title: "Shell Shockers", eyebrow: "EGG BATTLE", genre: "Action", description: "Jump into a fast multiplayer egg shooter arena.", sourceUrl: "https://shellshock.io/", coverUrl: "/manus-storage/shell-shockers_2438fb58.jpg", accent: "#f4b642", mode: "embedded" },
  { slug: "drift-hunters", title: "Drift Hunters", eyebrow: "PRECISION DRIVING", genre: "Racing", description: "Tune your ride, find the line, and build the perfect drift.", sourceUrl: "https://www.crazygames.com/game/drift-hunters", coverUrl: "/manus-storage/drift-hunters_2b468819.png", accent: "#ef6b5e", mode: "embedded" },
  { slug: "moto-x3m", title: "Moto X3M", eyebrow: "STUNT RUN", genre: "Racing", description: "Take on explosive tracks packed with flips, jumps, and hazards.", sourceUrl: "https://www.crazygames.com/game/moto-x3m", coverUrl: "/manus-storage/moto-x3m_713c195f.jpg", accent: "#ff8d3c", mode: "embedded" },
  { slug: "zombsroyale", title: "ZombsRoyale.io", eyebrow: "BATTLE ROYALE", genre: "Action", description: "Loot, move, and outlast the competition in a top-down battle royale.", sourceUrl: "https://zombsroyale.io/", accent: "#79d39b", mode: "embedded" },
  { slug: "robbery-bob-2", title: "Robbery Bob 2", eyebrow: "SNEAK & STEAL", genre: "Puzzle", description: "Sneak through tricky levels and help Bob pull off the perfect getaway.", sourceUrl: "https://robberybob.fandom.com/wiki/Robbery_Bob_2", coverUrl: "/manus-storage/robbery-bob-2_836a86ba.png", accent: "#a98cff", mode: "embedded" },
  { ...GAME_CONFIGS.wbwwb, slug: "wbwwb", genre: "Interactive story", mode: "embedded" },
  { ...GAME_CONFIGS.poxel, slug: "poxel", genre: "Action", mode: "embedded" },
];
