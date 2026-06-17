export const PTG_PREMADE_ITEMS = [
  truth("Aquatic", 117, "is one with the sea.", "Breathe underwater and gain a bonus while acting in a body of water."),
  truth("Armored", 117, "is tougher than they appear.", "Choose a damage source. Gain scaling armor against that source."),
  truth("Aura of Influence", 117, "is truly stunning or terrifying to behold.", "Spend a Fragment to project awe or fear over mortals in the scene."),
  truth("Bane", 117, "is the bane of all...", "Gain bonuses against a chosen creature or foe type."),
  truth("Beast Form", 117, "can turn into a...", "Spend a Fragment to take a chosen animal form for a scene."),
  truth("Beast Tongue", 118, "can talk to animals.", "Speak with one chosen animal type, with Fragment use expanding this for a scene."),
  truth("Colossal Size", 118, "can become as big as a giant.", "Spend a Fragment to grow larger, gaining durability, strength, and damage."),
  truth("Divinely Skilled", 118, "never fails at...", "Choose a specialty that gains a bonus and treats failures as one success."),
  truth("Extra Appendages", 118, "has been gifted with additional...", "Spend a Fragment to grow extra arms, a head, or legs for scene benefits."),
  truth("First Move", 119, "is always a step ahead.", "Gain initiative and spend a Fragment to act before others for several rounds."),
  truth("Flight", 119, "can fly among the clouds.", "Spend a Fragment to fly at increased movement."),
  truth("Healing Hands", 119, "can heal with a touch.", "Use divine healing to restore Health, Psyche, or reduce Conditions."),
  truth("Immunity", 119, "can't be harmed by...", "Choose one effect the god is completely immune to."),
  truth("Lash", 119, "can harm you with a stare.", "Spend a Fragment to attack at sight range with divine force."),
  truth("Natural Weapons", 119, "is never unarmed.", "Manifest claws, horns, or similar weapons with the Brutal quality."),
  truth("Otherworldly Sight", 119, "cannot be fooled by illusions.", "Spend a Fragment to sense supernatural presence and pierce disguises or illusions."),
  truth("Regeneration", 120, "recovers quickly when scarred.", "Improve natural healing and spend a Fragment for immediate recovery."),
  truth("Soothing Aura", 120, "is a calming influence on others.", "Reduce aggression and initiative around the god."),
  truth("Telepathy", 120, "can speak with others with their mind.", "Communicate mentally with visible targets, or spend a Fragment for greater reach."),
  truth("Tongues", 120, "is not limited by language.", "Understand unfamiliar languages after exposure, or spend a Fragment to skip the delay."),
  truth("Unobscured Eyes", 120, "cannot be blinded.", "Ignore sight impairment from darkness, smoke, injury, and similar effects."),
  truth("Visions", 120, "is visited by prophecy in the night.", "Receive prophetic dreams that may require interpretation."),

  relic("Chalice of Attraction", 1, 111, "+2 Influence", "Produces divine wine that improves social presence for a day."),
  relic("Obscuring Cigar", 1, 111, "Impaired Sight 2", "Creates concealing smoke while sparing its owner from the sight penalty."),
  relic("Skeleton Key", 1, 111, "Unlocks mundane locks", "Opens doors, padlocks, and similar mechanical locks, but not modern electronic systems."),
  relic("Your Story", 1, 111, "Spend 1 Free Time", "A living book that records the owner's life and may reveal context they missed."),
  relic("Blessed Whetstone", 2, 112, "+2 weapon damage", "Sharpens a blade for the scene, with Fragment use extending the effect to allies."),
  relic("Fortune's Favor", 2, 112, "Boost on 2 successes", "A lucky coin that lowers the successes needed for a Boost on the next roll."),
  relic("Mirrored Shield", 2, 112, "+1 physical Defense", "Can reflect a resisted supernatural effect back at its source."),
  relic("Storm Bowl", 2, 112, "Weather control", "Uses blood and water to call rain, storms, or stronger disasters with Fragment use."),
  relic("Cloak of Invisibility", 3, 112, "Invisible for 1 Fragment", "Turns the owner invisible until combat or obvious disturbance breaks the effect."),
  relic("Mercury's Boots", 3, 113, "+5 Movement while flying", "Winged footwear that grants flight but can require control checks for stunts."),
  relic("Scarab of Eternity", 3, 113, "Death ward", "Is destroyed to spare the god from permanent loss when they die."),
  relic("Whispering Rings", 3, 113, "Telepathic bond", "A matched pair of rings that links two wearers emotionally and mentally."),
  relic("Ancient Timepiece", 4, 113, "+2 Free Time each Session", "Makes time for the owner and can rewind failed dice with Fragment use."),
  relic("Metalwood Bat", 4, 113, "+4 Might, +2 damage", "A mythic club that hits hard and can deafen nearby foes with Fragment use."),
  relic("Tempest Trident", 4, 113, "+2 Beckon, +3 damage", "A sea-linked weapon that senses and amplifies nearby water."),
  relic("Eternal Coffin", 5, 114, "Suspends age", "Preserves those inside and can consume a victim's soul at terrible cost."),
  relic("The Ill Wind", 5, 114, "+2 Marksman, +4 damage", "A divine sniper rifle that can grant a perfect-shot Truth for a scene."),
  relic("Maelstrom Armor", 5, 114, "Armor 2, fear aura", "Summoned armor that protects body and mind and terrifies enemies."),

  worshipper("Chosen One", 1, 122, "A singular favored worshipper who can act as a vessel for the god's power."),
  worshipper("Confidants", 1, 123, "Followers who comfort and heal the god through devoted attention."),
  worshipper("The Faithful", 1, 123, "Core believers whose prayers can restore temporary Fragments."),
  worshipper("Givers", 1, 123, "Supporters who provide temporary Wealth through offerings and sacrifice."),
  worshipper("Preachers", 1, 123, "Evangelists who reduce the cost of gaining more Worshippers."),
  worshipper("Temple Keepers", 1, 124, "Caretakers of sacred sites who empower Manifestation checks there."),
  worshipper("Zealots", 1, 124, "Fanatical followers willing to do dangerous or terrible work."),

  bond("Individual Bond", "individual", 106, "A person who connects the god to mortal life."),
  bond("Group Bond", "group", 107, "A social circle, crew, community, or organization tied to the god."),
  bond("Landmark Bond", "landmark", 107, "A meaningful place that anchors the god and may affect territory."),

  curse("Apathy", "Failing", 108, 0, "Emotional numbness penalizes emotional checks but makes the god harder to read."),
  curse("Blood Thirsty", "Failing", 108, 0, "Violent fixation harms Defense but improves attacks against a chosen target."),
  curse("Cowardice", "Failing", 108, 0, "Fear weakens resolve but helps the god flee danger."),
  curse("Envy", "Failing", 108, 0, "Coveting what others have weakens Attachments but helps taking from others."),
  curse("Guilt", "Failing", 108, 0, "Past mistakes cloud choices but deepen empathy with pain."),
  curse("Hatred", "Failing", 109, 0, "Rage disrupts calm action but fuels close combat damage."),
  curse("Hoarder", "Failing", 109, 0, "An obsession is hard to resist but can justify unsanctioned Pantheon Dice use."),
  curse("Power", "Failing", 109, 0, "Control obsession drains resources but eases acquisition of assets."),
  curse("Self-Destruction", "Failing", 109, 0, "Danger becomes seductive, worsening incoming harm but stiffening against fear."),
  curse("Vengeance", "Failing", 110, 0, "Retaliation becomes difficult to resist but helps when pursuing payback."),

  vassal("Custom Vassal", 1, 121, "A mythological creature, Outsider, or supernatural ally bound to the god."),

  armor("Armored Jumpsuit", 2, 4, "Resistant, Light", 210),
  armor("Asbestos Suit", 0, 2, "Fireproof 2, Weak", 210),
  armor("Breastplate", 2, 4, "Practical, Resistant", 210),
  armor("Buckler", 1, 4, "Light, Practical, Shield, Fragile", 210),
  armor("Bulletproof Vest", 1, 4, "Bulletproof 1, Light", 210),
  armor("Coral Shield", 1, 5, "Aquatic, Magical, Shield, Bulky", 210),
  armor("Enchanted Leather Jacket", 2, 5, "Fragile, Light, Resistant, Subtle", 210),
  armor("Full Plate", 4, 5, "Cumbersome, Heavy, Resistant", 210),
  armor("Golden Plate", 4, 5, "Magical, Heavy", 210),
  armor("Hazmat Suit", 0, 2, "Radiation-proof 2, Weak", 210),
  armor("Hockey Pads", 3, 2, "Bargain, Heavy", 210),
  armor("Riot Shield", 3, 4, "Shield, Heavy", 210),
  armor("Scuba Gear", 1, 3, "Aquatic, Cold-proof 2, Weak", 210),
  armor("Tactical Gear", 2, 7, "Bulletproof 2, Light, Resistant, Expensive", 210),

  weapon("Derringer", 1, "Far", 5, "Concealable, Loud, Quick, Ranged", 211),
  weapon("Handgun", 1, "Far", 5, "Brutal 2, Loud, Ranged", 211),
  weapon("Knife", 1, "Close", 4, "Concealable, Sharp", 211),
  weapon("Police Baton", 1, "Close", 2, "Crushing, Defending", 211),
  weapon("Rapier", 1, "Close", 4, "Piercing, Defending", 211),
  weapon("Shotgun", 1, "Far", 4, "Brutal 2, Loud, Ranged, Reload", 212),
  weapon("Submachine Gun", 1, "Far", 9, "Autofire, Brutal 3, Loud, Ranged, Reload", 212),
  weapon("Sword", 1, "Close", 4, "Brutal, Sharp", 212),
  weapon("Whip", 1, "Near", 4, "Restraining, Reach, Sharp, Fragile", 212)
];

