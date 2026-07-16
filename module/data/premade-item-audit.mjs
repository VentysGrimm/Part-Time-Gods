const SYSTEM_ID = "part-time-gods";

export const VALID_CREATED_ITEM_TYPES = new Set([
  "archetype",
  "armor",
  "attachment",
  "blessing",
  "bond",
  "condition",
  "curse",
  "domain",
  "occupation",
  "power",
  "relic",
  "theology",
  "truth",
  "vassal",
  "weapon",
  "worshipper"
]);

export const VALID_CREATED_ITEM_FOLDER_KEYS = new Set([
  ...VALID_CREATED_ITEM_TYPES,
  "manifestation",
  "ritual"
]);

export const JOURNAL_STYLE_ITEM_KINDS = new Set([
  "chapter-4-rule",
  "chapter-5-rule",
  "critical-failure-effect",
  "gear-quality",
  "manifestation-application",
  "rules-reference",
  "complete-rules"
]);

export function auditCreatedItemDocuments(collections) {
  const entries = collections.flatMap(({ name, documents }) =>
    documents.map(document => ({
      collection: name,
      document
    }))
  );
  const issues = {
    invalidTypes: [],
    invalidFolderKeys: [],
    duplicateTypeNames: [],
    duplicateSourceIds: [],
    journalStyleItems: [],
    journalSourceItems: [],
    missingSourceIds: []
  };
  const counts = {
    collections: Object.fromEntries(collections.map(({ name, documents }) => [name, documents.length])),
    folders: {},
    types: {}
  };
  const typeNames = new Map();
  const sourceIds = new Map();

  for (const { collection, document } of entries) {
    const flags = document.flags?.[SYSTEM_ID] ?? {};
    const documentKey = auditDocumentKey(collection, document);
    const folderKey = itemFolderKey(document);
    const sourceId = flags.sourceId ?? document.system?.sourceId;

    counts.types[document.type] = (counts.types[document.type] ?? 0) + 1;
    counts.folders[folderKey] = (counts.folders[folderKey] ?? 0) + 1;

    if (!VALID_CREATED_ITEM_TYPES.has(document.type)) issues.invalidTypes.push(documentKey);
    if (!VALID_CREATED_ITEM_FOLDER_KEYS.has(folderKey)) issues.invalidFolderKeys.push(`${documentKey}:${folderKey}`);
    if (!sourceId) issues.missingSourceIds.push(documentKey);
    if (JOURNAL_STYLE_ITEM_KINDS.has(flags.kind)) issues.journalStyleItems.push(`${documentKey}:${flags.kind}`);
    if (String(sourceId ?? flags.sourceId ?? "").startsWith("journal:")) issues.journalSourceItems.push(`${documentKey}:${sourceId}`);

    const typeName = `${document.type}:${document.name}`;
    typeNames.set(typeName, [...(typeNames.get(typeName) ?? []), documentKey]);
    if (sourceId) sourceIds.set(sourceId, [...(sourceIds.get(sourceId) ?? []), documentKey]);
  }

  issues.duplicateTypeNames = duplicatedKeys(typeNames);
  issues.duplicateSourceIds = duplicatedKeys(sourceIds);

  return {
    summary: {
      totalItems: entries.length,
      issueCount: Object.values(issues).reduce((total, entries) => total + entries.length, 0)
    },
    counts,
    issues
  };
}

export function itemAuditHasIssues(audit) {
  return Object.values(audit.issues ?? {}).some(entries => entries.length > 0);
}

export function itemAuditIssueLines(audit) {
  return Object.entries(audit.issues ?? {}).flatMap(([key, entries]) =>
    entries.map(entry => `${key}: ${entry}`)
  );
}

export function itemFolderKey(item) {
  return item.flags?.[SYSTEM_ID]?.folder ?? item.type ?? "item";
}

function auditDocumentKey(collection, document) {
  return `${collection}:${document.type}:${document.name}`;
}

function duplicatedKeys(map) {
  return [...map.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([key, entries]) => `${key}: ${entries.join(", ")}`);
}
