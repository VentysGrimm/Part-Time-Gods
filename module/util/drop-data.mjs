const DROP_DATA_CACHE_KEY = "__ptgDropData";
const HTML_DROP_PACK_ATTRIBUTE = "data-pack";
const HTML_DROP_ID_ATTRIBUTE = "data-id";
const HTML_DROP_DOCUMENT_ID_ATTRIBUTE = "data-document-id";
const HTML_DROP_TYPE_ATTRIBUTE = "data-type";
const HTML_DROP_DOCUMENT_TYPE_ATTRIBUTE = "data-document-type";

export function getDragEventData(event) {
  if (event?.[DROP_DATA_CACHE_KEY]) return event[DROP_DATA_CACHE_KEY];

  const helper = foundry.applications?.ux?.TextEditor?.getDragEventData ?? globalThis.TextEditor?.getDragEventData;
  let helperError = null;
  if (helper) {
    try {
      const data = helper(event);
      if (data && Object.keys(data).length) return cacheDropData(event, data);
    } catch (error) {
      helperError = error;
    }
  }

  const fallback = parseDataTransfer(event?.dataTransfer);
  if (fallback && Object.keys(fallback).length) return cacheDropData(event, fallback);

  if (helperError) console.warn("Part-Time Gods 2E | Unable to parse Foundry drag data.", helperError);
  return cacheDropData(event, {});
}

export async function itemFromDropData(data) {
  const uuid = String(data?.uuid ?? "").trim();
  const type = String(data?.type ?? "").trim();

  if (uuid) {
    const document = await documentFromUuid(uuid);
    if (document?.documentName === "Item") return document;
  }

  if (data.pack && (data.id || data._id || data.data?._id)) {
    const pack = game.packs.get(data.pack);
    if (pack?.documentName === "Item") return pack.getDocument(data.id ?? data._id ?? data.data?._id);
  }

  if (type && type !== "Item" && !itemUuidLooksLikeItem(uuid)) return null;

  const id = data.id ?? data._id ?? data.data?._id;
  if (id) return game.items.get(id) ?? null;
  if (data.data) return new Item.implementation(data.data);

  return null;
}

function cacheDropData(event, data) {
  const cached = data && Object.keys(data).length ? data : {};
  try {
    if (event && typeof event === "object") event[DROP_DATA_CACHE_KEY] = cached;
  } catch {
    // DOM events may be non-extensible in some hosts; parsing can still proceed without caching.
  }
  return cached;
}

function parseDataTransfer(dataTransfer) {
  const seenTypes = new Set(["text/plain", "application/json", "text/html"]);
  for (const type of Array.from(dataTransfer?.types ?? [])) seenTypes.add(type);

  for (const type of seenTypes) {
    const raw = dataTransfer?.getData?.(type);
    const parsed = parseDroppedValue(raw);
    if (parsed && Object.keys(parsed).length) return parsed;
  }

  return {};
}

function parseDroppedValue(raw) {
  const value = String(raw ?? "").trim();
  if (!value) return {};

  try {
    return JSON.parse(value);
  } catch {
    const htmlDropData = dropDataFromHtmlAttributes(value);
    if (htmlDropData && Object.keys(htmlDropData).length) return htmlDropData;

    const uuid = extractDroppedUuid(value);
    return uuid ? dropDataFromUuid(uuid) : {};
  }
}

function dropDataFromHtmlAttributes(value) {
  const pack = extractHTMLAttribute(value, HTML_DROP_PACK_ATTRIBUTE);
  const id = extractHTMLAttribute(value, HTML_DROP_ID_ATTRIBUTE)
    || extractHTMLAttribute(value, HTML_DROP_DOCUMENT_ID_ATTRIBUTE);
  if (!pack || !id) return {};

  const explicitType = extractHTMLAttribute(value, HTML_DROP_TYPE_ATTRIBUTE)
    || extractHTMLAttribute(value, HTML_DROP_DOCUMENT_TYPE_ATTRIBUTE);
  const documentType = explicitType || inferPackDocumentType(pack);
  return {
    type: documentType || "Compendium",
    pack,
    id
  };
}

function extractDroppedUuid(value) {
  const match = String(value).match(/\bdata-uuid=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
    ?? String(value).match(/\buuid=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
    ?? String(value).match(/@UUID\[([^\]]+)\]/i)
    ?? String(value).match(/\b((?:Actor|Item|Scene|Compendium)\.[^\s<>"']+)/i);
  return match ? decodeHTMLAttribute(match[1] ?? match[2] ?? match[3] ?? "") : "";
}

function extractHTMLAttribute(value, attribute) {
  const escaped = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = String(value).match(new RegExp(`\\b${escaped}=(?:"([^"]+)"|'([^']+)'|([^\\s>]+))`, "i"));
  return match ? decodeHTMLAttribute(match[1] ?? match[2] ?? match[3] ?? "").trim() : "";
}

function dropDataFromUuid(uuid) {
  const parts = String(uuid).split(".");
  const type = parts[0] === "Compendium" ? parts.at(-2) : parts[0];
  return type ? { type, uuid } : { uuid };
}

function inferPackDocumentType(pack) {
  const packDocumentName = game?.packs?.get?.(pack)?.documentName;
  return packDocumentName || "";
}

function itemUuidLooksLikeItem(uuid) {
  const parts = String(uuid ?? "").split(".");
  return parts[0] === "Item" || (parts[0] === "Compendium" && parts.at(-2) === "Item");
}

function decodeHTMLAttribute(value) {
  return String(value)
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

async function documentFromUuid(uuid) {
  if (typeof globalThis.fromUuid !== "function") return null;

  try {
    return await globalThis.fromUuid(uuid);
  } catch (error) {
    console.warn("Part-Time Gods 2E | Unable to resolve dropped Item UUID.", uuid, error);
    return null;
  }
}
