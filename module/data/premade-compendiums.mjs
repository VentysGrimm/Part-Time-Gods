import { PTG_PREMADE_CHOICES } from "./premade-choices.mjs";
import { PTG_PREMADE_ITEMS } from "./premade-items.mjs";

const PACKS = {
  choices: "part-time-gods.character-creation",
  items: "part-time-gods.premade-items"
};

export async function populatePremadeCompendiums({ notify = true } = {}) {
  const choices = await populatePack(PACKS.choices, PTG_PREMADE_CHOICES);
  const items = await populatePack(PACKS.items, PTG_PREMADE_ITEMS);
  const total = choices + items;

  if (notify) {
    const message = total > 0
      ? `Added ${total} Part-Time Gods entries to system compendiums.`
      : "Part-Time Gods compendiums are already populated.";

    ui.notifications.info(message);
  }

  return total;
}

async function populatePack(packId, documents) {
  const pack = game.packs.get(packId);

  if (!pack) {
    ui.notifications.warn(`Missing Part-Time Gods compendium: ${packId}`);
    return 0;
  }

  await pack.getIndex({ fields: ["name", "type"] });

  const existing = new Set(pack.index.map(entry => `${entry.type}:${entry.name}`));
  const missing = documents.filter(document => !existing.has(`${document.type}:${document.name}`));

  if (!missing.length) return 0;

  const wasLocked = pack.locked;
  if (wasLocked) await pack.configure({ locked: false });

  await Item.createDocuments(missing, { pack: pack.collection });

  if (wasLocked) await pack.configure({ locked: true });

  return missing.length;
}