export async function importPremadeItems({ notify = true } = {}) {
  const existing = new Set(
    game.items
      .filter(item => item.getFlag("part-time-gods", "premade"))
      .map(item => `${item.type}:${item.name}`)
  );

  const items = PTG_PREMADE_ITEMS.filter(item => !existing.has(`${item.type}:${item.name}`));

  if (!items.length) {
    if (notify) ui.notifications.info("Part-Time Gods premade items are already imported.");
    return [];
  }

  const folders = await createPremadeFolders(items);
  const created = await Item.createDocuments(items.map(item => ({
    ...item,
    folder: folders[item.type]?.id
  })));

  if (notify) ui.notifications.info(`Imported ${created.length} Part-Time Gods premade items.`);

  return created;
}

async function createPremadeFolders(items) {
  const folders = {};
  const types = Array.from(new Set(items.map(item => item.type)));

  for (const type of types) {
    const label = typeLabels[type] ?? `${type[0].toUpperCase()}${type.slice(1)}s`;
    const name = `PTG Premade ${label}`;
    let folder = game.folders.find(existing => existing.type === "Item" && existing.name === name);

    if (!folder) {
      folder = await Folder.create({
        name,
        type: "Item",
        sorting: "a"
      });
    }

    folders[type] = folder;
  }

  return folders;
}

