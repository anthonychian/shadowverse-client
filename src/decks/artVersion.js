// Art is served from the R2 bucket (src/decks/assetBase.js) behind a long-lived
// cache, so a URL is never a stable identity for bytes that get replaced — e.g.
// a set's art swapped to the official EN version. A deploy changes the bytes but
// not the cache key. To break that, every texture URL carries ?v=<ART_VERSION>;
// bump this constant whenever card artwork is swapped.
// The deck-builder pool is versioned per sheet via content hashes instead
// (src/scripts/build-card-atlases.js), so it needs no manual bump.
export const ART_VERSION = 2;