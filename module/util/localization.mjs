export const SYSTEM_ID = "part-time-gods";

export function localize(key, data = {}) {
  return localizeFallback(key, key, data);
}

export function localizeFallback(key, fallback = "", data = {}) {
  const i18n = globalThis.game?.i18n;
  let value = "";

  if (i18n?.has?.(key)) {
    value = i18n.format ? i18n.format(key, data) : i18n.localize(key);
  } else {
    const localized = i18n?.localize?.(key);
    if (localized && localized !== key) value = i18n?.format ? i18n.format(key, data) : localized;
  }

  return formatTokens(value || fallback || key, data);
}

export function localizeRecord(rootKey, record = {}) {
  return Object.fromEntries(
    Object.entries(record).map(([key, fallback]) => [key, localizeFallback(`${rootKey}.${key}`, fallback)])
  );
}

function formatTokens(template, data = {}) {
  return String(template ?? "").replace(/\{([^}]+)\}/g, (match, key) => {
    const value = data[key.trim()];
    return value === undefined || value === null ? match : String(value);
  });
}
