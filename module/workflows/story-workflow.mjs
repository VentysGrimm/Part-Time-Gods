import { applyConditionToActor, customConditionItem } from "../conditions/condition-workflow.mjs";

const SYSTEM_ID = "part-time-gods";
const SOURCE_BOOK = "Part-Time Gods Second Edition";
const { DialogV2 } = foundry.applications.api;

const WORKFLOW_OPTIONS = [
  option("attachment", "individual-bond", "Individual Bond Demand", 272, "A personal Bond asks for attention, help, proof of care, money, rescue, or another relationship-driven Scene."),
  option("attachment", "group-bond", "Group Bond Demand", 272, "A group Bond asks the god to show up, contribute labor, perform a role, or uphold membership expectations."),
  option("attachment", "landmark-bond", "Landmark Bond Demand", 272, "A Landmark needs urgent attention from residents, caretakers, resources, safety issues, or local trouble."),
  option("attachment", "worshipper-request", "Worshipper Request", 273, "Worshippers bring a prayer, impossible ask, schism, or Dominion-shaped problem to the god."),
  option("attachment", "vassal-duty", "Vassal Duty", 272, "A Vassal pulls the god into its own mythic obligations, rivalries, community, or difficult task."),
  option("attachment", "spirit-community", "Spirit Community Request", 273, "Kunitsukami spirits ask the god for help because spirits know this Theology must answer."),
  option("attachment", "watchers-order", "Order of Meskhenet Plan", 273, "The Order asks for the reason it granted the god their Spark, often as part of an existing plan."),
  option("attachment", "hidden-threat", "Hidden Threat", 273, "A mundane problem around an Attachment may be tied to an Outsider, rival god, God-Killer, or red herring."),
  option("attachment", "landmark-pop", "Make a Landmark Pop", 273, "Emphasize what makes the place alive, then introduce a missing person, missing resource, or subtle lead."),
  option("attachment", "mix-scene-tones", "Mix Scene Tones", 273, "Use a pleasant or quiet mortal Scene before or between heavier divine pressure."),
  option("attachment", "playing-extras", "Playing as Extras", 274, "Assign inactive players Extras with a personality and goal while another character has the spotlight."),
  option("downtime", "going-on-vacation", "Going on Vacation", 274, "The pantheon travels and alerts work or Attachments; Free Time pressure changes while they are away."),
  option("downtime", "human-resources", "Human Resources Check", 275, "A neglected job starts asking questions after multiple Sessions without work attention."),
  option("downtime", "administrative-leave", "Administrative Leave", 275, "Work puts the god on leave without pay, often modeled as an Unemployed Condition."),
  option("downtime", "lost-wages", "Lost Wages", 275, "Missed work or job fallout costs up to 3 Wealth or creates paycheck trouble."),
  option("downtime", "reprimand", "Reprimand", 275, "The job requires regular work Scenes or the god risks lost wages, leave, or losing the job."),
  option("downtime", "shut-down", "Shut Down", 275, "The workplace is unavailable because of divine battle, damage, or consequences."),
  option("downtime", "losing-job", "Losing a Job", 275, "Job loss becomes an individual plot with financial and relationship consequences."),
  option("territory", "random-location", "Random Location", 275, "Roll 2d10 to place a new point of interest on the Territory Grid."),
  option("territory", "territory-crawl", "Territory Crawl", 276, "Prepare several points of interest with known information and secrets for exploration."),
  option("territory", "territory-secret", "Location Secret", 276, "Add a hidden divine, mortal, or mixed secret that can matter at a critical time."),
  option("sourcing", "source-extra", "Source an Extra", 277, "Ask a player who the Extra is and why it is urgent to speak with them now."),
  option("sourcing", "source-location", "Source a Location", 277, "Ask a player what a new location is known for and why the neighborhood or situation has changed."),
  option("sourcing", "source-background", "Source Background Detail", 277, "Ask a player to define a legend, rumor, Relic, or prior event and why it matters."),
  option("sourcing", "scene-framing", "Player Scene Framing", 277, "Let a player frame where the group is, what they are doing, and what is happening before the GM resumes control.")
];

