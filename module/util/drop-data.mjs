const { TextEditor } = foundry.applications.ux;

export function getDragEventData(event) {
  return TextEditor.getDragEventData(event);
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

  if (data.id) return game.items.get(data.id) ?? null;
  if (data.data) return new Item.implementation(data.data);

  return null;
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
