const SYSTEM_ID = "part-time-gods";
const RULES_KIND = "rules-reference";
const RULES_DATA_PATH = "systems/part-time-gods/module/data/complete-rules.json";

export async function getPremadeJournals() {
  const journals = await loadRulesJournals();
  return journals.map(normalizeRulesJournal).filter(Boolean);
}

async function loadRulesJournals() {
  const route = globalThis.foundry?.utils?.getRoute?.(RULES_DATA_PATH) ?? RULES_DATA_PATH;

  try {
    const response = await fetch(route, { cache: "no-cache" });
    if (!response.ok) return [];

    const journals = await response.json();
    return Array.isArray(journals) ? journals : [];
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to load source-backed rules journals.", error);
    return [];
  }
}

function normalizeRulesJournal(entry, index) {
  if (!entry?.name || !Array.isArray(entry.pages) || !entry.pages.length) return null;

  const pages = entry.pages.map(normalizeRulesPage).filter(Boolean);
  if (!pages.length) return null;

  const systemFlags = entry.flags?.[SYSTEM_ID] ?? {};
  const slug = systemFlags.slug ?? slugify(entry.name);
  const sourcePages = pages.flatMap(page => page.flags?.[SYSTEM_ID]?.sourcePages ?? []);
  const sourcePageStart = sourcePages.length ? Math.min(...sourcePages) : null;
  const sourcePageEnd = sourcePages.length ? Math.max(...sourcePages) : null;

  return {
    name: entry.name,
    sort: entry.sort ?? (index + 1) * 100000,
    pages,
    flags: {
      ...entry.flags,
      [SYSTEM_ID]: {
        ...systemFlags,
        premade: true,
        kind: RULES_KIND,
        category: systemFlags.category ?? entry.category ?? "rules",
        slug,
        sourceId: systemFlags.sourceId ?? `journal:${RULES_KIND}:${slug}`,
        sourceBook: systemFlags.sourceBook ?? "Part-Time Gods Second Edition",
        sourcePageStart,
        sourcePageEnd,
        safeSummary: systemFlags.safeSummary ?? safeRulesSummary(entry, sourcePageStart, sourcePageEnd)
      }
    }
  };
}

function normalizeRulesPage(entry, index) {
  if (!entry?.name || !entry.text?.content) return null;

  const systemFlags = entry.flags?.[SYSTEM_ID] ?? {};
  const sourcePages = extractBookPages(entry.text.content);
  const ruleTopic = systemFlags.ruleTopic ?? slugify(entry.name);
  const slug = systemFlags.slug ?? ruleTopic;

  return {
    name: entry.name,
    type: "text",
    sort: entry.sort ?? (index + 1) * 100000,
    title: {
      show: entry.title?.show ?? true,
      level: entry.title?.level ?? 2
    },
    text: {
      format: entry.text?.format ?? htmlFormat(),
      content: normalizeRulesContent(entry.text.content, {
        title: entry.name,
        ruleTopic,
        sourcePages
      })
    },
    flags: {
      ...entry.flags,
      [SYSTEM_ID]: {
        ...systemFlags,
        premade: true,
        kind: RULES_KIND,
        slug,
        sourceId: systemFlags.sourceId ?? `journal-page:${RULES_KIND}:${slug}`,
        ruleTopic,
        sourceBook: systemFlags.sourceBook ?? "Part-Time Gods Second Edition",
        sourcePages,
        sourcePageStart: sourcePages.length ? Math.min(...sourcePages) : null,
        sourcePageEnd: sourcePages.length ? Math.max(...sourcePages) : null,
        safeSummary: systemFlags.safeSummary ?? `${entry.name} rules reference page.`
      }
    }
  };
}

function safeRulesSummary(entry, sourcePageStart, sourcePageEnd) {
  const pageNames = Array.from(entry.pages ?? [])
    .map(page => page?.name)
    .filter(Boolean)
    .slice(0, 3)
    .join(", ");
  const pageLabel = sourcePageStart && sourcePageEnd
    ? sourcePageStart === sourcePageEnd ? `book p. ${sourcePageStart}` : `book pp. ${sourcePageStart}-${sourcePageEnd}`
    : "the source book";
  const topics = pageNames ? ` Topics include ${pageNames}.` : "";

  return `${entry.name} rules reference from ${pageLabel}.${topics}`;
}

