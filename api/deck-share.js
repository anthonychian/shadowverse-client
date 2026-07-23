// Serves /decks/:id with per-deck Open Graph tags.
//
// Link crawlers (Discord, Twitter, Slack) read raw HTML and never run React, so
// a static CRA build can only ever unfurl the one generic image in
// public/index.html. This function fetches the share row, takes the built
// index.html, swaps in tags for that deck, and returns it. Humans get the same
// document and the SPA boots normally on top of it — no user-agent sniffing.
//
// Wired up by vercel.json. Private and unknown shares fall through to the
// site's default tags, which is what makes "switch the link off" actually hide
// something from a crawler.

const { createClient } = require("@supabase/supabase-js");

// Same public values as src/lib/supabase.js (RLS does the protecting). Kept
// literal here because this file is bundled separately from the CRA app and
// can't import from src/.
const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://udylbxforcfsoumpfcun.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_I-iayZ6ZlGaW5yGin3MLbg_EsaWqXbM";

const BUCKET = "deck-previews";
const SITE_NAME = "Shadowverse Evolve Simulator";

const CLASS_LABELS = {
  forest: "Forestcraft",
  sword: "Swordcraft",
  rune: "Runecraft",
  dragon: "Dragoncraft",
  abyss: "Abysscraft",
  haven: "Havencraft",
  neutral: "Neutral",
  idolmaster: "THE IDOLM@STER CINDERELLA GIRLS",
  umamusume: "Umamusume: Pretty Derby",
  vanguard: "Cardfight!! Vanguard",
  priconne: "Princess Connect! Re:Dive",
};

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const escapeAttr = (s) =>
  String(s == null ? "" : s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// The built shell changes only on deploy, so one fetch per warm instance.
let shellCache = null;

const fetchShell = async (origin) => {
  if (shellCache) return shellCache;
  const res = await fetch(`${origin}/index.html`);
  if (!res.ok) throw new Error(`shell ${res.status}`);
  shellCache = await res.text();
  return shellCache;
};

// Drop the site-wide tags this page is about to replace, so a crawler doesn't
// have to choose between two og:image values.
const stripDefaults = (html) =>
  html
    .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/<meta\s+name="description"[^>]*>/gi, "")
    .replace(/<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");

const buildTags = ({ title, description, image, url }) =>
  [
    `<title>${escapeAttr(title)}</title>`,
    `<meta name="description" content="${escapeAttr(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:site_name" content="${escapeAttr(SITE_NAME)}" />`,
    `<meta property="og:title" content="${escapeAttr(title)}" />`,
    `<meta property="og:description" content="${escapeAttr(description)}" />`,
    `<meta property="og:url" content="${escapeAttr(url)}" />`,
    image ? `<meta property="og:image" content="${escapeAttr(image)}" />` : "",
    image ? `<meta property="og:image:alt" content="Deck preview" />` : "",
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`,
    `<meta name="twitter:title" content="${escapeAttr(title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(description)}" />`,
    image ? `<meta name="twitter:image" content="${escapeAttr(image)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n    ");

// Replace the shell's <title> with ours and inject the rest before </head>.
const inject = (shell, tags) =>
  stripDefaults(shell)
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<\/head>/i, `    ${tags}\n  </head>`);

const describe = (deck, ownerName) => {
  const cls = CLASS_LABELS[deck && deck.class] || "Deck";
  const main = (deck && deck.deck && deck.deck.length) || 0;
  const evo = (deck && deck.evoDeck && deck.evoDeck.length) || 0;
  const parts = [`${cls} • ${main} cards + ${evo} evo`];
  if (ownerName) parts.push(`shared by ${ownerName}`);
  return parts.join(" • ");
};

module.exports = async (req, res) => {
  const id = (req.query && req.query.id) || "";
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;

  let share = null;
  try {
    const { data } = await supabase
      .from("shared_decks")
      .select("id, deck, owner_name, image_path")
      .eq("id", id)
      .eq("is_public", true)
      .maybeSingle();
    share = data || null;
  } catch (e) {
    // A Supabase hiccup shouldn't take the page down — fall back to the
    // default tags and let the SPA render (and report) the real state.
    console.warn("deck-share: lookup failed:", e.message);
  }

  let shell;
  try {
    shell = await fetchShell(origin);
  } catch (e) {
    // Extremely rare (same-origin static file). Serve a minimal document that
    // still carries the tags, so at least the unfurl is right.
    console.warn("deck-share: could not read app shell:", e.message);
    const title = share ? share.deck.name || "Shared deck" : SITE_NAME;
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.status(200).send(
      `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
    ${buildTags({
      title,
      description: share ? describe(share.deck, share.owner_name) : SITE_NAME,
      image: share && share.image_path
        ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${share.image_path}`
        : null,
      url: `${origin}/decks/${id}`,
    })}
  </head><body><a href="/">Open ${escapeAttr(SITE_NAME)}</a></body></html>`,
    );
  }

  const html = share
    ? inject(
        shell,
        buildTags({
          title: `${share.deck.name || "Shared deck"} | ${SITE_NAME}`,
          description: describe(share.deck, share.owner_name),
          image: share.image_path
            ? `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${share.image_path}`
            : null,
          url: `${origin}/decks/${id}`,
        }),
      )
    : shell;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  // Short shared cache so revoking a link takes effect quickly, with a long
  // stale window so the function is rarely on the critical path.
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=300, stale-while-revalidate=86400",
  );
  return res.status(200).send(html);
};
