// Maps each leader name (the same tokens Leader.js / PlayerUI / EnemyUI switch
// on) to its svgdb.me leader id, so we can stream that leader's Spine animation
// from https://svgdb.me/assets/anim/class_<id>.json (+ .atlas + .png).
//
// Ids were resolved against svgdb's /api/leaders index and each one verified to
// have an animation asset. A few leaders have no Spine animation on svgdb
// (Manhatten Cafe / Maruzensky — Uma Musume have none; Vanguard isn't on svgdb)
// and are intentionally omitted, so Leader falls back to the static PNG for them.
export const LEADER_SPINE_IDS = {
  SiLong: "3514",
  Forte: "104",
  Galmieux: "1604",
  Lishenna: "1608",
  Ceridwen: "4605",
  Kuon: "2803",
  Daria: "403",
  Bunny: "2602",
  Albert: "402",
  Sekka: "2601",
  CC: "2401",
  Piercye: "3901",
  Icy: "3308", // Iceschillendrig
  Anisage: "3505",
  Amy: "3305",
  Mono: "1606",
  Vania: "106",
  Rola: "2814",
  Jeanne: "3307",
  Rin: "3111", // Rin Shibuya
  Uzuki: "3102", // Uzuki Shimamura
  Mio: "3104", // Mio Honda
  Pecorine: "1002", // Princess Connect! Re:Dive
  Karyl: "1003", // Princess Connect! Re:Dive
};

// Per-leader size multiplier applied on top of the auto fit-to-box scaling.
// Some skeletons have large bounding boxes (wide poses / effect attachments) so
// the visible character ends up small in the portrait — bump those here. 1 (the
// default for anything not listed) keeps a leader at its current, auto-fit size.
export const LEADER_SPINE_SCALE = {
  Forte: 2,
  SiLong: 1.2,
  Piercye: 1.2,
  Galmieux: 2.5,
  Albert: 1.15,
  Daria: 1.1,
  CC: 1.15,
  Amy: 1.18,
  Mono: 1.2,
  Rola: 1.2,
  Anisage: 1.2,
  Sekka: 1.15,
  Ceridwen: 1.15,
  Lishenna: 1.15,
  Kuon: 1.2,
  Icy: 1.2, // Iceschillendrig
  Jeanne: 2.45,
  Rin: 1.9,
};

export const leaderSpineScale = (name) => LEADER_SPINE_SCALE[name] || 1;

// Optional manual vertical nudge per leader, as a fraction of the canvas height
// (positive = move the character down, negative = up). Use to fine-tune framing
// when a skeleton's bounding box doesn't sit where the visible character is.
export const LEADER_SPINE_OFFSET_Y = {
  Galmieux: -0.54,
};

export const leaderSpineOffsetY = (name) => LEADER_SPINE_OFFSET_Y[name] || 0;

// Optional manual horizontal nudge per leader, as a fraction of the canvas width
// (positive = move the character right, negative = left).
export const LEADER_SPINE_OFFSET_X = {
  Galmieux: 0.76,
  Icy: -0.3,
  Rin: -0.7,
};

export const leaderSpineOffsetX = (name) => LEADER_SPINE_OFFSET_X[name] || 0;

// Leaders that center poorly off the live idle frame and instead use the fixed
// setup-pose bounds (frame-independent). Opt-in per leader so the default
// behavior — which works for everyone else — is left untouched.
export const LEADER_SPINE_SETUP_CENTER = new Set(["Galmieux"]);

export const usesSetupCenter = (name) => LEADER_SPINE_SETUP_CENTER.has(name);

// Static portrait (used in the leader-select grid and as the still fallback
// under the animation) for leaders that have no bundled local PNG — hotlinked
// from svgdb, same as the animation.
export const SVGDB_LEADER_PORTRAIT = {
  Piercye: "https://svgdb.me/assets/leader/class_3901_base.png",
  Amy: "https://svgdb.me/assets/leader/class_3305_base.png",
  Pecorine: "https://svgdb.me/assets/leader/class_1002_base.png",
  Karyl: "https://svgdb.me/assets/leader/class_1003_base.png",
};

export const SPINE_ANIM_BASE = "https://svgdb.me/assets/anim";

// Full URL to a leader's Spine skeleton json. pixi-spine's universal loader
// pulls the companion .atlas and texture automatically from the same folder.
export const leaderSpineUrl = (name) => {
  const id = LEADER_SPINE_IDS[name];
  return id ? `${SPINE_ANIM_BASE}/class_${id}.json` : null;
};