const DEFAULT_PROMPTS = {
  "individual-bond": "What does this Bond need from the god right now, and what relationship detail makes it hard to ignore?",
  "group-bond": "What does this group expect the god to do, and what does showing up cost in this Scene?",
  "landmark-bond": "What changed at this Landmark, and which resident, resource, or clue makes the god notice?",
  "worshipper-request": "What do these worshippers believe the god promised them, and how does the request tie to the Dominion?",
  "vassal-duty": "What does this Vassal need from its own mythic world, and what does helping reveal about divine politics?",
  "spirit-community": "Which spirit arrives, what is it asking for, and why are the Kunitsukami expected to comply?",
  "watchers-order": "What plan did the Order already have in motion when it granted this Spark?",
  "hidden-threat": "Which mortal problem may conceal a divine threat, and what red herring could push a rash choice?",
  "landmark-pop": "What sensory detail makes the Landmark feel alive, and what important person or resource is missing?",
  "mix-scene-tones": "What quiet mortal moment gives the character relief before the next divine pressure arrives?",
  "playing-extras": "Which Extra should an inactive player portray, what is their personality, and what is their goal?",
  "going-on-vacation": "Who is warned about the trip, what check-ins are required, and what happens if the trip runs long?",
  "human-resources": "How many Sessions has work been ignored, and what question does the job ask now?",
  "administrative-leave": "Why is the god placed on leave, how long might it last, and who else is affected?",
  "lost-wages": "What work failure or missed hours cost Wealth, and what ordinary obligation now becomes urgent?",
  "reprimand": "What schedule does work now demand, and what is the consequence for missing the next required Scene?",
  "shut-down": "What shut the workplace down, who blames the god, and what must happen before it reopens?",
  "losing-job": "What individual plot could help the god recover from losing this job?",
  "random-location": "What new point of interest appears on the Territory Grid, and why does it matter now?",
  "territory-crawl": "What is known about this location, and what secret could be discovered through play?",
  "territory-secret": "What secret is hidden here, and which clue can reveal it at the right moment?",
  "source-extra": "What is this Extra's name, and why is it urgent for the gods to talk to them right now?",
  "source-location": "What is this place known for, and why has the neighborhood become more dangerous or complicated?",
  "source-background": "What legendary Relic, rumor, or background detail is everyone talking about, and why does the pantheon need it?",
  "scene-framing": "Where are the characters, what are they doing, why are they there, and what is happening around them?"
};

