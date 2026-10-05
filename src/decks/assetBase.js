// Card art lives in a Cloudflare R2 bucket, not in public/textures/. The repo
// carries ~7k PNGs per variant (full + thumbs + icons), so serving them off the
// app's own origin meant every cold start re-shipped megabytes of art that never
// changed. R2 puts them behind its own edge and out of the deploy.
//
// Override with REACT_APP_TEXTURES_BASE to point a build at a different bucket
// root (e.g. a preview deploy); it is expected WITHOUT a trailing /textures
// segment, which this module appends.
const DEFAULT_BUCKET = "https://pub-d07230ffd5624f6981ebb2918a780b6b.r2.dev";

// Always ends in "/": every call site appends a path relative to textures/,
// e.g. `${TEXTURES_BASE}${cardNo}.png` or `${TEXTURES_BASE}thumbs/${no}.png`.
const root = (process.env.REACT_APP_TEXTURES_BASE || DEFAULT_BUCKET).replace(
  /\/+$/,
  "",
);

export const TEXTURES_BASE = `${root}/textures/`;
