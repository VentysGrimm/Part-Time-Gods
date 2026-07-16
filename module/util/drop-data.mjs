export function getDragEventData(event) {
  const helper = foundry.applications?.ux?.TextEditor?.getDragEventData ?? globalThis.TextEditor?.getDragEventData;
  if (helper) {
    try {
      const data = helper(event);
      if (data && Object.keys(data).length) return data;
    } catch (error) {
      console.warn("Part-Time Gods 2E | Unable to parse Foundry drag data.", error);
    }
  }

  return parseDataTransfer(event?.dataTransfer);
}

export async function itemFromDropData(data) {
  if (data?.type !== "Item") return null;

  if (data.uuid) {
    const document = await documentFromUuid(data.uuid);
    if (document?.documentName === "Item") return document;
  }

  if (data.pack && data.id) {
    const pack = game.packs.get(data.pack);
    if (pack?.documentName === "Item") return pack.getDocument(data.id);
  }

  const id = data.id ?? data._id ?? data.data?._id;
  if (id) return game.items.get(id) ?? null;
  if (data.data) return new Item.implementation(data.data);

  return null;
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
    const uuid = extractDroppedUuid(value);
    return uuid ? dropDataFromUuid(uuid) : {};
  }
}

function extractDroppedUuid(value) {
  const match = String(value).match(/\bdata-uuid=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i)
    ?? String(value).match(/\buuid=(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
  return match ? decodeHTMLAttribute(match[1] ?? match[2] ?? match[3] ?? "") : "";
}

function dropDataFromUuid(uuid) {
  const type = String(uuid).split(".")[0] ?? "";
  return type ? { type, uuid } : { uuid };
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
