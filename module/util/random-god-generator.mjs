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
    log
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