function htmlFormat() {
  return globalThis.CONST?.JOURNAL_ENTRY_PAGE_FORMATS?.HTML ?? 1;
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function normalizeRulesContent(content, { title, ruleTopic, sourcePages } = {}) {
  let html = String(content ?? "").trim();
  if (!html) return "";

  html = removeExtractorArtifacts(html);
  html = removeInlineSourceSummary(html);
  html = normalizeSourcePageSections(html);
  html = normalizeRulesStatHeadings(html);
  html = normalizeHeadingLevels(html);

  const sourceLabel = formatSourceRange(sourcePages);
  const metadata = sourceLabel
    ? `<aside class="ptg-rules-source"><strong>Source:</strong> Part-Time Gods Second Edition, book pp. ${escapeHTML(sourceLabel)}.</aside>`
    : "";

  return `<article class="ptg-rules-journal" data-rule-topic="${escapeHTML(ruleTopic ?? slugify(title ?? "rules"))}">${metadata}${html}</article>`;
}

function removeExtractorArtifacts(content) {
  return content
    .replace(/<h[1-6]>\s*(?:DescTeHnEding\s+OPSPtOoSrITmION|DeCsrceeantidnigng\s+NeSwtoMrymths)\s*<\/h[1-6]>/gi, "")
    .replace(/<p>\s*(?:DescTeHnEding\s+OPSPtOoSrITmION|DeCsrceeantidnigng\s+NeSwtoMrymths)\s*<\/p>/gi, "");
}

function removeInlineSourceSummary(content) {
  return content.replace(/<p><strong>Source:<\/strong>\s*Part-Time Gods Second Edition, book pp\.\s*[^<]+<\/p>/i, "");
}

function normalizeSourcePageSections(content) {
  return content
    .replace(/<section class="ptg-source-page" data-book-page="(\d+)">/g, '<section class="ptg-source-page" data-book-page="$1" aria-label="Book page $1">')
    .replace(/<p class="ptg-source-page-label"><strong>Book p\. (\d+)<\/strong><\/p>/g, '<p class="ptg-source-page-label"><strong>Book p. $1</strong></p>');
}

function normalizeRulesStatHeadings(content) {
  return content.replace(/<h2>(\s*(?:Rank|Threshold|Armor|Spark|Fragments|Attack|Defense|Initiative|Damage|Skills)\b[^<]*)<\/h2>/gi, (match, text) => {
    const cleaned = text.trim();
    const [label, ...rest] = cleaned.split(":");
    const value = rest.join(":").trim();
    if (!value) return `<p class="ptg-rules-stat"><strong>${escapeHTML(cleaned)}</strong></p>`;
    return `<p class="ptg-rules-stat"><strong>${escapeHTML(label.trim())}:</strong> ${escapeHTML(value)}</p>`;
  });
}

function normalizeHeadingLevels(content) {
  return content
    .replace(/<h1>(.*?)<\/h1>/gi, "<h2>$1</h2>")
    .replace(/<h2>(Powers|Power|Payoff|Pay-Offs?)<\/h2>/gi, "<h3>$1</h3>");
}

function extractBookPages(content) {
  return Array.from(new Set(
    [...String(content ?? "").matchAll(/data-book-page="(\d+)"/g)].map(match => Number(match[1]))
  )).sort((a, b) => a - b);
}

function formatSourceRange(pages) {
  if (!Array.isArray(pages) || !pages.length) return "";

  const ranges = [];
  let start = pages[0];
  let previous = pages[0];

  for (const page of pages.slice(1)) {
    if (page === previous + 1) {
      previous = page;
      continue;
    }

    ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
    start = page;
    previous = page;
  }

  ranges.push(start === previous ? `${start}` : `${start}-${previous}`);
  return ranges.join(", ");
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
