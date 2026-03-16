// =============================================
// exploreData.ts — Explore Mode data configs
// WiggleWoo's Word Quest
// =============================================
// Data-driven environment definitions for Explore
// Mode. Each environment maps to a landmark island
// on the quest map and contains positioned hotspots
// with science facts and animations.
// =============================================

import { countEarnedTrophies, loadTrophyProgress } from "./progression";

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
  fact: string;
  /** Path to pre-recorded narration audio (e.g., "/assets/audio/facts/volcano/how-volcanoes-form.wav") */
  audioSrc?: string;
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
// Fixed 1:1 mapping: quest ID → environment ID.
// Each CVC quest track has exactly one linked discovery room.

export const QUEST_ENVIRONMENT_MAP: Record<string, string> = {
  "quest-short-a": "valcano",
  "quest-short-i": "castle-island",
  "quest-short-o": "small-coastal-village",
  "quest-short-u": "industrial-tech-city",
  "quest-short-e": "glass-dome",
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
            fact: "Deep under the ground, rock gets so hot it melts! This melted rock pushes up through cracks and builds into a tall mountain. That's how a volcano is born!",
          },
          {
            id: "eruption-power",
            name: "Eruption Power",
            emoji: "💥",
            fact: "When a volcano erupts, it can shoot ash higher than aeroplanes fly! The biggest eruptions are so loud you can hear them from really, really far away.",
          },
          {
            id: "dormant-volcanoes",
            name: "Sleeping Volcanoes",
            emoji: "😴",
            fact: "Some volcanoes are sleeping! They haven't erupted in a long, long time — but they could wake up one day. Some have napped for hundreds of years!",
          },
          {
            id: "volcanic-soil",
            name: "Volcanic Soil",
            emoji: "🌱",
            fact: "After a volcano erupts, the soil around it becomes super good for growing things! That's why farmers love living near volcanoes — their fruits and veggies grow really well.",
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
      y: 100,
      width: 26,
      factPanel: {
        title: "Lava Pit",
        items: [
          {
            id: "lava-temperature",
            name: "Super Hot Lava",
            emoji: "🌡️",
            fact: "Lava is SO hot it can melt rock! You can tell how hot it is by the colour — red lava is cooler, and bright yellow lava is the hottest.",
          },
          {
            id: "lava-types",
            name: "Lava Types",
            emoji: "🌋",
            fact: "Some lava is thick and slow like honey, and it makes bumpy, rough rocks. Other lava is runny and fast, and it looks like swirly ropes when it cools down!",
          },
          {
            id: "lava-glow",
            name: "Lava Glow",
            emoji: "✨",
            fact: "Lava glows in the dark because it's so hot it makes its own light — just like a light bulb! At night, a lava pit can light up the whole sky.",
          },
          {
            id: "lava-gas",
            name: "Stinky Gas",
            emoji: "💨",
            fact: "Volcanoes let out stinky gas that smells like rotten eggs — pee-yew! They also puff out big clouds of steam, just like a giant kettle.",
          },
        ],
      },
    },
    {
      id: "erupt-button",
      src: "/assets/discovery rooms/rumble-peak-volcano/erupt-button-red.png",
      x: 50,
      y: 74,
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
            fact: "Lava rock forms when hot lava cools down quickly. It's full of tiny holes made by gas bubbles escaping — like a frozen sponge made of stone!",
          },
          {
            id: "molten-lava",
            name: "Glowing Lava",
            emoji: "\u{1F525}",
            fact: "Melted lava is so hot it can melt gold! It glows bright orange and red — the brighter it glows, the hotter it is.",
          },
          {
            id: "crystals",
            name: "Crystals",
            emoji: "\u{1F48E}",
            fact: "Volcanoes help make beautiful crystals! Hot water deep underground cools down very slowly and turns into sparkly gems like amethyst and quartz.",
          },
          {
            id: "cooled-rock",
            name: "Cooled Rock",
            emoji: "\u{1FAA8}",
            fact: "When lava lands in the ocean, it cools super fast and turns into shiny black glass called obsidian! Long ago, people used it to make sharp tools.",
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
            fact: "The ground we walk on is called the crust — it's like the skin on an apple! It's the thinnest layer of the Earth.",
          },
          {
            id: "mantle",
            name: "Mantle",
            emoji: "\u{1F525}",
            fact: "Under the crust is the mantle — the thickest layer! The rock here is so hot it moves very slowly, like thick, gooey honey.",
          },
          {
            id: "outer-core",
            name: "Outer Core",
            emoji: "\u{1F30A}",
            fact: "Deeper down is the outer core — it's made of melted metal that swirls around! This spinning metal is what makes a compass point north.",
          },
          {
            id: "inner-core",
            name: "Inner Core",
            emoji: "\u2B50",
            fact: "Right in the middle of the Earth is the inner core — a solid ball of metal that's as hot as the Sun! It stays solid because everything around it squeezes it so tight.",
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
      y: 115,
      width: 22,
      factPanel: {
        title: "Medieval Treasure",
        items: [
          {
            id: "gold-coins",
            name: "Gold Coins",
            emoji: "\u{1FA99}",
            fact: "Long ago, coins were made by hand! A worker would hammer a piece of metal to press a picture onto each side. Every coin was a little different!",
          },
          {
            id: "gemstones",
            name: "Gemstones",
            emoji: "\u{1F48E}",
            fact: "Kings and queens loved sparkly gems like rubies, sapphires, and emeralds. People even believed gems had magic powers — like rubies for bravery!",
          },
          {
            id: "treasure-chests",
            name: "Treasure Chests",
            emoji: "\u{1F4E6}",
            fact: "Treasure chests had big heavy locks and were hidden in secret rooms! Some castles even had secret tunnels that led to the treasure.",
          },
          {
            id: "trade-and-barter",
            name: "Trading",
            emoji: "\u2696\uFE0F",
            fact: "Before people had coins, they swapped things with each other — like trading a chicken for a bag of flour! This was called bartering.",
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
            fact: "The legend says only the true King of England could pull the magical sword from the stone. A young boy named Arthur did it \u2014 and became king!",
          },
          {
            id: "blacksmith",
            name: "The Blacksmith",
            emoji: "\u{1F525}",
            fact: "A blacksmith made swords by heating metal in a super hot fire until it glowed orange, then hammering it into shape. It could take days to make just one sword!",
          },
          {
            id: "types-of-swords",
            name: "Types of Swords",
            emoji: "\u{1F5E1}\uFE0F",
            fact: "Knights had different swords for different jobs! Some were wide for big swings, some were thin for quick jabs, and some were so long you needed two hands to hold them!",
          },
          {
            id: "knighting-ceremony",
            name: "Becoming a Knight",
            emoji: "\u{1F451}",
            fact: "To become a knight, you knelt before the king. He tapped your shoulders with a sword and said \u201CArise, Sir Knight!\u201D It was the proudest day ever!",
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
            fact: "Before pens were invented, people wrote with feathers! They sharpened a goose feather to a point and dipped it in ink. It was called a quill!",
          },
          {
            id: "scroll-making",
            name: "Scroll Making",
            emoji: "\u{1F4DC}",
            fact: "Long ago, people wrote on long rolls of paper called scrolls. Every single letter had to be written by hand — it took a really long time!",
          },
          {
            id: "castle-builders",
            name: "Castle Builders",
            emoji: "\u{1F3F0}",
            fact: "It could take 10 to 20 years to build a castle! Hundreds of workers stacked thousands of heavy stone blocks to make the big walls and towers.",
          },
          {
            id: "knight-armor",
            name: "Knight\u2019s Armour",
            emoji: "\u{1F6E1}\uFE0F",
            fact: "A suit of armour was as heavy as a big dog! Knights had to practice moving and fighting in all that metal since they were little kids.",
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
            fact: "Boys started training to become knights at just 7 years old! They began as pages, then became squires, and finally earned their knighthood.",
          },
          {
            id: "horse-power",
            name: "Horse Power",
            emoji: "🐴",
            fact: "A knight's horse was called a destrier — one of the strongest horses around. It had to carry the knight plus all that heavy armour!",
          },
          {
            id: "coat-of-arms",
            name: "Coat of Arms",
            emoji: "🛡️",
            fact: "Every knight had a special shield design called a coat of arms. It helped people tell who was who during battles when everyone wore helmets!",
          },
          {
            id: "knights-code",
            name: "Knight's Code",
            emoji: "📜",
            fact: "Knights followed a code of chivalry — rules about being brave, honest, and kind. They promised to protect those who couldn't protect themselves.",
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
            fact: "Giant clams can grow over 1 metre wide and weigh as much as a grown-up! They live on coral reefs and can live for over 100 years.",
          },
          {
            id: "pearls",
            name: "Making Pearls",
            emoji: "\u{1F48E}",
            fact: "When a tiny grain of sand gets inside a clam or oyster, it coats it in smooth layers called nacre. Over many years, this becomes a beautiful pearl!",
          },
          {
            id: "shell-homes",
            name: "Shell Homes",
            emoji: "\u{1F3E0}",
            fact: "A clam\u2019s shell is like its house! It builds its shell from minerals in the water, adding new layers as it grows — just like tree rings.",
          },
          {
            id: "filter-feeders",
            name: "How Clams Eat",
            emoji: "\u{1F30A}",
            fact: "Clams eat by sucking in water and catching tiny bits of food in it. One clam can clean a whole bathtub of water every single day!",
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
            fact: "Coral reefs are like underwater rainforests! Even though they're small, they are home to so many fish and sea creatures.",
          },
          {
            id: "village-life",
            name: "Seaside Living",
            emoji: "\u{1F3D6}\uFE0F",
            fact: "People have lived by the sea for thousands of years! They built homes near the water to catch fish and explore the ocean.",
          },
          {
            id: "tides",
            name: "Ocean Tides",
            emoji: "\u{1F30A}",
            fact: "The moon pulls on the ocean and makes the water go up and down every day! When the water goes out, you can find rock pools full of crabs and starfish.",
          },
          {
            id: "sea-creatures",
            name: "Sea Creatures",
            emoji: "\u{1F42C}",
            fact: "The ocean is home to so many animals — from tiny seahorses to huge blue whales! Scientists think there are millions more we haven't even found yet.",
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
            fact: "Octopuses have three hearts! And guess what — their blood is blue, not red! How cool is that?",
          },
          {
            id: "camouflage",
            name: "Master of Disguise",
            emoji: "\u{1F3A8}",
            fact: "Octopuses can change their colour and texture in less than a second! They can look like rocks, coral, or even other sea creatures to hide from predators.",
          },
          {
            id: "smart-creatures",
            name: "Super Smart",
            emoji: "\u{1F9E0}",
            fact: "Octopuses are one of the smartest animals in the ocean. They can solve puzzles, open jars, and even escape from aquarium tanks!",
          },
          {
            id: "eight-arms",
            name: "Eight Arms",
            emoji: "\u{1F419}",
            fact: "Each of an octopus\u2019s eight arms has its own mini brain and hundreds of suckers. They can taste and feel with every single sucker!",
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
            fact: "Coral looks like colourful rock, but it's actually alive! It's made of thousands of tiny animals that build hard shells on top of each other.",
          },
          {
            id: "coral-archways",
            name: "Natural Archways",
            emoji: "\u{1F309}",
            fact: "Ocean waves slowly carve holes through coral walls and make cool archways! Fish love swimming through them like underwater doorways.",
          },
          {
            id: "reef-colours",
            name: "Reef Colours",
            emoji: "\u{1F308}",
            fact: "Coral gets its pretty colours from tiny helpers that live inside it. If the water gets too warm, the helpers leave and the coral turns white!",
          },
          {
            id: "reef-life",
            name: "Reef Life",
            emoji: "\u{1F420}",
            fact: "Coral reefs are like busy underwater cities! So many fish, crabs, and sea animals live there — it's one of the most crowded places in the whole ocean.",
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
      y: -45,
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
        items: [
          {
            id: "how-gears-work",
            name: "How Gears Work",
            emoji: "\u2699\uFE0F",
            fact: "Gears are wheels with teeth that interlock. When one gear turns, it makes the next one spin too \u2014 transferring motion and force from one place to another!",
          },
          {
            id: "gear-ratios",
            name: "Big & Small Gears",
            emoji: "\u{1F504}",
            fact: "A small gear turning a big gear makes it stronger but slower. A big gear turning a small gear makes it faster! That\u2019s how bikes change speed.",
          },
          {
            id: "simple-machines",
            name: "Simple Machines",
            emoji: "\u{1F6E0}\uFE0F",
            fact: "Gears are a type of simple machine! Others are ramps, levers, and pulleys — they all help us do things that would be really hard with just our hands.",
          },
          {
            id: "clockwork",
            name: "Clockwork",
            emoji: "\u{1F570}\uFE0F",
            fact: "Before batteries, clocks ran on gears! You wound them up with a key, and tiny gears inside worked together to move the clock hands round and round.",
          },
        ],
      },
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
            fact: "Wrenches, screwdrivers, and pliers help your hands do things they can't do alone — like gripping really tight or turning things that are stuck!",
          },
          {
            id: "measuring-tools",
            name: "Measuring Tools",
            emoji: "📏",
            fact: "Rulers help builders measure so everything fits just right. Even a tiny mistake can make a whole machine stop working!",
          },
          {
            id: "safety-first",
            name: "Safety First",
            emoji: "🥽",
            fact: "In a workshop, you wear special gear to stay safe! Goggles protect your eyes, gloves protect your hands, and ear covers keep loud noises from hurting your ears.",
          },
          {
            id: "right-tool",
            name: "The Right Tool",
            emoji: "🛠️",
            fact: "Picking the right tool makes everything easier! A hammer is great for nails, but you need a saw to cut wood. The right tool for the right job!",
          },
        ],
      },
    },
    {
      id: "blueprint",
      src: "/assets/discovery rooms/geartown-workshop/blueprint-lights-off.png",
      x: 56,
      y: 70,
      width: 30,
      factPanel: {
        title: "Blueprints",
        items: [
          {
            id: "what-are-blueprints",
            name: "What Are Blueprints?",
            emoji: "📐",
            fact: "Blueprints are like a recipe for building things! Builders draw a plan first so they know exactly where every piece goes before they start.",
          },
          {
            id: "why-blue",
            name: "Why Are They Blue?",
            emoji: "🔵",
            fact: "A long time ago, a special trick turned paper blue with white lines. That's how they got the name blueprints — because they were actually blue!",
          },
          {
            id: "technical-drawing",
            name: "Drawing Plans",
            emoji: "📏",
            fact: "Builders draw pictures of what they want to make from every side — the top, the front, and the side — so they know exactly what it should look like!",
          },
          {
            id: "modern-blueprints",
            name: "Computer Plans",
            emoji: "💻",
            fact: "Today, builders use computers to draw 3D plans! They can spin them around and zoom in to see every little piece before they start building.",
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
            fact: "Energy is what makes things go! Light, heat, and electricity are all types of energy. Without energy, nothing would move or work!",
          },
          {
            id: "electricity",
            name: "Electricity",
            emoji: "🔌",
            fact: "Electricity travels through wires to power lights, toys, and machines! It's like invisible energy zooming through the wires super fast.",
          },
          {
            id: "batteries-and-cells",
            name: "Batteries",
            emoji: "🔋",
            fact: "Batteries store energy inside them so you can use it later. That's how your toys and tablets work even without being plugged in!",
          },
          {
            id: "renewable-energy",
            name: "Energy from Nature",
            emoji: "☀️",
            fact: "We can get energy from the sun, the wind, and flowing water! These never run out, so they can power things forever.",
          },
        ],
      },
    },
    {
      id: "geartown-logo",
      src: "/assets/discovery rooms/geartown-workshop/logo-no-smoke.png",
      x: 56,
      y: 35,
      width: 23,
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
            fact: "Every flower starts as a tiny seed! Inside each seed is a baby plant and a packed lunch of nutrients to help it sprout.",
          },
          {
            id: "photosynthesis",
            name: "Sunlight Power",
            emoji: "\u2600\uFE0F",
            fact: "Plants use sunlight, water, and air to make their own food \u2014 it\u2019s called photosynthesis! The green colour in leaves is what captures the light.",
          },
          {
            id: "bloom",
            name: "Blooming",
            emoji: "\u{1F33A}",
            fact: "When a flower blooms, its petals open to attract bees and butterflies. These visitors carry pollen from flower to flower, helping new seeds grow!",
          },
          {
            id: "roots",
            name: "Roots",
            emoji: "\u{1FAB4}",
            fact: "Roots work like underground straws, sucking up water and minerals from the soil. Some tree roots stretch wider underground than the branches do above!",
          },
        ],
      },
    },
    {
      id: "oxygen-machine",
      src: "/assets/discovery rooms/greenhouse-domes/oxygen-machine.png",
      x: 16,
      y: 48,
      width: 18,
      factPanel: {
        title: "Oxygen Machine",
        items: [
          {
            id: "photosynthesis-process",
            name: "Plant Power",
            emoji: "\u2600\uFE0F",
            fact: "Plants make the air we breathe! They use sunlight and water to make fresh oxygen for us. Thank you, plants!",
          },
          {
            id: "carbon-dioxide",
            name: "Breathing Together",
            emoji: "\u{1F4A8}",
            fact: "When you breathe out, you give plants a gift! Plants grab what you breathe out and use it to help them grow. You help each other!",
          },
          {
            id: "chlorophyll",
            name: "Why Plants Are Green",
            emoji: "\u{1F33F}",
            fact: "Plants are green because of something special inside their leaves that catches sunlight. It\u2019s like a tiny solar panel in every leaf!",
          },
          {
            id: "glucose",
            name: "Plant Food",
            emoji: "\u{1F36C}",
            fact: "Plants make their own food using sunlight — it\u2019s a kind of sugar! They use it to grow taller and make flowers, just like you eat food to grow big and strong.",
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
            fact: "When a seed gets water and warmth, it wakes up and sprouts! The first tiny root pushes down, and a little stem pushes up toward the light.",
          },
          {
            id: "watering",
            name: "Watering",
            emoji: "\u{1F4A7}",
            fact: "Plants drink water through their roots and pull it all the way up to their leaves. A tall tree can move over 100 litres of water a day!",
          },
          {
            id: "soil",
            name: "Soil",
            emoji: "\u{1FAB1}",
            fact: "Soil is full of life! Worms and tiny bugs break down old leaves and turn them into food that helps new plants grow. Soil is like a kitchen for plants!",
          },
          {
            id: "seed-travel",
            name: "Seed Travel",
            emoji: "\u{1F32C}\uFE0F",
            fact: "Seeds have clever ways to travel \u2014 some fly on the wind like tiny helicopters, some float on water, and some hitch a ride on animals\u2019 fur!",
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
            fact: "Each ring in a tree trunk is one year of growth! Count the rings and you know exactly how old the tree was. Some trees have over 4,000 rings!",
          },
          {
            id: "bark",
            name: "Bark",
            emoji: "\u{1F332}",
            fact: "Bark is like a tree\u2019s suit of armour. It protects the living wood inside from insects, disease, fire, and even freezing winter temperatures.",
          },
          {
            id: "sapwood",
            name: "Sapwood",
            emoji: "\u{1F4A7}",
            fact: "The light-coloured wood on the outside of a trunk carries water from the roots all the way up to the leaves — like a straw inside the tree!",
          },
          {
            id: "heartwood",
            name: "Heartwood",
            emoji: "\u{1F9E1}",
            fact: "The dark wood in the middle of a tree is the strongest part. It holds the whole tree up — like a big, sturdy backbone!",
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

/** Returns the list of environment IDs the player has unlocked. */
export function getUnlockedEnvironments(): string[] {
  const trophyCount = countEarnedTrophies();
  return EXPLORE_UNLOCK_ORDER.slice(0, trophyCount);
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
  return tp.trophyRoomComplete ? envId : null;
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
