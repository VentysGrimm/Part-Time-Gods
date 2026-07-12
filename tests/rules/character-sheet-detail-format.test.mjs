import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();

const { itemAutomationSummary, randomGodPreviewHTML, sheetDetailDisplayHTML } = await import("../../module/sheets/character-sheet.mjs?detail-format");

test("character sheet details render escaped HTML as readable prose", () => {
  const html = sheetDetailDisplayHTML("&lt;p&gt;Borrowed Lives keeps the ability text readable.&lt;/p&gt;");

  assert.equal(html, "<p>Borrowed Lives keeps the ability text readable.</p>");
  assert.equal(html.includes("&lt;p&gt;"), false);
});

test("character sheet details escape plain angle-bracket text", () => {
  const html = sheetDetailDisplayHTML("Use <Dominion> as a placeholder &amp; keep it readable.");

  assert.equal(html, "<p>Use &lt;Dominion&gt; as a placeholder &amp; keep it readable.</p>");
});

test("character sheet details strip unsafe markup and layout-breaking attributes", () => {
  const html = sheetDetailDisplayHTML("<p onclick=\"bad()\">Open <a href=\"javascript:alert(1)\">bad</a> <strong>safe</strong></p><script>bad()</script>");

  assert.equal(html, "<p>Open <a>bad</a> <strong>safe</strong></p>");
});

test("character sheet item automation renders as readable hook prose", () => {
  const summary = itemAutomationSummary({
    automation: {
      enabled: true,
      action: "gain-pantheon-dice",
      resourceChange: { resource: "pantheon", amount: 2 },
      chatCard: true
    }
  });

  assert.equal(summary, "Structured automation hook (enabled): Action: Gain pantheon dice; Resource: Pantheon +2. Posts a use card.");
  assert.equal(summary.includes("{"), false);
});

test("character sheet item automation names structured Blessing hooks", () => {
  const summary = itemAutomationSummary({
    automation: {
      enabled: true,
      action: "prevent-damage",
      roll: { primary: "fortitude", mode: "reflexive" },
      damage: { mode: "negate-successes", resource: "health", timing: "reflexive" },
      chatCard: true
    }
  });

  assert.equal(summary, "Structured automation hook (enabled): Action: Prevent damage; Roll: Reflexive; Damage: Negate successes. Posts a use card.");
  assert.equal(summary.includes("{"), false);
});

test("random god previews show escaped identity and roll-table path", () => {
  const html = randomGodPreviewHTML({
    identity: {
      concept: "God/dess of Smoke <script>",
      divineName: "Aurel of Small Mercies",
      divineTitle: "Keeper of Smoke",
      divineMythSeed: "First woke after a holy errand."
    },
    log: ["Random Dominion - Type: 12 -> Crossover"]
  });

  assert.match(html, /Divine Identity Suggestion/);
  assert.match(html, /Aurel of Small Mercies/);
  assert.match(html, /Roll-table path/);
  assert.match(html, /Random Dominion - Type: 12 -&gt; Crossover/);
  assert.equal(html.includes("<script>"), false);
  assert.match(html, /&lt;script&gt;/);
});
