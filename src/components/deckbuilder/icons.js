// Helpers to resolve the scraped keyword/stat/class icons (manifest in
// src/decks/icons.json, images under public/textures/icons/). Card images are
// referenced app-wide as "../textures/<file>", so icons share that base.
import icons from "../../decks/icons.json";
import iconData from "../../decks/iconData.json";
import idolmaster from "../../assets/logo/idolmaster.png";
import umamusume from "../../assets/logo/umamusume.png";
import vanguard from "../../assets/logo/vanguard.png";
import priconne from "../../assets/logo/priconne.webp";

const BASE = "../textures/";

// The small icons ship as data URIs (src/scripts/inline-icons.js) so they cost
// no requests: a single inspector view would otherwise fetch a cost gem, two
// stat icons and a keyword or two, and the filter bar fetches all seven class
// symbols. The handful of large ones aren't inlined and still resolve to a URL.
//
// Effect text tokens are matched case-insensitively (a card printing may write
// "[Fanfare]" where the manifest key is "[fanfare]"), which is why the fallback
// is tried against the lowercased token too. Every caller must come through
// here — a lookup straight into icons.json would miss the inlined data URIs and
// silently cost a request per icon.
export const iconUrl = (token) => {
  if (!token) return null;
  const lower = String(token).toLowerCase();
  if (iconData[token]) return iconData[token];
  if (iconData[lower]) return iconData[lower];
  const file = icons[token] || icons[lower];
  return file ? BASE + file : null;
};

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
const COLLAB_ICON = { idolmaster, umamusume, vanguard, priconne };

export const classIcon = (cls) => COLLAB_ICON[cls] || iconUrl(CLASS_TOKEN[cls]);
export const ATTACK_ICON = iconUrl("[attack]");
export const DEFENSE_ICON = iconUrl("[defense]");

// Numbered cost gems exist for 0–10 (no 9); returns null when there's no icon
// (e.g. "X"/"-"/large costs) so callers can fall back to plain text.
export const costIcon = (n) => {
  if (n == null || Number.isNaN(n)) return null;
  return iconUrl(`[cost${String(n).padStart(2, "0")}]`);
};
