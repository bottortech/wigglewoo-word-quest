// =============================================
// exploreData.ts — Explore Mode data configs
// WiggleWoo's Word Quest
// =============================================
// Data-driven environment definitions for Explore
// Mode. Each environment maps to a landmark island
// on the quest map and contains positioned hotspots
// with science facts and animations.
// =============================================

import { countEarnedTrophies, loadTrophyProgress, isQuestFullyComplete } from "./progression";

// ---- Types ----

export type IdleAnimation = "pulse" | "glow" | "bob" | "smoke" | "bubble";
export type TapAnimation = "pop" | "burst" | "shake" | "erupt" | "sparkle";

export interface Hotspot {
  id: string;
  x: number;              // % from left
  y: number;              // % from top
  label: string;          // tooltip title
  fact: string;           // science fact text
  idleAnimation: IdleAnimation;
  tapAnimation: TapAnimation;
  emoji: string;          // visual marker
}

/** An item inside a fact panel (e.g. a single rock type) */
export interface FactItem {
  id: string;
  name: string;
  emoji: string;
  /** Main fact text shown to learners */
  core: string;
  /** Simplified fact text for younger learners (not yet active) */
  easy?: string;
  /** Path to pre-recorded narration audio (e.g., "/assets/audio/facts/volcano/how-volcanoes-form.wav") */
  audioSrc?: string;
  /** Minimum vowel quest completions needed to unlock this fact (default 1) */
  unlockAt?: number;
}

/** A tappable panel attached to a scene prop */
export interface FactPanel {
  title: string;
  items: FactItem[];
}

/** A positioned scene prop (decorative or interactive element) */
export interface SceneProp {
  id: string;
  src: string;            // image path
  x: number;              // % from left
  y: number;              // % from top
  width: number;          // % of container width
  anchor?: "top" | "bottom"; // vertical anchor (default "bottom")
  factPanel?: FactPanel;  // if set, prop is tappable and opens this panel
}

export interface EnvironmentConfig {
  id: string;             // matches island id in IslandLayer
  name: string;           // display name
  description: string;    // short tagline
  backgroundGradient: string; // CSS gradient fallback
  backgroundImage?: string;   // optional background image path (overrides gradient)
  props?: SceneProp[];    // positioned scene elements
  hotspots: Hotspot[];
  ambientColor: string;   // theme tint for UI
}

// ---- Unlock order ----
// Each trophy earned (in any quest) unlocks the next environment.
// 1st trophy → Volcano, 2nd → Castle, etc.

export const EXPLORE_UNLOCK_ORDER: string[] = [
  "valcano",
  "castle-island",
  "small-coastal-village",
  "industrial-tech-city",
  "glass-dome",
];

// ---- Per-quest mapping ----
// Discovery rooms are universal by vowel pattern across all tiers.
// Short A → Volcano, Short I → Castle, Short O → Coral Cove, etc.

export const QUEST_ENVIRONMENT_MAP: Record<string, string> = {
  // CVC
  "quest-short-a": "valcano",
  "quest-short-i": "castle-island",
  "quest-short-o": "small-coastal-village",
  "quest-short-u": "industrial-tech-city",
  "quest-short-e": "glass-dome",
  // CVCC
  "quest-cvcc-short-a": "valcano",
  "quest-cvcc-short-i": "castle-island",
  "quest-cvcc-short-o": "small-coastal-village",
  "quest-cvcc-short-u": "industrial-tech-city",
  "quest-cvcc-short-e": "glass-dome",
  // Magic E
  "quest-magic-e-a": "valcano",
  "quest-magic-e-i": "castle-island",
  "quest-magic-e-o": "small-coastal-village",
  "quest-magic-e-u": "industrial-tech-city",
  "quest-magic-e-mixed": "glass-dome",
  // CVVC
  "quest-cvvc-long-a": "valcano",
  "quest-cvvc-long-e": "glass-dome",
  "quest-cvvc-long-o": "small-coastal-village",
  "quest-cvvc-long-u": "industrial-tech-city",
  "quest-cvvc-mixed-ea": "castle-island",
  // Advanced
  "quest-adv-ar-or": "valcano",
  "quest-adv-er-ir-ur": "castle-island",
  "quest-adv-bossy-r-mix": "small-coastal-village",
  "quest-adv-2syl-closed": "industrial-tech-city",
  "quest-adv-mixed-mastery": "glass-dome",
};

/** Reverse lookup: environment ID → quest ID */
export const ENVIRONMENT_QUEST_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(QUEST_ENVIRONMENT_MAP).map(([qId, eId]) => [eId, qId])
);

/** Display emoji for each environment (used in unlock announcements) */
export const ENVIRONMENT_EMOJI: Record<string, string> = {
  "valcano": "\u{1F30B}",
  "castle-island": "\u{1F3F0}",
  "small-coastal-village": "\u{1F3D8}\uFE0F",
  "industrial-tech-city": "\u2699\uFE0F",
  "glass-dome": "\u{1F33F}",
};

// ---- Environment configs ----

