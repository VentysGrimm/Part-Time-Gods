import { PTG_PREMADE_ROLL_TABLES } from "../data/premade-roll-tables.mjs";

const REROLL = "reroll";
const GM_CHOICE = "gm choice";

export function generateRandomGod() {
  const log = [];
  const occupationClass = rollTableText("Random Occupation - Class", log);
  const occupationSubtypeTable = occupationSubtypeTableName(occupationClass);
  const occupation = rollTableText(occupationSubtypeTable, log);
  const occupationCareer = rollTableText(`Random Occupation - ${occupation}`, log);

  const archetypeDrive = rollTableText("Random Archetype - Drive", log);
  const archetype = rollTableText(`Random Archetype - ${archetypeDrive}`, log);

  const dominionType = rollTableText("Random Dominion - Type", log);
  const dominion = rollTableText(`Random Dominion - ${dominionType}`, log);
  const dominionBlessing = rollTableText(`Random Dominion Blessing - ${dominionType}`, log);
  const dominionCurse = rollTableText(`Random Dominion Curse - ${dominionType}`, log);

  const attachmentKind = rollTableText("Random Attachment - Kind", log);
  const attachment = rollTableText(`Random Attachment - ${attachmentKind}`, log);
  const theology = rollTableText("Random Theology", log);
  const identity = generateDivineIdentity({
    occupation,
    archetype,
    dominion,
    theology
  });

  return {
    choices: {
      occupation,
      occupationCareer,
      archetype,
      domain: dominionType,
      theology
    },
    notes: {
      dominion,
      dominionBlessing,
      dominionCurse,
      attachmentKind,
      attachment
    },
    identity,
    log
  };
}

export function generateDivineIdentity({ occupation = "", archetype = "", dominion = "", theology = "" } = {}) {
  const portfolio = cleanPrompt(dominion) || cleanPrompt(archetype) || "Crossroads";
  const archetypeTheme = cleanPrompt(archetype) || "Wanderer";
  const theologyTheme = cleanPrompt(theology) || "Household Saints";
  const occupationTheme = cleanPrompt(occupation) || "Mortal Work";
  const tone = pick([
    "tender and uncanny",
    "bright and dangerous",
    "quietly ominous",
    "street-level mythic",
    "merciful but demanding",
    "strange and celebratory"
  ]);
  const name = `${pick(NAME_PREFIXES)} ${pick(NAME_SUFFIXES)}`;
  const title = `${pick(TITLE_OPENERS)} ${portfolio}`;
  const epithet = `${pick(EPITHET_OPENERS)} ${archetypeTheme}`;
  const symbol = `${pick(SYMBOLS)} marked with ${portfolio.toLowerCase()}`;
  const omen = `${pick(OMENS)} when ${portfolio.toLowerCase()} is near`;
  const taboo = `${pick(TABOOS)} when ${archetypeTheme.toLowerCase()} is at stake`;
  const offering = `${pick(OFFERINGS)} from ${occupationTheme.toLowerCase()} life`;
  const mythSeed = `${name} first woke as ${title.toLowerCase()} after ${pick(MYTH_SEEDS)}. Their ${theologyTheme} theology colors the miracle as ${tone}.`;

  return {
    concept: `God/dess of ${portfolio}`,
    divineName: name,
    divineTitle: title,
    divineEpithet: epithet,
    divineSymbol: symbol,
    divineOmen: omen,
    divineTaboo: taboo,
    divineOffering: offering,
    divineMythSeed: mythSeed,
    divineTone: tone
  };
}

function occupationSubtypeTableName(occupationClass) {
  return {
    Strangers: "Random Occupation - Strangers Subtype",
    "Low Class": "Random Occupation - Low Class Subtype",
    "Middle Class": "Random Occupation - Middle Class Subtype",
    "Upper Class": "Random Occupation - Upper Class Subtype"
  }[occupationClass] ?? "Random Occupation - Strangers Subtype";
}

function rollTableText(name, log, depth = 0) {
  const table = PTG_PREMADE_ROLL_TABLES.find(candidate => candidate.name === name);
  if (!table) {
    log.push(`${name}: GM Choice (missing table)`);
    return "GM Choice";
  }

  const total = rollFormula(table.formula);
  const result = table.results.find(row => total >= row.range[0] && total <= row.range[1])?.text ?? "GM Choice";
  log.push(`${name}: ${total} -> ${result}`);

  const normalized = normalize(result);
  if (normalized === REROLL && depth < 20) return rollTableText(name, log, depth + 1);
  if (normalized === GM_CHOICE) return "GM Choice";
  return result;
}

function rollFormula(formula) {
  const match = String(formula ?? "1d10").match(/^(\d+)d(\d+)$/i);
  if (!match) return 1;

  const dice = Number(match[1]);
  const faces = Number(match[2]);
  let total = 0;
  for (let index = 0; index < dice; index += 1) {
    total += Math.floor(Math.random() * faces) + 1;
  }
  return total;
}

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function cleanPrompt(value) {
  return String(value ?? "")
    .replace(/^the\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function pick(options) {
  return options[Math.floor(Math.random() * options.length)] ?? options[0] ?? "";
}

const NAME_PREFIXES = [
  "Aurel",
  "Briar",
  "Cassian",
  "Dove",
  "Eris",
  "Hallow",
  "Iris",
  "Jun",
  "Lumen",
  "Morrow",
  "Nix",
  "Sable"
];

const NAME_SUFFIXES = [
  "of the Last Door",
  "Under Neon Rain",
  "Who Keeps the Match",
  "of Small Mercies",
  "Behind the Siren",
  "of the Borrowed Crown",
  "in the Broken Choir",
  "Who Counts the Windows",
  "of Salt and Static",
  "at the Ninth Hour"
];

const TITLE_OPENERS = [
  "Keeper of",
  "Witness of",
  "Patron of",
  "Saint of",
  "Herald of",
  "Guardian of",
  "Thief of",
  "Voice of"
];

const EPITHET_OPENERS = [
  "the Uninvited",
  "the Patient",
  "the Hungry",
  "the Velvet",
  "the Last",
  "the Laughing",
  "the Iron",
  "the Candlelit"
];

const SYMBOLS = [
  "a cracked phone screen",
  "a brass key",
  "a moth-wing halo",
  "a red thread bracelet",
  "a receipt folded into a prayer",
  "a coin warm to the touch",
  "a black candle",
  "a subway token"
];

const OMENS = [
  "lights flicker twice",
  "dogs grow silent",
  "old songs play from dead speakers",
  "rain beads upward on glass",
  "strangers remember the same dream",
  "mirrors show a doorway",
  "salt appears on thresholds",
  "traffic signals turn violet"
];

const TABOOS = [
  "never refuse a sincere apology",
  "never step over spilled blood",
  "never break bread with a liar",
  "never ignore a ringing phone",
  "never enter by the front door",
  "never speak a true name after sunset",
  "never leave a debt uncounted",
  "never accept a gift wrapped in blue"
];

const OFFERINGS = [
  "coffee poured at dawn",
  "a handwritten apology",
  "bus fare left under a stone",
  "a repaired tool",
  "a secret kept for one night",
  "a candle burned beside running water",
  "a song hummed under the breath",
  "a shared meal with an empty chair"
];

const MYTH_SEEDS = [
  "choosing a Bond over an easy miracle",
  "answering a prayer meant for someone else",
  "lying to an Outsider and surviving",
  "finding a shrine in an ordinary workplace",
  "turning a failed errand into a holy sign",
  "bleeding on a forgotten threshold",
  "protecting a stranger from divine attention",
  "making a promise no mortal could keep"
];
