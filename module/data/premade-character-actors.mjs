const SYSTEM_ID = "part-time-gods";
const SOURCE_BOOK = "Part-Time Gods Second Edition";
const PREGEN_CATEGORY = "Backers' Pregens";

const SKILL_KEYS = [
  "athletics",
  "crafts",
  "deception",
  "discipline",
  "empathy",
  "fighting",
  "fortitude",
  "influence",
  "intuition",
  "knowledge",
  "marksman",
  "medicine",
  "might",
  "perception",
  "perform",
  "speed",
  "stealth",
  "survival",
  "tech",
  "travel"
];

const MANIFESTATION_KEYS = [
  "aegis",
  "beckon",
  "journey",
  "minion",
  "oracle",
  "puppetry",
  "ruin",
  "shaping",
  "soul"
];

const PREGEN_METADATA = [
  ["James Fordham", "God of Darkness", [290, 291]],
  ["Curtis Jasper \"CJ\" Lis", "God of Laughter", [292, 293]],
  ["Todd Ebert", "God of Runners", [294, 295]],
  ["Tessara Winfield", "Goddess of Forensics", [296, 297]],
  ["Tod Browning", "God of Worldbuilding", [298, 299]],
  ["Nathan Underwood", "God of Greed", [300, 301]],
  ["Eden Delerosa", "Goddess of Sex", [302, 303]],
  ["Luke Drury", "God of Nightmares", [304, 305]],
  ["Danielle Frost", "Goddess of Winter", [306, 307]]
];

export const PTG_PREMADE_CHARACTER_ACTORS = PREGEN_METADATA.map(([name, title, sourcePages]) => pregenMetadata({
  name,
  title,
  sourcePages
}));

function pregenMetadata({ name, title, sourcePages }) {
  const slug = slugify(name);

  return {
    name,
    type: "character",
    img: "icons/svg/mystery-man.svg",
    system: {
      identity: {
        concept: title,
        ageEthnicity: "",
        occupation: "",
        archetype: "",
        dominion: "",
        dominionTitle: title,
        dominionPortfolio: "",
        dominionSpecificity: "",
        dominionLimitations: "",
        dominionLandmarkBondUuid: "",
        dominionLandmarkBondName: "",
        theology: ""
      },
      resources: {
        health: resource(0),
        psyche: resource(0),
        fragments: resource(0),
        pantheon: resource(0),
        spark: 1,
        permanentFragmentLoss: 0,
        freeTime: 0,
        freeTimeMax: 0,
        wealth: 0,
        wealthMax: 0,
        occupationFreeTime: 0,
        occupationWealth: 0,
        legendaryActs: "",
        xpGained: 0,
        xpSpent: 0,
        xpPurchases: [],
        resourceLog: []
      },
      mortality: {
        state: "alive",
        timer: "",
        notes: "",
        lastTransitionAt: "",
        reconstitutionDue: "",
        devouredByUuid: "",
        devouredByName: "",
        log: []
      },
      derived: {
        initiative: 0,
        strength: 0,
        movement: 0,
        armor: 0,
        carriedWeight: 0,
        conditionWarnings: []
      },
      skills: ratings(SKILL_KEYS),
      manifestations: ratings(MANIFESTATION_KEYS),
      attachments: {
        bonds: "",
        failings: "",
        relics: "",
        truths: "",
        worshippers: "",
        vassals: ""
      },
      conditions: "",
      specialties: "",
      notes: paragraphs(
        `Metadata-only Backers' Pregens placeholder from ${SOURCE_BOOK}, PDF pp. ${sourcePages.join("-")}.`,
        "Full character prose, stats, and embedded item writeups are intentionally not shipped until publisher permission is confirmed."
      )
    },
    items: [],
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: "backers-pregen",
        category: PREGEN_CATEGORY,
        slug,
        sourceId: `actor:backers-pregen:${slug}`,
        sourceBook: SOURCE_BOOK,
        licensingStatus: "metadata-only",
        source: {
          book: SOURCE_BOOK,
          section: PREGEN_CATEGORY,
          pages: sourcePages.join("-"),
          pdfPages: sourcePages
        }
      }
    }
  };
}

function ratings(keys) {
  return Object.fromEntries(keys.map(key => [key, 0]));
}

function resource(max) {
  return {
    value: 0,
    max: Number(max ?? 0)
  };
}

function paragraphs(...parts) {
  return parts
    .filter(part => String(part ?? "").trim())
    .map(part => `<p>${escapeHTML(part)}</p>`)
    .join("");
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}
