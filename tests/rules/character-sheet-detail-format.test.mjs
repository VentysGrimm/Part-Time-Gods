import test from "node:test";
import assert from "node:assert/strict";
import { installFoundryTestEnvironment } from "../helpers/foundry-test-env.mjs";

installFoundryTestEnvironment();

const { sheetDetailDisplayHTML } = await import("../../module/sheets/character-sheet.mjs?detail-format");

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
