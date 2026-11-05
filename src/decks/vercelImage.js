// Card art and icons live on Cloudflare R2, so they bypass the Vercel CDN and
// are served at their full source size. Vercel's Image Optimization API resizes
// and re-encodes them (WebP) at the edge, and caches the result separately from
// the untouched source. Keep these widths in sync with `images.sizes` in
// vercel.json — the API rejects a `w` that isn't listed there.
export const IMAGE_WIDTHS = {
  icon: 64,
  thumb: 186,
  full: 459,
};

const QUALITY = 75;

// `/_vercel/image` only exists on a Vercel deployment. In local dev / tests we
// keep the direct R2 URLs so `npm start` and Jest don't request a 404.
const ENABLED = FALSE;

// The source URL is a query parameter, so its own query string (`?v=…`) must be
// escaped. Slashes and colons are left unescaped so the result still contains the
// `/textures/…` path that the onError fallbacks match on.
const encodeSource = (src) =>
  encodeURIComponent(src).replace(/%2F/gi, "/").replace(/%3A/gi, ":");

/**
 * Wrap a remote card-art URL in Vercel's Image Optimization endpoint.
 *
 * Only absolute URLs under `/textures/` are rewritten: those are the R2 assets
 * this is for. Local bundles (`/atlases`, hashed wallpapers, data URIs) pass
 * through untouched so the optimizer never sees a path it can't reach.
 */
export const optimizeImage = (src, width, quality = QUALITY) => {
  if (
    !ENABLED ||
    !src ||
    !/^https?:\/\//i.test(src) ||
    !src.includes("/textures/") ||
    src.includes("/_vercel/image?")
  ) {
    return src;
  }
  return `/_vercel/image?url=${encodeSource(src)}&w=${width}&q=${quality}`;
};

export const optimizeThumb = (src) => optimizeImage(src, IMAGE_WIDTHS.thumb);
export const optimizeFull = (src) => optimizeImage(src, IMAGE_WIDTHS.full);
export const optimizeIcon = (src) => optimizeImage(src, IMAGE_WIDTHS.icon);
