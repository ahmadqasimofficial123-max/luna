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

export type HubGame = GameConfig & { mode: "embedded" | "external"; genre: string; category?: string };

const HUB_GAME_ENTRIES: HubGame[] = [
  { slug: "shell-shockers", title: "Shell Shockers", eyebrow: "EGG BATTLE", genre: "Action", description: "Jump into a fast multiplayer egg shooter arena.", sourceUrl: "https://shellshock.io/", coverUrl: "/manus-storage/shell-shockers_2438fb58.jpg", accent: "#f4b642", mode: "embedded" },
  { slug: "drift-hunters", title: "Drift Hunters", eyebrow: "PRECISION DRIVING", genre: "Racing", description: "Tune your ride, find the line, and build the perfect drift.", sourceUrl: "https://www.crazygames.com/game/drift-hunters", coverUrl: "/manus-storage/drift-hunters_2b468819.png", accent: "#ef6b5e", mode: "embedded" },
  { slug: "moto-x3m", title: "Moto X3M", eyebrow: "STUNT RUN", genre: "Racing", description: "Take on explosive tracks packed with flips, jumps, and hazards.", sourceUrl: "https://www.crazygames.com/game/moto-x3m", coverUrl: "/manus-storage/moto-x3m_713c195f.jpg", accent: "#ff8d3c", mode: "embedded" },
  { slug: "zombsroyale", title: "ZombsRoyale.io", eyebrow: "BATTLE ROYALE", genre: "Action", description: "Loot, move, and outlast the competition in a top-down battle royale.", sourceUrl: "https://zombsroyale.io/", accent: "#79d39b", mode: "embedded" },
  { slug: "robbery-bob-2", title: "Robbery Bob 2", eyebrow: "SNEAK & STEAL", genre: "Puzzle", description: "Sneak through tricky levels and help Bob pull off the perfect getaway.", sourceUrl: "https://robberybob.fandom.com/wiki/Robbery_Bob_2", coverUrl: "/manus-storage/robbery-bob-2_836a86ba.png", accent: "#a98cff", mode: "embedded" },
  { ...GAME_CONFIGS.wbwwb, slug: "wbwwb", genre: "Interactive story", mode: "embedded" },
  { ...GAME_CONFIGS.poxel, slug: "poxel", genre: "Action", mode: "embedded" },
  { slug: "drift-boss", title: "Drift Boss", eyebrow: "POKI ARCADE", genre: "Racing", category: "Poki", description: "Keep the car on the road through a quick, one-button drift challenge.", sourceUrl: "https://poki.com/en/g/drift-boss", coverUrl: "/manus-storage/drift-boss_e21d5723.png", accent: "#ff9b5b", mode: "embedded" },
  { slug: "moto-x3m-poki", title: "Moto X3M", eyebrow: "POKI ARCADE", genre: "Racing", category: "Poki", description: "Race through explosive obstacle courses with flips, jumps, and perfect timing.", sourceUrl: "https://poki.com/en/g/moto-x3m", accent: "#ff783f", mode: "embedded" },
  { slug: "stickman-hook", title: "Stickman Hook", eyebrow: "POKI ARCADE", genre: "Action", category: "Poki", description: "Swing through colorful levels and land every hook with momentum.", sourceUrl: "https://poki.com/en/g/stickman-hook", coverUrl: "/manus-storage/stickman-hook_6038f2bc.png", accent: "#a98cff", mode: "embedded" },
  { slug: "subway-surfers", title: "Subway Surfers", eyebrow: "POKI ARCADE", genre: "Runner", category: "Poki", description: "Dash through the city, dodge trains, and collect a bright trail of coins.", sourceUrl: "https://poki.com/en/g/subway-surfers", coverUrl: "/manus-storage/subway-surfers_70335885.png", accent: "#42c7e8", mode: "embedded" },
  { slug: "temple-run-2", title: "Temple Run 2", eyebrow: "POKI ARCADE", genre: "Runner", category: "Poki", description: "Run the ancient route, leap hazards, and chase a new high score.", sourceUrl: "https://poki.com/en/g/temple-run-2", accent: "#f1bd56", mode: "embedded" },
  { slug: "fireboy-and-watergirl", title: "Fireboy and Watergirl", eyebrow: "POKI ARCADE", genre: "Puzzle", category: "Poki", description: "Solve elemental temple puzzles with timing, teamwork, and switches.", sourceUrl: "https://poki.com/en/g/fireboy-and-watergirl", accent: "#ff7166", mode: "embedded" },
  { slug: "basketball-stars", title: "Basketball Stars", eyebrow: "POKI ARCADE", genre: "Sports", category: "Poki", description: "Take the court for quick matches, sharp shots, and clutch plays.", sourceUrl: "https://poki.com/en/g/basketball-stars", accent: "#ff9b4a", mode: "embedded" },
  { slug: "soccer-skills-world-cup", title: "Soccer Skills World Cup", eyebrow: "POKI ARCADE", genre: "Sports", category: "Poki", description: "Dribble, aim, and score your way through a global soccer challenge.", sourceUrl: "https://poki.com/en/g/soccer-skills-world-cup", accent: "#67d493", mode: "embedded" },
  { slug: "drive-mad", title: "Drive Mad", eyebrow: "POKI ARCADE", genre: "Racing", category: "Poki", description: "Balance wild vehicles across impossible tracks full of bumps and jumps.", sourceUrl: "https://poki.com/en/g/drive-mad", accent: "#ff6b72", mode: "embedded" },
  { slug: "monkey-mart", title: "Monkey Mart", eyebrow: "POKI ARCADE", genre: "Simulation", category: "Poki", description: "Stock shelves, serve customers, and grow a cheerful little market.", sourceUrl: "https://poki.com/en/g/monkey-mart", accent: "#f0c86b", mode: "embedded" },
  { slug: "brain-test", title: "Brain Test", eyebrow: "POKI ARCADE", genre: "Puzzle", category: "Poki", description: "Challenge assumptions with playful puzzles and unexpected answers.", sourceUrl: "https://poki.com/en/g/brain-test", accent: "#c198ff", mode: "embedded" },
  { slug: "crossy-road", title: "Crossy Road", eyebrow: "POKI ARCADE", genre: "Arcade", category: "Poki", description: "Cross busy roads, rivers, and rail lines one careful hop at a time.", sourceUrl: "https://poki.com/en/g/crossy-road", accent: "#72d2c0", mode: "embedded" },
  { slug: "flappy-bird", title: "Flappy Bird", eyebrow: "POKI ARCADE", genre: "Arcade", category: "Poki", description: "Tap to fly and thread the tiny bird through every pipe.", sourceUrl: "https://poki.com/en/g/flappy-bird", accent: "#68b9ff", mode: "embedded" },
  { slug: "2048", title: "2048", eyebrow: "POKI ARCADE", genre: "Puzzle", category: "Poki", description: "Slide matching tiles together and build toward the iconic 2048 tile.", sourceUrl: "https://poki.com/en/g/2048", accent: "#edb96e", mode: "embedded" },
  { slug: "gold-digger-frvr", title: "Gold Digger FRVR", eyebrow: "POKI ARCADE", genre: "Arcade", category: "Poki", description: "Swing the claw underground and pull up the richest haul you can find.", sourceUrl: "https://poki.com/en/g/gold-digger-frvr", accent: "#f4c84f", mode: "embedded" },
  { slug: "stick-merge", title: "Stick Merge", eyebrow: "POKI ARCADE", genre: "Action", category: "Poki", description: "Merge gear, line up shots, and outsmart targets in a stickman arena.", sourceUrl: "https://poki.com/en/g/stick-merge", accent: "#e985ff", mode: "embedded" },
  { slug: "highway-traffic", title: "Highway Traffic", eyebrow: "POKI ARCADE", genre: "Racing", category: "Poki", description: "Thread through traffic at speed while keeping your run alive.", sourceUrl: "https://poki.com/en/g/highway-traffic", accent: "#6eb4ff", mode: "embedded" },
  { slug: "action-king", title: "Action King", eyebrow: "POKI ARCADE", genre: "Action", category: "Poki", description: "Take on quick action challenges designed for a fast arcade session.", sourceUrl: "https://poki.com/en/g/action-king", accent: "#ff6c9b", mode: "embedded" },
  { slug: "rally-champion", title: "Rally Champion", eyebrow: "POKI ARCADE", genre: "Racing", category: "Poki", description: "Master tight corners and chase the fastest rally time.", sourceUrl: "https://poki.com/en/g/rally-champion", accent: "#6ed9aa", mode: "embedded" },
  { slug: "boxing-random", title: "Boxing Random", eyebrow: "POKI ARCADE", genre: "Sports", category: "Poki", description: "Trade unpredictable punches in a quick and chaotic boxing match.", sourceUrl: "https://poki.com/en/g/boxing-random", accent: "#ff7d72", mode: "embedded" },
  { slug: "drift-hunters-poki", title: "Drift Hunters", eyebrow: "WEB ARCADE", genre: "Racing", category: "Web", description: "Tune your ride, find the line, and build the perfect drift.", sourceUrl: "https://www.drifthunters.io/", accent: "#ef6b5e", mode: "embedded" },
  { slug: "shell-shockers-web", title: "Shell Shockers", eyebrow: "WEB ARCADE", genre: "Action", category: "Web", description: "Jump into a fast multiplayer egg shooter arena.", sourceUrl: "https://shellshock.io/", coverUrl: "/manus-storage/shell-shockers_0ddefd51.jpg", accent: "#f4b642", mode: "embedded" },
  { slug: "zombsroyale-web", title: "ZombsRoyale.io", eyebrow: "WEB ARCADE", genre: "Action", category: "Web", description: "Loot, move, and outlast the competition in a top-down battle royale.", sourceUrl: "https://zombsroyale.io/", accent: "#79d39b", mode: "embedded" },
  { slug: "krunker", title: "Krunker", eyebrow: "WEB ARCADE", genre: "Shooter", category: "Web", description: "Move fast and compete in a sharp, browser-first arena shooter.", sourceUrl: "https://krunker.io/", accent: "#80a5ff", mode: "embedded" },
  { slug: "agar-io", title: "Agar.io", eyebrow: "WEB ARCADE", genre: "Multiplayer", category: "Web", description: "Grow your cell, avoid larger rivals, and own the arena.", sourceUrl: "https://agar.io/", accent: "#69d9cf", mode: "embedded" },
  { slug: "slither-io", title: "Slither.io", eyebrow: "WEB ARCADE", genre: "Multiplayer", category: "Web", description: "Guide your snake through a glowing field and outmaneuver every rival.", sourceUrl: "https://slither.io/", accent: "#c29bff", mode: "embedded" },
  { slug: "diep-io", title: "Diep.io", eyebrow: "WEB ARCADE", genre: "Action", category: "Web", description: "Upgrade your tank, control the map, and survive the chaos.", sourceUrl: "https://diep.io/", accent: "#ff8e67", mode: "embedded" },
  { slug: "hole-io", title: "Hole.io", eyebrow: "WEB ARCADE", genre: "Arcade", category: "Web", description: "Sweep through the city and become the biggest hole in the round.", sourceUrl: "https://hole-io.com/", accent: "#a68dff", mode: "embedded" },
  { slug: "paper-io", title: "Paper.io", eyebrow: "WEB ARCADE", genre: "Strategy", category: "Web", description: "Claim territory with daring loops and protect your expanding line.", sourceUrl: "https://paper-io.com/", accent: "#72c7ff", mode: "embedded" },
  { slug: "surviv-io", title: "Surviv.io", eyebrow: "WEB ARCADE", genre: "Battle royale", category: "Web", description: "Loot quickly, read the zone, and stay standing until the end.", sourceUrl: "https://surviv.io/", accent: "#e6bd61", mode: "embedded" },
  { slug: "funkin-classic", title: "Friday Night Funkin’", eyebrow: "ITCH ARCADE", genre: "Rhythm", category: "Itch.io", description: "Follow the beat and keep the arrows moving in this classic rhythm game.", sourceUrl: "https://ninja-muffin24.itch.io/funkin", accent: "#ff6aa8", mode: "embedded" },
  { slug: "celeste-classic", title: "Celeste Classic", eyebrow: "ITCH ARCADE", genre: "Platformer", category: "Itch.io", description: "Climb, jump, and dash through a compact mountain platforming classic.", sourceUrl: "https://maddymakesgames.itch.io/celeste-classic", coverUrl: "/manus-storage/celeste-classic_19fdabd4.png", accent: "#7ec9ff", mode: "embedded" },
  { slug: "sort-the-court", title: "Sort the Court", eyebrow: "ITCH ARCADE", genre: "Strategy", category: "Itch.io", description: "Make royal decisions and guide a kingdom through surprising requests.", sourceUrl: "https://graebor.itch.io/sort-the-court", accent: "#f0c76b", mode: "embedded" },
  { slug: "six-cats-under", title: "Six Cats Under", eyebrow: "ITCH ARCADE", genre: "Puzzle", category: "Itch.io", description: "Help a group of cats solve a clever, compact point-and-click puzzle.", sourceUrl: "https://caracald.itch.io/six-cats-under", accent: "#ed9fc4", mode: "embedded" },
  { slug: "wbwwb-itch", title: "We Become What We Behold", eyebrow: "ITCH ARCADE", genre: "Interactive story", category: "Itch.io", description: "Explore a short interactive story about attention, news, and media cycles.", sourceUrl: "https://ncase.itch.io/wbwwb", accent: "#f6c453", mode: "embedded" },
  { slug: "frogfall", title: "Frogfall", eyebrow: "ITCH ARCADE", genre: "Adventure", category: "Itch.io", description: "Leap into a handmade adventure full of charm and curious places.", sourceUrl: "https://kultisti.itch.io/frogfall", accent: "#78d6a1", mode: "embedded" },
  { slug: "platformer-toolkit", title: "Platformer Toolkit", eyebrow: "ITCH ARCADE", genre: "Platformer", category: "Itch.io", description: "Experiment with movement, jumps, and the feel of a platformer.", sourceUrl: "https://gmtk.itch.io/platformer-toolkit", accent: "#9f8bff", mode: "embedded" },
  { slug: "dinorunner", title: "Dino Runner", eyebrow: "ITCH ARCADE", genre: "Runner", category: "Itch.io", description: "Keep the prehistoric runner moving through a clean arcade challenge.", sourceUrl: "https://cap-price.itch.io/dinorunner", accent: "#e3a65e", mode: "embedded" },
  { slug: "rolling-balls", title: "Rolling Balls", eyebrow: "ITCH ARCADE", genre: "Arcade", category: "Itch.io", description: "Guide rolling balls through a playful physics-driven course.", sourceUrl: "https://gooey.itch.io/rolling-balls", accent: "#71c6ff", mode: "embedded" },
  { slug: "project-boost", title: "Project Boost", eyebrow: "ITCH ARCADE", genre: "Action", category: "Itch.io", description: "Boost through an experimental arcade experience with momentum.", sourceUrl: "https://indicary.itch.io/project-boost", accent: "#ff8c71", mode: "embedded" },
  { slug: "polytrack", title: "PolyTrack", eyebrow: "ITCH ARCADE", genre: "Racing", category: "Itch.io", description: "Race across clean geometric tracks built for speed and flow.", sourceUrl: "https://kodub.itch.io/polytrack", accent: "#7ee0c0", mode: "embedded" },
  { slug: "ducklings", title: "Ducklings", eyebrow: "ITCH ARCADE", genre: "Simulation", category: "Itch.io", description: "Swim, rescue ducklings, and grow a gentle pond community.", sourceUrl: "https://pelicanparty.itch.io/ducklings", accent: "#f2cb69", mode: "embedded" },
  { slug: "bonnies-bakery", title: "Bonnie’s Bakery", eyebrow: "ITCH ARCADE", genre: "Adventure", category: "Itch.io", description: "Step behind the counter in a bakery with a strange little secret.", sourceUrl: "https://aislebsoupid.itch.io/bonnies-bakery", accent: "#f79bba", mode: "embedded" },
  { slug: "feedvid-live", title: "FeedVid Live", eyebrow: "ITCH ARCADE", genre: "Interactive story", category: "Itch.io", description: "Navigate a strange live feed where attention shapes what happens next.", sourceUrl: "https://varun-r.itch.io/feedvid-live", accent: "#9f8eff", mode: "embedded" },
  { slug: "burger-frights", title: "Burger Frights", eyebrow: "ITCH ARCADE", genre: "Horror", category: "Itch.io", description: "Work a late shift where the menu is not the only thing that changes.", sourceUrl: "https://donitz.itch.io/burger-frights", accent: "#ff6e65", mode: "embedded" },
  { slug: "poom", title: "Poom", eyebrow: "ITCH ARCADE", genre: "Shooter", category: "Itch.io", description: "Enter a compact retro shooter packed with quick movement and danger.", sourceUrl: "https://freds72.itch.io/poom", accent: "#72d9a6", mode: "embedded" },
  { slug: "egg", title: "Egg", eyebrow: "ITCH ARCADE", genre: "Arcade", category: "Itch.io", description: "Spend a strange, short arcade moment with an egg at the center.", sourceUrl: "https://terrycavanagh.itch.io/egg", accent: "#f0c866", mode: "embedded" },
  { slug: "bread-roll", title: "Bread Roll", eyebrow: "ITCH ARCADE", genre: "Arcade", category: "Itch.io", description: "Roll, bounce, and keep the bakery physics under control.", sourceUrl: "https://dani-swordfish.itch.io/bread-roll", accent: "#e8a85c", mode: "embedded" },
  { slug: "night-flyer", title: "Night Flyer", eyebrow: "ITCH ARCADE", genre: "Adventure", category: "Itch.io", description: "Take a quiet night flight through a handcrafted atmospheric world.", sourceUrl: "https://mike-ren.itch.io/night-flyer", accent: "#7a9dff", mode: "embedded" },
  { slug: "exhibit-of-sorrows", title: "Exhibit of Sorrows", eyebrow: "ITCH ARCADE", genre: "Horror", category: "Itch.io", description: "Walk through an unsettling exhibit where each room invites a closer look.", sourceUrl: "https://adayofjoy.itch.io/exhibit-of-sorrows", accent: "#c48bff", mode: "embedded" },
];

export const HUB_GAMES: HubGame[] = Array.from(new Map(HUB_GAME_ENTRIES.map(game => [game.sourceUrl, game])).values());