function truth(name, page, statement, effect) {
  return baseItem("truth", name, page, {
    statement,
    rank: 1,
    cost: 2,
    fragmentCost: effect.includes("Spend a Fragment") ? 1 : 0,
    activation: effect.includes("Spend") ? "action" : "passive",
    effect: paragraph(effect),
    notes: source(page)
  });
}

function relic(name, level, page, bonus, effect) {
  return baseItem("relic", name, page, {
    level,
    cost: level,
    bonus,
    effect: paragraph(effect),
    description: "",
    notes: source(page)
  });
}

function worshipper(name, level, page, benefit) {
  return baseItem("worshipper", name, page, {
    level,
    group: name,
    size: "",
    benefit: paragraph(benefit),
    description: "",
    notes: source(page)
  });
}

function bond(name, kind, page, description) {
  return baseItem("bond", name, page, {
    kind,
    level: 1,
    strain: {
      value: 0,
      max: 1
    },
    description: paragraph(description),
    notes: source(page)
  });
}

function curse(name, sourceName, page, pantheonDice, effect) {
  return baseItem("curse", name, page, {
    source: sourceName,
    trigger: "",
    pantheonDice,
    effect: paragraph(effect),
    notes: source(page)
  });
}

function vassal(name, level, page, benefit) {
  return baseItem("vassal", name, page, {
    level,
    concept: "",
    loyalty: 0,
    benefit: paragraph(benefit),
    description: "",
    notes: source(page)
  });
}

function armor(name, rating, cost, quality, page) {
  return baseItem("armor", name, page, {
    amount: 1,
    weight: 0,
    held: true,
    equipped: false,
    rating,
    cost,
    quality,
    description: paragraph(`${name}: ${quality}.`),
    notes: source(page)
  });
}

function weapon(name, damage, range, cost, quality, page) {
  return baseItem("weapon", name, page, {
    amount: 1,
    weight: 0,
    held: true,
    equipped: false,
    damage,
    range,
    cost,
    quality,
    description: paragraph(`${name}: ${quality}.`),
    notes: source(page)
  });
}

function baseItem(type, name, page, system) {
  return {
    name,
    type,
    img: defaultIcon(type),
    system,
    flags: {
      "part-time-gods": {
        premade: true,
        source: "Part-Time Gods Second Edition",
        page
      }
    }
  };
}

function paragraph(text) {
  return `<p>${escapeHTML(text)}</p>`;
}

function source(page) {
  return `<p>Source: Part-Time Gods Second Edition, p. ${page}.</p>`;
}

function escapeHTML(text) {
  return text.replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

function defaultIcon(type) {
  const icons = {
    armor: "icons/equipment/chest/breastplate-layered-steel.webp",
    bond: "icons/sundries/documents/document-sealed-red.webp",
    curse: "icons/magic/unholy/silhouette-robe-evil-power.webp",
    relic: "icons/commodities/treasure/token-runed-os-grey.webp",
    truth: "icons/magic/symbols/rune-sigil-black-pink.webp",
    vassal: "icons/creatures/magical/spirit-undead-winged-blue.webp",
    weapon: "icons/weapons/swords/sword-guard.webp",
    worshipper: "icons/environment/people/group.webp"
  };

  return icons[type] ?? "icons/svg/item-bag.svg";
}

const typeLabels = {
  armor: "Armor",
  bond: "Bonds",
  curse: "Curses and Failings",
  relic: "Relics",
  truth: "Truths",
  vassal: "Vassals",
  weapon: "Weapons",
  worshipper: "Worshippers"
};
