export const PTG_IMAGE_FALLBACK = "icons/svg/item-bag.svg";

export function imageSource(value, fallback = PTG_IMAGE_FALLBACK) {
  const source = String(value ?? "").trim();
  return source || fallback;
}

export function wireImageFallbacks(root, fallback = PTG_IMAGE_FALLBACK) {
  for (const image of root?.querySelectorAll?.("img[data-fallback-src]") ?? []) {
    const fallbackSource = image.dataset.fallbackSrc || fallback;
    if (!image.getAttribute("src")) image.setAttribute("src", fallbackSource);
    if (image.dataset.ptgFallbackWired) continue;
    image.dataset.ptgFallbackWired = "true";
    image.addEventListener("error", () => {
      if (image.getAttribute("src") !== fallbackSource) image.setAttribute("src", fallbackSource);
    });
  }
}
