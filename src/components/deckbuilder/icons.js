// Helpers to resolve the scraped keyword/stat/class icons (manifest in
// src/decks/icons.json, images under public/textures/icons/). Card images are
// referenced app-wide as "../textures/<file>", so icons share that base.
import icons from "../../decks/icons.json";
import idolmaster from "../../assets/logo/idolmaster.png";
import umamusume from "../../assets/logo/umamusume.png";
import vanguard from "../../assets/logo/vanguard.png";

const BASE = "../textures/";

export const iconUrl = (token) => (icons[token] ? BASE + icons[token] : null);

const CLASS_TOKEN = {
  forest: "[forestcraft]",
  sword: "[swordcraft]",
  rune: "[runecraft]",
  dragon: "[dragoncraft]",
  abyss: "[abysscraft]",
  haven: "[havencraft]",
  neutral: "[neutral]",
};

// Collab classes aren't in the scraped icon manifest — use the official logos
// bundled under assets/logo.
const COLLAB_ICON = { idolmaster, umamusume, vanguard };

export const classIcon = (cls) => COLLAB_ICON[cls] || iconUrl(CLASS_TOKEN[cls]);
export const ATTACK_ICON = iconUrl("[attack]");
export const DEFENSE_ICON = iconUrl("[defense]");

// Numbered cost gems exist for 0–10 (no 9); returns null when there's no icon
// (e.g. "X"/"-"/large costs) so callers can fall back to plain text.
export const costIcon = (n) => {
  if (n == null || Number.isNaN(n)) return null;
  return iconUrl(`[cost${String(n).padStart(2, "0")}]`);
};
