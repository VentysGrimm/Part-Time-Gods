import { PTG_PREMADE_CHARACTER_ACTORS } from "./premade-character-actors.mjs";

const SYSTEM_ID = "part-time-gods";

function antagonist(name, category, sourcePage, system) {
  const slug = slugify(name);

  return {
    name,
    type: "antagonist",
    img: "icons/svg/mystery-man.svg",
    system: {
      antagonistType: category,
      rank: system.rank ?? "",
      threat: Number(system.threat ?? 1),
      threshold: Number(system.threshold ?? 1),
      health: Number(system.threshold ?? 1),
      psyche: Number(system.psyche ?? system.threshold ?? 1),
      armor: Number(system.armor ?? 0),
      spark: Number(system.spark ?? 0),
      fragments: Number(system.fragments ?? 0),
      attack: Number(system.attack ?? 1),
      defense: Number(system.defense ?? 1),
      initiative: Number(system.initiative ?? 0),
      damage: Number(system.damage ?? 1),
      skills: system.skills ?? "",
      powers: system.powers ?? "",
      conditionHandling: system.conditionHandling ?? conditionHandlingForRank(system.rank),
      sourcePage,
      description: system.description ?? "",
      notes: system.notes ?? ""
    },
    flags: {
      [SYSTEM_ID]: {
        premade: true,
        kind: "opposition-actor",
        category,
        slug,
        sourceId: `actor:opposition:${slug}`,
        powerHooks: system.powerHooks ?? [],
        source: {
          book: "Part-Time Gods Second Edition",
          page: sourcePage
        }
      }
    }
  };
}

function slugify(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function openAntagonistBuilder() {
  if (!game.user?.isGM) {
    ui.notifications.warn("Only a GM can create Opposition actors.");
    return null;
  }

  const { DialogV2 } = foundry.applications.api;
  const selection = await DialogV2.prompt({
    window: {
      title: "PTG Opposition Builder",
      resizable: true
    },
    position: {
      width: 620,
      height: 620
    },
    content: `
      <div class="ptg-roll-dialog">
        <div class="form-group">
          <label>Name</label>
          <input type="text" name="name" value="Custom Antagonist">
        </div>
        <div class="form-group">
          <label>Category</label>
          <select name="category">
            <option>Animals</option>
            <option>Mortals</option>
            <option>The Touched</option>
            <option>Other Gods</option>
            <option>Outsiders</option>
          </select>
        </div>
        <div class="form-group">
          <label>Power Band</label>
          <select name="band">
            ${Object.entries(CUSTOM_ANTAGONIST_BANDS).map(([key, band]) => `<option value="${key}">${band.label}</option>`).join("")}
          </select>
        </div>
        <div class="form-group">
          <label>Rank</label>
          <select name="rank">
            <option>Legion</option>
            <option>Squad</option>
            <option>Warrior</option>
            <option>Master</option>
            <option>Grand Master</option>
            <option>Novice</option>
            <option>Veteran</option>
            <option>Exemplar</option>
          </select>
        </div>
        <div class="form-group">
          <label>Skills</label>
          <input type="text" name="skills" value="" placeholder="Fighting, Influence, Stealth">
        </div>
        <div class="form-group">
          <label>Powers / Rules Notes</label>
          <textarea name="powers" rows="5" placeholder="Book powers, custom abilities, Conditions, or GM notes"></textarea>
        </div>
        <div class="form-group">
          <label>Conditions</label>
          <textarea name="conditionHandling" rows="3" placeholder="Leave blank to use PTG2E default by rank."></textarea>
        </div>
        <div class="form-group">
          <label>Source Page</label>
          <input type="number" name="sourcePage" value="259" min="0">
        </div>
      </div>
    `,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Create Actor",
      callback: (event, button) => {
        const form = button.form;
        return {
          name: form.elements.name?.value?.trim() || "Custom Antagonist",
          category: form.elements.category?.value ?? "Mortals",
          band: form.elements.band?.value ?? "medium",
          rank: form.elements.rank?.value ?? "Warrior",
          skills: form.elements.skills?.value ?? "",
          powers: form.elements.powers?.value ?? "",
          conditionHandling: form.elements.conditionHandling?.value ?? "",
          sourcePage: Number(form.elements.sourcePage?.value ?? 259)
        };
      }
    }
  });

  if (!selection) return null;

  const folder = await ensureOppositionFolder(selection.category);
  const band = CUSTOM_ANTAGONIST_BANDS[selection.band] ?? CUSTOM_ANTAGONIST_BANDS.medium;
  const actor = await Actor.create({
    ...antagonist(selection.name, selection.category, selection.sourcePage, {
      ...band,
      rank: selection.rank,
      skills: selection.skills || `${band.skills} dice, GM-defined Skills`,
      powers: paragraph(selection.powers || "Custom antagonist created from the PTG2E Custom Antagonists table."),
      conditionHandling: selection.conditionHandling || conditionHandlingForRank(selection.rank),
      description: `<p>Custom ${selection.category} antagonist using the ${band.label} custom-antagonist band.</p>`,
      notes: "<p>Created with the PTG Opposition Builder. Adjust fields to match the scene and source entry.</p>"
    }),
    folder: folder?.id
  }, { renderSheet: true });

  return actor;
}

async function ensureOppositionFolder(category) {
  const folderName = `PTG Opposition - ${category}`;
  const existing = game.folders.find(folder => folder.type === "Actor" && folder.name === folderName);
  if (existing) return existing;

  return Folder.create({
    name: folderName,
    type: "Actor",
    sorting: "a"
  });
}

