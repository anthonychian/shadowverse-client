// Maps a deck class to its pool of leader names — the exact "alt" tokens the
// in-game leader grid (Selection.js) uses and that Leader/PlayerUI/EnemyUI
// switch on. When both players load into a fresh game, each deck auto-selects a
// random leader from its class's pool; the player can still change it from the
// usual leader grid afterwards.
//
// Mapping confirmed by the project owner. Daria is intentionally not pooled
// (still manually selectable). Vanguard has no dedicated leader image yet, so it
// uses Galmieux as a placeholder.
export const CLASS_LEADERS = {
  forest: ["Sekka", "Hozumi", "CC", "Orchis"],
  sword: ["Bunny", "Albert"],
  rune: ["Lishenna", "Ceridwen", "Kuon"],
  dragon: ["SiLong", "Drache", "Forte", "Galmieux"],
  abyss: ["Icy", "Anisage", "Vania", "Mono"],
  haven: ["Rola", "Jeanne"],
  umamusume: ["Manhatten Cafe", "Maruzensky"],
  vanguard: ["Vanguard"],
  idolmaster: ["Rin", "Uzuki", "Mio"],
};

// A random leader from the class's pool, or "" if the class is unknown/empty
// (caller leaves the leader for the player to pick manually).
export const randomLeaderForClass = (cls) => {
  const pool = CLASS_LEADERS[cls];
  if (!pool || pool.length === 0) return "";
  return pool[Math.floor(Math.random() * pool.length)];
};