const VOLCANO_ENV: EnvironmentConfig = {
  id: "valcano",
  name: "Rumble Peak Volcano",
  description: "An active volcano full of fiery secrets!",
  backgroundGradient: "linear-gradient(180deg, #1a0a0a 0%, #4a1a0a 25%, #8b2500 50%, #c94420 75%, #ff6b3a 100%)",
  backgroundImage: "/assets/discovery rooms/rumble-peak-volcano/main-volcano-background.png",
  ambientColor: "#ff6b3a",
  props: [
    {
      id: "volcano-image",
      src: "/assets/discovery rooms/rumble-peak-volcano/no erupt volcano.png",
      x: 50,
      y: 55,
      width: 30,
      factPanel: {
        title: "The Volcano",
        items: [
          {
            id: "how-volcanoes-form",
            name: "How Volcanoes Form",
            emoji: "⛰️",
            core: "Deep under the ground, rock gets so hot it melts! It pushes up and builds a volcano.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file90_DesignsByBee_HowVolcanosForm_take2.wav",
            unlockAt: 1,
          },
          {
            id: "eruption-power",
            name: "Eruption Power",
            emoji: "💥",
            core: "When a volcano erupts, it can shoot ash higher than airplanes! Some eruptions are super loud.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file91_DesignsByBee_EruptionPower_take2.wav",
            unlockAt: 3,
          },
          {
            id: "dormant-volcanoes",
            name: "Sleeping Volcanoes",
            emoji: "😴",
            core: "Some volcanoes are sleeping! They haven't erupted in a long, long time — but they could wake up one day. Some have napped for hundreds of years!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file92_DesignsByBee_SleepingVolcanoes_take2.wav",
            unlockAt: 5,
          },
          {
            id: "volcanic-soil",
            name: "Volcanic Soil",
            emoji: "🌱",
            core: "After a volcano erupts, the soil around it becomes super good for growing things! That's why farmers love living near volcanoes — their fruits and veggies grow really well.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file93_DesignsByBee_VolcanicSoil_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "rpv-sign",
      src: "/assets/discovery rooms/rumble-peak-volcano/rpv-sign.png",
      x: 82,
      y: 0,
      width: 30,
      anchor: "top",
    },
    {
      id: "stand-back",
      src: "/assets/discovery rooms/rumble-peak-volcano/stand-back.png",
      x: 8,
      y: 55,
      width: 16,
    },
    {
      id: "lava-pit",
      src: "/assets/discovery rooms/rumble-peak-volcano/lava-pit.png",
      x: 50,
      y: 92,
      width: 26,
      factPanel: {
        title: "Lava Pit",
        items: [
          {
            id: "lava-temperature",
            name: "Super Hot Lava",
            emoji: "🌡️",
            core: "Lava is SO hot it can melt rock! Yellow lava is the hottest, and red lava is a little cooler.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file95_DesignsByBee_SuperHotLava_take2.wav",
            unlockAt: 1,
          },
          {
            id: "lava-types",
            name: "Lava Types",
            emoji: "🌋",
            core: "Some lava is thick and slow like honey. Other lava is runny and fast!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file96_DesignsByBee_LavaTypes_take2.wav",
            unlockAt: 3,
          },
          {
            id: "lava-glow",
            name: "Lava Glow",
            emoji: "✨",
            core: "Lava glows because it's so hot—it makes its own light! At night, it can light up the sky.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file97_DesignsByBee_LavaGlow_take2.wav",
            unlockAt: 5,
          },
          {
            id: "lava-gas",
            name: "Stinky Gas",
            emoji: "💨",
            core: "Volcanoes let out stinky gas that smells like rotten eggs — pee-yew! They also puff out big clouds of steam, just like a giant kettle.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file98_DesignsByBee_StinkyGas_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "erupt-button",
      src: "/assets/discovery rooms/rumble-peak-volcano/erupt-button-red.png",
      x: 50,
      y: 68,
      width: 14,
    },
    {
      id: "volcanic-rocks",
      src: "/assets/discovery rooms/rumble-peak-volcano/volcanic-rocks-1.png",
      x: 15,
      y: 92,
      width: 26,
      factPanel: {
        title: "Volcanic Rocks",
        items: [
          {
            id: "lava-rock",
            name: "Lava Rock",
            emoji: "\u{1F30B}",
            core: "Lava rock forms when hot lava cools fast. It has tiny holes—like a frozen sponge!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file100_DesignsByBee_LavaRock_take2.wav",
            unlockAt: 2,
          },
          {
            id: "molten-lava",
            name: "Glowing Lava",
            emoji: "\u{1F525}",
            core: "Lava is so hot it can melt gold! The brighter it glows, the hotter it is.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file101_DesignsByBee_GlowingLava_take2.wav",
            unlockAt: 4,
          },
          {
            id: "crystals",
            name: "Crystals",
            emoji: "\u{1F48E}",
            core: "Volcanoes help make sparkly crystals! Hot water underground cools down slowly and turns into shiny gems.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file102_DesignsByBee_Crystals_take2.wav",
            unlockAt: 6,
          },
          {
            id: "cooled-rock",
            name: "Cooled Rock",
            emoji: "\u{1FAA8}",
            core: "When lava hits the ocean, it cools super fast and turns into shiny black glass!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file103_DesignsByBee_CooledRock_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "earth-layers",
      src: "/assets/discovery rooms/rumble-peak-volcano/earth-layers.png",
      x: 85,
      y: 90,
      width: 22,
      factPanel: {
        title: "Earth\u2019s Layers",
        items: [
          {
            id: "crust",
            name: "Crust",
            emoji: "\u{1FAA8}",
            core: "The ground we walk on is called the crust — it's like the skin on an apple! It's the thinnest layer of the Earth.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file105_DesignsByBee_Crust_take2.wav",
            unlockAt: 2,
          },
          {
            id: "mantle",
            name: "Mantle",
            emoji: "\u{1F525}",
            core: "Under the crust is the mantle — the thickest layer! The rock here is so hot it moves very slowly, like thick, gooey honey.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file106_DesignsByBee_Mantle_take2.wav",
            unlockAt: 4,
          },
          {
            id: "outer-core",
            name: "Outer Core",
            emoji: "\u{1F30A}",
            core: "Deep inside Earth, there's hot, swirly metal moving around like a giant soup!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file107_DesignsByBee_OuterCore_take2.wav",
            unlockAt: 6,
          },
          {
            id: "inner-core",
            name: "Inner Core",
            emoji: "\u2B50",
            core: "The center of Earth is super, super hot — like a giant glowing ball!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file108_DesignsByBee_InnerCore_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "wigglewoo",
      src: "/assets/discovery rooms/rumble-peak-volcano/wigglewoo-volcano.png",
      x: 68,
      y: 101,
      width: 18,
    },
  ],
  hotspots: [],
};

const CASTLE_ENV: EnvironmentConfig = {
  id: "castle-island",
  name: "Stonewall Castle",
  description: "A medieval fortress with ancient secrets!",
  backgroundGradient: "linear-gradient(180deg, #87CEEB 0%, #a8d8ea 30%, #6b8e6b 60%, #4a5e3a 80%, #3d4a2e 100%)",
  backgroundImage: "/assets/discovery rooms/stonewall-castle/stonewall-background.png",
  ambientColor: "#6b8e6b",
  props: [
    {
      id: "stonewall-logo",
      src: "/assets/discovery rooms/stonewall-castle/stonewall-logo.png",
      x: 50,
      y: 0,
      width: 28,
      anchor: "top",
    },
    {
      id: "left-banner",
      src: "/assets/discovery rooms/stonewall-castle/left-banner.png",
      x: 18,
      y: 57,
      width: 16,
    },
    {
      id: "right-banner",
      src: "/assets/discovery rooms/stonewall-castle/right-banner.png",
      x: 82,
      y: 56,
      width: 16,
    },
    {
      id: "left-flame",
      src: "/assets/discovery rooms/stonewall-castle/wall-flame-lit.png",
      x: 18,
      y: 22,
      width: 10,
    },
    {
      id: "right-flame",
      src: "/assets/discovery rooms/stonewall-castle/wall-flame-lit.png",
      x: 82,
      y: 21,
      width: 10,
    },
    {
      id: "treasure-box",
      src: "/assets/discovery rooms/stonewall-castle/closed-treasure-box.png",
      x: 15,
      y: 108,
      width: 22,
      factPanel: {
        title: "Medieval Treasure",
        items: [
          {
            id: "gold-coins",
            name: "Gold Coins",
            emoji: "\u{1FA99}",
            core: "Long ago, people made coins by pressing pictures into metal!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file111_DesignsByBee_GoldCoins_take2.wav",
            unlockAt: 1,
          },
          {
            id: "gemstones",
            name: "Gemstones",
            emoji: "\u{1F48E}",
            core: "Kings and queens loved sparkly gems! People believed some gems had special powers.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file112_DesignsByBee_Gemstones_take2.wav",
            unlockAt: 3,
          },
          {
            id: "treasure-chests",
            name: "Treasure Chests",
            emoji: "\u{1F4E6}",
            core: "Treasure chests had big locks and were hidden in secret rooms! Some castles even had secret tunnels.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file113_DesignsByBee_TreasureChest_take2.wav",
            unlockAt: 5,
          },
          {
            id: "trade-and-barter",
            name: "Trading",
            emoji: "\u2696\uFE0F",
            core: "People used to trade things instead of money — like apples for bread!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file114_DesignsByBee_Trading_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "sword-n-rock",
      src: "/assets/discovery rooms/stonewall-castle/sword-n-rock.png",
      x: 70,
      y: 95,
      width: 30,
      factPanel: {
        title: "Swords & Legends",
        items: [
          {
            id: "excalibur",
            name: "Excalibur",
            emoji: "\u2694\uFE0F",
            core: "The legend says only the true King of England could pull the magical sword from the stone. A young boy named Arthur did it \u2014 and became king!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file116_DesignsByBee_Excalibur_take2.wav",
            unlockAt: 1,
          },
          {
            id: "blacksmith",
            name: "The Blacksmith",
            emoji: "\u{1F525}",
            core: "Swords were made by heating metal in a hot fire and hammering it into shape. It took days to make just one!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file117_DesignsByBee_TheBlacksmith_take2.wav",
            unlockAt: 3,
          },
          {
            id: "types-of-swords",
            name: "Types of Swords",
            emoji: "\u{1F5E1}\uFE0F",
            core: "Knights had different swords! Some were big and heavy, and some were so long you needed two hands!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file118_DesignsByBee_TypesOfSwords_take2.wav",
            unlockAt: 5,
          },
          {
            id: "knighting-ceremony",
            name: "Becoming a Knight",
            emoji: "\u{1F451}",
            core: "A knight had a special ceremony to become a royal protector!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file119_DesignsByBee_BecomingAKnight_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "castle-scroll",
      src: "/assets/discovery rooms/stonewall-castle/scrolled-up.png",
      x: 50,
      y: 103,
      width: 22,
      factPanel: {
        title: "Medieval Scrolls & Writing",
        items: [
          {
            id: "quill-and-ink",
            name: "Feather Pens",
            emoji: "\u{1FAB6}",
            core: "People used feathers to write! They dipped them in ink—this was called a quill.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file121_DesignsByBee_FeatherPens_take2.wav",
            unlockAt: 2,
          },
          {
            id: "scroll-making",
            name: "Scroll Making",
            emoji: "\u{1F4DC}",
            core: "Long ago, people wrote on long rolls of paper called scrolls. Every single letter had to be written by hand — it took a really long time!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file122_DesignsByBee_ScrollMaking_take2.wav",
            unlockAt: 4,
          },
          {
            id: "castle-builders",
            name: "Castle Builders",
            emoji: "\u{1F3F0}",
            core: "It could take 10 to 20 years to build a castle! Workers stacked heavy stones to make walls and towers.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file123_DesignsByBee_CastleBuilders_take2.wav",
            unlockAt: 6,
          },
          {
            id: "knight-armor",
            name: "Knight\u2019s Armour",
            emoji: "\u{1F6E1}\uFE0F",
            core: "A suit of armour was as heavy as a big dog! Knights had to practice moving and fighting in all that metal since they were little kids.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file124_DesignsByBee_KnightsArmor_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "knight",
      src: "/assets/discovery rooms/stonewall-castle/knight.png",
      x: 86,
      y: 95,
      width: 31,
      factPanel: {
        title: "Knights",
        items: [
          {
            id: "knight-training",
            name: "Knight Training",
            emoji: "⚔️",
            core: "Boys started training to be knights at age 7. They learned step by step until they became knights!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file126_DesignsByBee_KnightTraining_take2.wav",
            unlockAt: 2,
          },
          {
            id: "horse-power",
            name: "Horse Power",
            emoji: "🐴",
            core: "A knight's horse was one of the strongest horses around. It carried the knight and all that heavy armor!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file127_DesignsByBee_HorsePower_take2.wav",
            unlockAt: 4,
          },
          {
            id: "coat-of-arms",
            name: "Coat of Arms",
            emoji: "🛡️",
            core: "Every knight had a special shield design called a coat of arms. It helped people tell who was who during battles when everyone wore helmets!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file128_DesignsByBee_CoatOfArms_take2.wav",
            unlockAt: 6,
          },
          {
            id: "knights-code",
            name: "Knight's Code",
            emoji: "📜",
            core: "Knights had special rules — always be brave, honest, and kind. They promised to help people!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file129_DesignsByBee_KnightsCode_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "wigglewoo",
      src: "/assets/discovery rooms/stonewall-castle/wigglewoo-stonewall.png",
      x: 36,
      y: 95,
      width: 18,
    },
  ],
  hotspots: [],
};

const VILLAGE_ENV: EnvironmentConfig = {
  id: "small-coastal-village",
  name: "Coral Cove Village",
  description: "A seaside village where the ocean meets the land!",
  backgroundGradient: "linear-gradient(180deg, #87CEEB 0%, #98d1e8 30%, #e8d5a0 60%, #c9a96e 80%, #4a90a4 100%)",
  backgroundImage: "/assets/discovery rooms/coral-cove-village/background-coral.png",
  ambientColor: "#4a90a4",
  props: [
    {
      id: "coral-cove-logo",
      src: "/assets/discovery rooms/coral-cove-village/coral-cove-logo.png",
      x: 50,
      y: 0,
      width: 30,
      anchor: "top",
    },
    {
      id: "school-of-fish",
      src: "/assets/discovery rooms/coral-cove-village/school of fish 1.png",
      x: -20,
      y: 45,
      width: 18,
    },
    {
      id: "school-of-fish-2",
      src: "/assets/discovery rooms/coral-cove-village/school of fish 2.png",
      x: 120,
      y: 65,
      width: 18,
    },
    {
      id: "clam",
      src: "/assets/discovery rooms/coral-cove-village/closed-clam.png",
      x: 57,
      y: 90,
      width: 40,
      factPanel: {
        title: "Amazing Clams & Shells",
        items: [
          {
            id: "giant-clams",
            name: "Giant Clams",
            emoji: "\u{1F41A}",
            core: "Giant clams can grow over 1 metre wide! Some live for over 100 years.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file132_DesignsByBee_GiantClams_take2.wav",
            unlockAt: 1,
          },
          {
            id: "pearls",
            name: "Making Pearls",
            emoji: "\u{1F48E}",
            core: "When a grain of sand gets inside a clam, the clam wraps it in smooth layers. Over time, it becomes a pearl!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file133_DesignsByBee_MakingPearls_take2.wav",
            unlockAt: 3,
          },
          {
            id: "shell-homes",
            name: "Shell Homes",
            emoji: "\u{1F3E0}",
            core: "A clam's shell is like its house! It adds new layers as it grows — just like tree rings.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file134_DesignsByBee_ShellHomes_take2.wav",
            unlockAt: 5,
          },
          {
            id: "filter-feeders",
            name: "How Clams Eat",
            emoji: "\u{1F30A}",
            core: "Clams suck in water to catch tiny food. One clam can clean a whole bathtub of water each day!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file135_DesignsByBee_HowClamsEat_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "mayor-village",
      src: "/assets/discovery rooms/coral-cove-village/mayor-village.png",
      x: 35,
      y: 90,
      width: 38,
      factPanel: {
        title: "Coral Cove Village",
        items: [
          {
            id: "coral-reefs",
            name: "Coral Reefs",
            emoji: "\u{1FAB8}",
            core: "Coral reefs are like underwater rainforests! Even though they're small, they are home to so many fish and sea creatures.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file136_DesignsByBee_CoralReefs_take2.wav",
            unlockAt: 1,
          },
          {
            id: "village-life",
            name: "Seaside Living",
            emoji: "\u{1F3D6}\uFE0F",
            core: "People have lived by the sea for thousands of years! They built homes near the water to catch fish and explore the ocean.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file137_DesignsByBee_SeasideLiving_take2.wav",
            unlockAt: 3,
          },
          {
            id: "tides",
            name: "Ocean Tides",
            emoji: "\u{1F30A}",
            core: "The moon pulls the ocean water up and down each day. When the water goes out, you can find little sea creatures!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file138_DesignsByBee_OceanTides_take2.wav",
            unlockAt: 5,
          },
          {
            id: "sea-creatures",
            name: "Sea Creatures",
            emoji: "\u{1F42C}",
            core: "The ocean is full of amazing animals! There are many we still haven't discovered yet.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file139_DesignsByBee_SeaCreatures_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "octopus",
      src: "/assets/discovery rooms/coral-cove-village/stone-octopus.png",
      x: 15,
      y: 100,
      width: 40,
      factPanel: {
        title: "Incredible Octopuses",
        items: [
          {
            id: "three-hearts",
            name: "Three Hearts",
            emoji: "\u{2764}\uFE0F",
            core: "Octopuses have three hearts! And guess what — their blood is blue, not red! How cool is that?",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file141_DesignsByBee_ThreeHearts_take2.wav",
            unlockAt: 2,
          },
          {
            id: "camouflage",
            name: "Master of Disguise",
            emoji: "\u{1F3A8}",
            core: "Octopuses can change their color in less than a second! They hide by looking like rocks or coral.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file142_DesignsByBee_MasterOfDisguise_take2.wav",
            unlockAt: 4,
          },
          {
            id: "smart-creatures",
            name: "Super Smart",
            emoji: "\u{1F9E0}",
            core: "Octopuses are super smart! They can solve puzzles and even open jars all by themselves.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file143_DesignsByBee_SuperSmart_take2.wav",
            unlockAt: 6,
          },
          {
            id: "eight-arms",
            name: "Eight Arms",
            emoji: "\u{1F419}",
            core: "An octopus has eight arms with suckers! It can feel and taste with them.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file144_DesignsByBee_EightArms_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "coral-archway",
      src: "/assets/discovery rooms/coral-cove-village/coral-archway.png",
      x: 80,
      y: 95,
      width: 45,
      factPanel: {
        title: "Coral Reefs & Archways",
        items: [
          {
            id: "living-coral",
            name: "Living Coral",
            emoji: "\u{1FAB8}",
            core: "Coral looks like rock, but it's alive! It's made of lots of tiny animals.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file146_DesignsByBee_LivingCoral_take2.wav",
            unlockAt: 2,
          },
          {
            id: "coral-archways",
            name: "Natural Archways",
            emoji: "\u{1F309}",
            core: "Ocean waves slowly carve holes through coral walls and make cool archways! Fish love swimming through them like underwater doorways.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file147_DesignsByBee_NaturalArchways_take2.wav",
            unlockAt: 4,
          },
          {
            id: "reef-colours",
            name: "Reef Colours",
            emoji: "\u{1F308}",
            core: "Coral has tiny helpers that give it color. When they leave, it turns white!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file148_DesignsByBee_ReefColours_take2.wav",
            unlockAt: 6,
          },
          {
            id: "reef-life",
            name: "Reef Life",
            emoji: "\u{1F420}",
            core: "Coral reefs are like busy underwater cities! So many fish and crabs live there.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file149_DesignsByBee_ReefLife_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "wigglewoo",
      src: "/assets/discovery rooms/coral-cove-village/wigglewoo-coral-cove.png",
      x: 85,
      y: 95,
      width: 18,
    },
  ],
  hotspots: [],
};

const TECH_CITY_ENV: EnvironmentConfig = {
  id: "industrial-tech-city",
  name: "Geartown Workshop",
  description: "A bustling city of inventions and machines!",
  backgroundGradient: "linear-gradient(180deg, #2c3e50 0%, #34495e 30%, #5d6d7e 60%, #85929e 80%, #aab7b8 100%)",
  backgroundImage: "/assets/discovery rooms/geartown-workshop/background-geartown.png",
  ambientColor: "#5d6d7e",
  props: [
    {
      id: "hanging-light-3",
      src: "/assets/discovery rooms/geartown-workshop/hanging light off-3.png",
      x: 79,
      y: -19,
      width: 8,
      anchor: "top",
    },
    {
      id: "gears-on-wall",
      src: "/assets/discovery rooms/geartown-workshop/gears-on-wall.png",
      x: 24,
      y: 68,
      width: 38,
      factPanel: {
        title: "Gears & Machines",
        // (Spinning-gear overlays are added as separate props after this one
        //  so they render on top of the static wall artwork. See the
        //  geartown-spinner-* entries below.)
        items: [
          {
            id: "how-gears-work",
            name: "How Gears Work",
            emoji: "\u2699\uFE0F",
            core: "When one gear turns, it makes another gear turn too — like teamwork!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file152_DesignsByBee_HowGearsWork_take2.wav",
            unlockAt: 1,
          },
          {
            id: "gear-ratios",
            name: "Big & Small Gears",
            emoji: "\u{1F504}",
            core: "Some gears spin fast, and some spin slow — it depends on their size!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file153_DesignsByBee_BigAndSmallGears_take2.wav",
            unlockAt: 3,
          },
          {
            id: "simple-machines",
            name: "Simple Machines",
            emoji: "\u{1F6E0}\uFE0F",
            core: "Gears help us do things that are too hard with just our hands! Ramps and levers help too.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file154_DesignsByBee_SimpleMachines_take2.wav",
            unlockAt: 5,
          },
          {
            id: "clockwork",
            name: "Clockwork",
            emoji: "\u{1F570}\uFE0F",
            core: "Before batteries, clocks ran on gears! You wound them up with a key to make them tick.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file155_DesignsByBee_Clockwork_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    // ---- Spinning gear overlays on top of gears-on-wall ----
    // Position coords are best-guess clusters over where the static wall
    // gears appear; tweak x/y/width once visible against the actual artwork.
    // ExploreScreen.tsx renders props with id starting "geartown-spinner-"
    // through a dedicated branch that adds the rotation animation.
    {
      id: "geartown-spinner-1",
      src: "/assets/discovery rooms/geartown-workshop/spinning-gear.png",
      x: 15,
      y: 57,
      width: 9,
    },
    {
      id: "geartown-spinner-2",
      src: "/assets/discovery rooms/geartown-workshop/spinning-gear.png",
      x: 28.2,
      y: 48,
      width: 7,
    },
    {
      id: "geartown-spinner-3",
      src: "/assets/discovery rooms/geartown-workshop/spinning-gear.png",
      x: 35.5,
      y: 57.7,
      width: 5,
    },
    {
      id: "geartown-spinner-4",
      src: "/assets/discovery rooms/geartown-workshop/spinning-gear.png",
      x: 24,
      y: 63,
      width: 8,
    },
    {
      id: "light-switch",
      src: "/assets/discovery rooms/geartown-workshop/off switch.png",
      x: 88,
      y: 50,
      width: 8,
    },
    {
      id: "tool-rack",
      src: "/assets/discovery rooms/geartown-workshop/tool-rack.png",
      x: 81,
      y: 67,
      width: 15,
      factPanel: {
        title: "Tool Rack",
        items: [
          {
            id: "hand-tools",
            name: "Hand Tools",
            emoji: "🔧",
            core: "Tools like wrenches and screwdrivers help your hands do things they can't do alone!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file157_DesignsByBee_HandTools_take2.wav",
            unlockAt: 1,
          },
          {
            id: "measuring-tools",
            name: "Measuring Tools",
            emoji: "📏",
            core: "Rulers help builders measure things. This helps everything fit just right!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file158_DesignsByBee_MeasuringTools_take2.wav",
            unlockAt: 3,
          },
          {
            id: "safety-first",
            name: "Safety First",
            emoji: "🥽",
            core: "In a workshop, you wear goggles and gloves to stay safe! Safety gear protects you.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file159_DesignsByBee_SafetyFirst_take2.wav",
            unlockAt: 5,
          },
          {
            id: "right-tool",
            name: "The Right Tool",
            emoji: "🛠️",
            core: "Using the right tool makes things easier! A hammer is for nails, and a saw cuts wood.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file160_DesignsByBee_TheRightTool_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "blueprint",
      src: "/assets/discovery rooms/geartown-workshop/blueprint-lights-off.png",
      x: 56,
      y: 57,
      width: 30,
      factPanel: {
        title: "Blueprints",
        items: [
          {
            id: "what-are-blueprints",
            name: "What Are Blueprints?",
            emoji: "📐",
            core: "Blueprints are like recipes that show how to build things!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file162_DesignsByBee_WhatAreBlueprints_take2.wav",
            unlockAt: 2,
          },
          {
            id: "why-blue",
            name: "Why Are They Blue?",
            emoji: "🔵",
            core: "Blueprints used to be blue with white lines. That's how they got their name!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file163_DesignsByBee_WhyAreTheyBlue_take2.wav",
            unlockAt: 4,
          },
          {
            id: "technical-drawing",
            name: "Drawing Plans",
            emoji: "📏",
            core: "Builders draw pictures from every side — the top, the front, and the side!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file164_DesignsByBee_DrawingPlans_take2.wav",
            unlockAt: 6,
          },
          {
            id: "modern-blueprints",
            name: "Computer Plans",
            emoji: "💻",
            core: "Builders can look at plans and spin them around to see every side!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file165_DesignsByBee_ComputerPlans_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "power-core",
      src: "/assets/discovery rooms/geartown-workshop/power-core-not-glowing.png",
      x: 40,
      y: 74,
      width: 25,
      factPanel: {
        title: "Power Core",
        items: [
          {
            id: "what-is-energy",
            name: "What Is Energy?",
            emoji: "⚡",
            core: "Energy helps things move and work. Without it, nothing would go!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file167_DesignsByBee_WhatIsEnergy_take2.wav",
            unlockAt: 2,
          },
          {
            id: "electricity",
            name: "Electricity",
            emoji: "🔌",
            core: "Electricity travels through wires to power things. It moves super fast!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file168_DesignsByBee_Electricity_take2.wav",
            unlockAt: 4,
          },
          {
            id: "batteries-and-cells",
            name: "Batteries",
            emoji: "🔋",
            core: "Batteries store energy for later. That's how toys work without being plugged in!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file169_DesignsByBee_Batteries_take2.wav",
            unlockAt: 6,
          },
          {
            id: "renewable-energy",
            name: "Energy from Nature",
            emoji: "☀️",
            core: "We can get energy from the sun and the wind! They never run out.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file170_DesignsByBee_EnergyFromNature_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "geartown-logo",
      src: "/assets/discovery rooms/geartown-workshop/logo-no-smoke.png",
      x: 56,
      y: 27,
      width: 26.5,
    },
    {
      id: "robot-parts",
      src: "/assets/discovery rooms/geartown-workshop/robot-parts.png",
      x: 24,
      y: 32,
      width: 24,
    },
    {
      id: "wigglewoo",
      src: "/assets/discovery rooms/geartown-workshop/wigglewoo-geartown.png",
      x: 72,
      y: 80,
      width: 18,
    },
  ],
  hotspots: [],
};

const GLASS_DOME_ENV: EnvironmentConfig = {
  id: "glass-dome",
  name: "Greenhouse Dome",
  description: "A glass dome full of amazing plants and nature!",
  backgroundGradient: "linear-gradient(180deg, #e8f5e9 0%, #a5d6a7 30%, #66bb6a 60%, #388e3c 80%, #1b5e20 100%)",
  backgroundImage: "/assets/discovery rooms/greenhouse-domes/greenhouse-background.png",
  ambientColor: "#66bb6a",
  props: [
    {
      id: "greenhouse-logo",
      src: "/assets/discovery rooms/greenhouse-domes/greenhouse-logo-1.png",
      x: 50,
      y: 0,
      width: 28,
      anchor: "top",
    },
    {
      id: "flower-stage",
      src: "/assets/discovery rooms/greenhouse-domes/flower-stage-1.png",
      x: 50,
      y: 100,
      width: 28,
      factPanel: {
        title: "How Flowers Grow",
        items: [
          {
            id: "seed",
            name: "Seed",
            emoji: "\u{1F331}",
            core: "Every flower starts as a tiny seed! Inside is a baby plant ready to grow.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file173_DesignsByBee_Seed_take2.wav",
            unlockAt: 1,
          },
          {
            id: "photosynthesis",
            name: "Sunlight Power",
            emoji: "\u2600\uFE0F",
            core: "Plants use sunlight to make their own food!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file174_DesignsByBee_SunlightPower_take2.wav",
            unlockAt: 3,
          },
          {
            id: "bloom",
            name: "Blooming",
            emoji: "\u{1F33A}",
            core: "When flowers bloom, they open their petals. Bees and butterflies help make new seeds.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file175_DesignsByBee_Blooming_take2.wav",
            unlockAt: 5,
          },
          {
            id: "roots",
            name: "Roots",
            emoji: "\u{1FAB4}",
            core: "Roots work like underground straws, sucking up water from the soil! Some roots stretch wider than the tree above.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file176_DesignsByBee_Roots_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "oxygen-machine",
      src: "/assets/discovery rooms/greenhouse-domes/oxygen-machine.png",
      x: 16,
      y: 56,
      width: 21.6,
      factPanel: {
        title: "Oxygen Machine",
        items: [
          {
            id: "photosynthesis-process",
            name: "Plant Power",
            emoji: "\u2600\uFE0F",
            core: "Plants help make the air we breathe! They use sunlight to make fresh oxygen.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file178_DesignsByBee_PlantPower_take2.wav",
            unlockAt: 1,
          },
          {
            id: "carbon-dioxide",
            name: "Breathing Together",
            emoji: "\u{1F4A8}",
            core: "When you breathe out, plants use that air to grow. You help each other!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file179_DesignsByBee_BreathingTogether_take2.wav",
            unlockAt: 3,
          },
          {
            id: "chlorophyll",
            name: "Why Plants Are Green",
            emoji: "\u{1F33F}",
            core: "Plants are green because they catch sunlight in their leaves! It helps them make food.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file180_DesignsByBee_WhyPlantsAreGreen_take2.wav",
            unlockAt: 5,
          },
          {
            id: "glucose",
            name: "Plant Food",
            emoji: "\u{1F36C}",
            core: "Plants make their own food using sunlight. It helps them grow big and strong!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file181_DesignsByBee_PlantFood_take2.wav",
            unlockAt: 7,
          },
        ],
      },
    },
    {
      id: "seed-n-water",
      src: "/assets/discovery rooms/greenhouse-domes/seed-n-water.png",
      x: 12,
      y: 95,
      width: 24,
      factPanel: {
        title: "Seeds & Water",
        items: [
          {
            id: "germination",
            name: "Germination",
            emoji: "\u{1F331}",
            core: "When a seed gets water, it starts to grow! A root goes down, and a stem grows up.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file183_DesignsByBee_Germination_take2.wav",
            unlockAt: 2,
          },
          {
            id: "watering",
            name: "Watering",
            emoji: "\u{1F4A7}",
            core: "Plants drink water through their roots. Some trees move a LOT of water every day!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file184_DesignsByBee_Watering_take2.wav",
            unlockAt: 4,
          },
          {
            id: "soil",
            name: "Soil",
            emoji: "\u{1FAB1}",
            core: "Soil is full of tiny living things! They help turn old leaves into food for plants.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file185_DesignsByBee_Soil_take2.wav",
            unlockAt: 6,
          },
          {
            id: "seed-travel",
            name: "Seed Travel",
            emoji: "\u{1F32C}\uFE0F",
            core: "Seeds travel in cool ways! Some fly on the wind, some float on water, and some stick to animals.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file186_DesignsByBee_SeedTravel_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "tree-rings",
      src: "/assets/discovery rooms/greenhouse-domes/tree-rings.png",
      x: 88,
      y: 90,
      width: 22,
      factPanel: {
        title: "Tree Rings",
        items: [
          {
            id: "counting-rings",
            name: "Age Rings",
            emoji: "\u{1FAB5}",
            core: "Each ring in a tree shows one year of growth! Some trees are thousands of years old.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file188_DesignsByBee_AgeRings_take2.wav",
            unlockAt: 2,
          },
          {
            id: "bark",
            name: "Bark",
            emoji: "\u{1F332}",
            core: "Bark is like a tree's armor! It keeps the tree safe from bugs and bad weather.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file189_DesignsByBee_Bark_take2.wav",
            unlockAt: 4,
          },
          {
            id: "sapwood",
            name: "Sapwood",
            emoji: "\u{1F4A7}",
            core: "The wood inside a tree carries water from the roots up to the leaves — like a big straw!",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file190_DesignsByBee_Sapwood_take2.wav",
            unlockAt: 6,
          },
          {
            id: "heartwood",
            name: "Heartwood",
            emoji: "\u{1F9E1}",
            core: "The center of a tree is strong and sturdy! It helps hold the tree up.",
            audioSrc: "/assets/discovery rooms/DiscoverRoomFacts_take2/file191_DesignsByBee_Heartwood_take2.wav",
            unlockAt: 8,
          },
        ],
      },
    },
    {
      id: "butterfly",
      src: "/assets/discovery rooms/greenhouse-domes/butterfly-view-1.png",
      x: 72,
      y: 28,
      width: 12,
    },
    {
      id: "wigglewoo",
      src: "/assets/discovery rooms/greenhouse-domes/wigglewoo-greenhouse.png",
      x: 75,
      y: 103,
      width: 18,
    },
  ],
  hotspots: [],
};

// ---- Lookup map ----

export const ENVIRONMENTS: Record<string, EnvironmentConfig> = {
  [VOLCANO_ENV.id]: VOLCANO_ENV,
  [CASTLE_ENV.id]: CASTLE_ENV,
  [VILLAGE_ENV.id]: VILLAGE_ENV,
  [TECH_CITY_ENV.id]: TECH_CITY_ENV,
  [GLASS_DOME_ENV.id]: GLASS_DOME_ENV,
};

// ---- Landmark positions on quest map (% coords matching IslandLayer) ----
// Used by QuestMapScreen to render dedicated explore hitboxes above other elements.

export const LANDMARK_POSITIONS: Record<string, { x: number; y: number; s: number }> = {
  "valcano":                { x: 42, y: 32, s: 1.15 },
  "castle-island":          { x: 18, y: 32, s: 1.25 },
  "small-coastal-village":  { x: 15, y: 70, s: 1.29 },
  "industrial-tech-city":   { x: 72, y: 31, s: 1.20 },
  "glass-dome":             { x: 85, y: 60, s: 1.30 },
};

// ---- Unlock helpers ----

/** Returns the list of environment IDs the player has unlocked.
 *  An environment unlocks when ANY quest mapped to it has all 16 nodes complete. */
export function getUnlockedEnvironments(): string[] {
  const unlocked: string[] = [];
  for (const envId of EXPLORE_UNLOCK_ORDER) {
    // Check all quests that map to this environment
    const questIds = Object.entries(QUEST_ENVIRONMENT_MAP)
      .filter(([, eId]) => eId === envId)
      .map(([qId]) => qId);

    const anyComplete = questIds.some((qId) => {
      try {
        const raw = localStorage.getItem("wigglewoo-cvc-progress");
        if (!raw) return false;
        const data = JSON.parse(raw);
        const qp = data.quests?.[qId];
        return qp?.questComplete === true;
      } catch { return false; }
    });

    if (anyComplete) unlocked.push(envId);
  }
  return unlocked;
}

/** Check if a specific environment is unlocked. */
export function isEnvironmentUnlocked(envId: string): boolean {
  return getUnlockedEnvironments().includes(envId);
}

/** Get the most recently unlocked environment config (or null). */
export function getNewlyUnlockedEnvironment(): EnvironmentConfig | null {
  const count = countEarnedTrophies();
  if (count === 0) return null;
  const envId = EXPLORE_UNLOCK_ORDER[count - 1];
  return ENVIRONMENTS[envId] ?? null;
}

// ---- Per-quest unlock helpers ----

/**
 * Returns the environment ID unlocked for a specific quest,
 * or null if that quest's trophy hasn't been earned yet.
 */
export function getEnvironmentForQuest(questId: string): string | null {
  const envId = QUEST_ENVIRONMENT_MAP[questId];
  if (!envId) return null;
  const tp = loadTrophyProgress(questId);
  return tp.tier === "full" ? envId : null;
}

/**
 * Get the environment config linked to a quest (for announcement display).
 * Returns the config regardless of unlock state — caller decides when to show.
 */
export function getLinkedEnvironment(questId: string): EnvironmentConfig | null {
  const envId = QUEST_ENVIRONMENT_MAP[questId];
  if (!envId) return null;
  return ENVIRONMENTS[envId] ?? null;
}

/**
 * Has the player fully mastered any quest mapped to this environment?
 * "Fully mastered" = all 16 nodes done + full trophy + discovery complete
 * for at least one of the quests sharing this room (CVC, CVCC, etc).
 *
 * Used to lift the per-room daily fact cap once a kid has actually finished
 * the content. Pacing matters during first-pass learning, but gating
 * engagement after mastery just frustrates kids who already know the words.
 */
export function isEnvironmentVowelMastered(envId: string): boolean {
  for (const [questId, mappedEnvId] of Object.entries(QUEST_ENVIRONMENT_MAP)) {
    if (mappedEnvId !== envId) continue;
    if (isQuestFullyComplete(questId)) return true;
  }
  return false;
}