function paragraph(value) {
  return `<p>${escapeHTML(value)}</p>`;
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

function conditionHandlingForRank(rank) {
  return ["Squad", "Legion"].includes(rank)
    ? "Conditions that would affect one individual are taken as damage instead."
    : "May take Conditions normally, limited to three Conditions.";
}

const CUSTOM_ANTAGONIST_BANDS = {
  low: {
    label: "Low",
    threat: 1,
    threshold: 5,
    armor: 0,
    spark: 1,
    fragments: 2,
    attack: 5,
    defense: 5,
    initiative: 2,
    damage: 0,
    skills: "3"
  },
  medium: {
    label: "Medium",
    threat: 2,
    threshold: 10,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 7,
    defense: 7,
    initiative: 4,
    damage: 1,
    skills: "4"
  },
  high: {
    label: "High",
    threat: 3,
    threshold: 15,
    armor: 2,
    spark: 3,
    fragments: 6,
    attack: 10,
    defense: 10,
    initiative: 8,
    damage: 2,
    skills: "4"
  },
  adept: {
    label: "Adept",
    threat: 4,
    threshold: 20,
    armor: 2,
    spark: 4,
    fragments: 8,
    attack: 13,
    defense: 13,
    initiative: 10,
    damage: 3,
    skills: "5"
  },
  divine: {
    label: "Divine",
    threat: 5,
    threshold: 25,
    armor: 3,
    spark: 5,
    fragments: 10,
    attack: 16,
    defense: 16,
    initiative: 13,
    damage: 4,
    skills: "6"
  }
};

export const PTG_PREMADE_ACTORS = [
  ...PTG_PREMADE_CHARACTER_ACTORS,
  antagonist("Animal Swarm", "Animals", 219, {
    rank: "Legion",
    threat: 3,
    threshold: 15,
    armor: 1,
    attack: 8,
    defense: 8,
    initiative: 5,
    damage: 1,
    skills: "Athletics, Survival, Speed (3 dice)",
    powers: "<p><strong>Stung:</strong> At the beginning of each round, nearby combatants risk damage, Overwhelmed 1, or increased Difficulty if they fail Fortitude + Survival.</p><p><strong>Swarm:</strong> Takes over the battlefield and receives 2 Actions per Turn as a Legion.</p>",
    description: "<p>Locusts, snakes, ants, squirrels, wasps, or similar small animals that become dangerous in large numbers.</p>"
  }),
  antagonist("Large Animal", "Animals", 220, {
    rank: "Master",
    threat: 4,
    threshold: 10,
    armor: 1,
    attack: 8,
    defense: 8,
    initiative: 6,
    damage: 2,
    skills: "Athletics, Fortitude, Might, Perception, Survival (4 dice)",
    powers: "<p><strong>Mount:</strong> Can serve as a mount where appropriate, using its Movement instead of the rider's.</p><p><strong>Strong as an Ox:</strong> Can become enraged when threatened, gaining a Might bonus for the battle.</p><p><strong>Trample:</strong> Can add damage and inflict Unconscious 1 on a Boost.</p>",
    description: "<p>A large mundane threat or potential mount used for mythic-scale animal encounters.</p>"
  }),
  antagonist("Massive Animal", "Animals", 220, {
    rank: "Grand Master",
    threat: 5,
    threshold: 17,
    armor: 2,
    attack: 10,
    defense: 10,
    initiative: 8,
    damage: 3,
    skills: "Athletics, Fighting, Fortitude, Might, Survival (5 dice)",
    powers: "<p><strong>Pain Tolerance:</strong> Ignores Pain Conditions and the first 5 damage dealt during a Battle.</p><p><strong>Size Matters:</strong> Hits knock targets back based on Strength; large knockback also knocks the target down and costs their next Quick Action.</p>",
    description: "<p>Whales, elephants, hippos, or similar huge animals that act as battlefield-scale threats or obstacles.</p>",
    powerHooks: ["condition-immunity:pain", "damage-reduction:5", "forced-movement"]
  }),
  antagonist("Average Person", "Mortals", 221, {
    rank: "Warrior",
    threat: 1,
    threshold: 7,
    armor: 0,
    attack: 4,
    defense: 3,
    initiative: 3,
    damage: 1,
    skills: "Four GM-chosen skills (3 dice)",
    powers: "<p><strong>Special Talent:</strong> One Skill receives a +3 bonus, for a +6 total bonus.</p>",
    description: "<p>A mundane person with a single notable talent, useful as a bystander, witness, or minor complication.</p>",
    powerHooks: ["skill-bonus"]
  }),
  antagonist("Con Artist", "Mortals", 221, {
    rank: "Warrior",
    threat: 3,
    threshold: 9,
    armor: 0,
    attack: 5,
    defense: 5,
    initiative: 5,
    damage: 1,
    skills: "Deception, Discipline, Empathy, Influence, Perception, Stealth (3 dice)",
    powers: "<p><strong>Silver Tongue:</strong> In a Battle of Wits, other participants take Convinced 1 and mental damage converts into more Convinced levels until Level 5.</p><p><strong>What Do I Want?:</strong> On a social Boost, can learn leverage about a god's Bond and start a blackmail plan that can cost Wealth, Psyche, and Bond Strain.</p>",
    description: "<p>A stealthy, charming manipulator who earns trust before exploiting a god or their attachments.</p>",
    powerHooks: ["condition:convinced", "bond-strain", "resource:wealth", "damage:psyche"]
  }),
  antagonist("The Boss", "Mortals", 222, {
    rank: "Grand Master",
    threat: 5,
    threshold: 20,
    armor: 4,
    attack: 9,
    defense: 15,
    initiative: 5,
    damage: 2,
    skills: "Deception, Discipline, Influence, Intuition, Knowledge, Speed (5 dice)",
    powers: "<p><strong>Always Protected:</strong> Can bring henchmen into a direct fight.</p><p><strong>Listen to Me:</strong> Can drain Free Time instead of dealing damage.</p><p><strong>With the Snap of My Fingers:</strong> Uses wealth, status, and underlings to pressure targets.</p>",
    description: "<p>A politician, executive, crime boss, or other protected mortal power broker.</p>"
  }),
  antagonist("Cultist", "Mortals", 222, {
    rank: "Warrior",
    threat: 3,
    threshold: 9,
    armor: 2,
    attack: 5,
    defense: 5,
    initiative: 5,
    damage: 3,
    skills: "Athletics, Discipline, Fighting, Speed (4 dice)",
    powers: "<p><strong>Belief Keeps Me Safe:</strong> Can resist Manifestations from gods outside their own faith.</p><p><strong>Gift from the God:</strong> Carries or has access to a level 2 Relic.</p>",
    description: "<p>A devoted mortal backed by divine power and dangerous faith.</p>"
  }),
  antagonist("Internet Personality", "Mortals", 223, {
    rank: "Warrior",
    threat: 2,
    threshold: 9,
    armor: 0,
    attack: 3,
    defense: 3,
    initiative: 5,
    damage: 1,
    skills: "Empathy, Influence, Perform, Speed, Tech (4 dice)",
    powers: "<p><strong>Doxing:</strong> Uses Influence + Tech to expose a target, gaining +2 in a Battle of Wits on success.</p><p><strong>Power of the Internet:</strong> Can spread rumors, harassment, and doxing to Strain a target's Bonds.</p>",
    description: "<p>A public-facing mortal who weaponizes followers, fame, and online reach.</p>",
    powerHooks: ["condition:social", "bond-strain", "skill-bonus"]
  }),
  antagonist("Mob", "Mortals", 223, {
    rank: "Legion",
    threat: 4,
    threshold: 20,
    armor: 1,
    attack: 10,
    defense: 10,
    initiative: 5,
    damage: 2,
    skills: "Athletics, Fortitude, Fighting, Might, Perception (4 dice)",
    powers: "<p><strong>No Barrier Can Hold Us:</strong> Gains +3 to break through barriers such as barricades and short walls.</p><p><strong>Rampant Destruction:</strong> In a god's Territory, deals 1 Strain to the associated Attachment each Scene.</p>",
    description: "<p>Rioters, protesters, cultists, or another large mortal crowd dangerous enough to act as a Legion.</p>",
    powerHooks: ["skill-bonus", "attachment-strain", "legion-actions"]
  }),
  antagonist("Street Fighter", "Mortals", 224, {
    rank: "Warrior",
    threat: 3,
    threshold: 9,
    armor: 2,
    attack: 7,
    defense: 7,
    initiative: 3,
    damage: 2,
    skills: "Discipline, Fighting, Fortitude, Influence, Might (3 dice)",
    powers: "<p><strong>Improvised Weapons:</strong> Equips nearby objects without an action and ignores 1 level of Armor with the weapon.</p><p><strong>Keep Going:</strong> Ignores penalties from dangerous footing such as ice or wet pavement.</p>",
    description: "<p>A brawler, petty criminal, amateur fighter, or martial artist who can make divine violence socially costly.</p>",
    powerHooks: ["armor-piercing", "terrain-immunity"]
  }),
  antagonist("Trained Emergency Personnel", "Mortals", 224, {
    rank: "Squad",
    threat: 3,
    threshold: 22,
    armor: 2,
    attack: 10,
    defense: 10,
    initiative: 3,
    damage: 2,
    skills: "Empathy, Knowledge, Marksman, Medicine (4 dice)",
    powers: "<p><strong>Call for Backup:</strong> Can summon another squad for reinforcements after 2 rounds, twice per battle, once under half Threshold.</p><p><strong>Equipped:</strong> Specialized gear makes Quick Actions and emergency response more flexible.</p>",
    description: "<p>Police officers, firefighters, paramedics, or similar trained teams responding to divine fallout.</p>"
  }),
  antagonist("Champion", "The Touched", 225, {
    rank: "Veteran",
    threat: 3,
    threshold: 13,
    armor: 2,
    spark: 2,
    fragments: 4,
    attack: 8,
    defense: 7,
    initiative: 5,
    damage: 2,
    skills: "Athletics, Discipline, Fortitude, Influence, Knowledge, Perform, Tech (4 dice)",
    powers: "<p><strong>Family Ties:</strong> Family functions like Worshippers for assistance, care, support, and sanctuary.</p><p><strong>Natural Magnetism:</strong> Gains Spark rating in automatic successes on social rolls to obtain human followers.</p><p><strong>Physical Enhancement:</strong> Spend 1 Fragment to add Spark to a physical check.</p><p><strong>Relic:</strong> Has a summonable heirloom Relic tied to the bloodline.</p>",
    description: "<p>A divine bloodline scion carrying inherited heroic potential.</p>"
  }),
  antagonist("Forsaken", "The Touched", 227, {
    rank: "Veteran",
    threat: 3,
    threshold: 14,
    armor: 2,
    spark: 2,
    fragments: 0,
    attack: 7,
    defense: 7,
    initiative: 5,
    damage: 3,
    skills: "Discipline, Empathy, Fortitude, Influence, Knowledge, Fighting, Stealth, Survival (4 dice)",
    powers: "<p><strong>See the Light:</strong> Can sense Sparks in other beings.</p><p><strong>Stolen Embers:</strong> Twice per Scene, draws Fragments from Manifestations used nearby to replenish their own damaged Spark.</p><p><strong>Repair the Spark:</strong> Hoarding enough stolen Fragments can raise Spark, but inflicts a Level 2 Failing.</p>",
    description: "<p>A would-be god with damaged or denied divine potential, hunting Spark-touched beings for stolen power.</p>"
  }),
  antagonist("God-Killer", "The Touched", 228, {
    rank: "Veteran",
    threat: 4,
    threshold: 15,
    armor: 4,
    spark: 3,
    fragments: 6,
    attack: 10,
    defense: 8,
    initiative: 5,
    damage: 4,
    skills: "Athletics, Deception, Discipline, Fighting, Perception, Stealth, Survival (6 dice)",
    powers: "<p><strong>Hidden Fire:</strong> Cannot be detected by Spark-identifying or Spark-tracking methods.</p><p><strong>Kill the Flame:</strong> Negates Manifestations by drawing divine power into itself.</p><p><strong>Relentless Hunter:</strong> Focuses on a divine victim and pursues until the Spark is taken.</p>",
    description: "<p>A dark mirror to Champions, bred or transformed to stalk and slay gods.</p>"
  }),
  antagonist("Sibyl", "The Touched", 229, {
    rank: "Experienced",
    threat: 3,
    threshold: 11,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 5,
    defense: 7,
    initiative: 1,
    damage: 1,
    skills: "Crafts, Deception, Discipline, Empathy, Knowledge, Medicine, Perception (3 dice)",
    powers: "<p><strong>Forewarning:</strong> At the start of each Round, may choose +3 Initiative or +2 Defense.</p><p><strong>See the Future:</strong> Can force a vision of a specific time, place, or person; additional major details cost Fragments.</p><p><strong>Oracle Type:</strong> Prophets can inspire zealotry, while clairvoyants pass visions to seekers who must interpret them.</p>",
    description: "<p>A future-sighted mortal touched by Spark, often driven by unclear visions and dangerous certainty.</p>",
    powerHooks: ["initiative-bonus", "defense-bonus", "oracle"]
  }),
  antagonist("Unhallowed", "The Touched", 229, {
    rank: "Veteran",
    threat: 4,
    threshold: 15,
    armor: 2,
    spark: 3,
    fragments: 5,
    attack: 7,
    defense: 7,
    initiative: 5,
    damage: 4,
    skills: "Crafts, Deception, Discipline, Intuition, Knowledge, Medicine, Stealth (4 dice)",
    powers: "<p><strong>Dreamwalking:</strong> Enters and reshapes dreams for 1 Fragment, often to lure a victim into a trap.</p><p><strong>Familiar:</strong> Uses a Level 3 Vassal familiar as a sympathetic link and extra senses.</p><p><strong>Glamour Skin:</strong> Assumes the appearance of a familiar person for 1 Fragment.</p><p><strong>Hex:</strong> Inflicts random Level 2 Conditions, often through dreams, a familiar, or remote viewing.</p><p><strong>Remote Viewing:</strong> Spies through mirrors, water, fog, or similar media for 1-2 Fragments.</p>",
    description: "<p>A mortal sorcerer whose borrowed Spark-like power comes from a corrupt bargain.</p>",
    powerHooks: ["condition:random", "vassal:familiar", "remote-viewing", "shapechange"]
  }),
  antagonist("Guardian God Template", "Other Gods", 231, {
    ...CUSTOM_ANTAGONIST_BANDS.adept,
    rank: "Master",
    skills: "Discipline, Empathy, Fortitude, Medicine, Persuasion, Survival (4-5 dice)",
    powers: "<p><strong>Defense of the Virtuous:</strong> Creates a temporary protective Truth against one source of damage for 1-2 Fragments.</p><p><strong>Manifestations:</strong> Aegis, Beckon, Minion, Ruin, and Shaping are common.</p>",
    description: "<p>A rival or allied god defined by duty, protection, and a guarded charge.</p>"
  }),
  antagonist("Hunter God Template", "Other Gods", 231, {
    ...CUSTOM_ANTAGONIST_BANDS.adept,
    rank: "Master",
    skills: "Athletics, Discipline, Fighting, Marksman, Perception, Survival (4-5 dice)",
    powers: "<p><strong>As the Crow Flies:</strong> Once per Scene, finds obscured tracks and signs; active concealment costs extra Fragments to overcome.</p><p><strong>Manifestations:</strong> Aegis, Journey, Oracle, Ruin, and Shaping are common.</p>",
    description: "<p>A god of nature, tracking, predation, or the hunt.</p>"
  }),
  antagonist("Psychopomp God Template", "Other Gods", 232, {
    ...CUSTOM_ANTAGONIST_BANDS.adept,
    rank: "Master",
    skills: "Deception, Empathy, Influence, Intuition, Stealth, Travel (4-5 dice)",
    powers: "<p><strong>Reaper's Call:</strong> Once per Scene, spend 1 Fragment and roll 4 dice to summon allied spirits, one per success.</p><p><strong>Manifestations:</strong> Aegis, Beckon, Puppetry, Ruin, and Soul are common.</p>",
    description: "<p>A death, ghost, or afterlife god who can command spirits and protect souls.</p>"
  }),
  antagonist("Rival God Template", "Other Gods", 232, {
    ...CUSTOM_ANTAGONIST_BANDS.adept,
    rank: "Master",
    skills: "Opponent's six highest Skills (3-5 dice by age)",
    powers: "<p><strong>Anything You Can Do:</strong> Co-opts a beneficial effect manifested by the rival target, gaining the benefit as if they manifested it. Each repeated use in the Scene has a cumulative Fragment cost.</p><p><strong>Mirrored Build:</strong> Dominions, Manifestations, Relics, Truths, Vassals, and Worshippers should mirror or oppose the chosen player character.</p>",
    description: "<p>A god defined as the personal foil to a player character or another deity.</p>",
    powerHooks: ["manifestation-copy", "fragment-cost:cumulative"]
  }),
  antagonist("Templar God Template", "Other Gods", 232, {
    ...CUSTOM_ANTAGONIST_BANDS.adept,
    rank: "Master",
    skills: "Crafts, Deception, Influence, Knowledge, Perform, Tech (3-5 dice)",
    powers: "<p><strong>Rarefied Resources:</strong> Uses wealth, status, media, and underlings to ruin an enemy's life or force concessions.</p><p><strong>Manifestations:</strong> Beckon, Minion, Oracle, Puppetry, and Ruin are common.</p><p><strong>Truths:</strong> Aura of Influence, Divinely Skilled, Fortune, Immunity, Silver Tongue, and similar social or resource advantages fit the template.</p>",
    description: "<p>A wealthy, well-connected god who works through social pressure, institutions, and mortal infrastructure.</p>",
    powerHooks: ["resource-pressure", "minion", "social-condition"]
  }),
  antagonist("Trickster God Template", "Other Gods", 233, {
    ...CUSTOM_ANTAGONIST_BANDS.adept,
    rank: "Master",
    skills: "Deception, Intuition, Marksman, Perform, Stealth, Tech (4-5 dice)",
    powers: "<p><strong>Liar's Gambit:</strong> Once per Scene, convince a target of an absolute fact, inflicting Convinced 3; divine beings may resist.</p><p><strong>Manifestations:</strong> Beckon, Journey, Puppetry, Shaping, and Soul are common.</p>",
    description: "<p>A god of mischief, theft, pranks, secrets, or creative chaos.</p>"
  }),
  antagonist("Warlord God Template", "Other Gods", 233, {
    ...CUSTOM_ANTAGONIST_BANDS.divine,
    rank: "Grand Master",
    skills: "Athletics, Fighting, Fortitude, Might, Speed, Survival (5-6 dice)",
    powers: "<p><strong>Fearsome Might:</strong> Once per Scene, spend 1 Fragment; successful damaging attacks also inflict Afraid 1 and grant bonuses against afraid targets.</p><p><strong>Manifestations:</strong> Aegis, Journey, Ruin, and Shaping are common.</p>",
    description: "<p>A martial god of war, conflict, fury, borders, or battlefields.</p>"
  }),
  antagonist("Cherub", "Outsiders", 234, {
    rank: "Warrior",
    threat: 3,
    threshold: 9,
    armor: 1,
    spark: 3,
    fragments: 6,
    attack: 8,
    defense: 6,
    initiative: 4,
    damage: 1,
    skills: "Empathy, Influence, Knowledge, Marksman, Speed, Travel (2 dice)",
    powers: "<p><strong>Arrow of Love:</strong> Can deal damage or spend a Fragment to inflict an In Love 5 Condition.</p><p><strong>Out of Sight:</strong> Can spend a Fragment to become invisible to onlookers.</p>",
    description: "<p>A meddling Outsider whose arrows twist mortal affection into dangerous obsession.</p>"
  }),
  antagonist("Cloak", "Outsiders", 235, {
    rank: "Grand Master",
    threat: 5,
    threshold: 24,
    armor: 2,
    spark: 4,
    fragments: 8,
    attack: 13,
    defense: 15,
    initiative: 10,
    damage: 2,
    skills: "Crafts, Discipline, Fortitude, Knowledge, Speed, Stealth, Travel (5 dice)",
    powers: "<p><strong>Death Touch:</strong> Spend 1 Fragment to instantly kill a mortal target touched; does not work on creatures with Spark.</p><p><strong>Death Travels Swiftly:</strong> Moves through objects, walls, water, and air; can teleport to known or visible locations for 1 Fragment.</p><p><strong>Deathless:</strong> Cannot be killed outside its own realm; defeat returns it home.</p>",
    description: "<p>A robed death-realm Outsider and relentless reaper of marked souls.</p>"
  }),
  antagonist("Devourer", "Outsiders", 236, {
    rank: "Squad",
    threat: 4,
    threshold: 25,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 11,
    defense: 10,
    initiative: 7,
    damage: 1,
    skills: "Athletics, Empathy, Fighting, Stealth, Fortitude, Might, Survival (3 dice)",
    powers: "<p><strong>Eat to Live:</strong> Gains Regeneration for an hour after eating enough human flesh.</p><p><strong>Feeding Frenzy:</strong> Spend 1 Fragment to gain +1 Attack, +1 Defense, +1 Initiative, and +1 damage for the Battle.</p><p><strong>Human Guise:</strong> Spend 1 Fragment to take human form for the Scene, unless recent hunger or feeding exposes its nature.</p><p><strong>Tasty:</strong> Biting a Puck-Eater grants the last Payoff they acquired.</p>",
    description: "<p>A cannibalistic clan or family transformed by infernal hunger and demonic force.</p>",
    powerHooks: ["regeneration", "attack-bonus", "defense-bonus", "initiative-bonus", "damage-bonus", "shapechange"]
  }),
  antagonist("Djinn", "Outsiders", 236, {
    rank: "Master",
    threat: 4,
    threshold: 16,
    armor: 2,
    spark: 3,
    fragments: 6,
    attack: 10,
    defense: 10,
    initiative: 6,
    damage: 1,
    skills: "Crafts, Deception, Discipline, Empathy, Beckon, Shaping (4 dice)",
    powers: "<p><strong>Itty Bitty Living Space:</strong> A master can order the Djinn back into its lamp; whoever releases it becomes the next master.</p><p><strong>Phenomenal Cosmic Power:</strong> Uses Beckon and Shaping through the master's wishes and can appear as another person, object, or animal.</p>",
    description: "<p>A malicious wish-granting fire spirit bound by ancient imprisonment and dangerous loopholes.</p>"
  }),
  antagonist("Dwarf", "Outsiders", 237, {
    rank: "Warrior",
    threat: 3,
    threshold: 15,
    armor: 3,
    spark: 2,
    fragments: 4,
    attack: 9,
    defense: 8,
    initiative: 3,
    damage: 2,
    skills: "Athletics, Fortitude, Knowledge, Survival, Technology (4 dice); Crafts 5 dice",
    powers: "<p><strong>Dwarven Improvements:</strong> For 1 Fragment and an hour, improves a weapon or armor by increasing Damage, Range, or Armor.</p><p><strong>Famed Crafters:</strong> Has Crafts 5 dice and rerolls failed dice on the initial craft roll once.</p><p><strong>Relics:</strong> Usually has 6 points of Relics available in any combination.</p>",
    description: "<p>A stout, divine craftsperson and weaponsmith whose services are costly but valuable.</p>",
    powerHooks: ["item-upgrade", "skill-reroll", "relic-budget:6"]
  }),
  antagonist("Elf", "Outsiders", 238, {
    rank: "Warrior",
    threat: 3,
    threshold: 14,
    armor: 1,
    spark: 3,
    fragments: 6,
    attack: 8,
    defense: 8,
    initiative: 5,
    damage: 1,
    skills: "Acrobatics, Knowledge, Medicine, Perception, Perform, Persuasion, Stealth, Survival (4 dice)",
    powers: "<p><strong>Beast Speech:</strong> Speaks to animals as with the Beast Tongue Truth.</p><p><strong>Creatures of Light and Shadow:</strong> Counts as tied to an Elemental Dominion and receives In My Element; also has three GM-chosen Manifestation skills.</p>",
    description: "<p>A faerie noble whose grace and beauty conceal old cruelty and bitter lost power.</p>",
    powerHooks: ["truth:beast-tongue", "blessing:in-my-element", "manifestation-skills"]
  }),
  antagonist("Giant", "Outsiders", 239, {
    rank: "Grand Master",
    threat: 5,
    threshold: 25,
    armor: 3,
    spark: 5,
    fragments: 10,
    attack: 16,
    defense: 15,
    initiative: 5,
    damage: 4,
    skills: "Athletics, Crafts, Fighting, Fortitude, Influence, Might, Travel (4 dice)",
    powers: "<p><strong>Birth Dominion:</strong> Possesses two Dominions by species and uses Manifestations with Fragments like a god.</p><p><strong>Incredibly Strong:</strong> Gains Divinely Skilled (Might).</p><p><strong>Terrifying:</strong> Witnesses must resist or take Afraid 2; first-time witnesses automatically fail.</p><p><strong>Species:</strong> Cyclops, Fire Giant, Frost Giant, Mountain Giant, Oni, and Storm Giant variants change Dominions and behavior.</p>",
    description: "<p>A huge Outsider descended from the many mythic giant species and still capable of godlike force.</p>",
    powerHooks: ["dominion", "truth:divinely-skilled-might", "condition:afraid"]
  }),
  antagonist("Gorgon", "Outsiders", 241, {
    rank: "Master",
    threat: 4,
    threshold: 17,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 11,
    defense: 9,
    initiative: 5,
    damage: 1,
    skills: "Athletics, Influence, Intimidation, Knowledge, Medicine, Stealth (3 dice)",
    powers: "<p><strong>Beauty Beyond Compare:</strong> Face-to-face mortals may take Convinced 1 or Hopeless 1 once per Scene.</p><p><strong>Snake Hair:</strong> Cannot be ambushed while uncovered; gains Perception 5 and can inflict venom damage during a Grab.</p><p><strong>Stone Gaze:</strong> Spend 1 Fragment to petrify; mortals cannot resist, beings with Spark may resist.</p>",
    description: "<p>A half-snake Outsider whose beauty, venom, and gaze make direct encounters dangerous.</p>",
    powerHooks: ["condition:convinced", "condition:hopeless", "condition:petrified", "ambush-immunity", "poison"]
  }),
  antagonist("Hell Hound", "Outsiders", 242, {
    rank: "Warrior",
    threat: 4,
    threshold: 16,
    armor: 0,
    spark: 2,
    fragments: 4,
    attack: 11,
    defense: 10,
    initiative: 4,
    damage: 2,
    skills: "Athletics, Fortitude, Intimidation, Stealth, Survival (3 dice)",
    powers: "<p><strong>Extra Heads:</strong> Makes two attacks per Round; larger hounds may split targets.</p><p><strong>Immunity:</strong> Immune to fire and, when already mastered, mind control.</p>",
    description: "<p>A many-headed guardian beast tied to underworld gates, death gods, and infernal portals.</p>",
    powerHooks: ["extra-attack", "immunity:fire", "immunity:mind-control"]
  }),
  antagonist("Hydra", "Outsiders", 243, {
    rank: "Grand Master",
    threat: 5,
    threshold: 12,
    armor: 3,
    spark: 4,
    fragments: 8,
    attack: 12,
    defense: 10,
    initiative: 12,
    damage: 2,
    skills: "Fortitude, Intimidation, Survival (4 dice)",
    powers: "<p><strong>Hydra Heads:</strong> Each head after the first adds +1 to combat checks, +1 damage, +3 Threshold, and extra Standard Actions per two extra heads.</p><p><strong>Breath Weapons:</strong> Each head may have a Fragment-activated breath power chosen by the GM.</p>",
    description: "<p>A many-headed monster whose danger scales sharply as more heads are brought into play.</p>"
  }),
  antagonist("Jikininki", "Outsiders", 243, {
    rank: "Warrior",
    threat: 3,
    threshold: 16,
    armor: 2,
    spark: 3,
    fragments: 6,
    attack: 9,
    defense: 9,
    initiative: 6,
    damage: 2,
    skills: "Athletics, Deception, Medicine, Perception, Perform, Stealth (4 dice)",
    powers: "<p><strong>A New Face:</strong> Eats a recent corpse and spends 1 Fragment to steal the victim's face and memories for a limited time.</p><p><strong>Supernatural Might:</strong> Spend 1 Fragment to raise damage to +4 and gain Divinely Skilled (Might) for the Scene.</p><p><strong>Beast Revulsion:</strong> Animals nearby suffer Afraid 1 and Psyche damage each Round.</p>",
    description: "<p>A wicked dead spirit that devours corpses, steals faces, and moves through mortal lives by disguise.</p>",
    powerHooks: ["shapechange", "damage-bonus", "truth:divinely-skilled-might", "condition:afraid", "damage:psyche"]
  }),
  antagonist("Kappa", "Outsiders", 244, {
    rank: "Squad",
    threat: 3,
    threshold: 18,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 4,
    defense: 3,
    initiative: 5,
    damage: 2,
    skills: "Deception, Fighting, Knowledge, Medicine, Speed (2 dice)",
    powers: "<p><strong>Amphibious:</strong> Gains Attack and Defense bonuses while fighting in water or while its head bowl remains full.</p><p><strong>Eat Anything:</strong> Can heal Threshold by consuming available material.</p><p><strong>Who Smelt It:</strong> Can release a noxious battle effect when threatened.</p>",
    description: "<p>A small water-dwelling Outsider commonly encountered in groups.</p>"
  }),
  antagonist("Manananggal", "Outsiders", 245, {
    rank: "Master",
    threat: 4,
    threshold: 8,
    armor: 1,
    spark: 3,
    fragments: 6,
    attack: 8,
    defense: 7,
    initiative: 4,
    damage: 1,
    skills: "Deception, Empathy, Fortitude, Intuition, Stealth, Survival, Travel (3 dice)",
    powers: "<p><strong>Feeding:</strong> Feeds at long distance and recovers damage or reduces Conditions based on damage inflicted.</p><p><strong>Flight:</strong> Separates at the waist to fly, gaining +3 Initiative and +2 Defense while airborne.</p><p><strong>Tongue Lashing:</strong> Uses its tongue as a Reach-like weapon, gaining +2 Attack and +1 damage while not feeding.</p>",
    description: "<p>A concealed blood-feeding Outsider whose divided flying form is terrifying and vulnerable before sunrise.</p>",
    powerHooks: ["healing", "condition-recovery", "flight", "initiative-bonus", "defense-bonus", "attack-bonus", "damage-bonus"]
  }),
  antagonist("Minotaur", "Outsiders", 245, {
    rank: "Master",
    threat: 4,
    threshold: 22,
    armor: 2,
    spark: 3,
    fragments: 6,
    attack: 13,
    defense: 11,
    initiative: 2,
    damage: 3,
    skills: "Fighting, Fortitude, Knowledge, Intimidation, Might, Survival (5 dice)",
    powers: "<p><strong>Incredible Strength:</strong> Spend 1 Fragment to lift any object regardless of size or weight.</p><p><strong>Shoulder Check:</strong> Gains +3 to Rush maneuvers, ignores Armor of structures, and can lift up to two tons easily.</p><p><strong>Weapon Break:</strong> On a Boost during a close attack, may break a non-magical weapon held by the target.</p>",
    description: "<p>A powerful half-human, half-beast Outsider whose rage and strength can smash through battlefields.</p>",
    powerHooks: ["strength-feat", "rush-bonus", "armor-ignore:structures", "weapon-break"]
  }),
  antagonist("Ningyo", "Outsiders", 247, {
    rank: "Warrior",
    threat: 3,
    threshold: 10,
    armor: 0,
    spark: 3,
    fragments: 6,
    attack: 8,
    defense: 10,
    initiative: 3,
    damage: 1,
    skills: "Crafts, Deception, Empathy, Knowledge, Perform, Speed, Travel (4 dice)",
    powers: "<p><strong>Aqualung:</strong> Breathes underwater and can grant that ability for up to an hour at the cost of 1 Fragment.</p><p><strong>Pearly Tears:</strong> Creates up to 5 Wealth worth of pearls per day.</p><p><strong>Siren's Lure:</strong> Spend 2 Fragments to make a target believe a truth or lie, inflicting Convinced 5.</p>",
    description: "<p>A wealthy, alluring sea Outsider whose beauty and lies are as dangerous as its aquatic nature.</p>",
    powerHooks: ["water-breathing", "resource:wealth", "condition:convinced"]
  }),
  antagonist("Phoenix", "Outsiders", 248, {
    rank: "Grand Master",
    threat: 5,
    threshold: 12,
    armor: 2,
    spark: 4,
    fragments: 8,
    attack: 8,
    defense: 10,
    initiative: 7,
    damage: 1,
    skills: "Discipline, Empathy, Intuition, Knowledge, Medicine, Speed, Travel (6 dice)",
    powers: "<p><strong>Flame Strike:</strong> Spend 1 Fragment to launch as a bolt of flame, dealing +4 damage on a hit.</p><p><strong>Resurrection:</strong> Can bring back creatures dead less than three days; mortals cost Fragments, Spark beings require the Phoenix's sacrifice and rebirth.</p><p><strong>Telepathy:</strong> Speaks directly to hearts with no Range limitation.</p>",
    description: "<p>A rare celestial Outsider of wisdom, fire, death, and rebirth.</p>",
    powerHooks: ["damage-bonus", "resurrection", "telepathy"]
  }),
  antagonist("Pucks", "Outsiders", 247, {
    rank: "Squad",
    threat: 3,
    threshold: 15,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 6,
    defense: 6,
    initiative: 2,
    damage: 1,
    skills: "Athletics, Crafts, Deception, Speed, Stealth (3 dice)",
    powers: "<p><strong>Corner of Your Eye:</strong> Exist in an in-between phase of reality, appearing from impossible places and hiding in cracks of reality.</p><p><strong>Stolen Dominion:</strong> Some packs consume Sparks and take on Dominion-like chaos.</p>",
    description: "<p>A pack of violent tricksters and chaos pests, usually three to five creatures.</p>"
  }),
  antagonist("Puck Crawler", "Outsiders", 249, {
    rank: "Squad",
    threat: 3,
    threshold: 15,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 6,
    defense: 6,
    initiative: 2,
    damage: 1,
    skills: "Athletics, Crafts, Deception, Speed, Stealth (3 dice)",
    powers: "<p><strong>Lair:</strong> For 1 Fragment, makes its lair and everything within invisible; gains +2 to checks inside a breached lair.</p><p><strong>Paralyze:</strong> A surprise bite can paralyze a victim, resisted with a Tough Fortitude check.</p>",
    description: "<p>A wall-crawling Puck variant that hides in dark spaces and drags victims back to its lair.</p>",
    powerHooks: ["lair", "invisibility", "condition:paralyzed", "skill-bonus"]
  }),
  antagonist("Puck Gnawer", "Outsiders", 249, {
    rank: "Squad",
    threat: 3,
    threshold: 15,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 6,
    defense: 6,
    initiative: 2,
    damage: 1,
    skills: "Athletics, Crafts, Deception, Speed, Stealth (3 dice)",
    powers: "<p><strong>Composite Skin:</strong> Armor can rise to 2 or 3 depending on the last minerals or metals eaten.</p><p><strong>Iron Jaw:</strong> Bites ignore Armor, deal +3 damage, and can break objects, weapons, armor, or structures.</p>",
    description: "<p>A cute-looking Puck variant with an impossible maw and a taste for bones, metal, and structures.</p>",
    powerHooks: ["armor-variable", "armor-ignore", "damage-bonus", "object-break"]
  }),
  antagonist("Puck Hider", "Outsiders", 250, {
    rank: "Squad",
    threat: 3,
    threshold: 15,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 6,
    defense: 6,
    initiative: 2,
    damage: 1,
    skills: "Athletics, Crafts, Deception, Speed, Stealth (3 dice)",
    powers: "<p><strong>Object Permanence:</strong> Hides inside objects for 1 Fragment and moves between objects for another Fragment.</p><p><strong>Waking Nightmare:</strong> Manifests a victim's known fear as visions only that victim can see.</p>",
    description: "<p>A Puck variant that hides in objects and weaponizes a mortal's spoken fears.</p>",
    powerHooks: ["object-hide", "hallucination", "fear"]
  }),
  antagonist("Puck Possessor", "Outsiders", 250, {
    rank: "Squad",
    threat: 3,
    threshold: 15,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 6,
    defense: 6,
    initiative: 2,
    damage: 1,
    skills: "Athletics, Crafts, Deception, Speed, Stealth (3 dice)",
    powers: "<p><strong>I Am You:</strong> Controls mortal hosts for up to a week; Spark-bearing targets receive repeated resistance checks.</p><p><strong>Toxic Spit:</strong> Spend 1 Fragment and attack to make the target lose 1 Turn on a success.</p>",
    description: "<p>A tiny parasitic Puck variant that puppets hosts and steers them into ruin.</p>",
    powerHooks: ["control", "lost-turn", "resistance-check"]
  }),
  antagonist("Puck Screamer", "Outsiders", 251, {
    rank: "Squad",
    threat: 3,
    threshold: 15,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 6,
    defense: 6,
    initiative: 2,
    damage: 1,
    skills: "Athletics, Crafts, Deception, Speed, Stealth (3 dice)",
    powers: "<p><strong>Feed on Fear:</strong> When it gives Afraid, heals 2 damage and gains +2 Attack against the frightened target.</p><p><strong>Gooey:</strong> Vomits black ichor that deals damage and inflicts Sensory Loss 1 and Afraid 1.</p>",
    description: "<p>A disturbingly childlike Puck variant that feeds on fear and panic.</p>",
    powerHooks: ["condition:afraid", "condition:sensory-loss", "healing", "attack-bonus"]
  }),
  antagonist("Rakshasa", "Outsiders", 253, {
    rank: "Grand Master",
    threat: 5,
    threshold: 22,
    armor: 2,
    spark: 5,
    fragments: 10,
    attack: 14,
    defense: 12,
    initiative: 7,
    damage: 3,
    skills: "Athletics, Influence, Knowledge, Might, Perception, Stealth, Survival (5 dice)",
    powers: "<p><strong>A Little Night Magic:</strong> Spend 1 Fragment to create illusions that last until they fade or are renewed.</p><p><strong>Bloodthirsty:</strong> Successful hits inflict Bleeding 1 and give attack bonuses against bleeding victims.</p>",
    description: "<p>A cruel, shapeshifting shock troop and illusionist from Hindu mythic traditions.</p>"
  }),
  antagonist("Satyr", "Outsiders", 253, {
    rank: "Warrior",
    threat: 3,
    threshold: 7,
    armor: 0,
    spark: 2,
    fragments: 4,
    attack: 5,
    defense: 9,
    initiative: 4,
    damage: 1,
    skills: "Athletics, Crafts, Deception, Influence, Perform, Speed, Survival, Tech (3 dice)",
    powers: "<p><strong>A Little Song, A Little Dance:</strong> Gains +3 Perform with a preferred instrument; for 1 Fragment, mortals who hear the song dance and revel, while Spark beings may resist.</p><p><strong>Cowardly:</strong> Spend 1 Fragment to escape an encounter to a nearby safe place.</p><p><strong>Sexually Proficient:</strong> Seduction-centered rolls receive +2; partners spend Free Time and may gain a temporary bonus afterward.</p>",
    description: "<p>A common, hedonistic Outsider whose music, charm, and cowardly escape tricks complicate mortal scenes.</p>",
    powerHooks: ["skill-bonus", "condition:compulsion", "teleport", "resource:freeTime"]
  }),
  antagonist("Slasher", "Outsiders", 253, {
    rank: "Master",
    threat: 4,
    threshold: 19,
    armor: 4,
    spark: 3,
    fragments: 6,
    attack: 12,
    defense: 12,
    initiative: 5,
    damage: 3,
    skills: "Athletics, Stealth, Fortitude, Might, Survival, Speed, Travel (4 dice)",
    powers: "<p><strong>Always Comes Back:</strong> Spend 2 Fragments to return from death if its legend remains and its unique killing condition was not met; may spend 1 Fragment to heal 4 Threshold.</p><p><strong>The Next Victim:</strong> Names a target, gaining +1 to relevant checks and +1 damage against them until they die or another target is chosen.</p><p><strong>Weakness:</strong> A unique weakness lets opponents ignore its high Armor and destroy it for good.</p><p><strong>You Can't Run:</strong> Spend 1 Fragment to appear within 10 feet of a chosen victim.</p>",
    description: "<p>A supernatural killer-spirit built around pursuit, legend, resilience, and a personal weakness.</p>",
    powerHooks: ["resurrection", "healing", "target-mark", "armor-ignore:weakness", "teleport"]
  }),
  antagonist("Snarlequin", "Outsiders", 254, {
    rank: "Warrior",
    threat: 3,
    threshold: 14,
    armor: 1,
    spark: 2,
    fragments: 4,
    attack: 9,
    defense: 11,
    initiative: 6,
    damage: 1,
    skills: "Athletics, Perform, Stealth, Speed, Travel (4 dice)",
    powers: "<p><strong>Aura of Influence (Fear):</strong> Fear aura works especially against children and those afraid of clowns.</p><p><strong>Deadly Jester:</strong> Uses games, performances, and unsettling appearances to lure victims before violence begins.</p>",
    description: "<p>A capricious, murderous performer-creature that feeds on flesh and fear.</p>"
  }),
  antagonist("Spirit", "Outsiders", 255, {
    rank: "Warrior",
    threat: 3,
    threshold: 11,
    armor: 1,
    spark: 3,
    fragments: 6,
    attack: 8,
    defense: 8,
    initiative: 4,
    damage: 2,
    skills: "Deception, Empathy, Fortitude, Intimidation, Knowledge (3 dice)",
    powers: "<p><strong>Incorporeal:</strong> Phases through objects and can harm Health or Psyche when passing through a living creature once per Scene.</p><p><strong>Manifest:</strong> Spend 1 Fragment to become temporarily solid for a Scene.</p><p><strong>Spirit Types:</strong> Ghosts can possess mortals or objects; elementals express natural forces and sacred places.</p>",
    description: "<p>A mystical being, ghost, idea, or elemental presence that can be unseen until it manifests.</p>",
    powerHooks: ["incorporeal", "damage:health", "damage:psyche", "manifest", "possession"]
  }),
  antagonist("Tengu", "Outsiders", 256, {
    rank: "Grand Master",
    threat: 5,
    threshold: 20,
    armor: 3,
    spark: 3,
    fragments: 6,
    attack: 14,
    defense: 15,
    initiative: 5,
    damage: 4,
    skills: "Athletics, Fighting, Fortitude, Marksman, Medicine, Might, Perception, Speed, Tech (6 dice)",
    powers: "<p><strong>Divine Wind:</strong> Spend 1 Fragment to act first for the next 3 Rounds regardless of Initiative; Move Actions are free during Battles of Fists.</p><p><strong>March to War:</strong> Creatures within Near Range feel compelled toward violence each minute; Spark-bearing targets may resist or suffer Afraid 1.</p><p><strong>Wings of Thunder:</strong> Spend 1 Fragment to buffet everyone within Near Range, or +1 Fragment for Far Range, knocking targets back, dealing Health damage, and inflicting Impaired Hearing 1 and Pain 1 on failed resistance.</p>",
    description: "<p>A dangerous birdlike martial Outsider, suitable as a major duel opponent or severe mentor figure.</p>",
    powerHooks: ["first-turn", "free-movement", "condition:afraid", "forced-movement", "damage:health", "condition:impaired-hearing", "condition:pain"]
  }),
  antagonist("Unicorn", "Outsiders", 257, {
    rank: "Master",
    threat: 4,
    threshold: 11,
    armor: 2,
    spark: 5,
    fragments: 10,
    attack: 8,
    defense: 10,
    initiative: 6,
    damage: 1,
    skills: "Athletics, Empathy, Intuition, Knowledge, Medicine, Speed, Survival (4 dice)",
    powers: "<p><strong>Blessed Horn:</strong> Raises damage to +3 when the Unicorn attacks with its horn in dire circumstances.</p><p><strong>Healing Spirit:</strong> Heals 4 damage per Fragment, removes Light or Lasting Conditions, reduces Heavy Conditions, and can regenerate limbs or organs and cure mental afflictions.</p><p><strong>Sense Motive:</strong> Uses Empathy + Intuition to discern motives; if a target is impure, may spend 1 Fragment to become invisible and incorporeal to escape.</p>",
    description: "<p>A rare, powerful Outsider associated with healing, purity, and elusive divine grace.</p>",
    powerHooks: ["damage-bonus", "healing", "condition-recovery", "regeneration", "sense-motive", "invisibility", "incorporeal", "escape"]
  }),
  antagonist("Elemental Spirit", "Outsiders", 258, {
    rank: "Master",
    threat: 4,
    threshold: 20,
    armor: 2,
    spark: 4,
    fragments: 8,
    attack: 11,
    defense: 11,
    initiative: 8,
    damage: 3,
    skills: "Fortitude, Knowledge, Might, Survival, Shaping (5 dice)",
    powers: "<p><strong>Natural Articulation:</strong> Attacks up to Far Distance through its element and can fortify targets against that element for 1 Fragment and a Quick Action/Defense.</p><p><strong>Sacred Land:</strong> On sacred land, worshippers and the environment make the Elemental more dangerous.</p>",
    description: "<p>A spirit bound to a natural element or sacred place, often acting as guardian of that area.</p>"
  })
];