export async function openPTGStoryWorkflow({ pantheon = null, actingActor = null, workflow = "attachment:individual-bond" } = {}) {
  const actors = await characterActorOptions({ pantheon, actingActor });
  const attachments = attachmentOptions(actors);
  const selectedActorUuid = actingActor?.type === "character" ? actingActor.uuid : actors[0]?.uuid ?? "";
  const selectedWorkflow = WORKFLOW_OPTIONS.find(entry => entry.value === workflow) ?? WORKFLOW_OPTIONS[0];

  const content = `
    <div class="ptg-advancement-dialog ptg-story-workflow-dialog">
      <div class="ptg-territory-summary">
        <strong>Story Workflow Card</strong>
        <span>Source: ${SOURCE_BOOK}, book pp. 272-277.</span>
      </div>
      <section class="ptg-item-fields two">
        <label>
          <span>Workflow</span>
          <select name="workflow">
            ${workflowOptionMarkup(selectedWorkflow.value)}
          </select>
        </label>
        <label>
          <span>Character</span>
          <select name="actorUuid">
            <option value="">No character</option>
            ${actors.map(actor => `<option value="${escapeHTML(actor.uuid)}" ${actor.uuid === selectedActorUuid ? "selected" : ""}>${escapeHTML(actor.name)}</option>`).join("")}
          </select>
        </label>
      </section>
      <section class="ptg-item-fields two">
        <label>
          <span>Attachment</span>
          <select name="attachmentRef">
            <option value="">No linked attachment</option>
            ${attachments.map(entry => `<option value="${escapeHTML(entry.ref)}">${escapeHTML(entry.label)}</option>`).join("")}
          </select>
        </label>
        <label>
          <span>Scene / Location / Target</span>
          <input name="target" type="text" placeholder="Attachment, job, location, Extra, or threat">
        </label>
      </section>
      <section class="ptg-item-fields three">
        <label>
          <span>Free Time Delta</span>
          <input name="freeTimeDelta" type="number" value="0">
        </label>
        <label>
          <span>Wealth Delta</span>
          <input name="wealthDelta" type="number" value="0">
        </label>
        <label>
          <span>Attachment Strain Delta</span>
          <input name="strainDelta" type="number" value="0">
        </label>
      </section>
      <section class="ptg-item-fields three">
        <label>
          <span>Condition</span>
          <input name="conditionName" type="text" value="Unemployed">
        </label>
        <label>
          <span>Severity</span>
          <input name="conditionSeverity" type="number" value="4" min="1" max="10">
        </label>
        <label>
          <span>Category</span>
          <select name="conditionCategory">
            <option value="mental">Mental</option>
            <option value="physical">Physical</option>
            <option value="crossover">Crossover</option>
          </select>
        </label>
      </section>
      <label class="ptg-checkbox">
        <input type="checkbox" name="applyCondition">
        <span>Apply this Condition to the selected character</span>
      </label>
      <label class="ptg-checkbox">
        <input type="checkbox" name="allowNegative">
        <span>Allow Free Time or Wealth to drop below 0 as a GM override</span>
      </label>
      <label class="ptg-checkbox">
        <input type="checkbox" name="rollTerritory" checked>
        <span>Roll Territory coordinates for territory workflows</span>
      </label>
      <label>
        <span>Player / GM Prompt</span>
        <textarea name="prompt" rows="3" placeholder="${escapeHTML(DEFAULT_PROMPTS[selectedWorkflow.slug] ?? "What should the table answer?")}"></textarea>
      </label>
      <label>
        <span>Consequence / Result</span>
        <textarea name="result" rows="4" placeholder="Request, cost, Strain, job fallout, location secret, player answer, or next Scene"></textarea>
      </label>
      <label>
        <span>GM Notes</span>
        <textarea name="notes" rows="3" placeholder="Ruling, follow-up, affected Attachment, table consent, or pacing note"></textarea>
      </label>
      <p class="ptg-sheet-note">Attachment prompts draw from Devoting Scenes, Hidden Threats, Making Landmarks Pop, mixed Scene tones, prayers, Vassal duties, and player-sourced Extras. Downtime prompts cover vacation, work, Human Resources, and job fallout.</p>
    </div>
  `;

  const selection = await DialogV2.prompt({
    window: { title: "PTG Story Workflow", resizable: true },
    position: { width: 760, height: 760 },
    content,
    rejectClose: false,
    modal: true,
    ok: {
      label: "Post Card",
      callback: (event, button) => readStoryWorkflowForm(button.form)
    }
  });

  if (!selection) return null;
  return resolveStoryWorkflow(selection, { pantheon });
}

async function resolveStoryWorkflow(selection, { pantheon = null } = {}) {
  const workflowOption = WORKFLOW_OPTIONS.find(entry => entry.value === selection.workflow) ?? WORKFLOW_OPTIONS[0];
  const attachment = selection.attachmentRef ? await attachmentFromRef(selection.attachmentRef) : null;
  const actor = attachment?.actor ?? (selection.actorUuid ? await fromUuid(selection.actorUuid) : null);
  const results = [];

  if (selection.rollTerritory && workflowOption.group === "territory") {
    const coordinates = [randomDie(10), randomDie(10)];
    results.push(`Territory Grid coordinates: ${coordinates[0]}-${coordinates[1]}.`);
  }

  if (actor && (selection.freeTimeDelta || selection.wealthDelta)) {
    const changed = await actor.adjustDowntimeResources?.({
      action: `story-${workflowOption.group}`,
      freeTimeDelta: selection.freeTimeDelta,
      wealthDelta: selection.wealthDelta,
      reason: workflowOption.label,
      notes: selection.notes,
      allowNegative: selection.allowNegative
    });
    results.push(changed
      ? `${actor.name}: Free Time ${signedNumber(selection.freeTimeDelta)}, Wealth ${signedNumber(selection.wealthDelta)}.`
      : `${actor.name}: resource change could not be applied.`);
  }

  if (attachment?.item && selection.strainDelta) {
    const changed = await adjustAttachmentStrain(attachment.item, selection.strainDelta);
    results.push(changed);
  }

  if (actor && selection.applyCondition && selection.conditionName) {
    const applied = await applyConditionToActor(actor, customConditionItem({
      name: selection.conditionName,
      category: selection.conditionCategory,
      severity: selection.conditionSeverity,
      sourcePage: workflowOption.sourcePage,
      sourceSection: workflowOption.label,
      effect: selection.result || workflowOption.summary,
      recovery: "Recover when the job, relationship, or story consequence is resolved through play."
    }), {
      reason: workflowOption.label,
      duplicateMode: "prompt"
    });
    if (applied) results.push(applied);
  }

  await ChatMessage.create({
    speaker: actor
      ? ChatMessage.getSpeaker({ actor })
      : pantheon
        ? ChatMessage.getSpeaker({ actor: pantheon })
        : ChatMessage.getSpeaker(),
    content: storyWorkflowCard({
      actor,
      pantheon,
      attachment: attachment?.item ?? null,
      workflowOption,
      selection,
      results
    })
  });

  return {
    actor,
    attachment: attachment?.item ?? null,
    workflow: workflowOption,
    results
  };
}

