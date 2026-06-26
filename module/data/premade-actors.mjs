const SYSTEM_ID = "part-time-gods";

function antagonist(name, category, sourcePage, system) {
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
        source: {
          book: "Part-Time Gods Second Edition",
          page: sourcePage
        }
      }
    }
  };
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
