// Card art is served with `Cache-Control: public, max-age=31536000, immutable`
// (see vercel.json), so browsers and the edge hold it for a year keyed by URL.
// Replacing art under the same filename therefore never reaches clients — a
// deploy changes the bytes but not the cache key. To break that, every texture
// URL carries ?v=<ART_VERSION>; bump this constant whenever card artwork is
// swapped (e.g. when a set's JP images are replaced with the official EN art).
// The deck-builder pool is versioned per sheet via content hashes instead
// (src/scripts/build-card-atlases.js), so it needs no manual bump.
export const ART_VERSION = 2;