function storyWorkflowCard({ actor, pantheon, attachment, workflowOption, selection, results }) {
  const prompt = selection.prompt || DEFAULT_PROMPTS[workflowOption.slug] || workflowOption.summary;
  const source = `${SOURCE_BOOK}, book p. ${workflowOption.sourcePage}`;
  const cardActorUuid = actor?.uuid ?? pantheon?.uuid ?? "";

  return `
    <div class="ptg-chat-card" data-ptg-chat-card="story-workflow" data-actor-uuid="${escapeHTML(cardActorUuid)}" data-reason="${escapeHTML(workflowOption.label)}">
      <h3>${escapeHTML(workflowOption.label)}</h3>
      <div><strong>Workflow:</strong> ${escapeHTML(labelCase(workflowOption.group))}</div>
      ${actor ? `<div><strong>Character:</strong> ${escapeHTML(actor.name)}</div>` : ""}
      ${attachment ? `<div><strong>Attachment:</strong> ${escapeHTML(attachment.name)} (${escapeHTML(typeLabel(attachment))})</div>` : ""}
      ${selection.target ? `<div><strong>Scene / Target:</strong> ${escapeHTML(selection.target)}</div>` : ""}
      <div><strong>Prompt:</strong> ${escapeHTML(prompt)}</div>
      <div><strong>Source Guidance:</strong> ${escapeHTML(workflowOption.summary)}</div>
      ${selection.result ? `<div><strong>Consequence / Result:</strong> ${escapeHTML(selection.result)}</div>` : ""}
      ${results.length ? `<ul>${results.map(result => `<li>${escapeHTML(result)}</li>`).join("")}</ul>` : ""}
      ${selection.notes ? `<div><strong>GM Notes:</strong> ${escapeHTML(selection.notes)}</div>` : ""}
      <p>Source: ${escapeHTML(source)}. This card records table-facing story pressure; Pantheon Dice scene edits remain separate from player-sourcing prompts.</p>
      <div class="ptg-chat-actions">
        ${actor ? `<button type="button" data-ptg-chat-action="open-actor">Open Character</button>` : ""}
        ${actor ? `<button type="button" data-ptg-chat-action="apply-condition" data-reason="${escapeHTML(workflowOption.label)}">Apply Condition</button>` : ""}
      </div>
    </div>
  `;
}

function readStoryWorkflowForm(form) {
  return {
    workflow: form.elements.workflow?.value ?? WORKFLOW_OPTIONS[0].value,
    actorUuid: form.elements.actorUuid?.value ?? "",
    attachmentRef: form.elements.attachmentRef?.value ?? "",
    target: form.elements.target?.value?.trim() ?? "",
    freeTimeDelta: Number(form.elements.freeTimeDelta?.value ?? 0),
    wealthDelta: Number(form.elements.wealthDelta?.value ?? 0),
    strainDelta: Number(form.elements.strainDelta?.value ?? 0),
    conditionName: form.elements.conditionName?.value?.trim() ?? "",
    conditionSeverity: Math.max(1, Math.min(10, Number(form.elements.conditionSeverity?.value ?? 1))),
    conditionCategory: form.elements.conditionCategory?.value ?? "mental",
    applyCondition: Boolean(form.elements.applyCondition?.checked),
    allowNegative: Boolean(form.elements.allowNegative?.checked),
    rollTerritory: Boolean(form.elements.rollTerritory?.checked),
    prompt: form.elements.prompt?.value?.trim() ?? "",
    result: form.elements.result?.value?.trim() ?? "",
    notes: form.elements.notes?.value?.trim() ?? ""
  };
}

async function characterActorOptions({ pantheon = null, actingActor = null } = {}) {
  const actors = new Map();

  if (actingActor?.type === "character" && canUseActor(actingActor)) actors.set(actingActor.uuid, actingActor);

  for (const member of Array.from(pantheon?.system?.members ?? [])) {
    const actor = member.uuid ? await safeFromUuid(member.uuid) : null;
    if (actor?.type === "character" && canUseActor(actor)) actors.set(actor.uuid, actor);
  }

  for (const actor of game.actors ?? []) {
    if (actor.type === "character" && canUseActor(actor)) actors.set(actor.uuid, actor);
  }

  return Array.from(actors.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function attachmentOptions(actors) {
  const options = [];
  for (const actor of actors) {
    const items = actor.items
      ?.filter?.(item => ["bond", "worshipper", "vassal"].includes(item.type))
      ?.sort?.((a, b) => a.name.localeCompare(b.name)) ?? [];
    for (const item of items) {
      const strain = item.system.strain ?? {};
      const current = Number(strain.value ?? 0);
      const max = Math.max(0, Number(strain.max ?? item.system.level ?? 0));
      options.push({
        ref: `${actor.uuid}::${item.id}`,
        label: `${actor.name}: ${item.name} (${typeLabel(item)}, Strain ${current}/${max})`
      });
    }
  }
  return options;
}

async function attachmentFromRef(ref) {
  const [actorUuid, itemId] = String(ref ?? "").split("::");
  const actor = actorUuid ? await safeFromUuid(actorUuid) : null;
  const item = actor?.items?.get?.(itemId) ?? null;
  return actor && item ? { actor, item } : null;
}

async function adjustAttachmentStrain(item, delta) {
  const strain = item.system.strain ?? {};
  const before = Number(strain.value ?? 0);
  const max = Math.max(0, Number(strain.max ?? item.system.level ?? 0));
  const after = clamp(before + Number(delta ?? 0), 0, max);

  await item.update({ "system.strain.value": after });
  return `${item.name}: Strain ${before} ${signedNumber(after - before)} = ${after} / ${max}.`;
}

function workflowOptionMarkup(selectedValue) {
  const groups = [
    ["attachment", "Attachment Tricks"],
    ["downtime", "Downtime and Work"],
    ["territory", "Territory"],
    ["sourcing", "Sourcing Players"]
  ];

  return groups.map(([group, label]) => {
    const options = WORKFLOW_OPTIONS
      .filter(entry => entry.group === group)
      .map(entry => `<option value="${escapeHTML(entry.value)}" ${entry.value === selectedValue ? "selected" : ""}>${escapeHTML(entry.label)} (p. ${entry.sourcePage})</option>`)
      .join("");
    return `<optgroup label="${escapeHTML(label)}">${options}</optgroup>`;
  }).join("");
}

function option(group, slug, label, sourcePage, summary) {
  return {
    group,
    slug,
    value: `${group}:${slug}`,
    label,
    sourcePage,
    summary
  };
}

async function safeFromUuid(uuid) {
  try {
    return uuid ? await fromUuid(uuid) : null;
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to resolve story workflow UUID.", uuid, error);
    return null;
  }
}

function canUseActor(actor) {
  return Boolean(actor && (game.user?.isGM || actor.isOwner || actor.canUserModify?.(game.user, "update")));
}

function randomDie(sides) {
  return Math.max(1, Math.ceil(Math.random() * sides));
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, Number(value ?? 0)));
}

function signedNumber(value) {
  const number = Number(value ?? 0);
  return number >= 0 ? `+${number}` : `${number}`;
}

function labelCase(value) {
  return String(value ?? "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function typeLabel(item) {
  if (!item) return "";
  if (item.type === "bond") return `${labelCase(item.system.kind || "bond")} Bond`;
  if (item.type === "worshipper") return "Worshippers";
  if (item.type === "vassal") return "Vassal";
  return labelCase(item.type);
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
