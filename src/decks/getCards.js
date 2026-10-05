import cardStats from "../engine/card-stats.json";
import { ART_VERSION } from "./artVersion";
import { TEXTURES_BASE } from "./assetBase";

// Card art is served with a long immutable cache, so a URL can never be a
// stable identity for bytes that get replaced (e.g. a set's art swapped to the
// EN version). Every texture URL here carries ?v=<ART_VERSION>; bump the
// constant when art changes to force a refetch.
const withVersion = (src) =>
  src && !src.includes("?v=") ? `${src}?v=${ART_VERSION}` : src;

let statsNameToCardNo = null;
function cardNoFromStatsName(cardName) {
  if (!statsNameToCardNo) {
    statsNameToCardNo = new Map();
    for (const [cardNo, stats] of Object.entries(cardStats)) {
      if (stats?.name) statsNameToCardNo.set(stats.name, cardNo);
    }
  }
  return statsNameToCardNo.get(cardName) ?? null;
}

// Resolve a deck card's image honoring a per-deck rarity/art choice. `art` is the
// deck's optional { name: cardNo } map saved by the builder; when a card has a
// chosen printing, use that printing's texture, else fall back to the default
// name-keyed art. The Game keeps using names, so this only affects display.
export const artImage = (cardName, art) =>
  withVersion(
    art && art[cardName]
      ? `${TEXTURES_BASE}${art[cardName]}.png`
      : cardImage(cardName),
  );

// Rewrite a full-size texture URL to its lightweight thumbnail
// (".../textures/thumbs/X.png"). Non-texture paths (require()'d assets, etc.)
// pass through unchanged. Use for many-at-once card displays (hand/field/etc.);
// keep the full-size image for the large hover preview. Matching on the
// "/textures/" segment rather than the origin is what lets this work for both
// the R2 bucket and a same-origin fallback.
export const toThumb = (src) =>
  withVersion(
    src && src.includes("/textures/") && !src.includes("/textures/thumbs/")
      ? src.replace("/textures/", "/textures/thumbs/")
      : src,
  );

// Thumbnail variant of artImage, honoring the per-card art choice.
export const artThumb = (cardName, art) => toThumb(artImage(cardName, art));

// The card shown as a deck's cover/tile art. Prefers the deck's chosen `cover`
// when it's still in the main deck; otherwise the middle main-deck card, the
// historical default. An empty string means "no cover picked" (Auto).
export const deckCoverName = (deck) => {
  const main = deck?.deck;
  const evo = deck?.evoDeck;
  // The chosen cover may live in the main or evolve deck (both are offered in
  // the builder's cover picker), so honor it whenever it's actually in either.
  if (deck?.cover) {
    if (Array.isArray(main) && main.includes(deck.cover)) return deck.cover;
    if (Array.isArray(evo) && evo.includes(deck.cover)) return deck.cover;
  }
  if (Array.isArray(main) && main.length) return main[Math.floor(main.length / 2)];
  if (Array.isArray(evo) && evo.length) return evo[Math.floor(evo.length / 2)];
  return "";
};

const rawCardImage = (cardName) => {
  switch (cardName) {
    case "Aria, Lady of the Woods":
      return `${TEXTURES_BASE}BP16-001EN.png`;
    case "Aria, Lady of the Woods Evolved":
      return `${TEXTURES_BASE}BP16-002EN.png`;
    case "Orchis, Newfound Heart":
      return `${TEXTURES_BASE}BP16-003EN.png`;
    case "Nazuri, Bestial Innkeeper":
      return `${TEXTURES_BASE}BP16-004EN.png`;
    case "Glade, Fragrantwood Ward":
      return `${TEXTURES_BASE}BP16-005EN.png`;
    case "Glade, Fragrantwood Ward Evolved":
      return `${TEXTURES_BASE}BP16-006EN.png`;
    case "Lily, Crystalian Innocence":
      return `${TEXTURES_BASE}BP16-007EN.png`;
    case "Liam, Crazed Creator":
      return `${TEXTURES_BASE}BP16-008EN.png`;
    case "Aerin, Crystalian Frostward":
      return `${TEXTURES_BASE}BP16-009EN.png`;
    case "Aerin, Crystalian Frostward Evolved":
      return `${TEXTURES_BASE}BP16-010EN.png`;
    case "Bayle, Luxglaive Warrior":
      return `${TEXTURES_BASE}BP16-011EN.png`;
    case "Godwood Staff":
      return `${TEXTURES_BASE}BP16-012EN.png`;
    case "Fairy Tamer":
      return `${TEXTURES_BASE}BP16-013EN.png`;
    case "Fairy Tamer Evolved":
      return `${TEXTURES_BASE}BP16-014EN.png`;
    case "Good Fairy of the Pond":
      return `${TEXTURES_BASE}BP16-015EN.png`;
    case "Fay Twinkletoes":
      return `${TEXTURES_BASE}BP16-016EN.png`;
    case "Baby Carbuncle":
      return `${TEXTURES_BASE}BP16-017EN.png`;
    case "Fragrantwood Whispers":
      return `${TEXTURES_BASE}BP16-018EN.png`;
    case "Amelia, Silver Captain":
      return `${TEXTURES_BASE}BP16-019EN.png`;
    case "Amelia, Silver Captain Evolved":
      return `${TEXTURES_BASE}BP16-020EN.png`;
    case "Albert, Levin Stormsaber":
      return `${TEXTURES_BASE}BP16-021EN.png`;
    case "Ginne, Bewitching Courtesan":
      return `${TEXTURES_BASE}BP16-022EN.png`;
    case "Zirconia, Ironcrown Ward":
      return `${TEXTURES_BASE}BP16-023EN.png`;
    case "Zirconia, Ironcrown Ward Evolved":
      return `${TEXTURES_BASE}BP16-024EN.png`;
    case "Amalia, Luxsteel Paladin":
      return `${TEXTURES_BASE}BP16-025EN.png`;
    case "Ravening Tentacles":
      return `${TEXTURES_BASE}BP16-026EN.png`;
    case "Luminous Commander":
      return `${TEXTURES_BASE}BP16-027EN.png`;
    case "Luminous Commander Evolved":
      return `${TEXTURES_BASE}BP16-028EN.png`;
    case "Luminous Magus":
      return `${TEXTURES_BASE}BP16-029EN.png`;
    case "Rusty, Luxcard Trickster":
      return `${TEXTURES_BASE}BP16-030EN.png`;
    case "Jeno, Levin Axeraider":
      return `${TEXTURES_BASE}BP16-031EN.png`;
    case "Flashstep Quickblader":
      return `${TEXTURES_BASE}BP16-032EN.png`;
    case "Flashstep Quickblader Evolved":
      return `${TEXTURES_BASE}BP16-033EN.png`;
    case "Luminous Lancetrooper":
      return `${TEXTURES_BASE}BP16-034EN.png`;
    case "Lyrala, Luminous Potionwright":
      return `${TEXTURES_BASE}BP16-035EN.png`;
    case "Ignominious Samurai":
      return `${TEXTURES_BASE}BP16-036EN.png`;
    case "Ironcrown Majesty":
      return `${TEXTURES_BASE}BP16-037EN.png`;
    case "Anne & Grea, Mysterian Duo":
      return `${TEXTURES_BASE}BP16-038EN.png`;
    case "Lilanthim, Anathema of Edacity":
      return `${TEXTURES_BASE}BP16-039EN.png`;
    case "Lilanthim, Anathema of Edacity Evolved":
      return `${TEXTURES_BASE}BP16-040EN.png`;
    case "Zizdvend, Fate's Arbiter":
      return `${TEXTURES_BASE}BP16-041EN.png`;
    case "Zizdvend, Fate's Arbiter Evolved":
      return `${TEXTURES_BASE}BP16-042EN.png`;
    case "Edelweiss, Sagelight Ward":
      return `${TEXTURES_BASE}BP16-043EN.png`;
    case "Edelweiss, Sagelight Ward Evolved":
      return `${TEXTURES_BASE}BP16-044EN.png`;
    case "Juno, Visionary Alchemist":
      return `${TEXTURES_BASE}BP16-045EN.png`;
    case "Homework Time!":
      return `${TEXTURES_BASE}BP16-046EN.png`;
    case "Penelope, Potions Prodigy":
      return `${TEXTURES_BASE}BP16-047EN.png`;
    case "Penelope, Potions Prodigy Evolved":
      return `${TEXTURES_BASE}BP16-048EN.png`;
    case "Ms. Miranda, Adored Academic":
      return `${TEXTURES_BASE}BP16-049EN.png`;
    case "Snowman Army":
      return `${TEXTURES_BASE}BP16-050EN.png`;
    case "Starry-Eyed Penguin Wizard":
      return `${TEXTURES_BASE}BP16-051EN.png`;
    case "Starry-Eyed Penguin Wizard Evolved":
      return `${TEXTURES_BASE}BP16-052EN.png`;
    case "Emmylou, Witch of Wonder":
      return `${TEXTURES_BASE}BP16-053EN.png`;
    case "William, Mysterian Student":
      return `${TEXTURES_BASE}BP16-054EN.png`;
    case "Sagelight Teachings":
      return `${TEXTURES_BASE}BP16-055EN.png`;
    case "Truth Summons":
      return `${TEXTURES_BASE}BP16-056EN.png`;
    case "Forte, Blackwing Dragoon":
      return `${TEXTURES_BASE}BP16-057EN.png`;
    case "Burnite, Anathema of Flame":
      return `${TEXTURES_BASE}BP16-058EN.png`;
    case "Burnite, Anathema of Flame Evolved":
      return `${TEXTURES_BASE}BP16-059EN.png`;
    case "Nirle, Draconic Prodigy":
      return `${TEXTURES_BASE}BP16-060EN.png`;
    case "Nirle, Draconic Prodigy Evolved":
      return `${TEXTURES_BASE}BP16-061EN.png`;
    case "Liu Feng, Goldennote Ward":
      return `${TEXTURES_BASE}BP16-062EN.png`;
    case "Liu Feng, Goldennote Ward Evolved":
      return `${TEXTURES_BASE}BP16-063EN.png`;
    case "Genesis Dragon Reborn":
      return `${TEXTURES_BASE}BP16-064EN.png`;
    case "Fan of Otohime":
      return `${TEXTURES_BASE}BP16-065EN.png`;
    case "Eyfa, Windrider":
      return `${TEXTURES_BASE}BP16-066EN.png`;
    case "Eyfa, Windrider Evolved":
      return `${TEXTURES_BASE}BP16-067EN.png`;
    case "Marion, Ravishing Dragonewt":
      return `${TEXTURES_BASE}BP16-068EN.png`;
    case "Kit, Luxfang Champion":
      return `${TEXTURES_BASE}BP16-069EN.png`;
    case "Zahar, Stormwave Dragoon":
      return `${TEXTURES_BASE}BP16-070EN.png`;
    case "Little Dragon Nanny":
      return `${TEXTURES_BASE}BP16-071EN.png`;
    case "Little Dragon Nanny Evolved":
      return `${TEXTURES_BASE}BP16-072EN.png`;
    case "Zell, Windreader":
      return `${TEXTURES_BASE}BP16-073EN.png`;
    case "Silvercloud Dragonrider":
      return `${TEXTURES_BASE}BP16-074EN.png`;
    case "Swordsnout Trencher":
      return `${TEXTURES_BASE}BP16-075EN.png`;
    case "Goldennote Melody":
      return `${TEXTURES_BASE}BP16-076EN.png`;
    case "Cerberus, Hellfire Unleashed":
      return `${TEXTURES_BASE}BP16-077EN.png`;
    case "Aragavy, Eternal Hunter":
      return `${TEXTURES_BASE}BP16-078EN.png`;
    case "Aragavy, Eternal Hunter Evolved":
      return `${TEXTURES_BASE}BP16-079EN.png`;
    case "Gold Rush Ghost":
      return `${TEXTURES_BASE}BP16-080EN.png`;
    case "Mukan, Shadowcrypt Ward":
      return `${TEXTURES_BASE}BP16-081EN.png`;
    case "Mukan, Shadowcrypt Ward Evolved":
      return `${TEXTURES_BASE}BP16-082EN.png`;
    case "Balto, Dusk Bounty Hunter":
      return `${TEXTURES_BASE}BP16-083EN.png`;
    case "Ceres, Blue Rose Maiden":
      return `${TEXTURES_BASE}BP16-084EN.png`;
    case "Orthrus, Hellhound Blader":
      return `${TEXTURES_BASE}BP16-085EN.png`;
    case "Orthrus, Hellhound Blader Evolved":
      return `${TEXTURES_BASE}BP16-086EN.png`;
    case "Yuna, Occult Hunter":
      return `${TEXTURES_BASE}BP16-087EN.png`;
    case "Soul Predation":
      return `${TEXTURES_BASE}BP16-088EN.png`;
    case "Vlad, Impaler":
      return `${TEXTURES_BASE}BP16-089EN.png`;
    case "Vlad, Impaler Evolved":
      return `${TEXTURES_BASE}BP16-090EN.png`;
    case "Aryll, Moonstruck Vampire":
      return `${TEXTURES_BASE}BP16-091EN.png`;
    case "Mino, Shrewd Reaper":
      return `${TEXTURES_BASE}BP16-092EN.png`;
    case "Beryl, Nightmare Incarnate":
      return `${TEXTURES_BASE}BP16-093EN.png`;
    case "Shadowcrypt Memorial":
      return `${TEXTURES_BASE}BP16-094EN.png`;
    case "Lapis, Shining Seraph":
      return `${TEXTURES_BASE}BP16-095EN.png`;
    case "Rodeo, Anathema of Judgment":
      return `${TEXTURES_BASE}BP16-096EN.png`;
    case "Rodeo, Anathema of Judgment Evolved":
      return `${TEXTURES_BASE}BP16-097EN.png`;
    case "Rana, Dual Cannon Abbess":
      return `${TEXTURES_BASE}BP16-098EN.png`;
    case "Ronavero, Darkhaven Ward":
      return `${TEXTURES_BASE}BP16-099EN.png`;
    case "Ronavero, Darkhaven Ward Evolved":
      return `${TEXTURES_BASE}BP16-100EN.png`;
    case "Salefa, Guardian of Water":
      return `${TEXTURES_BASE}BP16-101EN.png`;
    case "Pact of the Beast Princess":
      return `${TEXTURES_BASE}BP16-102EN.png`;
    case "Angelic Prism Priestess":
      return `${TEXTURES_BASE}BP16-103EN.png`;
    case "Angelic Prism Priestess Evolved":
      return `${TEXTURES_BASE}BP16-104EN.png`;
    case "Reno, Luxwing Featherfolk":
      return `${TEXTURES_BASE}BP16-105EN.png`;
    case "Serene Sanctuary":
      return `${TEXTURES_BASE}BP16-106EN.png`;
    case "Ironfist Priest":
      return `${TEXTURES_BASE}BP16-107EN.png`;
    case "Ironfist Priest Evolved":
      return `${TEXTURES_BASE}BP16-108EN.png`;
    case "Maeve, Guardian of Earth":
      return `${TEXTURES_BASE}BP16-109EN.png`;
    case "Holy Shieldmaiden":
      return `${TEXTURES_BASE}BP16-110EN.png`;
    case "Mainyu, Darkdweller":
      return `${TEXTURES_BASE}BP16-111EN.png`;
    case "Darkhaven Grace":
      return `${TEXTURES_BASE}BP16-112EN.png`;
    case "Olivia, Heroic Dark Angel":
      return `${TEXTURES_BASE}BP16-113EN.png`;
    case "Olivia, Heroic Dark Angel Evolved":
      return `${TEXTURES_BASE}BP16-114EN.png`;
    case "Ruler of Cocytus":
      return `${TEXTURES_BASE}BP16-115EN.png`;
    case "Phildau, Lionheart Ward":
      return `${TEXTURES_BASE}BP16-116EN.png`;
    case "Phildau, Lionheart Ward Evolved":
      return `${TEXTURES_BASE}BP16-117EN.png`;
    case "Alouette, Doomwright Ward":
      return `${TEXTURES_BASE}BP16-118EN.png`;
    case "Leah, Bellringer Angel":
      return `${TEXTURES_BASE}BP16-119EN.png`;
    case "Apollo, Heaven's Envoy":
      return `${TEXTURES_BASE}BP16-120EN.png`;
    case "Apollo, Heaven's Envoy Evolved":
      return `${TEXTURES_BASE}BP16-121EN.png`;
    case "Divine Thunder":
      return `${TEXTURES_BASE}BP16-122EN.png`;
    case "Doomwright Resurgence":
      return `${TEXTURES_BASE}BP16-123EN.png`;

    case "Izudia, Unkilling Annihilation":
      return `${TEXTURES_BASE}BP15-U01EN.png`;
    case "Amataz, Reverse Blader":
      return `${TEXTURES_BASE}BP15-002EN.png`;
    case "Amataz, Reverse Blader Evolved":
      return `${TEXTURES_BASE}BP15-003EN.png`;
    case "Piercye, Queen of Frost":
      return `${TEXTURES_BASE}BP15-004EN.png`;
    case "Piercye, Queen of Frost Evolved":
      return `${TEXTURES_BASE}BP15-005EN.png`;
    case "Inauspicious Puppeteer":
      return `${TEXTURES_BASE}BP15-006EN.png`;
    case "Inauspicious Puppeteer Evolved":
      return `${TEXTURES_BASE}BP15-007EN.png`;
    case "Erosive Annihilation":
      return `${TEXTURES_BASE}BP15-008EN.png`;
    case "Rejuvenating Resurrection":
      return `${TEXTURES_BASE}BP15-009EN.png`;
    case "Cryptid Keeper":
      return `${TEXTURES_BASE}BP15-010EN.png`;
    case "Cryptid Keeper Evolved":
      return `${TEXTURES_BASE}BP15-011EN.png`;
    case "Adherent of Annihilation":
      return `${TEXTURES_BASE}BP15-012EN.png`;
    case "Fairy Healer":
      return `${TEXTURES_BASE}BP15-013EN.png`;
    case "Hermit of Unkilling":
      return `${TEXTURES_BASE}BP15-014EN.png`;
    case "Hermit of Unkilling Evolved":
      return `${TEXTURES_BASE}BP15-015EN.png`;
    case "Horned Beastie":
      return `${TEXTURES_BASE}BP15-016EN.png`;
    case "Bouquet Fairy":
      return `${TEXTURES_BASE}BP15-017EN.png`;
    case "Emerald Wildfox":
      return `${TEXTURES_BASE}BP15-018EN.png`;
    case "Wind Fairy":
      return `${TEXTURES_BASE}BP15-019EN.png`;
    case "Octrice, Hollow Usurpation":
      return `${TEXTURES_BASE}BP15-020EN.png`;
    case "Kagemitsu, Lost Samurai":
      return `${TEXTURES_BASE}BP15-021EN.png`;
    case "Kagemitsu, Lost Samurai Evolved":
      return `${TEXTURES_BASE}BP15-022EN.png`;
    case "Ralmia, Astrowing":
      return `${TEXTURES_BASE}BP15-023EN.png`;
    case "Arsène Lupin":
      return `${TEXTURES_BASE}BP15-024EN.png`;
    case "Arsène Lupin Evolved":
      return `${TEXTURES_BASE}BP15-025EN.png`;
    case "Ultimate Hollow":
      return `${TEXTURES_BASE}BP15-026EN.png`;
    case "Supersonic Breakthrough":
      return `${TEXTURES_BASE}BP15-U02EN.png`;
    case "Adherent of Hollowness":
      return `${TEXTURES_BASE}BP15-028EN.png`;
    case "Adherent of Hollowness Evolved":
      return `${TEXTURES_BASE}BP15-029EN.png`;
    case "Sword General":
      return `${TEXTURES_BASE}BP15-030EN.png`;
    case "Serration Wave":
      return `${TEXTURES_BASE}BP15-031EN.png`;
    case "Penguin Guardian":
      return `${TEXTURES_BASE}BP15-032EN.png`;
    case "Penguin Guardian Evolved":
      return `${TEXTURES_BASE}BP15-033EN.png`;
    case "Hermit of Usurpation":
      return `${TEXTURES_BASE}BP15-034EN.png`;
    case "Chivalrous Bandit":
      return `${TEXTURES_BASE}BP15-035EN.png`;
    case "Flying Messenger Squirrel":
      return `${TEXTURES_BASE}BP15-036EN.png`;
    case "Brave Buccaneer":
      return `${TEXTURES_BASE}BP15-037EN.png`;
    case "Raio, Truthful Elimination":
      return `${TEXTURES_BASE}BP15-038EN.png`;
    case "Lishenna, Melodious Destruction":
      return `${TEXTURES_BASE}BP15-039EN.png`;
    case "Lishenna, Melodious Destruction Evolved":
      return `${TEXTURES_BASE}BP15-040EN.png`;
    case "Kuon, Wuxing Master":
      return `${TEXTURES_BASE}BP15-041EN.png`;
    case "Noble Shikigami ADVANCED":
      return `${TEXTURES_BASE}BP15-042EN.png`;
    case "Acid Golem":
      return `${TEXTURES_BASE}BP15-043EN.png`;
    case "Acid Golem Evolved":
      return `${TEXTURES_BASE}BP15-044EN.png`;
    case "Melody's Return":
      return `${TEXTURES_BASE}BP15-045EN.png`;
    case "Secrets of Onmyodo":
      return `${TEXTURES_BASE}BP15-U03EN.png`;
    case "Adherent of Elimination":
      return `${TEXTURES_BASE}BP15-047EN.png`;
    case "Adherent of Elimination Evolved":
      return `${TEXTURES_BASE}BP15-048EN.png`;
    case "Adherent of Melody":
      return `${TEXTURES_BASE}BP15-049EN.png`;
    case "Elimination Unleashed":
      return `${TEXTURES_BASE}BP15-050EN.png`;
    case "Scroll Wizard":
      return `${TEXTURES_BASE}BP15-051EN.png`;
    case "Scroll Wizard Evolved":
      return `${TEXTURES_BASE}BP15-052EN.png`;
    case "Hermit of Truth":
      return `${TEXTURES_BASE}BP15-053EN.png`;
    case "Hermit of Destruction":
      return `${TEXTURES_BASE}BP15-054EN.png`;
    case "Crystal Witch":
      return `${TEXTURES_BASE}BP15-055EN.png`;
    case "Twinblade Mage":
      return `${TEXTURES_BASE}BP15-056EN.png`;
    case "Galmieux, Ardent Disdain":
      return `${TEXTURES_BASE}BP15-U04EN.png`;
    case "Filene, Blizzardous Heart":
      return `${TEXTURES_BASE}BP15-058EN.png`;
    case "Filene, Blizzardous Heart Evolved":
      return `${TEXTURES_BASE}BP15-059EN.png`;
    case "Celestial Dragoon":
      return `${TEXTURES_BASE}BP15-060EN.png`;
    case "Celestial Dragoon Evolved":
      return `${TEXTURES_BASE}BP15-061EN.png`;
    case "Mermaid of Punishment":
      return `${TEXTURES_BASE}BP15-062EN.png`;
    case "Mermaid of Punishment Evolved":
      return `${TEXTURES_BASE}BP15-063EN.png`;
    case "Ardent Torch":
      return `${TEXTURES_BASE}PR-387EN.png`;
    case "Whitefrost Blizzard":
      return `${TEXTURES_BASE}BP15-065EN.png`;
    case "Adherent of Ardor":
      return `${TEXTURES_BASE}BP15-066EN.png`;
    case "Adherent of Ardor Evolved":
      return `${TEXTURES_BASE}BP15-067EN.png`;
    case "Windswept Dragonewt":
      return `${TEXTURES_BASE}BP15-068EN.png`;
    case "Tropical Mermaid":
      return `${TEXTURES_BASE}BP15-069EN.png`;
    case "Tiniest Dragon":
      return `${TEXTURES_BASE}BP15-070EN.png`;
    case "Tiniest Dragon Evolved":
      return `${TEXTURES_BASE}BP15-071EN.png`;
    case "Hermit of Disdain":
      return `${TEXTURES_BASE}BP15-072EN.png`;
    case "Beginner Dragoon":
      return `${TEXTURES_BASE}BP15-073EN.png`;
    case "Orbed Cancer":
      return `${TEXTURES_BASE}BP15-074EN.png`;
    case "Whimsical Mermaid":
      return `${TEXTURES_BASE}BP15-075EN.png`;
    case "Valnareik, Lustful Desire":
      return `${TEXTURES_BASE}BP15-076EN.png`;
    case "Valnareik, Lustful Desire Evolved":
      return `${TEXTURES_BASE}BP15-077EN.png`;
    case "Rulenye, Screaming Silence":
      return `${TEXTURES_BASE}BP15-078EN.png`;
    case "Ginsetsu, Terror Banquet":
      return `${TEXTURES_BASE}BP15-079EN.png`;
    case "Yuzuki, Bloodlord":
      return `${TEXTURES_BASE}BP15-080EN.png`;
    case "Yuzuki, Bloodlord Evolved":
      return `${TEXTURES_BASE}BP15-081EN.png`;
    case "Spiteful Screams":
      return `${TEXTURES_BASE}BP15-U05EN.png`;
    case "A Hellish Banquet":
      return `${TEXTURES_BASE}BP15-083EN.png`;
    case "Adherent of Desire":
      return `${TEXTURES_BASE}BP15-084EN.png`;
    case "Adherent of Desire Evolved":
      return `${TEXTURES_BASE}BP15-085EN.png`;
    case "Loathing Desire":
      return `${TEXTURES_BASE}BP15-086EN.png`;
    case "Crimson Virtue":
      return `${TEXTURES_BASE}BP15-087EN.png`;
    case "Adherent of Screams":
      return `${TEXTURES_BASE}BP15-088EN.png`;
    case "Adherent of Screams Evolved":
      return `${TEXTURES_BASE}BP15-089EN.png`;
    case "Hermit of Lust":
      return `${TEXTURES_BASE}BP15-090EN.png`;
    case "Hermit of Silence":
      return `${TEXTURES_BASE}BP15-091EN.png`;
    case "Krampus":
      return `${TEXTURES_BASE}BP15-092EN.png`;
    case "Astral Projection":
      return `${TEXTURES_BASE}BP15-093EN.png`;
    case "Marwynn, Repose of Despair":
      return `${TEXTURES_BASE}BP15-094EN.png`;
    case "Marwynn, Repose of Despair Evolved":
      return `${TEXTURES_BASE}BP15-095EN.png`;
    case "Wilbert, Luminous Paladin":
      return `${TEXTURES_BASE}BP15-U06EN.png`;
    case "Sarissa, Luxflash Spear":
      return `${TEXTURES_BASE}BP15-097EN.png`;
    case "Shiro, Cursed Wings":
      return `${TEXTURES_BASE}BP15-098EN.png`;
    case "Shiro, Cursed Wings Evolved":
      return `${TEXTURES_BASE}BP15-099EN.png`;
    case "Cyclical Fate":
      return `${TEXTURES_BASE}BP15-100EN.png`;
    case "Perpetual Despair":
      return `${TEXTURES_BASE}BP15-101EN.png`;
    case "Adherent of Despair":
      return `${TEXTURES_BASE}BP15-102EN.png`;
    case "Adherent of Despair Evolved":
      return `${TEXTURES_BASE}BP15-103EN.png`;
    case "Zeno, Paradoxical Shield":
      return `${TEXTURES_BASE}BP15-104EN.png`;
    case "Crusader's Rallying Cry":
      return `${TEXTURES_BASE}BP15-105EN.png`;
    case "Temple Healer":
      return `${TEXTURES_BASE}BP15-106EN.png`;
    case "Temple Healer Evolved":
      return `${TEXTURES_BASE}BP15-107EN.png`;
    case "Hermit of Repose":
      return `${TEXTURES_BASE}BP15-108EN.png`;
    case "Hardplume Warrior":
      return `${TEXTURES_BASE}BP15-109EN.png`;
    case "Caladrius":
      return `${TEXTURES_BASE}BP15-110EN.png`;
    case "Sacred Gavel":
      return `${TEXTURES_BASE}BP15-111EN.png`;
    case "Mjerrabaine, Great One":
      return `${TEXTURES_BASE}BP15-SP01EN.png`;
    case "Gilnelise, Ravenous Craving":
      return `${TEXTURES_BASE}BP15-SP02EN.png`;
    case "Gilnelise, Ravenous Craving Evolved":
      return `${TEXTURES_BASE}BP15-U07EN.png`;
    case "Arael":
      return `${TEXTURES_BASE}BP15-115EN.png`;
    case "Arael Evolved":
      return `${TEXTURES_BASE}BP15-116EN.png`;
    case "Thunder God of the Tempest":
      return `${TEXTURES_BASE}BP15-117EN.png`;
    case "Resolve of the Fallen":
      return `${TEXTURES_BASE}BP15-118EN.png`;
    case "Mechanical Analyzer":
      return `${TEXTURES_BASE}BP15-119EN.png`;
    case "Mechanical Analyzer Evolved":
      return `${TEXTURES_BASE}BP15-120EN.png`;
    case "Messenger of the Skies":
      return `${TEXTURES_BASE}BP15-121EN.png`;
    case "Merciless Voiding":
      return `${TEXTURES_BASE}BP15-122EN.png`;
    case "Nomadic Conductor":
      return `${TEXTURES_BASE}BP15-123EN.png`;
    case "Nomadic Conductor Evolved":
      return `${TEXTURES_BASE}BP15-124EN.png`;
    case "Mountain Gigas":
      return `${TEXTURES_BASE}BP15-125EN.png`;
    case "Fluffy Angel":
      return `${TEXTURES_BASE}BP15-126EN.png`;

    case "Hozumi, Enchanting Hostess":
      return `${TEXTURES_BASE}BP14-001EN.png`;
    case "Hozumi, Enchanting Hostess Evolved":
      return `${TEXTURES_BASE}BP14-002EN.png`;
    case "Levon, Scentbound Sword":
      return `${TEXTURES_BASE}BP14-U01EN.png`;
    case "Bastion of Seasons":
      return `${TEXTURES_BASE}BP14-004EN.png`;
    case "Bastion of Seasons Evolved":
      return `${TEXTURES_BASE}BP14-005EN.png`;
    case "Spirit of the Spring":
      return `${TEXTURES_BASE}BP14-006EN.png`;
    case "Illusions of Comfort":
      return `${TEXTURES_BASE}BP14-007EN.png`;
    case "Elven Waitress":
      return `${TEXTURES_BASE}BP14-008EN.png`;
    case "Elven Waitress Evolved":
      return `${TEXTURES_BASE}BP14-009EN.png`;
    case "Tinkering Shopkeeper":
      return `${TEXTURES_BASE}BP14-010EN.png`;
    case "Craftsman's Pride":
      return `${TEXTURES_BASE}BP14-011EN.png`;
    case "Karakuri Servant":
      return `${TEXTURES_BASE}BP14-012EN.png`;
    case "Karakuri Servant Evolved":
      return `${TEXTURES_BASE}BP14-013EN.png`;
    case "Fairylight Guide":
      return `${TEXTURES_BASE}BP14-014EN.png`;
    case "Woodland Pest Control":
      return `${TEXTURES_BASE}BP14-015EN.png`;
    case "Windswept Lancer":
      return `${TEXTURES_BASE}BP14-016EN.png`;
    case "Elven Craftsmanship":
      return `${TEXTURES_BASE}BP14-017EN.png`;
    case "Taketsumi, Aconite Paladin":
      return `${TEXTURES_BASE}BP14-018EN.png`;
    case "Taketsumi, Beginning of Paradise ADVANCED":
      return `${TEXTURES_BASE}BP14-019EN.png`;
    case "Mars, Belligerent Flame":
      return `${TEXTURES_BASE}BP14-020EN.png`;
    case "Mars, Belligerent Flame Evolved":
      return `${TEXTURES_BASE}BP14-U02EN.png`;
    case "Jiemon, Thief Lord":
      return `${TEXTURES_BASE}BP14-022EN.png`;
    case "Jiemon, Thief Lord Evolved":
      return `${TEXTURES_BASE}BP14-023EN.png`;
    case "Bumpkin Recruit":
      return `${TEXTURES_BASE}BP14-024EN.png`;
    case "Hero of the Hunt":
      return `${TEXTURES_BASE}BP14-025EN.png`;
    case "Masterful Musician":
      return `${TEXTURES_BASE}BP14-026EN.png`;
    case "Masterful Musician Evolved":
      return `${TEXTURES_BASE}BP14-027EN.png`;
    case "War Hero":
      return `${TEXTURES_BASE}BP14-028EN.png`;
    case "Noble Shieldmaiden":
      return `${TEXTURES_BASE}BP14-029EN.png`;
    case "Front Desk Frog":
      return `${TEXTURES_BASE}BP14-030EN.png`;
    case "Front Desk Frog Evolved":
      return `${TEXTURES_BASE}BP14-031EN.png`;
    case "Violent Soldier":
      return `${TEXTURES_BASE}BP14-032EN.png`;
    case "Hasty Axeman":
      return `${TEXTURES_BASE}BP14-033EN.png`;
    case "Night on the Town":
      return `${TEXTURES_BASE}BP14-034EN.png`;
    case "Haggler's Gambit":
      return `${TEXTURES_BASE}BP14-035EN.png`;
    case "Yukishima, Master Biographer":
      return `${TEXTURES_BASE}BP14-U03EN.png`;
    case "Riley, Astral Shaman":
      return `${TEXTURES_BASE}BP14-037EN.png`;
    case "Riley, Astral Shaman Evolved":
      return `${TEXTURES_BASE}BP14-038EN.png`;
    case "Bergent, Layered Sorceress":
      return `${TEXTURES_BASE}BP14-039EN.png`;
    case "Bergent, Layered Sorceress Evolved":
      return `${TEXTURES_BASE}BP14-040EN.png`;
    case "Arctic Chimera":
      return `${TEXTURES_BASE}BP14-041EN.png`;
    case "Story of a Lifetime":
      return `${TEXTURES_BASE}BP14-042EN.png`;
    case "Orchestral Mage":
      return `${TEXTURES_BASE}BP14-043EN.png`;
    case "Orchestral Mage Evolved":
      return `${TEXTURES_BASE}BP14-044EN.png`;
    case "Tempestuous Alchemist":
      return `${TEXTURES_BASE}BP14-045EN.png`;
    case "Dream Come True":
      return `${TEXTURES_BASE}BP14-046EN.png`;
    case "Chakram Wizard":
      return `${TEXTURES_BASE}BP14-047EN.png`;
    case "Chakram Wizard Evolved":
      return `${TEXTURES_BASE}BP14-048EN.png`;
    case "Owl Receptionist":
      return `${TEXTURES_BASE}BP14-049EN.png`;
    case "Earthen Fist":
      return `${TEXTURES_BASE}BP14-050EN.png`;
    case "Magical Reserves":
      return `${TEXTURES_BASE}BP14-051EN.png`;
    case "Grand Spire":
      return `${TEXTURES_BASE}BP14-052EN.png`;
    case "Si Long, Draconic God-Queen":
      return `${TEXTURES_BASE}BP14-053EN.png`;
    case "Si Long, Draconic God-Queen Evolved":
      return `${TEXTURES_BASE}BP14-U04EN.png`;
    case "Sacred Springs Dragon":
      return `${TEXTURES_BASE}BP14-055EN.png`;
    case "Frostbite Dragon":
      return `${TEXTURES_BASE}BP14-056EN.png`;
    case "Frostbite Dragon Evolved":
      return `${TEXTURES_BASE}BP14-057EN.png`;
    case "Dragonskull Bludgeoner":
      return `${TEXTURES_BASE}BP14-058EN.png`;
    case "Soothing Dragonspring":
      return `${TEXTURES_BASE}BP14-059EN.png`;
    case "Dragonfolk Stoker":
      return `${TEXTURES_BASE}BP14-060EN.png`;
    case "Dragonfolk Stoker Evolved":
      return `${TEXTURES_BASE}BP14-061EN.png`;
    case "Leviathan, the Furious":
      return `${TEXTURES_BASE}BP14-062EN.png`;
    case "March of the Dragonspring":
      return `${TEXTURES_BASE}BP14-063EN.png`;
    case "Dragon Breeder":
      return `${TEXTURES_BASE}BP14-064EN.png`;
    case "Dragon Breeder Evolved":
      return `${TEXTURES_BASE}BP14-065EN.png`;
    case "Dragon-Drawn Carriage":
      return `${TEXTURES_BASE}BP14-066EN.png`;
    case "Loyal Sea Serpent":
      return `${TEXTURES_BASE}BP14-067EN.png`;
    case "Mermaid Song":
      return `${TEXTURES_BASE}BP14-068EN.png`;
    case "Aquatic Authority":
      return `${TEXTURES_BASE}BP14-069EN.png`;
    case "Itsurugi, Eager Admirer":
      return `${TEXTURES_BASE}BP14-070EN.png`;
    case "Itsurugi, End of Paradise ADVANCED":
      return `${TEXTURES_BASE}BP14-071EN.png`;
    case "Paracelise, Demon of Greed":
      return `${TEXTURES_BASE}BP14-072EN.png`;
    case "Paracelise, Demon of Greed Evolved":
      return `${TEXTURES_BASE}BP14-SP02EN.png`;
    case "Anisage, Lost Forsaken":
      return `${TEXTURES_BASE}BP14-074EN.png`;
    case "Anisage, Lost Forsaken Evolved":
      return `${TEXTURES_BASE}BP14-075EN.png`;
    case "Frigid Necromancer":
      return `${TEXTURES_BASE}BP14-076EN.png`;
    case "Eternal Contract":
      return `${TEXTURES_BASE}BP14-U05EN.png`;
    case "Briared Vampire":
      return `${TEXTURES_BASE}BP14-078EN.png`;
    case "Briared Vampire Evolved":
      return `${TEXTURES_BASE}BP14-079EN.png`;
    case "Room Service Demon":
      return `${TEXTURES_BASE}BP14-080EN.png`;
    case "Undying Resolve":
      return `${TEXTURES_BASE}BP14-081EN.png`;
    case "Silvernail Blaster":
      return `${TEXTURES_BASE}BP14-082EN.png`;
    case "Silvernail Blaster Evolved":
      return `${TEXTURES_BASE}BP14-083EN.png`;
    case "Parkour Werewolf":
      return `${TEXTURES_BASE}BP14-084EN.png`;
    case "Bat Usher":
      return `${TEXTURES_BASE}BP14-085EN.png`;
    case "Creeping Malice":
      return `${TEXTURES_BASE}BP14-086EN.png`;
    case "Full Moon Leap":
      return `${TEXTURES_BASE}BP14-087EN.png`;
    case "All-Feeling Divine":
      return `${TEXTURES_BASE}BP14-088EN.png`;
    case "All-Feeling Divine Evolved":
      return `${TEXTURES_BASE}BP14-089EN.png`;
    case "Shion, Immortal Aegis":
      return `${TEXTURES_BASE}BP14-U06EN.png`;
    case "Nekhbet":
      return `${TEXTURES_BASE}BP14-091EN.png`;
    case "Nekhbet Evolved":
      return `${TEXTURES_BASE}BP14-092EN.png`;
    case "Impious Bishop":
      return `${TEXTURES_BASE}BP14-093EN.png`;
    case "Chamber of Cleansing":
      return `${TEXTURES_BASE}BP14-094EN.png`;
    case "Winged Gatekeeper":
      return `${TEXTURES_BASE}BP14-095EN.png`;
    case "Winged Gatekeeper Evolved":
      return `${TEXTURES_BASE}BP14-096EN.png`;
    case "Boomerang Sister":
      return `${TEXTURES_BASE}BP14-097EN.png`;
    case "Spiritual Blow":
      return `${TEXTURES_BASE}BP14-098EN.png`;
    case "Twinblade Featherfolk":
      return `${TEXTURES_BASE}BP14-099EN.png`;
    case "Twinblade Featherfolk Evolved":
      return `${TEXTURES_BASE}BP14-100EN.png`;
    case "Fox of Fortune":
      return `${TEXTURES_BASE}BP14-101EN.png`;
    case "Pegasus Knight":
      return `${TEXTURES_BASE}BP14-102EN.png`;
    case "Al-mi'raj Defender":
      return `${TEXTURES_BASE}BP14-103EN.png`;
    case "White Eagle Baptism":
      return `${TEXTURES_BASE}BP14-104EN.png`;
    case "Magna Saber":
      return `${TEXTURES_BASE}BP14-105EN.png`;
    case "Magna Saber Evolved":
      return `${TEXTURES_BASE}BP14-106EN.png`;
    case "Flame and Glass, Duality":
      return `${TEXTURES_BASE}BP14-U07EN.png`;
    case "Glistering Angel":
      return `${TEXTURES_BASE}BP14-108EN.png`;
    case "Glistering Angel Evolved":
      return `${TEXTURES_BASE}BP14-109EN.png`;
    case "Angel's Blessing":
      return `${TEXTURES_BASE}BP14-110EN.png`;
    case "Magna Transformation":
      return `${TEXTURES_BASE}BP14-111EN.png`;
    case "Gunslinger Automaton":
      return `${TEXTURES_BASE}BP14-112EN.png`;
    case "Gunslinger Automaton Evolved":
      return `${TEXTURES_BASE}BP14-113EN.png`;
    case "Ogre Weaponmaster":
      return `${TEXTURES_BASE}BP14-114EN.png`;
    case "Stay in Paradise":
      return `${TEXTURES_BASE}BP14-115EN.png`;
    case "Brave Goblin":
      return `${TEXTURES_BASE}BP14-116EN.png`;
    case "Brave Goblin Evolved":
      return `${TEXTURES_BASE}BP14-117EN.png`;
    case "Torchbearing Guide":
      return `${TEXTURES_BASE}BP14-118EN.png`;
    case "Goblin Assault":
      return `${TEXTURES_BASE}BP14-119EN.png`;

    case "Hokko Tarumae":
      return `${TEXTURES_BASE}ECP01-SP01EN.png`;
    case "Hokko Tarumae Evolved":
      return `${TEXTURES_BASE}ECP01-SP02EN.png`;
    case "Sakura Laurel":
      return `${TEXTURES_BASE}ECP01-SP03EN.png`;
    case "Sounds of Earth":
      return `${TEXTURES_BASE}ECP01-SP04EN.png`;
    case "Haru Urara [Sunny Passion ♪]":
      return `${TEXTURES_BASE}ECP01-005EN.png`;
    case "Yamanin Zephyr":
      return `${TEXTURES_BASE}ECP01-006EN.png`;
    case "Sakura Bakushin O":
      return `${TEXTURES_BASE}ECP01-007EN.png`;
    case "Mihono Bourbon":
      return `${TEXTURES_BASE}ECP01-008EN.png`;
    case "A MORE MARVELOUS WORLD! ☆":
      return `${TEXTURES_BASE}ECP01-009EN.png`;
    case "Gentildonna":
      return `${TEXTURES_BASE}ECP01-SP05EN.png`;
    case "Gentildonna Evolved":
      return `${TEXTURES_BASE}ECP01-SP06EN.png`;
    case "Symboli Rudolf [Enchaînement]":
      return `${TEXTURES_BASE}ECP01-SP07EN.png`;
    case "Sirius Symboli [Escorte Étoile]":
      return `${TEXTURES_BASE}ECP01-SP08EN.png`;
    case "Aston Machan":
      return `${TEXTURES_BASE}ECP01-014EN.png`;
    case "Symboli Kris S":
      return `${TEXTURES_BASE}ECP01-015EN.png`;
    case "Tap Dance City":
      return `${TEXTURES_BASE}ECP01-016EN.png`;
    case "Biwa Hayahide":
      return `${TEXTURES_BASE}ECP01-017EN.png`;
    case "Teio-Oo-Oo!!!":
      return `${TEXTURES_BASE}ECP01-018EN.png`;
    case "Cheval Grand":
      return `${TEXTURES_BASE}ECP01-SP09EN.png`;
    case "Cheval Grand Evolved":
      return `${TEXTURES_BASE}ECP01-SP10EN.png`;
    case "Tanino Gimlet":
      return `${TEXTURES_BASE}ECP01-SP11EN.png`;
    case "Narita Top Road [Peachy Silhouette]":
      return `${TEXTURES_BASE}ECP01-SP12EN.png`;
    case "Verxina":
      return `${TEXTURES_BASE}ECP01-023EN.png`;
    case "Vivlos":
      return `${TEXTURES_BASE}ECP01-024EN.png`;
    case "Daitaku Helios":
      return `${TEXTURES_BASE}ECP01-025EN.png`;
    case "Sweep Tosho":
      return `${TEXTURES_BASE}ECP01-026EN.png`;
    case "Lucky Star in the Sky":
      return `${TEXTURES_BASE}ECP01-027EN.png`;
    case "Neo Universe":
      return `${TEXTURES_BASE}ECP01-SP13EN.png`;
    case "Neo Universe Evolved":
      return `${TEXTURES_BASE}ECP01-SP14EN.png`;
    case "Mr. C.B.":
      return `${TEXTURES_BASE}ECP01-SP15EN.png`;
    case "Katsuragi Ace":
      return `${TEXTURES_BASE}ECP01-SP16EN.png`;
    case "Super Creek [Piece of Mind]":
      return `${TEXTURES_BASE}ECP01-032EN.png`;
    case "Tsurumaru Tsuyoshi":
      return `${TEXTURES_BASE}ECP01-033EN.png`;
    case "El Condor Pasa":
      return `${TEXTURES_BASE}ECP01-034EN.png`;
    case "Nishino Flower":
      return `${TEXTURES_BASE}ECP01-035EN.png`;
    case "Pious Flame, Heavens Scorcher":
      return `${TEXTURES_BASE}ECP01-036EN.png`;
    case "Hishi Miracle":
      return `${TEXTURES_BASE}ECP01-SP17EN.png`;
    case "Hishi Miracle Evolved":
      return `${TEXTURES_BASE}ECP01-SP18EN.png`;
    case "Daiichi Ruby":
      return `${TEXTURES_BASE}ECP01-SP19EN.png`;
    case "Duramente":
      return `${TEXTURES_BASE}ECP01-SP20EN.png`;
    case "Matikanetannhauser [Machitan☆Adventure]":
      return `${TEXTURES_BASE}ECP01-041EN.png`;
    case "K.S.Miracle":
      return `${TEXTURES_BASE}ECP01-042EN.png`;
    case "Air Shakur":
      return `${TEXTURES_BASE}ECP01-043EN.png`;
    case "Manhattan Cafe":
      return `${TEXTURES_BASE}ECP01-044EN.png`;
    case "TT Ignition!":
      return `${TEXTURES_BASE}ECP01-045EN.png`;
    case "Satono Crown":
      return `${TEXTURES_BASE}ECP01-SP21EN.png`;
    case "Satono Crown Evolved":
      return `${TEXTURES_BASE}ECP01-SP22EN.png`;
    case "Mejiro Ramonu":
      return `${TEXTURES_BASE}ECP01-SP23EN.png`;
    case "Jungle Pocket":
      return `${TEXTURES_BASE}ECP01-SP24EN.png`;
    case "Wonder Acute":
      return `${TEXTURES_BASE}ECP01-050EN.png`;
    case "Mejiro Ardan [Hopeful Petals Dancing in the Night]":
      return `${TEXTURES_BASE}ECP01-051EN.png`;
    case "Matikanefukukitaru":
      return `${TEXTURES_BASE}ECP01-052EN.png`;
    case "Mejiro Palmer [Moonlit Devil ♪]":
      return `${TEXTURES_BASE}ECP01-053EN.png`;
    case "Bring 'Em Home, Please!":
      return `${TEXTURES_BASE}ECP01-054EN.png`;
    case "Progenitors and Guides":
      return `${TEXTURES_BASE}ECP01-055EN.png`;
    case "Balliamo?":
      return `${TEXTURES_BASE}ECP01-056EN.png`;
    case "Ryoka Tsurugi":
      return `${TEXTURES_BASE}ECP01-057EN.png`;
    case "A Super Successful Event!":
      return `${TEXTURES_BASE}ECP01-058EN.png`;
    case "Hungry for a Miracle":
      return `${TEXTURES_BASE}ECP01-059EN.png`;
    case "At the End of the Day":
      return `${TEXTURES_BASE}ECP01-060EN.png`;
    case "Forth! Into the Great Age of Agriculture!":
      return `${TEXTURES_BASE}ECP01-061EN.png`;
    case "Workshop! Farmers for a Day!":
      return `${TEXTURES_BASE}ECP01-062EN.png`;

    case "Sekka, Fatebound Fox":
      return `${TEXTURES_BASE}BP13-U01EN.png`;
    case "Sekka, Ninefold Blaze ADVANCED":
      return `${TEXTURES_BASE}BP13-SP01EN.png`;
    case "Aria, Miasma Fairy":
      return `${TEXTURES_BASE}BP13-003EN.png`;
    case "Aria, Miasma Fairy Evolved":
      return `${TEXTURES_BASE}BP13-004EN.png`;
    case "Nelcha, Fashion Hazard":
      return `${TEXTURES_BASE}BP13-005EN.png`;
    case "Nelcha, Fashion Hazard Evolved":
      return `${TEXTURES_BASE}BP13-006EN.png`;
    case "Spinaria, Keeper of the End":
      return `${TEXTURES_BASE}BP13-007EN.png`;
    case "Resolve of the Nine-Tailed Fox":
      return `${TEXTURES_BASE}BP13-008EN.png`;
    case "Sunbright Elf":
      return `${TEXTURES_BASE}BP13-009EN.png`;
    case "Sunbright Elf Evolved":
      return `${TEXTURES_BASE}BP13-010EN.png`;
    case "Wildwood Warrior":
      return `${TEXTURES_BASE}BP13-011EN.png`;
    case "Tree of Wonders":
      return `${TEXTURES_BASE}BP13-012EN.png`;
    case "Fairy Slugger":
      return `${TEXTURES_BASE}BP13-013EN.png`;
    case "Fairy Slugger Evolved":
      return `${TEXTURES_BASE}BP13-014EN.png`;
    case "Edgy Elf":
      return `${TEXTURES_BASE}BP13-015EN.png`;
    case "Gazania Fox":
      return `${TEXTURES_BASE}BP13-016EN.png`;
    case "Tower Root Giant":
      return `${TEXTURES_BASE}BP13-017EN.png`;
    case "Feybolt Archer":
      return `${TEXTURES_BASE}BP13-018EN.png`;
    case "Albert, Thunderous Doom":
      return `${TEXTURES_BASE}BP13-019EN.png`;
    case "Albert, Thunderous Doom Evolved":
      return `${TEXTURES_BASE}BP13-020EN.png`;
    case "Magna Zero":
      return `${TEXTURES_BASE}BP13-U02EN.png`;
    case "Sera, Maiden of the Dawn":
      return `${TEXTURES_BASE}BP13-022EN.png`;
    case "Sera, Maiden of the Dawn Evolved":
      return `${TEXTURES_BASE}BP13-023EN.png`;
    case "Homebound Infantryman":
      return `${TEXTURES_BASE}BP13-024EN.png`;
    case "Levin Justice":
      return `${TEXTURES_BASE}BP13-025EN.png`;
    case "Lounes, Levin Apprentice":
      return `${TEXTURES_BASE}BP13-026EN.png`;
    case "Lounes, Levin Apprentice Evolved":
      return `${TEXTURES_BASE}BP13-027EN.png`;
    case "Jeno, Fanged Tyrant":
      return `${TEXTURES_BASE}BP13-028EN.png`;
    case "Cat Admiral":
      return `${TEXTURES_BASE}BP13-029EN.png`;
    case "Mina, Levin Vice Leader":
      return `${TEXTURES_BASE}BP13-030EN.png`;
    case "Mina, Levin Vice Leader Evolved":
      return `${TEXTURES_BASE}BP13-031EN.png`;
    case "Mona, Levin Mage":
      return `${TEXTURES_BASE}BP13-032EN.png`;
    case "Mena, Levin Duelist":
      return `${TEXTURES_BASE}BP13-033EN.png`;
    case "Icyclone":
      return `${TEXTURES_BASE}BP13-034EN.png`;
    case "Meet the Levin Sisters!":
      return `${TEXTURES_BASE}BP13-035EN.png`;
    case "Anne, Mysterian Imperatrix":
      return `${TEXTURES_BASE}BP13-036EN.png`;
    case "Ghios, Sparkling Prism":
      return `${TEXTURES_BASE}BP13-037EN.png`;
    case "Ghios, Sparkling Prism Evolved":
      return `${TEXTURES_BASE}BP13-U03EN.png`;
    case "Rending Blast ADVANCED":
      return `${TEXTURES_BASE}BP13-039EN.png`;
    case "Mileka, Celestial Seer":
      return `${TEXTURES_BASE}BP13-040EN.png`;
    case "Mileka, Celestial Seer Evolved":
      return `${TEXTURES_BASE}BP13-041EN.png`;
    case "Grea, Scorching Fury":
      return `${TEXTURES_BASE}BP13-042EN.png`;
    case "Whims of Chaos":
      return `${TEXTURES_BASE}BP13-043EN.png`;
    case "Grimoire Sorcerer":
      return `${TEXTURES_BASE}BP13-044EN.png`;
    case "Grimoire Sorcerer Evolved":
      return `${TEXTURES_BASE}BP13-045EN.png`;
    case "Hurricane Golem":
      return `${TEXTURES_BASE}BP13-046EN.png`;
    case "Riven Earth":
      return `${TEXTURES_BASE}BP13-047EN.png`;
    case "Magical Squirrel":
      return `${TEXTURES_BASE}BP13-048EN.png`;
    case "Magical Squirrel Evolved":
      return `${TEXTURES_BASE}BP13-049EN.png`;
    case "Art Society Magus":
      return `${TEXTURES_BASE}BP13-050EN.png`;
    case "Cat Summoner":
      return `${TEXTURES_BASE}BP13-051EN.png`;
    case "Arcane Duplication":
      return `${TEXTURES_BASE}BP13-052EN.png`;
    case "Sacrifice":
      return `${TEXTURES_BASE}BP13-053EN.png`;
    case "Drache, Fiery Dragonlord":
      return `${TEXTURES_BASE}BP13-054EN.png`;
    case "Drache, Fiery Dragonlord Evolved":
      return `${TEXTURES_BASE}BP13-U04EN.png`;
    case "Forte, Sovereign Supreme":
      return `${TEXTURES_BASE}BP13-056EN.png`;
    case "Godfire Phoenix":
      return `${TEXTURES_BASE}BP13-057EN.png`;
    case "Godfire Phoenix Evolved":
      return `${TEXTURES_BASE}BP13-058EN.png`;
    case "Roy, Dragonreaver":
      return `${TEXTURES_BASE}BP13-059EN.png`;
    case "Howling Conflagration":
      return `${TEXTURES_BASE}BP13-060EN.png`;
    case "Flame Pillar Dragonewt":
      return `${TEXTURES_BASE}BP13-061EN.png`;
    case "Flame Pillar Dragonewt Evolved":
      return `${TEXTURES_BASE}BP13-062EN.png`;
    case "Empyreal Dragon":
      return `${TEXTURES_BASE}BP13-063EN.png`;
    case "Scalebound Plight":
      return `${TEXTURES_BASE}BP13-064EN.png`;
    case "Margarite Mermaid":
      return `${TEXTURES_BASE}BP13-065EN.png`;
    case "Margarite Mermaid Evolved":
      return `${TEXTURES_BASE}BP13-066EN.png`;
    case "Earthen Dragonewt":
      return `${TEXTURES_BASE}BP13-067EN.png`;
    case "Twinblade Dragonfolk":
      return `${TEXTURES_BASE}BP13-068EN.png`;
    case "Coral Shark":
      return `${TEXTURES_BASE}BP13-069EN.png`;
    case "Beating of the Dragonwings":
      return `${TEXTURES_BASE}BP13-070EN.png`;
    case "Aluzard, Timeworn Vampire":
      return `${TEXTURES_BASE}BP13-071EN.png`;
    case "Aluzard, Timeworn Vampire Evolved":
      return `${TEXTURES_BASE}BP13-072EN.png`;
    case "Laura, Crimson Strife":
      return `${TEXTURES_BASE}BP13-U05EN.png`;
    case "Ceres, Bride of the Night":
      return `${TEXTURES_BASE}BP13-074EN.png`;
    case "Ceres, Bride of the Night Evolved":
      return `${TEXTURES_BASE}BP13-075EN.png`;
    case "Kagero, Swordbound Soul":
      return `${TEXTURES_BASE}BP13-076EN.png`;
    case "Chris, Beyond the Patch":
      return `${TEXTURES_BASE}BP13-077EN.png`;
    case "Liberté, Unchained Wolf":
      return `${TEXTURES_BASE}BP13-078EN.png`;
    case "Liberté, Unchained Wolf Evolved":
      return `${TEXTURES_BASE}BP13-079EN.png`;
    case "Silversteel Blader":
      return `${TEXTURES_BASE}BP13-080EN.png`;
    case "Soulstrike":
      return `${TEXTURES_BASE}BP13-081EN.png`;
    case "Linkstaff Necromancer":
      return `${TEXTURES_BASE}BP13-082EN.png`;
    case "Linkstaff Necromancer Evolved":
      return `${TEXTURES_BASE}BP13-083EN.png`;
    case "Noble Phantom":
      return `${TEXTURES_BASE}BP13-084EN.png`;
    case "Bandage Connoisseur":
      return `${TEXTURES_BASE}BP13-085EN.png`;
    case "Ghastly Banishment":
      return `${TEXTURES_BASE}BP13-086EN.png`;
    case "Sanguine Necklace":
      return `${TEXTURES_BASE}BP13-087EN.png`;
    case "Jeanne, Despair's Maiden":
      return `${TEXTURES_BASE}BP13-088EN.png`;
    case "Jeanne, Despair's Maiden Evolved":
      return `${TEXTURES_BASE}BP13-U06EN.png`;
    case "Jatelant, God of Prosperity":
      return `${TEXTURES_BASE}BP13-090EN.png`;
    case "Lunerian Paladin":
      return `${TEXTURES_BASE}BP13-091EN.png`;
    case "Lunerian Paladin Evolved":
      return `${TEXTURES_BASE}BP13-092EN.png`;
    case "Absolute Tolerance":
      return `${TEXTURES_BASE}BP13-093EN.png`;
    case "Westmuenster Abbey":
      return `${TEXTURES_BASE}BP13-094EN.png`;
    case "Pyne, Twisted Justice":
      return `${TEXTURES_BASE}BP13-095EN.png`;
    case "Pyne, Twisted Justice Evolved":
      return `${TEXTURES_BASE}BP13-096EN.png`;
    case "Thornclad Arbiter":
      return `${TEXTURES_BASE}BP13-097EN.png`;
    case "Gods' Loving Smite":
      return `${TEXTURES_BASE}BP13-098EN.png`;
    case "Charitable Al-mi'raj":
      return `${TEXTURES_BASE}BP13-099EN.png`;
    case "Charitable Al-mi'raj Evolved":
      return `${TEXTURES_BASE}BP13-100EN.png`;
    case "Prismawing Featherfolk":
      return `${TEXTURES_BASE}BP13-101EN.png`;
    case "Turquoise Sister":
      return `${TEXTURES_BASE}BP13-102EN.png`;
    case "Sacred Groundskeeper":
      return `${TEXTURES_BASE}BP13-103EN.png`;
    case "Sealed Tome":
      return `${TEXTURES_BASE}BP13-104EN.png`;
    case "Sahaquiel & Israfil":
      return `${TEXTURES_BASE}BP13-105EN.png`;
    case "Sahaquiel & Israfil Evolved":
      return `${TEXTURES_BASE}BP13-U07EN.png`;
    case "Planetary Fracture":
      return `${TEXTURES_BASE}BP13-107EN.png`;
    case "Miriam, Mutinous Being":
      return `${TEXTURES_BASE}BP13-108EN.png`;
    case "Miriam, Mutinous Being Evolved":
      return `${TEXTURES_BASE}BP13-109EN.png`;
    case "Grimnir, Voidwrought Wind":
      return `${TEXTURES_BASE}BP13-110EN.png`;
    case "Frostfire":
      return `${TEXTURES_BASE}BP13-111EN.png`;
    case "Managrocer":
      return `${TEXTURES_BASE}BP13-112EN.png`;
    case "Managrocer Evolved":
      return `${TEXTURES_BASE}BP13-113EN.png`;
    case "Goddess of Rebirth":
      return `${TEXTURES_BASE}BP13-114EN.png`;
    case "Dogged Detective":
      return `${TEXTURES_BASE}BP13-115EN.png`;
    case "Armored Goblin":
      return `${TEXTURES_BASE}BP13-116EN.png`;
    case "Armored Goblin Evolved":
      return `${TEXTURES_BASE}BP13-117EN.png`;
    case "Fallen Harpist":
      return `${TEXTURES_BASE}BP13-118EN.png`;
    case "Retracing the Past":
      return `${TEXTURES_BASE}BP13-119EN.png`;

    case "Awakened Gaia":
      return `${TEXTURES_BASE}BP12-001EN.png`;
    case "Elf Queen of Abundant Life":
      return `${TEXTURES_BASE}BP12-002EN.png`;
    case "Elf Queen of Abundant Life Evolved":
      return `${TEXTURES_BASE}BP12-U01EN.png`;
    case "Carbuncle, Immortal Jewel":
      return `${TEXTURES_BASE}BP12-004EN.png`;
    case "Carbuncle, Immortal Jewel Evolved":
      return `${TEXTURES_BASE}BP12-005EN.png`;
    case "Irene, Harvest Defender":
      return `${TEXTURES_BASE}BP12-006EN.png`;
    case "Intertwined Resolve":
      return `${TEXTURES_BASE}BP12-007EN.png`;
    case "Forest Defender":
      return `${TEXTURES_BASE}BP12-008EN.png`;
    case "Forest Defender Evolved":
      return `${TEXTURES_BASE}BP12-009EN.png`;
    case "Windfall Fay":
      return `${TEXTURES_BASE}BP12-010EN.png`;
    case "Aria's Whirlwind":
      return `${TEXTURES_BASE}BP12-011EN.png`;
    case "Forest Hatcheteer":
      return `${TEXTURES_BASE}BP12-012EN.png`;
    case "Forest Hatcheteer Evolved":
      return `${TEXTURES_BASE}BP12-013EN.png`;
    case "Springleaf Sprite":
      return `${TEXTURES_BASE}BP12-014EN.png`;
    case "Elven Pikeman":
      return `${TEXTURES_BASE}BP12-015EN.png`;
    case "Fairy Officer":
      return `${TEXTURES_BASE}BP12-016EN.png`;
    case "Fairy Menhir":
      return `${TEXTURES_BASE}BP12-017EN.png`;
    case "Patrick, Rhiceros Knight":
      return `${TEXTURES_BASE}BP12-018EN.png`;
    case "Patrick, Rhiceros Knight Evolved":
      return `${TEXTURES_BASE}BP12-019EN.png`;
    case "Lecia, Sky Saber":
      return `${TEXTURES_BASE}BP12-U02EN.png`;
    case "Ironfist Beast Warrior":
      return `${TEXTURES_BASE}BP12-021EN.png`;
    case "Ironfist Beast Warrior Evolved":
      return `${TEXTURES_BASE}BP12-022EN.png`;
    case "Alwida, Pirate Queen":
      return `${TEXTURES_BASE}BP12-023EN.png`;
    case "Stroke of Conviction":
      return `${TEXTURES_BASE}BP12-024EN.png`;
    case "Nano, the Dawnblade":
      return `${TEXTURES_BASE}BP12-025EN.png`;
    case "Nano, the Dawnblade Evolved":
      return `${TEXTURES_BASE}BP12-026EN.png`;
    case "Panther Scout":
      return `${TEXTURES_BASE}BP12-027EN.png`;
    case "King's Welcome":
      return `${TEXTURES_BASE}BP12-028EN.png`;
    case "Lilje, Butler of the Mists":
      return `${TEXTURES_BASE}BP12-029EN.png`;
    case "Lilje, Butler of the Mists Evolved":
      return `${TEXTURES_BASE}BP12-030EN.png`;
    case "Sheena, Maid of the Mists":
      return `${TEXTURES_BASE}BP12-031EN.png`;
    case "Wolf Fang Swordsman":
      return `${TEXTURES_BASE}BP12-032EN.png`;
    case "Splendid Fencer":
      return `${TEXTURES_BASE}BP12-033EN.png`;
    case "Ivory Sword Dance":
      return `${TEXTURES_BASE}BP12-034EN.png`;
    case "Belphomet, Worldreaver":
      return `${TEXTURES_BASE}BP12-035EN.png`;
    case "Belphomet, Worldreaver Evolved":
      return `${TEXTURES_BASE}BP12-036EN.png`;
    case "Daria, Infinity Witch":
      return `${TEXTURES_BASE}BP12-U03EN.png`;
    case "Regalore, Steel Chimera":
      return `${TEXTURES_BASE}BP12-038EN.png`;
    case "Regalore, Steel Chimera Evolved":
      return `${TEXTURES_BASE}BP12-039EN.png`;
    case "Melvie, Princess Witch":
      return `${TEXTURES_BASE}BP12-040EN.png`;
    case "Sorcery in Solidarity":
      return `${TEXTURES_BASE}BP12-041EN.png`;
    case "Chaos Wielder":
      return `${TEXTURES_BASE}BP12-042EN.png`;
    case "Chaos Wielder Evolved":
      return `${TEXTURES_BASE}BP12-043EN.png`;
    case "Rebel Against Fate":
      return `${TEXTURES_BASE}BP12-044EN.png`;
    case "Arcane Item Shop":
      return `${TEXTURES_BASE}BP12-045EN.png`;
    case "Gigahand Golem":
      return `${TEXTURES_BASE}BP12-046EN.png`;
    case "Gigahand Golem Evolved":
      return `${TEXTURES_BASE}BP12-047EN.png`;
    case "Device Diviner":
      return `${TEXTURES_BASE}BP12-048EN.png`;
    case "Mechabook Sorcerer":
      return `${TEXTURES_BASE}BP12-049EN.png`;
    case "Chain Lightning":
      return `${TEXTURES_BASE}BP12-050EN.png`;
    case "Mystic Absorption":
      return `${TEXTURES_BASE}BP12-051EN.png`;
    case "Shipsbane Plesiosaurus":
      return `${TEXTURES_BASE}BP12-052EN.png`;
    case "Shipsbane Plesiosaurus Evolved":
      return `${TEXTURES_BASE}BP12-U04EN.png`;
    case "Jerva, Wyrm Transcendent":
      return `${TEXTURES_BASE}BP12-054EN.png`;
    case "Steelcap Pachycephalosaurus":
      return `${TEXTURES_BASE}BP12-055EN.png`;
    case "Steelcap Pachycephalosaurus Evolved":
      return `${TEXTURES_BASE}BP12-056EN.png`;
    case "Giselle, Mermaid Healer":
      return `${TEXTURES_BASE}BP12-057EN.png`;
    case "Cursed Furor":
      return `${TEXTURES_BASE}BP12-058EN.png`;
    case "Assault Dragoon":
      return `${TEXTURES_BASE}BP12-059EN.png`;
    case "Assault Dragoon Evolved":
      return `${TEXTURES_BASE}BP12-060EN.png`;
    case "Petalspine Stegosaurus":
      return `${TEXTURES_BASE}BP12-061EN.png`;
    case "Phoenix Howl":
      return `${TEXTURES_BASE}BP12-062EN.png`;
    case "Dragoon Medic":
      return `${TEXTURES_BASE}BP12-063EN.png`;
    case "Dragoon Medic Evolved":
      return `${TEXTURES_BASE}BP12-064EN.png`;
    case "Rockback Ankylosaurus":
      return `${TEXTURES_BASE}BP12-065EN.png`;
    case "Ruinous Dragon":
      return `${TEXTURES_BASE}BP12-066EN.png`;
    case "Dragon Aficionado":
      return `${TEXTURES_BASE}BP12-067EN.png`;
    case "Overwhelming Crush":
      return `${TEXTURES_BASE}BP12-068EN.png`;
    case "Neun, Daybreak Vampire":
      return `${TEXTURES_BASE}BP12-069EN.png`;
    case "Neun, Daybreak Vampire Evolved":
      return `${TEXTURES_BASE}BP12-070EN.png`;
    case "Gremory, Death Teller":
      return `${TEXTURES_BASE}BP12-U05EN.png`;
    case "Jackshovel Gravedigger":
      return `${TEXTURES_BASE}BP12-072EN.png`;
    case "Jackshovel Gravedigger Evolved":
      return `${TEXTURES_BASE}BP12-073EN.png`;
    case "Medusa, Evil-Eyed Serpent":
      return `${TEXTURES_BASE}BP12-074EN.png`;
    case "Friends Forever":
      return `${TEXTURES_BASE}BP12-075EN.png`;
    case "Liberté, Werewolf Pup":
      return `${TEXTURES_BASE}BP12-076EN.png`;
    case "Liberté, Werewolf Pup Evolved":
      return `${TEXTURES_BASE}BP12-077EN.png`;
    case "Hellfire Hound":
      return `${TEXTURES_BASE}BP12-078EN.png`;
    case "Garnet Waltz":
      return `${TEXTURES_BASE}BP12-079EN.png`;
    case "Bloodstained Berserker":
      return `${TEXTURES_BASE}BP12-080EN.png`;
    case "Bloodstained Berserker Evolved":
      return `${TEXTURES_BASE}BP12-081EN.png`;
    case "Roly-Poly Mk I":
      return `${TEXTURES_BASE}BP12-082EN.png`;
    case "Mechasaw Deathbringer":
      return `${TEXTURES_BASE}BP12-083EN.png`;
    case "Ghoul":
      return `${TEXTURES_BASE}BP12-084EN.png`;
    case "Viper Lash":
      return `${TEXTURES_BASE}BP12-085EN.png`;
    case "Rola, Inferno Dragoon":
      return `${TEXTURES_BASE}BP12-086EN.png`;
    case "Rola, Inferno Dragoon Evolved":
      return `${TEXTURES_BASE}BP12-U06EN.png`;
    case "Charaton, Iceflame Priest":
      return `${TEXTURES_BASE}BP12-088EN.png`;
    case "Gullias, Silverbeast Lord":
      return `${TEXTURES_BASE}BP12-089EN.png`;
    case "Gullias, Silverbeast Lord Evolved":
      return `${TEXTURES_BASE}BP12-090EN.png`;
    case "Robowhip Reverend":
      return `${TEXTURES_BASE}BP12-091EN.png`;
    case "Major Prayers":
      return `${TEXTURES_BASE}BP12-092EN.png`;
    case "Holylight Convert":
      return `${TEXTURES_BASE}BP12-093EN.png`;
    case "Holylight Convert Evolved":
      return `${TEXTURES_BASE}BP12-094EN.png`;
    case "Smilecure Priest":
      return `${TEXTURES_BASE}BP12-095EN.png`;
    case "Salvation Ex Limonia":
      return `${TEXTURES_BASE}BP12-096EN.png`;
    case "Sol Sister":
      return `${TEXTURES_BASE}BP12-097EN.png`;
    case "Sol Sister Evolved":
      return `${TEXTURES_BASE}BP12-098EN.png`;
    case "Robowing Precant":
      return `${TEXTURES_BASE}BP12-099EN.png`;
    case "Fortune Fowl":
      return `${TEXTURES_BASE}BP12-100EN.png`;
    case "Pilgrims' Path":
      return `${TEXTURES_BASE}BP12-101EN.png`;
    case "Fiery Paean":
      return `${TEXTURES_BASE}BP12-102EN.png`;
    case "Natur Al'machinus":
      return `${TEXTURES_BASE}BP12-U07EN.png`;
    case "Changewing Cherub":
      return `${TEXTURES_BASE}BP12-104EN.png`;
    case "Changewing Cherub Evolved":
      return `${TEXTURES_BASE}BP12-105EN.png`;
    case "Seraphic Blade":
      return `${TEXTURES_BASE}BP12-106EN.png`;
    case "Travelers' Respite":
      return `${TEXTURES_BASE}BP12-107EN.png`;
    case "Romantic Chanteuse":
      return `${TEXTURES_BASE}BP12-108EN.png`;
    case "Romantic Chanteuse Evolved":
      return `${TEXTURES_BASE}BP12-109EN.png`;
    case "Giving Gourmet":
      return `${TEXTURES_BASE}BP12-110EN.png`;
    case "Goblin Warpack":
      return `${TEXTURES_BASE}BP12-111EN.png`;
    case "Plucky Treasure Hunter":
      return `${TEXTURES_BASE}BP12-112EN.png`;
    case "Plucky Treasure Hunter Evolved":
      return `${TEXTURES_BASE}BP12-113EN.png`;
    case "Wayfaring Illustrator":
      return `${TEXTURES_BASE}BP12-114EN.png`;
    case "We've Got a Case!":
      return `${TEXTURES_BASE}BP12-115EN.png`;

    case "Spinaria, Waveing Will":
      return `${TEXTURES_BASE}SP01-SP02EN.png`;
    case "Amelia, Sunny Paladin":
      return `${TEXTURES_BASE}SP01-SP05EN.png`;
    case "Falise, Innocent Sea Spray":
      return `${TEXTURES_BASE}SP01-SP12EN.png`;
    case "Sharon, Seaside Nymph":
      return `${TEXTURES_BASE}SP01-SP16EN.png`;
    case "Queen Vampire, Sultry Evening":
      return `${TEXTURES_BASE}SP01-SP20EN.png`;
    case "Zoe, Shore's Melody":
      return `${TEXTURES_BASE}SDD06-003EN.png`;
    case "Alice, Golden Afternoon":
      return `${TEXTURES_BASE}SP01-SP31EN.png`;

    case "Loxis, Homestead Pioneer":
      return `${TEXTURES_BASE}BP11-001EN.png`;
    case "Loxis, Homestead Pioneer Evolved":
      return `${TEXTURES_BASE}BP11-002EN.png`;
    case "Shamu & Shama, Posh Felines":
      return `${TEXTURES_BASE}BP11-003EN.png`;
    case "Terrorformer":
      return `${TEXTURES_BASE}BP11-004EN.png`;
    case "Terrorformer Evolved":
      return `${TEXTURES_BASE}BP11-005EN.png`;
    case "Giant Pastures":
      return `${TEXTURES_BASE}BP11-006EN.png`;
    case "Fairy Flowering":
      return `${TEXTURES_BASE}BP11-007EN.png`;
    case "Varmint Hunter":
      return `${TEXTURES_BASE}BP11-008EN.png`;
    case "Varmint Hunter Evolved":
      return `${TEXTURES_BASE}BP11-009EN.png`;
    case "Stringmaster":
      return `${TEXTURES_BASE}BP11-010EN.png`;
    case "Corrosive Thorns":
      return `${TEXTURES_BASE}BP11-011EN.png`;
    case "Lookout Elf":
      return `${TEXTURES_BASE}BP11-012EN.png`;
    case "Lookout Elf Evolved":
      return `${TEXTURES_BASE}BP11-013EN.png`;
    case "Cactus Cowboy":
      return `${TEXTURES_BASE}BP11-014EN.png`;
    case "Nature's Warden":
      return `${TEXTURES_BASE}BP11-015EN.png`;
    case "Hornet Strike":
      return `${TEXTURES_BASE}BP11-016EN.png`;
    case "Scavenge":
      return `${TEXTURES_BASE}BP11-017EN.png`;
    case "Nahtnaught, Cursed Queen":
      return `${TEXTURES_BASE}BP11-018EN.png`;
    case "Bunny & Baron, Specter Duo":
      return `${TEXTURES_BASE}BP11-019EN.png`;
    case "Bunny & Baron, Specter Duo Evolved":
      return `${TEXTURES_BASE}BP11-020EN.png`;
    case "Reinhardt, the Deathless":
      return `${TEXTURES_BASE}BP11-021EN.png`;
    case "Reinhardt, the Deathless Evolved":
      return `${TEXTURES_BASE}BP11-022EN.png`;
    case "Radical Gunslinger":
      return `${TEXTURES_BASE}BP11-023EN.png`;
    case "Tyrant's Order":
      return `${TEXTURES_BASE}BP11-024EN.png`;
    case "Stalwart Slinger":
      return `${TEXTURES_BASE}BP11-025EN.png`;
    case "Stalwart Slinger Evolved":
      return `${TEXTURES_BASE}BP11-026EN.png`;
    case "Outlaw Gunner":
      return `${TEXTURES_BASE}BP11-027EN.png`;
    case "Desperados' Shot":
      return `${TEXTURES_BASE}BP11-028EN.png`;
    case "Shinobi Tanuki":
      return `${TEXTURES_BASE}BP11-029EN.png`;
    case "Shinobi Tanuki Evolved":
      return `${TEXTURES_BASE}BP11-030EN.png`;
    case "Naht's Henchman":
      return `${TEXTURES_BASE}BP11-031EN.png`;
    case "Frontline Instructor":
      return `${TEXTURES_BASE}BP11-032EN.png`;
    case "Bandit Raid":
      return `${TEXTURES_BASE}BP11-033EN.png`;
    case "Dramatic Retreat":
      return `${TEXTURES_BASE}BP11-034EN.png`;
    case "Vincent, the Peacekeeper":
      return `${TEXTURES_BASE}BP11-035EN.png`;
    case "Vincent, the Peacekeeper Evolved":
      return `${TEXTURES_BASE}BP11-036EN.png`;
    case "Maiser, Neighborhood Hero":
      return `${TEXTURES_BASE}BP11-037EN.png`;
    case "Magical Gunslinger":
      return `${TEXTURES_BASE}BP11-038EN.png`;
    case "Magical Gunslinger Evolved":
      return `${TEXTURES_BASE}BP11-039EN.png`;
    case "Transcendent Simulacrum":
      return `${TEXTURES_BASE}BP11-040EN.png`;
    case "Words of Judgment":
      return `${TEXTURES_BASE}BP11-041EN.png`;
    case "Artistic Arcanist":
      return `${TEXTURES_BASE}BP11-042EN.png`;
    case "Artistic Arcanist Evolved":
      return `${TEXTURES_BASE}BP11-043EN.png`;
    case "Golem Marshal":
      return `${TEXTURES_BASE}BP11-044EN.png`;
    case "Rapid Fire":
      return `${TEXTURES_BASE}BP11-045EN.png`;
    case "Crystal Fencer":
      return `${TEXTURES_BASE}BP11-046EN.png`;
    case "Crystal Fencer Evolved":
      return `${TEXTURES_BASE}BP11-047EN.png`;
    case "Rivaylian Deputy":
      return `${TEXTURES_BASE}BP11-048EN.png`;
    case "Mirror Witch":
      return `${TEXTURES_BASE}BP11-049EN.png`;
    case "Terra Nova":
      return `${TEXTURES_BASE}BP11-050EN.png`;
    case "Scorching Blast":
      return `${TEXTURES_BASE}BP11-051EN.png`;
    case "Reggie, Peerless Artisan":
      return `${TEXTURES_BASE}BP11-052EN.png`;
    case "Reggie, Peerless Artisan Evolved":
      return `${TEXTURES_BASE}BP11-053EN.png`;
    case "Resplendent Phoenix":
      return `${TEXTURES_BASE}BP11-054EN.png`;
    case "Georgius":
      return `${TEXTURES_BASE}BP11-055EN.png`;
    case "Georgius Evolved":
      return `${TEXTURES_BASE}BP11-056EN.png`;
    case "Balefire Wrenchsmith":
      return `${TEXTURES_BASE}BP11-057EN.png`;
    case "Dragon-Devouring Dread":
      return `${TEXTURES_BASE}BP11-058EN.png`;
    case "Azureflame Dragonewt":
      return `${TEXTURES_BASE}BP11-059EN.png`;
    case "Azureflame Dragonewt Evolved":
      return `${TEXTURES_BASE}BP11-060EN.png`;
    case "Dragonfolk Artificer":
      return `${TEXTURES_BASE}BP11-061EN.png`;
    case "Draconic Call":
      return `${TEXTURES_BASE}BP11-062EN.png`;
    case "Mermaid Guide":
      return `${TEXTURES_BASE}BP11-063EN.png`;
    case "Mermaid Guide Evolved":
      return `${TEXTURES_BASE}BP11-064EN.png`;
    case "Wyrmfire Engineer":
      return `${TEXTURES_BASE}BP11-065EN.png`;
    case "Pumpkin Dragon":
      return `${TEXTURES_BASE}BP11-066EN.png`;
    case "Wavecrest Angler":
      return `${TEXTURES_BASE}BP11-067EN.png`;
    case "Thunderous Roar":
      return `${TEXTURES_BASE}BP11-068EN.png`;
    case "Iceschillendrig, Gilded Autocrat":
      return `${TEXTURES_BASE}BP11-069EN.png`;
    case "Iceschillendrig, Gilded Autocrat Evolved":
      return `${TEXTURES_BASE}BP11-070EN.png`;
    case "Illganeau, Horror Astray":
      return `${TEXTURES_BASE}BP11-071EN.png`;
    case "Hazhan, Demonblade Knight":
      return `${TEXTURES_BASE}BP11-072EN.png`;
    case "Hazhan, Demonblade Knight Evolved":
      return `${TEXTURES_BASE}BP11-073EN.png`;
    case "Greatpick Corpse":
      return `${TEXTURES_BASE}BP11-074EN.png`;
    case "Dead to Rights":
      return `${TEXTURES_BASE}BP11-075EN.png`;
    case "Wretch":
      return `${TEXTURES_BASE}BP11-076EN.png`;
    case "Wretch Evolved":
      return `${TEXTURES_BASE}BP11-077EN.png`;
    case "Gold Mine Necromancer":
      return `${TEXTURES_BASE}BP11-078EN.png`;
    case "Wretched Tryst":
      return `${TEXTURES_BASE}BP11-079EN.png`;
    case "Redcap":
      return `${TEXTURES_BASE}BP11-080EN.png`;
    case "Redcap Evolved":
      return `${TEXTURES_BASE}BP11-081EN.png`;
    case "Skeleton Dreamer":
      return `${TEXTURES_BASE}BP11-082EN.png`;
    case "Fulminating Berserker":
      return `${TEXTURES_BASE}BP11-083EN.png`;
    case "Grudge Teller":
      return `${TEXTURES_BASE}BP11-084EN.png`;
    case "Spiderweb Array":
      return `${TEXTURES_BASE}BP11-085EN.png`;
    case "Selena, Sugarkiss Assassin":
      return `${TEXTURES_BASE}BP11-086EN.png`;
    case "Anvelt, Judgment's Cannon":
      return `${TEXTURES_BASE}BP11-087EN.png`;
    case "Anvelt, Judgment's Cannon Evolved":
      return `${TEXTURES_BASE}BP11-088EN.png`;
    case "Vengeful Sniper":
      return `${TEXTURES_BASE}BP11-089EN.png`;
    case "Vengeful Sniper Evolved":
      return `${TEXTURES_BASE}BP11-090EN.png`;
    case "Paladin of Clemency":
      return `${TEXTURES_BASE}BP11-091EN.png`;
    case "Holy Sanctuary":
      return `${TEXTURES_BASE}BP11-092EN.png`;
    case "Set":
      return `${TEXTURES_BASE}BP11-093EN.png`;
    case "Set Evolved":
      return `${TEXTURES_BASE}BP11-094EN.png`;
    case "Shady Priest":
      return `${TEXTURES_BASE}BP11-095EN.png`;
    case "Haven Fire":
      return `${TEXTURES_BASE}BP11-096EN.png`;
    case "Enchanted Knight":
      return `${TEXTURES_BASE}BP11-097EN.png`;
    case "Enchanted Knight Evolved":
      return `${TEXTURES_BASE}BP11-098EN.png`;
    case "Revolver Eagle":
      return `${TEXTURES_BASE}BP11-099EN.png`;
    case "Sacred Stone Apostle":
      return `${TEXTURES_BASE}BP11-100EN.png`;
    case "Benevolent Blight":
      return `${TEXTURES_BASE}BP11-101EN.png`;
    case "Pure Metamorphosis":
      return `${TEXTURES_BASE}BP11-102EN.png`;
    case "Sylvia, Grand Arbiter":
      return `${TEXTURES_BASE}BP11-103EN.png`;
    case "Sylvia, Grand Arbiter Evolved":
      return `${TEXTURES_BASE}BP11-104EN.png`;
    case "Quixotic Adventurer":
      return `${TEXTURES_BASE}BP11-105EN.png`;
    case "Quixotic Adventurer Evolved":
      return `${TEXTURES_BASE}BP11-106EN.png`;
    case "Goblin Queen":
      return `${TEXTURES_BASE}BP11-107EN.png`;
    case "Embodiment of Cocytus":
      return `${TEXTURES_BASE}BP11-108EN.png`;
    case "Wandering Chef":
      return `${TEXTURES_BASE}BP11-109EN.png`;
    case "Wandering Chef Evolved":
      return `${TEXTURES_BASE}BP11-110EN.png`;
    case "Supercharged Guitarist":
      return `${TEXTURES_BASE}BP11-111EN.png`;
    case "Titanic Showdown":
      return `${TEXTURES_BASE}BP11-112EN.png`;
    case "Rivaylian Bandit":
      return `${TEXTURES_BASE}BP11-113EN.png`;
    case "Rivaylian Bandit Evolved":
      return `${TEXTURES_BASE}BP11-114EN.png`;
    case "Vagabond Lizard":
      return `${TEXTURES_BASE}BP11-115EN.png`;
    case "Spice Shower":
      return `${TEXTURES_BASE}BP11-116EN.png`;
    case "Alfred Early":
      return `${TEXTURES_BASE}CSD03a-001EN.png`;
    case "King of Knights, Alfred":
      return `${TEXTURES_BASE}CSD03a-002EN.png`;
    case "Blaster Blade":
      return `${TEXTURES_BASE}CSD03a-003EN.png`;
    case "Blaster Blade Evolved":
      return `${TEXTURES_BASE}CSD03a-004EN.png`;
    case "Wingal":
      return `${TEXTURES_BASE}CSD03a-005EN.png`;
    case "Knight of Conviction, Bors":
      return `${TEXTURES_BASE}CSD03a-006EN.png`;
    case "Flash Shield, Iseult":
      return `${TEXTURES_BASE}CSD03a-007EN.png`;
    case "Knight of Silence, Gallatin":
      return `${TEXTURES_BASE}CSD03a-008EN.png`;
    case "Little Sage, Marron":
      return `${TEXTURES_BASE}CSD03a-009EN.png`;
    case "Lake Maiden, Lien":
      return `${TEXTURES_BASE}CSD03a-010EN.png`;
    case "Knight of Rose, Morgana":
      return `${TEXTURES_BASE}CSD03a-011EN.png`;
    case "Stardust Trumpeter":
      return `${TEXTURES_BASE}CSD03a-016EN.png`;

    case "Dragonic Overlord":
      return `${TEXTURES_BASE}CSD03b-001EN.png`;
    case "Dragonic Overlord Evolved":
      return `${TEXTURES_BASE}CSD03b-002EN.png`;
    case "Dragon Monk, Goku":
      return `${TEXTURES_BASE}CSD03b-003EN.png`;
    case "Dragon Knight, Aleph":
      return `${TEXTURES_BASE}CSD03b-004EN.png`;
    case "Embodiment of Victory, Aleph":
      return `${TEXTURES_BASE}CSD03b-005EN.png`;
    case "Berserk Dragon":
      return `${TEXTURES_BASE}CSD03b-006EN.png`;
    case "Wyvern Guard, Barri":
      return `${TEXTURES_BASE}CSD03b-007EN.png`;
    case "Dragon Knight, Nehalem":
      return `${TEXTURES_BASE}CSD03b-008EN.png`;
    case "Embodiment of Armor, Bahr":
      return `${TEXTURES_BASE}CSD03b-009EN.png`;
    case "Chain-Attack Sutherland":
      return `${TEXTURES_BASE}CSD03b-010EN.png`;
    case "Follower, Reas":
      return `${TEXTURES_BASE}CSD03b-011EN.png`;
    case "Lizard Runner, Undeux":
      return `${TEXTURES_BASE}CSD03b-016EN.png`;

    case "Blue Storm Dragon, Maelstrom":
      return `${TEXTURES_BASE}CP03-U01EN.png`;
    case "Blue Storm Supreme Dragon, Glory Maelstrom":
      return `${TEXTURES_BASE}CP03-002EN.png`;
    case "Storm Rider, Diamantes":
      return `${TEXTURES_BASE}CP03-003EN.png`;
    case "Storm Rider, Basil":
      return `${TEXTURES_BASE}CP03-004EN.png`;
    case "Marine General of the Restless Tides, Algos":
      return `${TEXTURES_BASE}CP03-005EN.png`;
    case "Navalgazer Dragon":
      return `${TEXTURES_BASE}CP03-006EN.png`;
    case "Hydro Hurricane Dragon":
      return `${TEXTURES_BASE}CP03-007EN.png`;
    case "Water General of Wave-Like Spirals, Benedict":
      return `${TEXTURES_BASE}CP03-008EN.png`;
    case "Tear Knight, Valeria":
      return `${TEXTURES_BASE}CP03-009EN.png`;
    case "Tear Knight, Lazarus":
      return `${TEXTURES_BASE}CP03-010EN.png`;
    case "Tear Knight, Theo":
      return `${TEXTURES_BASE}CP03-011EN.png`;
    case "Light Signals Penguin Soldier":
      return `${TEXTURES_BASE}CP03-012EN.png`;
    case "Tear Knight, Cyprus":
      return `${TEXTURES_BASE}CP03-013EN.png`;
    case "Emerald Shield, Paschal":
      return `${TEXTURES_BASE}CP03-014EN.png`;
    case "Battleship Intelligence":
      return `${TEXTURES_BASE}CP03-015EN.png`;
    case "Pyroxene Communications Sea Otter Soldier":
      return `${TEXTURES_BASE}CP03-016EN.png`;
    case "Dolphin Soldier of High Speed Raids":
      return `${TEXTURES_BASE}CP03-017EN.png`;
    case "Medical Officer of the Rainbow Elixir":
      return `${TEXTURES_BASE}CP03-018EN.png`;
    case "Coral Assault":
      return `${TEXTURES_BASE}CP03-019EN.png`;
    case "Battle Siren, Cynthia":
      return `${TEXTURES_BASE}CP03-020EN.png`;
    case "Officer Cadet, Erikk":
      return `${TEXTURES_BASE}CP03-021EN.png`;

    case "Majesty Lord Blaster":
      return `${TEXTURES_BASE}CP03-U02EN.png`;
    case "Swordsman of the Explosive Flames, Palamedes":
      return `${TEXTURES_BASE}CP03-023EN.png`;
    case "Star Call Trumpeter":
      return `${TEXTURES_BASE}CP03-024EN.png`;
    case "High Dog Breeder, Akane":
      return `${TEXTURES_BASE}CP03-025EN.png`;
    case "Soul Saver Dragon":
      return `${TEXTURES_BASE}CP03-026EN.png`;
    case "Knight of Loyalty, Bedivere":
      return `${TEXTURES_BASE}CP03-027EN.png`;
    case "Solitary Knight, Gancelot":
      return `${TEXTURES_BASE}CP03-028EN.png`;
    case "Knight of Friendship, Kay":
      return `${TEXTURES_BASE}CP03-029EN.png`;
    case "Barcgal":
      return `${TEXTURES_BASE}CP03-030EN.png`;
    case "Miru Biru":
      return `${TEXTURES_BASE}CP03-031EN.png`;
    case "Young Pegasus Knight":
      return `${TEXTURES_BASE}CP03-032EN.png`;
    case "Toypugal":
      return `${TEXTURES_BASE}CP03-033EN.png`;
    case "Pongal":
      return `${TEXTURES_BASE}CP03-034EN.png`;
    case "Future Knight, Llew":
      return `${TEXTURES_BASE}CP03-035EN.png`;
    case "Margal":
      return `${TEXTURES_BASE}CP03-036EN.png`;
    case "Flogal":
      return `${TEXTURES_BASE}CP03-037EN.png`;
    case "Yggdrasil Maiden, Elaine":
      return `${TEXTURES_BASE}CP03-038EN.png`;
    case "Starlight Unicorn":
      return `${TEXTURES_BASE}CP03-039EN.png`;
    case "Knight of Truth, Gordon":
      return `${TEXTURES_BASE}CP03-040EN.png`;
    case "Wingal Brave":
      return `${TEXTURES_BASE}CP03-041EN.png`;

    case "Silver Thorn Dragon Tamer, Luquier":
      return `${TEXTURES_BASE}CP03-U03EN.png`;
    case "Nightmare Doll, Alice":
      return `${TEXTURES_BASE}CP03-043EN.png`;
    case "Nightmare Doll, Alice Evolved":
      return `${TEXTURES_BASE}CP03-044EN.png`;
    case "Purple Trapezist":
      return `${TEXTURES_BASE}CP03-045EN.png`;
    case "Crimson Beast Tamer":
      return `${TEXTURES_BASE}CP03-046EN.png`;
    case "Barking Manticore":
      return `${TEXTURES_BASE}CP03-047EN.png`;
    case "Mistress Hurricane":
      return `${TEXTURES_BASE}CP03-048EN.png`;
    case "Golden Beast Tamer":
      return `${TEXTURES_BASE}CP03-049EN.png`;
    case "Starlight Melody Tamer, Farah":
      return `${TEXTURES_BASE}CP03-050EN.png`;
    case "Turquoise Beast Tamer":
      return `${TEXTURES_BASE}CP03-051EN.png`;
    case "Dark Metal Bicorn":
      return `${TEXTURES_BASE}CP03-052EN.png`;
    case "Nitro Juggler":
      return `${TEXTURES_BASE}CP03-053EN.png`;
    case "Midnight Bunny":
      return `${TEXTURES_BASE}CP03-054EN.png`;
    case "Hades Hypnotist":
      return `${TEXTURES_BASE}CP03-055EN.png`;
    case "Dynamite Juggler":
      return `${TEXTURES_BASE}CP03-056EN.png`;
    case "Rainbow Magician":
      return `${TEXTURES_BASE}CP03-057EN.png`;
    case "Skyhigh Walker":
      return `${TEXTURES_BASE}CP03-058EN.png`;
    case "Candy Clown":
      return `${TEXTURES_BASE}CP03-059EN.png`;
    case "Jumping Jill":
      return `${TEXTURES_BASE}CP03-060EN.png`;
    case "Skull Juggler":
      return `${TEXTURES_BASE}CP03-061EN.png`;
    case "Girl Who Crossed the Gap":
      return `${TEXTURES_BASE}CP03-062EN.png`;

    case "Dragonic Overlord the End":
      return `${TEXTURES_BASE}CP03-U04EN.png`;
    case "Seal Dragon, Blockade":
      return `${TEXTURES_BASE}CP03-064EN.png`;
    case "Burning Horn Dragon":
      return `${TEXTURES_BASE}CP03-065EN.png`;
    case "Blazing Core Dragon":
      return `${TEXTURES_BASE}CP03-066EN.png`;
    case "Blazing Flare Dragon":
      return `${TEXTURES_BASE}CP03-067EN.png`;
    case "Dragonic Executioner":
      return `${TEXTURES_BASE}CP03-068EN.png`;
    case "Vortex Dragon":
      return `${TEXTURES_BASE}CP03-069EN.png`;
    case "Flame of Promise, Aermo":
      return `${TEXTURES_BASE}CP03-070EN.png`;
    case "Bellicosity Dragon":
      return `${TEXTURES_BASE}CP03-071EN.png`;
    case "Prowling Dragon, Striken":
      return `${TEXTURES_BASE}CP03-072EN.png`;
    case "Dragon Monk, Gojo":
      return `${TEXTURES_BASE}CP03-073EN.png`;
    case "Demonic Dragon Berserker, Yaksha":
      return `${TEXTURES_BASE}CP03-074EN.png`;
    case "Demonic Dragon Mage, Kimnara":
      return `${TEXTURES_BASE}CP03-075EN.png`;
    case "Embodiment of Spear, Tahr":
      return `${TEXTURES_BASE}CP03-076EN.png`;
    case "Gatling Claw Dragon":
      return `${TEXTURES_BASE}CP03-077EN.png`;
    case "Lizard Soldier, Ganlu":
      return `${TEXTURES_BASE}CP03-078EN.png`;
    case "Dragon Monk, Genjo":
      return `${TEXTURES_BASE}CP03-079EN.png`;
    case "Irontail Dragon":
      return `${TEXTURES_BASE}CP03-080EN.png`;
    case "Flame of Hope, Aermo":
      return `${TEXTURES_BASE}CP03-081EN.png`;
    case "Lizard Soldier, Conroe":
      return `${TEXTURES_BASE}CP03-082EN.png`;

    case "Phantom Blaster Overlord":
      return `${TEXTURES_BASE}CP03-U05EN.png`;
    case "Phantom Blaster Dragon":
      return `${TEXTURES_BASE}CP03-084EN.png`;
    case "Phantom Blaster Dragon Evolved":
      return `${TEXTURES_BASE}CP03-085EN.png`;
    case "Blaster Dark":
      return `${TEXTURES_BASE}CP03-086EN.png`;
    case "Blaster Dark Evolved":
      return `${TEXTURES_BASE}CP03-087EN.png`;
    case "Skull Witch, Nemain":
      return `${TEXTURES_BASE}CP03-088EN.png`;
    case "Knight of Nullity, Masquerade":
      return `${TEXTURES_BASE}CP03-089EN.png`;
    case "Darkness Maiden, Macha":
      return `${TEXTURES_BASE}CP03-090EN.png`;
    case "Cursed Lancer":
      return `${TEXTURES_BASE}CP03-091EN.png`;
    case "Knight of Darkness, Rugos":
      return `${TEXTURES_BASE}CP03-092EN.png`;
    case "Black Sage, Charon":
      return `${TEXTURES_BASE}CP03-093EN.png`;
    case "Doranbau":
      return `${TEXTURES_BASE}CP03-094EN.png`;
    case "Blaster Javelin":
      return `${TEXTURES_BASE}CP03-095EN.png`;
    case "Dark Shield, Mac Lir":
      return `${TEXTURES_BASE}CP03-096EN.png`;
    case "Grim Reaper":
      return `${TEXTURES_BASE}CP03-097EN.png`;
    case "Abyss Freezer":
      return `${TEXTURES_BASE}CP03-098EN.png`;
    case "Darkside Trumpeter":
      return `${TEXTURES_BASE}CP03-099EN.png`;
    case "Abyss Healer":
      return `${TEXTURES_BASE}CP03-100EN.png`;
    case "Witch of Nostrum, Arianrhod":
      return `${TEXTURES_BASE}CP03-101EN.png`;
    case "Gururubau":
      return `${TEXTURES_BASE}CP03-102EN.png`;
    case "Fullbau":
      return `${TEXTURES_BASE}CP03-103EN.png`;

    case "Goddess of the Full Moon, Tsukuyomi":
      return `${TEXTURES_BASE}CP03-U06EN.png`;
    case "Goddess of the Half Moon, Tsukuyomi":
      return `${TEXTURES_BASE}CP03-105EN.png`;
    case "CEO Amaterasu":
      return `${TEXTURES_BASE}CP03-106EN.png`;
    case "CEO Amaterasu Evolved":
      return `${TEXTURES_BASE}CP03-107EN.png`;
    case "Silent Tom":
      return `${TEXTURES_BASE}CP03-108EN.png`;
    case "Silent Tom Evolved":
      return `${TEXTURES_BASE}CP03-109EN.png`;
    case "Evil-eye Princess, Euryale":
      return `${TEXTURES_BASE}CP03-110EN.png`;
    case "Maiden of Libra":
      return `${TEXTURES_BASE}CP03-111EN.png`;
    case "Battle Sister, Cocoa":
      return `${TEXTURES_BASE}CP03-112EN.png`;
    case "Oracle Guardian, Wiseman":
      return `${TEXTURES_BASE}CP03-113EN.png`;
    case "White Hare of Inaba":
      return `${TEXTURES_BASE}CP03-114EN.png`;
    case "Goddess of the Crescent Moon, Tsukuyomi":
      return `${TEXTURES_BASE}CP03-115EN.png`;
    case "Dark Cat":
      return `${TEXTURES_BASE}CP03-116EN.png`;
    case "Battle Sister, Chocolat":
      return `${TEXTURES_BASE}CP03-117EN.png`;
    case "Oracle Guardian, Nike":
      return `${TEXTURES_BASE}CP03-118EN.png`;
    case "Dream Eater":
      return `${TEXTURES_BASE}CP03-119EN.png`;
    case "Emergency Alarmer":
      return `${TEXTURES_BASE}CP03-120EN.png`;
    case "Lozenge Magus":
      return `${TEXTURES_BASE}CP03-121EN.png`;
    case "Battle Maiden, Tagitsuhime":
      return `${TEXTURES_BASE}CP03-122EN.png`;
    case "Luck Bird":
      return `${TEXTURES_BASE}CP03-123EN.png`;
    case "Godhawk, Ichibyoshi":
      return `${TEXTURES_BASE}CP03-124EN.png`;
    case "Powers Converged":
      return `${TEXTURES_BASE}CP03-126EN.png`;
    case "Drive Point":
      return `${TEXTURES_BASE}CP03-127EN.png`;

    case "XII. Wolfraud, The Hanged Man":
      return `${TEXTURES_BASE}BP10-001EN.png`;
    case "XII. Wolfraud, The Hanged Man Evolved":
      return `${TEXTURES_BASE}BP10-002EN.png`;
    case "Lucille, Keeper of Relics":
      return `${TEXTURES_BASE}BP10-003EN.png`;
    case "Spinaria & Lucille, Keepers ADVANCED":
      return `${TEXTURES_BASE}BP10-004EN.png`;
    case "Chipper Skipper":
      return `${TEXTURES_BASE}BP10-005EN.png`;
    case "Chipper Skipper Evolved":
      return `${TEXTURES_BASE}BP10-006EN.png`;
    case "Windflower Tiger":
      return `${TEXTURES_BASE}BP10-007EN.png`;
    case "Treacherous Reversal":
      return `${TEXTURES_BASE}BP10-008EN.png`;
    case "Salvia Panther":
      return `${TEXTURES_BASE}BP10-009EN.png`;
    case "Salvia Panther Evolved":
      return `${TEXTURES_BASE}BP10-010EN.png`;
    case "Optimistic Beastmaster":
      return `${TEXTURES_BASE}BP10-011EN.png`;
    case "Lumbering Carapace":
      return `${TEXTURES_BASE}BP10-012EN.png`;
    case "Reclusive Ponderer":
      return `${TEXTURES_BASE}BP10-013EN.png`;
    case "Reclusive Ponderer Evolved":
      return `${TEXTURES_BASE}BP10-014EN.png`;
    case "Crocus Rat":
      return `${TEXTURES_BASE}BP10-015EN.png`;
    case "Blossoming Archer":
      return `${TEXTURES_BASE}BP10-016EN.png`;
    case "Deepwood Wolf":
      return `${TEXTURES_BASE}BP10-017EN.png`;
    case "Fairy Assault":
      return `${TEXTURES_BASE}BP10-018EN.png`;
    case "VII. Oluon, The Chariot":
      return `${TEXTURES_BASE}BP10-019EN.png`;
    case "VII. Oluon, Runaway Chariot ADVANCED":
      return `${TEXTURES_BASE}BP10-020EN.png`;
    case "Alyaska, War Hawker":
      return `${TEXTURES_BASE}BP10-021EN.png`;
    case "Alyaska, War Hawker Evolved":
      return `${TEXTURES_BASE}BP10-022EN.png`;
    case "Prudent General":
      return `${TEXTURES_BASE}BP10-023EN.png`;
    case "Prudent General Evolved":
      return `${TEXTURES_BASE}BP10-024EN.png`;
    case "Ilmisuna, Discord Hawker":
      return `${TEXTURES_BASE}BP10-025EN.png`;
    case "Aerial Slash":
      return `${TEXTURES_BASE}BP10-026EN.png`;
    case "Lightning Kicker":
      return `${TEXTURES_BASE}BP10-027EN.png`;
    case "Lightning Kicker Evolved":
      return `${TEXTURES_BASE}BP10-028EN.png`;
    case "Empress of Serenity":
      return `${TEXTURES_BASE}BP10-029EN.png`;
    case "Knight Neilan the Lazy":
      return `${TEXTURES_BASE}BP10-030EN.png`;
    case "Honorable Thief":
      return `${TEXTURES_BASE}BP10-031EN.png`;
    case "Honorable Thief Evolved":
      return `${TEXTURES_BASE}BP10-032EN.png`;
    case "Windslasher":
      return `${TEXTURES_BASE}BP10-033EN.png`;
    case "Selfless Noble":
      return `${TEXTURES_BASE}BP10-034EN.png`;
    case "Ernesta, Weapons Hawker":
      return `${TEXTURES_BASE}BP10-035EN.png`;
    case "Pompous Summons":
      return `${TEXTURES_BASE}BP10-036EN.png`;
    case "0. Lhynkal, The Fool":
      return `${TEXTURES_BASE}BP10-037EN.png`;
    case "0. Lhynkal, The Fool Evolved":
      return `${TEXTURES_BASE}BP10-038EN.png`;
    case "Runie, Resolute Diviner":
      return `${TEXTURES_BASE}BP10-039EN.png`;
    case "Imperator of Magic":
      return `${TEXTURES_BASE}BP10-040EN.png`;
    case "Imperator of Magic Evolved":
      return `${TEXTURES_BASE}BP10-041EN.png`;
    case "Checkmate":
      return `${TEXTURES_BASE}BP10-042EN.png`;
    case "Scourge of the Omniscient":
      return `${TEXTURES_BASE}BP10-043EN.png`;
    case "Juggling Moggy":
      return `${TEXTURES_BASE}BP10-044EN.png`;
    case "Juggling Moggy Evolved":
      return `${TEXTURES_BASE}BP10-045EN.png`;
    case "Gambit":
      return `${TEXTURES_BASE}BP10-046EN.png`;
    case "Rite of the Ignorant":
      return `${TEXTURES_BASE}BP10-047EN.png`;
    case "Piquant Potioneer":
      return `${TEXTURES_BASE}BP10-048EN.png`;
    case "Piquant Potioneer Evolved":
      return `${TEXTURES_BASE}BP10-049EN.png`;
    case "Creative Conjurer":
      return `${TEXTURES_BASE}BP10-050EN.png`;
    case "Arcane Auteur":
      return `${TEXTURES_BASE}BP10-051EN.png`;
    case "Skewer":
      return `${TEXTURES_BASE}BP10-052EN.png`;
    case "Magical Augmentation":
      return `${TEXTURES_BASE}BP10-053EN.png`;
    case "XI. Erntz, Justice":
      return `${TEXTURES_BASE}BP10-054EN.png`;
    case "XI. Erntz, Justice Evolved":
      return `${TEXTURES_BASE}BP10-055EN.png`;
    case "Aiela, Devoted Knight":
      return `${TEXTURES_BASE}BP10-056EN.png`;
    case "Lævateinn Dragon, Dual Form α ADVANCED":
      return `${TEXTURES_BASE}BP10-057EN.png`;
    case "Lævateinn Dragon, Dual Form β ADVANCED":
      return `${TEXTURES_BASE}BP10-058EN.png`;
    case "Lævateinn Dragon, Dual Form γ ADVANCED":
      return `${TEXTURES_BASE}BP10-059EN.png`;
    case "Slaughering Dragonewt":
      return `${TEXTURES_BASE}BP10-060EN.png`;
    case "Slaughering Dragonewt Evolved":
      return `${TEXTURES_BASE}BP10-061EN.png`;
    case "Eternal Whale":
      return `${TEXTURES_BASE}BP10-062EN.png`;
    case "Dual Rage":
      return `${TEXTURES_BASE}BP10-063EN.png`;
    case "Swiftblade Dragonewt":
      return `${TEXTURES_BASE}BP10-064EN.png`;
    case "Swiftblade Dragonewt Evolved":
      return `${TEXTURES_BASE}BP10-065EN.png`;
    case "Heliodragon":
      return `${TEXTURES_BASE}BP10-066EN.png`;
    case "Dragon Impact":
      return `${TEXTURES_BASE}BP10-067EN.png`;
    case "Springwell Dragon Keeper":
      return `${TEXTURES_BASE}BP10-068EN.png`;
    case "Springwell Dragon Keeper Evolved":
      return `${TEXTURES_BASE}BP10-069EN.png`;
    case "Gallant Dragonewt":
      return `${TEXTURES_BASE}BP10-070EN.png`;
    case "Dragonclad Lancer":
      return `${TEXTURES_BASE}BP10-071EN.png`;
    case "Tropical Grouper":
      return `${TEXTURES_BASE}BP10-072EN.png`;
    case "Dragon Spawning":
      return `${TEXTURES_BASE}BP10-073EN.png`;
    case "VI. Milteo, The Lovers":
      return `${TEXTURES_BASE}BP10-074EN.png`;
    case "VI. Milteo, The Lovers Evolved":
      return `${TEXTURES_BASE}BP10-075EN.png`;
    case "XIV. Luzen, Temperance":
      return `${TEXTURES_BASE}BP10-076EN.png`;
    case "Sincere Masquerade Ghost ADVANCED":
      return `${TEXTURES_BASE}BP10-077EN.png`;
    case "Deathbringer":
      return `${TEXTURES_BASE}BP10-078EN.png`;
    case "Deathbringer Evolved":
      return `${TEXTURES_BASE}BP10-079EN.png`;
    case "Demonium, Clash Devil":
      return `${TEXTURES_BASE}BP10-080EN.png`;
    case "Sincere Soul":
      return `${TEXTURES_BASE}BP10-081EN.png`;
    case "Ghost Maid":
      return `${TEXTURES_BASE}BP10-082EN.png`;
    case "Ghost Maid Evolved":
      return `${TEXTURES_BASE}BP10-083EN.png`;
    case "Insatiable Desire":
      return `${TEXTURES_BASE}BP10-084EN.png`;
    case "Unselfish Grace":
      return `${TEXTURES_BASE}BP10-085EN.png`;
    case "Moonrise Werewolf":
      return `${TEXTURES_BASE}BP10-086EN.png`;
    case "Moonrise Werewolf Evolved":
      return `${TEXTURES_BASE}BP10-087EN.png`;
    case "Spirit Curator":
      return `${TEXTURES_BASE}BP10-088EN.png`;
    case "Silverbolt Hunter":
      return `${TEXTURES_BASE}BP10-089EN.png`;
    case "Soul Box":
      return `${TEXTURES_BASE}BP10-090EN.png`;
    case "Colossal Grudge":
      return `${TEXTURES_BASE}BP10-091EN.png`;
    case "VIII. Sofina, Strength":
      return `${TEXTURES_BASE}BP10-092EN.png`;
    case "VIII. Sofina, Strength Evolved":
      return `${TEXTURES_BASE}BP10-093EN.png`;
    case "X. Slaus, Wheel of Fortune":
      return `${TEXTURES_BASE}BP10-094EN.png`;
    case "Reverend Adjudicator":
      return `${TEXTURES_BASE}BP10-095EN.png`;
    case "Reverend Adjudicator Evolved":
      return `${TEXTURES_BASE}BP10-096EN.png`;
    case "Tanzanite Convictor":
      return `${TEXTURES_BASE}BP10-097EN.png`;
    case "Somnolent Strength":
      return `${TEXTURES_BASE}BP10-098EN.png`;
    case "Topaz Swordian":
      return `${TEXTURES_BASE}BP10-099EN.png`;
    case "Topaz Swordian Evolved":
      return `${TEXTURES_BASE}BP10-100EN.png`;
    case "Puresong Priest":
      return `${TEXTURES_BASE}BP10-101EN.png`;
    case "Wheel of Misfortune":
      return `${TEXTURES_BASE}BP10-102EN.png`;
    case "Priestess of Foresight":
      return `${TEXTURES_BASE}BP10-103EN.png`;
    case "Priestess of Foresight Evolved":
      return `${TEXTURES_BASE}BP10-104EN.png`;
    case "Azurite Maiden":
      return `${TEXTURES_BASE}BP10-105EN.png`;
    case "Prismaplume Bird":
      return `${TEXTURES_BASE}BP10-106EN.png`;
    case "Stalwart Featherfolk":
      return `${TEXTURES_BASE}BP10-107EN.png`;
    case "Holybright Altar":
      return `${TEXTURES_BASE}BP10-108EN.png`;

    case "XXI. Zelgenea, The World":
      return `${TEXTURES_BASE}BP10-109EN.png`;
    case "XXI. Zelgenea, O Great World ADVANCED":
      return `${TEXTURES_BASE}BP10-110EN.png`;
    case "Starbright Deity":
      return `${TEXTURES_BASE}BP10-111EN.png`;
    case "Starbright Deity Evolved":
      return `${TEXTURES_BASE}BP10-112EN.png`;
    case "Fieran, Havensent Wind God":
      return `${TEXTURES_BASE}BP10-113EN.png`;
    case "Fallen Shot":
      return `${TEXTURES_BASE}BP10-114EN.png`;
    case "One-Winged Traitor":
      return `${TEXTURES_BASE}BP10-115EN.png`;
    case "One-Winged Traitor Evolved":
      return `${TEXTURES_BASE}BP10-116EN.png`;
    case "Mind Splitter":
      return `${TEXTURES_BASE}BP10-117EN.png`;
    case "Angelic Strike":
      return `${TEXTURES_BASE}BP10-118EN.png`;
    case "Pureshot Angel":
      return `${TEXTURES_BASE}BP10-119EN.png`;
    case "Pureshot Angel Evolved":
      return `${TEXTURES_BASE}BP10-120EN.png`;
    case "Corruption Guardian":
      return `${TEXTURES_BASE}BP10-121EN.png`;
    case "Winged Courier":
      return `${TEXTURES_BASE}BP10-122EN.png`;

    case "Yggdrasil":
      return `${TEXTURES_BASE}BP09-001EN.png`;
    case "White Vanara":
      return `${TEXTURES_BASE}BP09-002EN.png`;
    case "White Vanara Evolved":
      return `${TEXTURES_BASE}BP09-003EN.png`;
    case "Paula, Icy Warmth":
      return `${TEXTURES_BASE}BP09-004EN.png`;
    case "Paula, Gentle Warmth":
      return `${TEXTURES_BASE}BP09-005EN.png`;
    case "Paula, Passionate Warmth":
      return `${TEXTURES_BASE}BP09-005EN_URA.png`;
    case "Greenglen Axeman":
      return `${TEXTURES_BASE}BP09-006EN.png`;
    case "Wrath of Nature":
      return `${TEXTURES_BASE}BP09-007EN.png`;
    case "Storied Falconer":
      return `${TEXTURES_BASE}BP09-008EN.png`;
    case "Storied Falconer Evolved":
      return `${TEXTURES_BASE}BP09-009EN.png`;
    case "Owl Man":
      return `${TEXTURES_BASE}BP09-010EN.png`;
    case "Blessings of Creation":
      return `${TEXTURES_BASE}BP09-011EN.png`;
    case "Grasshopper Conductor":
      return `${TEXTURES_BASE}BP09-012EN.png`;
    case "Grasshopper Conductor Evolved":
      return `${TEXTURES_BASE}BP09-013EN.png`;
    case "Elf General":
      return `${TEXTURES_BASE}BP09-014EN.png`;
    case "Lila, Arborist":
      return `${TEXTURES_BASE}BP09-015EN.png`;
    case "Substitution":
      return `${TEXTURES_BASE}BP09-016EN.png`;
    case "Flower of Fairies":
      return `${TEXTURES_BASE}BP09-017EN.png`;
    case "Celia, Sky Commander":
      return `${TEXTURES_BASE}BP09-018EN.png`;
    case "Celia, Hope's Strategist":
      return `${TEXTURES_BASE}BP09-019EN.png`;
    case "Celia, Despair's Messenger":
      return `${TEXTURES_BASE}BP09-019EN_URA.png`;
    case "Spartacus":
      return `${TEXTURES_BASE}BP09-020EN.png`;
    case "Prim, Innocent Princess":
      return `${TEXTURES_BASE}BP09-021EN.png`;
    case "Prim, Innocent Princess Evolved":
      return `${TEXTURES_BASE}BP09-022EN.png`;
    case "Nonja, Silent Maid":
      return `${TEXTURES_BASE}BP09-023EN.png`;
    case "Monochrome Duel":
      return `${TEXTURES_BASE}BP09-024EN.png`;
    case "Dario, Demon Count":
      return `${TEXTURES_BASE}BP09-025EN.png`;
    case "Dario, Demon Count Evolved":
      return `${TEXTURES_BASE}BP09-026EN.png`;
    case "Queen Hemera the White":
      return `${TEXTURES_BASE}BP09-027EN.png`;
    case "Queen Magnus the Black":
      return `${TEXTURES_BASE}BP09-028EN.png`;
    case "Axe Princess":
      return `${TEXTURES_BASE}BP09-029EN.png`;
    case "Axe Princess Evolved":
      return `${TEXTURES_BASE}BP09-030EN.png`;
    case "Master Samurai":
      return `${TEXTURES_BASE}BP09-031EN.png`;
    case "Savage Swordsman":
      return `${TEXTURES_BASE}BP09-032EN.png`;
    case "Tycoon":
      return `${TEXTURES_BASE}BP09-033EN.png`;
    case "Frontline Ramparts":
      return `${TEXTURES_BASE}BP09-034EN.png`;
    case "Ceridwen, Eternity Hunter":
      return `${TEXTURES_BASE}BP09-035EN.png`;
    case "Ceridwen, Eternity Hunter Evolved":
      return `${TEXTURES_BASE}BP09-036EN.png`;
    case "Faust, Truthseeker":
      return `${TEXTURES_BASE}BP09-037EN.png`;
    case "Anne, Mysterian Prodigy":
      return `${TEXTURES_BASE}BP09-038EN.png`;
    case "Grea, Mysterian Dragoness":
      return `${TEXTURES_BASE}BP09-039EN.png`;
    case "Grea, Mysterian Dragoness Evolved":
      return `${TEXTURES_BASE}BP09-040EN.png`;
    case "Mysterian Wyrmist":
      return `${TEXTURES_BASE}BP09-041EN.png`;
    case "Mysterian Whitewyrm":
      return `${TEXTURES_BASE}BP09-042EN.png`;
    case "Mysterian Blackwyrm":
      return `${TEXTURES_BASE}BP09-042EN_URA.png`;
    case "Snowman King":
      return `${TEXTURES_BASE}BP09-043EN.png`;
    case "Owen, Knight of Mysteria":
      return `${TEXTURES_BASE}BP09-044EN.png`;
    case "Absolute Zeroblade":
      return `${TEXTURES_BASE}BP09-045EN.png`;
    case "Anne's Sorcery":
      return `${TEXTURES_BASE}BP09-046EN.png`;
    case "Grea's Ember":
      return `${TEXTURES_BASE}BP09-047EN.png`;
    case "Bergent, Onion Patchmaster":
      return `${TEXTURES_BASE}BP09-048EN.png`;
    case "Bergent, Onion Patchmaster Evolved":
      return `${TEXTURES_BASE}BP09-049EN.png`;
    case "Palla, Student Teacher":
      return `${TEXTURES_BASE}BP09-050EN.png`;
    case "Vayle, Mysterian Summoner":
      return `${TEXTURES_BASE}BP09-051EN.png`;
    case "Vayle, Mysterian Summoner Evolved":
      return `${TEXTURES_BASE}BP09-052EN.png`;
    case "Mysterian Knowledge":
      return `${TEXTURES_BASE}BP09-053EN.png`;
    case "Summoning Drills":
      return `${TEXTURES_BASE}BP09-054EN.png`;
    case "Witch of Foresight":
      return `${TEXTURES_BASE}BP09-055EN.png`;
    case "Witch of Foresight Evolved":
      return `${TEXTURES_BASE}BP09-056EN.png`;
    case "Beastfaced Mage":
      return `${TEXTURES_BASE}BP09-057EN.png`;
    case "Onion Patch":
      return `${TEXTURES_BASE}BP09-058EN.png`;
    case "Tico, Mysterian Spellnerd":
      return `${TEXTURES_BASE}BP09-059EN.png`;
    case "Mr. Bertrand, Magic Mentor":
      return `${TEXTURES_BASE}BP09-060EN.png`;
    case "Staff of Whirlwinds":
      return `${TEXTURES_BASE}BP09-061EN.png`;
    case "Jerva of Draconic Mail":
      return `${TEXTURES_BASE}BP09-062EN.png`;
    case "Jerva of Draconic Mail Evolved":
      return `${TEXTURES_BASE}BP09-063EN.png`;
    case "Zirnitra, Dragon's Flame":
      return `${TEXTURES_BASE}BP09-064EN.png`;
    case "Romelia, Lightning Striker":
      return `${TEXTURES_BASE}BP09-065EN.png`;
    case "Romelia, Lightning Striker Evolved":
      return `${TEXTURES_BASE}BP09-066EN.png`;
    case "Masamune, Raging Dragon":
      return `${TEXTURES_BASE}BP09-067EN.png`;
    case "Lindworm":
      return `${TEXTURES_BASE}BP09-068EN.png`;
    case "Virtuous Lindworm":
      return `${TEXTURES_BASE}BP09-069EN.png`;
    case "Iniquitous Lindworm":
      return `${TEXTURES_BASE}BP09-069EN_URA.png`;
    case "Dragonplate Warrior":
      return `${TEXTURES_BASE}BP09-070EN.png`;
    case "Poseidon":
      return `${TEXTURES_BASE}BP09-071EN.png`;
    case "Pure-Voiced Dragoon":
      return `${TEXTURES_BASE}BP09-072EN.png`;
    case "Force of the Dragonewt":
      return `${TEXTURES_BASE}BP09-073EN.png`;
    case "Waters of the Megalorca":
      return `${TEXTURES_BASE}BP09-081EN.png`;
    case "Roy, Dragoncleaver":
      return `${TEXTURES_BASE}BP09-074EN.png`;
    case "Roy, Dragoncleaver Evolved":
      return `${TEXTURES_BASE}BP09-075EN.png`;
    case "Galua of Two Breaths":
      return `${TEXTURES_BASE}BP09-076EN.png`;
    case "Katakura Kojuro":
      return `${TEXTURES_BASE}BP09-077EN.png`;
    case "Katakura Kojuro Evolved":
      return `${TEXTURES_BASE}BP09-078EN.png`;
    case "Dragoon Scyther":
      return `${TEXTURES_BASE}BP09-079EN.png`;
    case "Gargouille":
      return `${TEXTURES_BASE}BP09-080EN.png`;
    case "Heroic Dragonslayer":
      return `${TEXTURES_BASE}BP09-082EN.png`;
    case "Heroic Dragonslayer Evolved":
      return `${TEXTURES_BASE}BP09-083EN.png`;
    case "Dragonclad Blademaster":
      return `${TEXTURES_BASE}BP09-084EN.png`;
    case "Drakewing Assassin":
      return `${TEXTURES_BASE}BP09-085EN.png`;
    case "Coda, Twilight Dragoon":
      return `${TEXTURES_BASE}BP09-086EN.png`;
    case "Hypersonic Dragonewt":
      return `${TEXTURES_BASE}BP09-087EN.png`;
    case "Dragon's Handspur":
      return `${TEXTURES_BASE}BP09-088EN.png`;
    case "Vania, Nightshade Vampire":
      return `${TEXTURES_BASE}BP09-089EN.png`;
    case "Vania, Kind Queen":
      return `${TEXTURES_BASE}BP09-090EN.png`;
    case "Vania, Blood Queen":
      return `${TEXTURES_BASE}BP09-090EN_URA.png`;
    case "Arcus, Spirited Manager":
      return `${TEXTURES_BASE}BP09-091EN.png`;
    case "Oldblood King":
      return `${TEXTURES_BASE}BP09-092EN.png`;
    case "Oldblood King Evolved":
      return `${TEXTURES_BASE}BP09-093EN.png`;
    case "Darkfeast Bat":
      return `${TEXTURES_BASE}BP09-094EN.png`;
    case "Gift for Bloodkin":
      return `${TEXTURES_BASE}BP09-095EN.png`;
    case "Big Soul Hunter":
      return `${TEXTURES_BASE}BP09-096EN.png`;
    case "Big Soul Hunter Evolved":
      return `${TEXTURES_BASE}BP09-097EN.png`;
    case "Raven, Eventide Vampire":
      return `${TEXTURES_BASE}BP09-098EN.png`;
    case "Blood Moon":
      return `${TEXTURES_BASE}BP09-099EN.png`;
    case "Orator of the Bones":
      return `${TEXTURES_BASE}BP09-100EN.png`;
    case "Orator of the Bones Evolved":
      return `${TEXTURES_BASE}BP09-101EN.png`;
    case "Raven, Noontide Vampire":
      return `${TEXTURES_BASE}BP09-102EN.png`;
    case "Raven, Midnight Vampire":
      return `${TEXTURES_BASE}BP09-103EN.png`;
    case "Death the Nyctophile":
      return `${TEXTURES_BASE}BP09-104EN.png`;
    case "Poltergeist":
      return `${TEXTURES_BASE}BP09-105EN.png`;
    case "Jeanne, Beacon of Salvation":
      return `${TEXTURES_BASE}BP09-106EN.png`;
    case "Jeanne, Beacon of Salvation Evolved":
      return `${TEXTURES_BASE}BP09-107EN.png`;
    case "Tutankhamun":
      return `${TEXTURES_BASE}BP09-108EN.png`;
    case "Ceryneian Hind":
      return `${TEXTURES_BASE}BP09-109EN.png`;
    case "Ceryneian Lighthind":
      return `${TEXTURES_BASE}BP09-110EN.png`;
    case "Ceryneian Darkhind":
      return `${TEXTURES_BASE}BP09-110EN_URA.png`;
    case "Heavenly Knight":
      return `${TEXTURES_BASE}BP09-111EN.png`;
    case "Tenko's Shrine":
      return `${TEXTURES_BASE}BP09-112EN.png`;
    case "Jeweled Priestess":
      return `${TEXTURES_BASE}BP09-113EN.png`;
    case "Jeweled Priestess Evolved":
      return `${TEXTURES_BASE}BP09-114EN.png`;
    case "Whitefang Temple":
      return `${TEXTURES_BASE}BP09-115EN.png`;
    case "Opposing Statues":
      return `${TEXTURES_BASE}BP09-116EN.png`;
    case "Lycaon":
      return `${TEXTURES_BASE}BP09-117EN.png`;
    case "Lycaon Evolved":
      return `${TEXTURES_BASE}BP09-118EN.png`;
    case "Holy Fowl of Ivory":
      return `${TEXTURES_BASE}BP09-119EN.png`;
    case "Hexed Fowl of Ebon":
      return `${TEXTURES_BASE}BP09-120EN.png`;
    case "Deathscythe Nun":
      return `${TEXTURES_BASE}BP09-121EN.png`;
    case "Moriae Encomium":
      return `${TEXTURES_BASE}BP09-122EN.png`;
    case "Marduk":
      return `${TEXTURES_BASE}BP09-123EN.png`;
    case "Marduk Evolved":
      return `${TEXTURES_BASE}BP09-124EN.png`;
    case "Moon and Sun":
      return `${TEXTURES_BASE}BP09-125EN.png`;
    case "Paradise Vanguard":
      return `${TEXTURES_BASE}BP09-126EN.png`;
    case "Paradise Vanguard Evolved":
      return `${TEXTURES_BASE}BP09-127EN.png`;
    case "Amaterasu":
      return `${TEXTURES_BASE}BP09-128EN.png`;
    case "Tsukuyomi":
      return `${TEXTURES_BASE}BP09-129EN.png`;
    case "Suttungr":
      return `${TEXTURES_BASE}BP09-130EN.png`;
    case "Suttungr Evolved":
      return `${TEXTURES_BASE}BP09-131EN.png`;
    case "Oceanus":
      return `${TEXTURES_BASE}BP09-132EN.png`;
    case "Divine Retribution":
      return `${TEXTURES_BASE}BP09-133EN.png`;
    case "Valkyrie of Chaos":
      return `${TEXTURES_BASE}BP09-134EN.png`;
    case "Valkyrie of Chaos Evolved":
      return `${TEXTURES_BASE}BP09-135EN.png`;
    case "Valkyrie of Order":
      return `${TEXTURES_BASE}BP09-136EN.png`;
    case "Fount of Angels":
      return `${TEXTURES_BASE}BP09-137EN.png`;

    case "Forest Oracle Pascale":
      return `${TEXTURES_BASE}BP08-001EN.png`;
    case "Orchis, Puppet Girl":
      return `${TEXTURES_BASE}BP08-002EN.png`;
    case "Orchis, Resolute Puppet":
      return `${TEXTURES_BASE}BP08-003ENfront.png`;
    case "Orchis, Vengeful Puppet":
      return `${TEXTURES_BASE}BP08-003ENback.png`;
    case "Zwei, Murderous Puppet":
      return `${TEXTURES_BASE}BP08-004EN.png`;
    case "Zwei, Murderous Puppet Evolved":
      return `${TEXTURES_BASE}BP08-005EN.png`;
    case "Lycoris, Poisoner Princess":
      return `${TEXTURES_BASE}BP08-006EN.png`;
    case "Lina & Lena, Twin Souls":
      return `${TEXTURES_BASE}BP08-007EN.png`;
    case "Michelle, the Mind Reader":
      return `${TEXTURES_BASE}BP08-008EN.png`;
    case "Michelle, the Mind Reader Evolved":
      return `${TEXTURES_BASE}BP08-009EN.png`;
    case "Liam, Master of Puppets":
      return `${TEXTURES_BASE}BP08-010EN.png`;
    case "Heartless Battle":
      return `${TEXTURES_BASE}BP08-011EN.png`;
    case "Junk":
      return `${TEXTURES_BASE}BP08-012EN.png`;
    case "Insane Dark Elf":
      return `${TEXTURES_BASE}BP08-013EN.png`;
    case "Insane Dark Elf Evolved":
      return `${TEXTURES_BASE}BP08-014EN.png`;
    case "Zealot of Unkilling":
      return `${TEXTURES_BASE}BP08-015EN.png`;
    case "Knower of History":
      return `${TEXTURES_BASE}BP08-016EN.png`;
    case "Ward of Unkilling":
      return `${TEXTURES_BASE}BP08-017EN.png`;
    case "Aether of the Warrior Wing":
      return `${TEXTURES_BASE}BP08-018EN.png`;
    case "Dionne, Dancing Blade":
      return `${TEXTURES_BASE}BP08-019EN.png`;
    case "Dionne, Dancing Blade Evolved":
      return `${TEXTURES_BASE}BP08-020EN.png`;
    case "Roland the Incorruptible":
      return `${TEXTURES_BASE}BP08-021EN.png`;
    case "Roland the Incorruptible Evolved":
      return `${TEXTURES_BASE}BP08-022EN.png`;
    case "Swordflash Panther":
      return `${TEXTURES_BASE}BP08-023EN.png`;
    case "Durandal the Incorruptible":
      return `${TEXTURES_BASE}BP08-024EN.png`;
    case "Azord, Duke of the Mists":
      return `${TEXTURES_BASE}BP08-025EN.png`;
    case "Azord, Duke of the Mists Evolved":
      return `${TEXTURES_BASE}BP08-026EN.png`;
    case "Madlance Centaur":
      return `${TEXTURES_BASE}BP08-027EN.png`;
    case "Dance of Usurpation":
      return `${TEXTURES_BASE}BP08-028EN.png`;
    case "Phantom Assassin":
      return `${TEXTURES_BASE}BP08-029EN.png`;
    case "Zealot of Usurpation":
      return `${TEXTURES_BASE}BP08-030EN.png`;
    case "Wardog":
      return `${TEXTURES_BASE}BP08-031EN.png`;
    case "Mana Pistol Merc":
      return `${TEXTURES_BASE}BP08-032EN.png`;
    case "Mana Pistol Merc Evolved":
      return `${TEXTURES_BASE}BP08-033EN.png`;
    case "Godsend Stride":
      return `${TEXTURES_BASE}BP08-034EN.png`;
    case "Sweet-Tooth Medusa":
      return `${TEXTURES_BASE}BP08-035EN.png`;
    case "Sweet-Tooth Medusa Evolved":
      return `${TEXTURES_BASE}BP08-036EN.png`;
    case "Prophetless of Creation":
      return `${TEXTURES_BASE}BP08-U03EN.png`;
    case "Unbodied Witch":
      return `${TEXTURES_BASE}BP08-038EN.png`;
    case "Unbodied Witch Evolved":
      return `${TEXTURES_BASE}BP08-039EN.png`;
    case "Lovely-Heart Monika":
      return `${TEXTURES_BASE}BP08-040EN.png`;
    case "Edict of Truth":
      return `${TEXTURES_BASE}BP08-041EN.png`;
    case "Elusa, Magic Wunderkind":
      return `${TEXTURES_BASE}BP08-042EN.png`;
    case "Elusa, Magic Wunderkind Evolved":
      return `${TEXTURES_BASE}BP08-043EN.png`;
    case "Morra, Monika's Familiar":
      return `${TEXTURES_BASE}BP08-044EN.png`;
    case "Veridic Discovery":
      return `${TEXTURES_BASE}BP08-045EN.png`;
    case "Moonshade Mage":
      return `${TEXTURES_BASE}BP08-046EN.png`;
    case "Zealot of Truth":
      return `${TEXTURES_BASE}BP08-047EN.png`;
    case "Rabbit Mage":
      return `${TEXTURES_BASE}BP08-048EN.png`;
    case "Rabbit Mage Evolved":
      return `${TEXTURES_BASE}BP08-049EN.png`;
    case "Zealot of Destruction":
      return `${TEXTURES_BASE}BP08-050EN.png`;
    case "Joy of Destruction":
      return `${TEXTURES_BASE}BP08-051EN.png`;
    case "Dragon Empress Otohime":
      return `${TEXTURES_BASE}BP08-052EN.png`;
    case "Azi Dahaka":
      return `${TEXTURES_BASE}BP08-053EN.png`;
    case "Azi Dahaka Evolved":
      return `${TEXTURES_BASE}BP08-054EN.png`;
    case "Annerose":
      return `${TEXTURES_BASE}BP08-055EN.png`;
    case "Annerose Evolved":
      return `${TEXTURES_BASE}BP08-056EN.png`;
    case "Ouroboros":
      return `${TEXTURES_BASE}BP08-057EN.png`;
    case "Powerforge":
      return `${TEXTURES_BASE}BP08-058EN.png`;
    case "Elios, Loyal Dragoon":
      return `${TEXTURES_BASE}BP08-059EN.png`;
    case "Elios, Loyal Dragoon Evolved":
      return `${TEXTURES_BASE}BP08-060EN.png`;
    case "Dragonsoul Princess":
      return `${TEXTURES_BASE}BP08-061EN.png`;
    case "Vile Violet Dragon":
      return `${TEXTURES_BASE}BP08-062EN.png`;
    case "Zealot of Disdain":
      return `${TEXTURES_BASE}BP08-063EN.png`;
    case "Righteous Dragoon":
      return `${TEXTURES_BASE}BP08-064EN.png`;
    case "Geovore":
      return `${TEXTURES_BASE}BP08-065EN.png`;
    case "Geovore Evolved":
      return `${TEXTURES_BASE}BP08-066EN.png`;
    case "Draco Marionette":
      return `${TEXTURES_BASE}BP08-067EN.png`;
    case "Sneer of Disdain":
      return `${TEXTURES_BASE}BP08-068EN.png`;
    case "Crimson Rose Queen":
      return `${TEXTURES_BASE}BP08-069EN.png`;
    case "Crimson Rose Queen Evolved":
      return `${TEXTURES_BASE}BP08-070EN.png`;
    case "Nepthys":
      return `${TEXTURES_BASE}BP08-U05EN.png`;
    case "Tartarus, the Tormentor":
      return `${TEXTURES_BASE}BP08-072EN.png`;
    case "Tartarus, the Tormentor Evolved":
      return `${TEXTURES_BASE}BP08-073EN.png`;
    case "Vuella, One-Winged Demon":
      return `${TEXTURES_BASE}BP08-074EN.png`;
    case "Sonata of Silence":
      return `${TEXTURES_BASE}BP08-075EN.png`;
    case "Chris Pumpkinhead":
      return `${TEXTURES_BASE}BP08-076EN.png`;
    case "Chris Pumpkinhead Evolved":
      return `${TEXTURES_BASE}BP08-077EN.png`;
    case "Salome":
      return `${TEXTURES_BASE}BP08-078EN.png`;
    case "Kiss of Lust":
      return `${TEXTURES_BASE}BP08-079EN.png`;
    case "Arion":
      return `${TEXTURES_BASE}BP08-080EN.png`;
    case "Marian the Mummy":
      return `${TEXTURES_BASE}BP08-081EN.png`;
    case "Marian the Mummy Evolved":
      return `${TEXTURES_BASE}BP08-082EN.png`;
    case "Zealot of Silence":
      return `${TEXTURES_BASE}BP08-083EN.png`;
    case "Zealot of Lust":
      return `${TEXTURES_BASE}BP08-084EN.png`;
    case "Manifest Malice":
      return `${TEXTURES_BASE}BP08-085EN.png`;
    case "Holylord Eachtar":
      return `${TEXTURES_BASE}BP08-086EN.png`;
    case "Godsworn Alexiel":
      return `${TEXTURES_BASE}BP08-087EN.png`;
    case "Godsworn Alexiel Evolved":
      return `${TEXTURES_BASE}BP08-088EN.png`;
    case "Eidolon of Madness":
      return `${TEXTURES_BASE}BP08-089EN.png`;
    case "Eidolon of Madness Evolved":
      return `${TEXTURES_BASE}BP08-090EN.png`;
    case "Sekhmet":
      return `${TEXTURES_BASE}BP08-091EN.png`;
    case "Vengeful Radiance":
      return `${TEXTURES_BASE}BP08-092EN.png`;
    case "Collete, Holy Gunner":
      return `${TEXTURES_BASE}BP08-093EN.png`;
    case "Collete, Holy Gunner Evolved":
      return `${TEXTURES_BASE}BP08-094EN.png`;
    case "Battlefield Inquisitor":
      return `${TEXTURES_BASE}BP08-095EN.png`;
    case "Manifestation of Repose":
      return `${TEXTURES_BASE}BP08-096EN.png`;
    case "Malevolent Al-mi'raj":
      return `${TEXTURES_BASE}BP08-097EN.png`;
    case "Zealot of Repose":
      return `${TEXTURES_BASE}BP08-098EN.png`;
    case "Temple Windbear":
      return `${TEXTURES_BASE}BP08-099EN.png`;
    case "Temple Windbear Evolved":
      return `${TEXTURES_BASE}BP08-100EN.png`;
    case "Angel of the Iron Steed":
      return `${TEXTURES_BASE}BP08-101EN.png`;
    case "Forgotten Sanctuary":
      return `${TEXTURES_BASE}BP08-102EN.png`;
    case "Alterplane Arbiter":
      return `${TEXTURES_BASE}BP08-103EN.png`;
    case "Alterplane Arbiter Evolved":
      return `${TEXTURES_BASE}BP08-104EN.png`;
    case "Sylvia, the Condemner":
      return `${TEXTURES_BASE}BP08-105EN.png`;
    case "Sahaquiel":
      return `${TEXTURES_BASE}BP08-106EN.png`;
    case "Sahaquiel Evolved":
      return `${TEXTURES_BASE}BP08-107EN.png`;
    case "Tart Man":
      return `${TEXTURES_BASE}BP08-108EN.png`;
    case "Slash of the One":
      return `${TEXTURES_BASE}BP08-109EN.png`;
    case "Reina, Evolution's Herald":
      return `${TEXTURES_BASE}BP08-110EN.png`;
    case "Reina, Evolution's Herald Evolved":
      return `${TEXTURES_BASE}BP08-111EN.png`;
    case "Ephemera, Sword Angel":
      return `${TEXTURES_BASE}BP08-112EN.png`;
    case "Treasure Map":
      return `${TEXTURES_BASE}BP08-113EN.png`;
    case "Steelclad Minotaur":
      return `${TEXTURES_BASE}BP08-114EN.png`;
    case "High Enchantress":
      return `${TEXTURES_BASE}BP08-115EN.png`;
    case "High Enchantress Evolved":
      return `${TEXTURES_BASE}BP08-116EN.png`;
    case "Happy Pig":
      return `${TEXTURES_BASE}BP08-117EN.png`;

    case "Ladica, the Stoneclaw":
      return `${TEXTURES_BASE}BP07-001EN.png`;
    case "Ladica, the Stoneclaw Evolved":
      return `${TEXTURES_BASE}BP07-002EN.png`;
    case "Cynthia, the Queen's Blade":
      return `${TEXTURES_BASE}BP07-003EN.png`;
    case "Primal Giant":
      return `${TEXTURES_BASE}BP07-004EN.png`;
    case "Setus, the Beastblade":
      return `${TEXTURES_BASE}BP07-005EN.png`;
    case "Setus, the Beastblade Evolved":
      return `${TEXTURES_BASE}BP07-006EN.png`;
    case "Send 'Em Packing":
      return `${TEXTURES_BASE}BP07-007EN.png`;
    case "Blossom Spirit":
      return `${TEXTURES_BASE}BP07-008EN.png`;
    case "Blossom Spirit Evolved":
      return `${TEXTURES_BASE}BP07-009EN.png`;
    case "Avatar of Fruition":
      return `${TEXTURES_BASE}BP07-010EN.png`;
    case "Divine Smithing":
      return `${TEXTURES_BASE}BP07-011EN.png`;
    case "Chesire Cat":
      return `${TEXTURES_BASE}BP07-012EN.png`;
    case "Ghastly Treant":
      return `${TEXTURES_BASE}BP07-013EN.png`;
    case "Forest Hermit":
      return `${TEXTURES_BASE}BP07-014EN.png`;
    case "Forest Hermit Evolved":
      return `${TEXTURES_BASE}BP07-015EN.png`;
    case "Marvelously Mad Hatter":
      return `${TEXTURES_BASE}BP07-016EN.png`;
    case "Fertile Aether":
      return `${TEXTURES_BASE}BP07-017EN.png`;
    case "Bayleon, Sovereign Light":
      return `${TEXTURES_BASE}BP07-018EN.png`;
    case "Bayleon, Sovereign Light Evolved":
      return `${TEXTURES_BASE}BP07-019EN.png`;
    case "Mistolina, Forest Princess":
      return `${TEXTURES_BASE}BP07-020EN.png`;
    case "Tsubaki of the Demon Blade":
      return `${TEXTURES_BASE}BP07-021EN.png`;
    case "Leod, the Crescent Blade":
      return `${TEXTURES_BASE}BP07-022EN.png`;
    case "Leod, the Crescent Blade Evolved":
      return `${TEXTURES_BASE}BP07-023EN.png`;
    case "King's Might":
      return `${TEXTURES_BASE}BP07-024EN.png`;
    case "Troya, Thunder of Hagelberg":
      return `${TEXTURES_BASE}BP07-025EN.png`;
    case "Troya, Thunder of Hagelberg Evolved":
      return `${TEXTURES_BASE}BP07-026EN.png`;
    case "Valse, Champion Deadeye":
      return `${TEXTURES_BASE}BP07-027EN.png`;
    case "Princess's Strike":
      return `${TEXTURES_BASE}BP07-028EN.png`;
    case "Swift Tigress":
      return `${TEXTURES_BASE}BP07-029EN.png`;
    case "Lupine Axeman":
      return `${TEXTURES_BASE}BP07-030EN.png`;
    case "Dauntless Commander":
      return `${TEXTURES_BASE}BP07-031EN.png`;
    case "Dauntless Commander Evolved":
      return `${TEXTURES_BASE}BP07-032EN.png`;
    case "Tempered Aether":
      return `${TEXTURES_BASE}BP07-033EN.png`;
    case "Elegance in Action":
      return `${TEXTURES_BASE}BP07-034EN.png`;

    case "Tetra, Sapphire Rebel":
      return `${TEXTURES_BASE}BP07-035EN.png`;
    case "Tetra, Sapphire Rebel Evolved":
      return `${TEXTURES_BASE}BP07-036EN.png`;
    case "Belphomet, Lord of Aiolon":
      return `${TEXTURES_BASE}BP07-037EN.png`;
    case "Riley, Hydroshaman":
      return `${TEXTURES_BASE}BP07-038EN.png`;
    case "Eleanor, Cosmic Flower":
      return `${TEXTURES_BASE}BP07-039EN.png`;
    case "Eleanor, Cosmic Flower Evolved":
      return `${TEXTURES_BASE}BP07-040EN.png`;
    case "Delta Cannon":
      return `${TEXTURES_BASE}BP07-041EN.png`;
    case "Displacer Bot":
      return `${TEXTURES_BASE}BP07-042EN.png`;
    case "Displacer Bot Evolved":
      return `${TEXTURES_BASE}BP07-043EN.png`;
    case "Mechanized Lifeform":
      return `${TEXTURES_BASE}BP07-044EN.png`;
    case "Splendid Conjury":
      return `${TEXTURES_BASE}BP07-045EN.png`;
    case "Mechastaff Sorcerer":
      return `${TEXTURES_BASE}BP07-046EN.png`;
    case "Prototype Warrior":
      return `${TEXTURES_BASE}BP07-047EN.png`;
    case "Magiblade Witch":
      return `${TEXTURES_BASE}BP07-048EN.png`;
    case "Magiblade Witch Evolved":
      return `${TEXTURES_BASE}BP07-049EN.png`;
    case "Presto Chango":
      return `${TEXTURES_BASE}BP07-050EN.png`;
    case "Sagacious Core":
      return `${TEXTURES_BASE}BP07-051EN.png`;
    case "Valdain, Cursed Shadow":
      return `${TEXTURES_BASE}BP07-052EN.png`;
    case "Valdain, Cursed Shadow Evolved":
      return `${TEXTURES_BASE}BP07-053EN.png`;
    case "Neptune, Tidemistress":
      return `${TEXTURES_BASE}BP07-054EN.png`;
    case "Wildfire Tyrannosaur":
      return `${TEXTURES_BASE}BP07-055EN.png`;
    case "Marion, Elegant Dragonewt":
      return `${TEXTURES_BASE}BP07-056EN.png`;
    case "Marion, Elegant Dragonewt Evolved":
      return `${TEXTURES_BASE}BP07-057EN.png`;
    case "Shadow's Corrosion":
      return `${TEXTURES_BASE}BP07-058EN.png`;
    case "Bubbleborne Mermaid":
      return `${TEXTURES_BASE}BP07-059EN.png`;
    case "Hoarfrost Triceratops":
      return `${TEXTURES_BASE}BP07-060EN.png`;
    case "Hoarfrost Triceratops Evolved":
      return `${TEXTURES_BASE}BP07-061EN.png`;
    case "Whirlwind Pteranodon":
      return `${TEXTURES_BASE}BP07-062EN.png`;
    case "Dragonewt Needler":
      return `${TEXTURES_BASE}BP07-063EN.png`;
    case "Lightning Velociraptor":
      return `${TEXTURES_BASE}BP07-064EN.png`;
    case "Doting Dragoneer":
      return `${TEXTURES_BASE}BP07-065EN.png`;
    case "Doting Dragoneer Evolved":
      return `${TEXTURES_BASE}BP07-066EN.png`;
    case "Boomfish":
      return `${TEXTURES_BASE}BP07-067EN.png`;
    case "Feral Aether":
      return `${TEXTURES_BASE}BP07-068EN.png`;
    case "Mono, Garnet Rebel":
      return `${TEXTURES_BASE}BP07-069EN.png`;
    case "Mono, Garnet Rebel Evolved":
      return `${TEXTURES_BASE}BP07-070EN.png`;
    case "Kudlak":
      return `${TEXTURES_BASE}BP07-071EN.png`;
    case "Aenea, Amethyst Rebel":
      return `${TEXTURES_BASE}BP07-072EN.png`;
    case "Doublame, Duke and Dame":
      return `${TEXTURES_BASE}BP07-073EN.png`;
    case "Doublame, Duke and Dame Evolved":
      return `${TEXTURES_BASE}BP07-074EN.png`;
    case "Alpha Drive":
      return `${TEXTURES_BASE}BP07-075EN.png`;
    case "Nicola, Forbidden Strength":
      return `${TEXTURES_BASE}BP07-076EN.png`;
    case "Nicola, Forbidden Strength Evolved":
      return `${TEXTURES_BASE}BP07-077EN.png`;
    case "Hellblaze Demon":
      return `${TEXTURES_BASE}BP07-078EN.png`;
    case "Forbidden Art":
      return `${TEXTURES_BASE}BP07-079EN.png`;
    case "Robozombie":
      return `${TEXTURES_BASE}BP07-080EN.png`;
    case "Bone Drone":
      return `${TEXTURES_BASE}BP07-081EN.png`;
    case "Berserk Demon":
      return `${TEXTURES_BASE}BP07-082EN.png`;
    case "Berserk Demon Evolved":
      return `${TEXTURES_BASE}BP07-083EN.png`;
    case "Ghostwriter":
      return `${TEXTURES_BASE}BP07-084EN.png`;
    case "Sanguine Core":
      return `${TEXTURES_BASE}BP07-085EN.png`;
    case "Limonia, Flawed Saint":
      return `${TEXTURES_BASE}BP07-086EN.png`;
    case "Limonia, Flawed Saint Evolved":
      return `${TEXTURES_BASE}BP07-087EN.png`;
    case "Lapis, Glorious Seraph":
      return `${TEXTURES_BASE}BP07-088EN.png`;
    case "Father Refinement":
      return `${TEXTURES_BASE}BP07-089EN.png`;
    case "Marione, Light of Balance":
      return `${TEXTURES_BASE}BP07-090EN.png`;
    case "Marione, Light of Balance Evolved":
      return `${TEXTURES_BASE}BP07-091EN.png`;
    case "Augmentation Bestowal":
      return `${TEXTURES_BASE}BP07-092EN.png`;
    case "Bunny-Eared Administrator":
      return `${TEXTURES_BASE}BP07-093EN.png`;
    case "Robofalcon":
      return `${TEXTURES_BASE}BP07-094EN.png`;
    case "Robofalcon Evolved":
      return `${TEXTURES_BASE}BP07-095EN.png`;
    case "Marcotte, Heretical Sister":
      return `${TEXTURES_BASE}BP07-096EN.png`;
    case "Ironknuckle Nun":
      return `${TEXTURES_BASE}BP07-097EN.png`;
    case "Dark Bishop":
      return `${TEXTURES_BASE}BP07-098EN.png`;
    case "Dark Bishop Evolved":
      return `${TEXTURES_BASE}BP07-099EN.png`;
    case "Meowskers, Ruff-Tuff Major":
      return `${TEXTURES_BASE}BP07-100EN.png`;
    case "Saintly Core":
      return `${TEXTURES_BASE}BP07-101EN.png`;
    case "Meowskers Ambush!":
      return `${TEXTURES_BASE}BP07-102EN.png`;
    case "Technolord":
      return `${TEXTURES_BASE}BP07-103EN.png`;
    case "Viridia Magna":
      return `${TEXTURES_BASE}BP07-104EN.png`;
    case "Viridia Magna Evolved":
      return `${TEXTURES_BASE}BP07-105EN.png`;
    case "Mechawing Angel":
      return `${TEXTURES_BASE}BP07-106EN.png`;
    case "Desert Pathfinder":
      return `${TEXTURES_BASE}BP07-107EN.png`;
    case "Maisha, Hero of Purgation":
      return `${TEXTURES_BASE}BP07-108EN.png`;
    case "Maisha, Hero of Purgation Evolved":
      return `${TEXTURES_BASE}BP07-109EN.png`;
    case "Robogoblin":
      return `${TEXTURES_BASE}BP07-110EN.png`;
    case "Robogoblin Evolved":
      return `${TEXTURES_BASE}BP07-111EN.png`;
    case "Colorful Cook":
      return `${TEXTURES_BASE}BP07-112EN.png`;
    case "Purgation's Blade":
      return `${TEXTURES_BASE}BP07-113EN.png`;
    case "Aldis, Trendsetting Seraph":
      return `${TEXTURES_BASE}BP07-114EN.png`;
    case "Aldis, Trendsetting Seraph Evolved":
      return `${TEXTURES_BASE}BP07-115EN.png`;
    case "Mechagun Wielder":
      return `${TEXTURES_BASE}BP07-116EN.png`;
    case "Extreme Carrot":
      return `${TEXTURES_BASE}BP07-117EN.png`;

    case "Uzuki Shimamura [P.C.S.]":
      return `${TEXTURES_BASE}CSD02a-001EN.png`;
    case "Kyoko Igarashi [P.C.S.]":
      return `${TEXTURES_BASE}CSD02a-002EN.png`;
    case "Miho Kohinata [P.C.S.]":
      return `${TEXTURES_BASE}CSD02a-003EN.png`;
    case "Chika Yokoyama":
      return `${TEXTURES_BASE}CSD02a-004EN.png`;
    case "Momoka Sakurai":
      return `${TEXTURES_BASE}CSD02a-005EN.png`;
    case "Momoka Sakurai Evolved":
      return `${TEXTURES_BASE}CSD02a-006EN.png`;
    case "Akiha Ikebukuro":
      return `${TEXTURES_BASE}CSD02a-007EN.png`;
    case "Akiha Ikebukuro Evolved":
      return `${TEXTURES_BASE}CSD02a-008EN.png`;
    case "Nene Kurihara":
      return `${TEXTURES_BASE}CSD02a-009EN.png`;
    case "Nene Kurihara Evolved":
      return `${TEXTURES_BASE}CSD02a-010EN.png`;
    case "Karin Domyoji":
      return `${TEXTURES_BASE}CSD02a-011EN.png`;

    case "Rin Shibuya [Triad Primus]":
      return `${TEXTURES_BASE}CSD02b-001EN.png`;
    case "Nao Kamiya [Over the Rainbow]":
      return `${TEXTURES_BASE}CSD02b-002EN.png`;
    case "Karen Hojo [Song for Life]":
      return `${TEXTURES_BASE}CSD02b-003EN.png`;
    case "Yasuha Okazaki":
      return `${TEXTURES_BASE}CSD02b-004EN.png`;
    case "Yukimi Sajo":
      return `${TEXTURES_BASE}CSD02b-005EN.png`;
    case "Yukimi Sajo Evolved":
      return `${TEXTURES_BASE}CSD02b-006EN.png`;
    case "Kako Takafuji":
      return `${TEXTURES_BASE}CSD02b-007EN.png`;
    case "Kako Takafuji Evolved":
      return `${TEXTURES_BASE}CSD02b-008EN.png`;
    case "Chizuru Matsuo":
      return `${TEXTURES_BASE}CSD02b-009EN.png`;
    case "Seira Mizuki":
      return `${TEXTURES_BASE}CSD02b-010EN.png`;
    case "Seira Mizuki Evolved":
      return `${TEXTURES_BASE}CSD02b-011EN.png`;

    case "Mio Honda [Positive Passion]":
      return `${TEXTURES_BASE}CSD02c-001EN.png`;
    case "Aiko Takamori [Handmade Hapiness]":
      return `${TEXTURES_BASE}CSD02c-002EN.png`;
    case "Akane Hino [Positive Passion]":
      return `${TEXTURES_BASE}CSD02c-003EN.png`;
    case "Kaoru Ryuzaki":
      return `${TEXTURES_BASE}CSD02c-004EN.png`;
    case "Suzuho Ueda":
      return `${TEXTURES_BASE}CSD02c-005EN.png`;
    case "Suzuho Ueda Evolved":
      return `${TEXTURES_BASE}CSD02c-006EN.png`;
    case "Miria Akagi":
      return `${TEXTURES_BASE}CSD02c-007EN.png`;
    case "Miria Akagi Evolved":
      return `${TEXTURES_BASE}CSD02c-008EN.png`;
    case "Miu Yaguchi":
      return `${TEXTURES_BASE}CSD02c-009EN.png`;
    case "Kumiko Matsuyama":
      return `${TEXTURES_BASE}CSD02c-010EN.png`;
    case "Kumiko Matsuyama Evolved":
      return `${TEXTURES_BASE}CSD02c-011EN.png`;

    case "Aiko Takamori":
      return `${TEXTURES_BASE}CP02-001EN.png`;
    case "Aiko Takamori Evolved":
      return `${TEXTURES_BASE}CP02-002EN.png`;
    case "Miku Maekawa":
      return `${TEXTURES_BASE}CP02-U01aEN.png`;
    case "Yuzu Kitami":
      return `${TEXTURES_BASE}CP02-004EN.png`;
    case "Yuzu Kitami Evolved":
      return `${TEXTURES_BASE}CP02-005EN.png`;
    case "Anastasia":
      return `${TEXTURES_BASE}CP02-U02EN.png`;
    case "Brand New Beat":
      return `${TEXTURES_BASE}CP02-007EN.png`;
    case "Shinobu Kudo":
      return `${TEXTURES_BASE}CP02-008EN.png`;
    case "Yumi Aiba":
      return `${TEXTURES_BASE}CP02-009EN.png`;
    case "Yumi Aiba Evolved":
      return `${TEXTURES_BASE}CP02-010EN.png`;
    case "Goddess by the Sunlit Sea":
      return `${TEXTURES_BASE}CP02-011EN.png`;
    case "Honoka Ayase":
      return `${TEXTURES_BASE}CP02-012EN.png`;
    case "Azuki Momoi":
      return `${TEXTURES_BASE}CP02-013EN.png`;
    case "Kana Imai":
      return `${TEXTURES_BASE}CP02-014EN.png`;
    case "Kana Imai Evolved":
      return `${TEXTURES_BASE}CP02-015EN.png`;
    case "Otaha Umeki":
      return `${TEXTURES_BASE}CP02-016EN.png`;
    case "A Single Vessel":
      return `${TEXTURES_BASE}CP02-017EN.png`;

    case "Kyoko Igarashi":
      return `${TEXTURES_BASE}CP02-018EN.png`;
    case "Kyoko Igarashi Evolved":
      return `${TEXTURES_BASE}CP02-U03EN.png`;
    case "Nagi Hisakawa":
      return `${TEXTURES_BASE}CP02-020EN.png`;
    case "Rin Shibuya":
      return `${TEXTURES_BASE}CP02-021EN.png`;
    case "Mio Honda":
      return `${TEXTURES_BASE}CP02-022EN.png`;
    case "Uzuki Shimamura":
      return `${TEXTURES_BASE}CP02-023EN.png`;
    case "Uzuki Shimamura Evolved":
      return `${TEXTURES_BASE}CP02-024EN.png`;
    case "Anzu Futaba":
      return `${TEXTURES_BASE}CP02-025EN.png`;
    case "Karen Hojo":
      return `${TEXTURES_BASE}CP02-026EN.png`;
    case "Karen Hojo Evolved":
      return `${TEXTURES_BASE}CP02-027EN.png`;
    case "Sparkling Days":
      return `${TEXTURES_BASE}CP02-028EN.png`;
    case "Nao Kamiya":
      return `${TEXTURES_BASE}CP02-029EN.png`;
    case "Mayu Sakuma":
      return `${TEXTURES_BASE}CP02-030EN.png`;
    case "Kirari Moroboshi":
      return `${TEXTURES_BASE}CP02-031EN.png`;
    case "Miho Kohinata":
      return `${TEXTURES_BASE}CP02-032EN.png`;
    case "Miho Kohinata Evolved":
      return `${TEXTURES_BASE}CP02-033EN.png`;
    case "Angelic Maid":
      return `${TEXTURES_BASE}CP02-034EN.png`;

    case "Mizuki Kawashima":
      return `${TEXTURES_BASE}CP02-035EN.png`;
    case "Shiki Ichinose":
      return `${TEXTURES_BASE}CP02-036EN.png`;
    case "Shiki Ichinose Evolved":
      return `${TEXTURES_BASE}CP02-U05EN.png`;
    case "Syuko Shiomi":
      return `${TEXTURES_BASE}CP02-U06bEN.png`;
    case "Kanade Hayami":
      return `${TEXTURES_BASE}CP02-039EN.png`;
    case "Kanade Hayami Evolved":
      return `${TEXTURES_BASE}CP02-040EN.png`;
    case "Center Street":
      return `${TEXTURES_BASE}CP02-041EN.png`;
    case "Hina Araki":
      return `${TEXTURES_BASE}CP02-042EN.png`;
    case "Hina Araki Evolved":
      return `${TEXTURES_BASE}CP02-043EN.png`;
    case "Frederica Miyamoto":
      return `${TEXTURES_BASE}CP02-044EN.png`;
    case "Precocious Little Devil":
      return `${TEXTURES_BASE}CP02-045EN.png`;
    case "Sarina Matsumoto":
      return `${TEXTURES_BASE}CP02-046EN.png`;
    case "Rika Jougasaki":
      return `${TEXTURES_BASE}CP02-047EN.png`;
    case "Rika Jougasaki Evolved":
      return `${TEXTURES_BASE}CP02-048EN.png`;
    case "Sae Kobayakawa":
      return `${TEXTURES_BASE}CP02-049EN.png`;
    case "Tomoe Murakami":
      return `${TEXTURES_BASE}CP02-050EN.png`;
    case "Full Bloom Panorama":
      return `${TEXTURES_BASE}CP02-051EN.png`;

    case "Akari Tsujino":
      return `${TEXTURES_BASE}CP02-052EN.png`;
    case "Yui Ohtsuki":
      return `${TEXTURES_BASE}CP02-053EN.png`;
    case "Yui Ohtsuki Evolved":
      return `${TEXTURES_BASE}CP02-U07EN.png`;
    case "Fumika Sagisawa":
      return `${TEXTURES_BASE}CP02-U08aEN.png`;
    case "Akira Sunazuka":
      return `${TEXTURES_BASE}CP02-056EN.png`;
    case "Tsukasa Kiryu":
      return `${TEXTURES_BASE}CP02-057EN.png`;
    case "Tsukasa Kiryu Evolved":
      return `${TEXTURES_BASE}CP02-058EN.png`;
    case "Arisu Tachibana":
      return `${TEXTURES_BASE}CP02-059EN.png`;
    case "Yuka Nakano":
      return `${TEXTURES_BASE}CP02-060EN.png`;
    case "Yuka Nakano Evolved":
      return `${TEXTURES_BASE}CP02-061EN.png`;
    case "Unbound Emotion":
      return `${TEXTURES_BASE}CP02-062EN.png`;
    case "Tokiko Zaizen":
      return `${TEXTURES_BASE}CP02-063EN.png`;
    case "Noriko Shiina":
      return `${TEXTURES_BASE}CP02-064EN.png`;
    case "Yukari Mizumoto":
      return `${TEXTURES_BASE}CP02-065EN.png`;
    case "Noa Takamine":
      return `${TEXTURES_BASE}CP02-066EN.png`;
    case "Noa Takamine Evolved":
      return `${TEXTURES_BASE}CP02-067EN.png`;
    case "Mode Estivale":
      return `${TEXTURES_BASE}CP02-068EN.png`;

    case "Ranko Kanzaki":
      return `${TEXTURES_BASE}CP02-069EN.png`;
    case "Ranko Kanzaki Evolved":
      return `${TEXTURES_BASE}CP02-U09bEN.png`;
    case "Sachiko Koshimizu":
      return `${TEXTURES_BASE}CP02-U10EN.png`;
    case "Takumi Mukai":
      return `${TEXTURES_BASE}CP02-072EN.png`;
    case "Takumi Mukai Evolved":
      return `${TEXTURES_BASE}CP02-073EN.png`;
    case "Chitose Kurosaki":
      return `${TEXTURES_BASE}CP02-074EN.png`;
    case "Whispers of a Dream":
      return `${TEXTURES_BASE}CP02-075EN.png`;
    case "Chiyo Shirayuki":
      return `${TEXTURES_BASE}CP02-076EN.png`;
    case "Aki Yamato":
      return `${TEXTURES_BASE}CP02-077EN.png`;
    case "Aki Yamato Evolved":
      return `${TEXTURES_BASE}CP02-078EN.png`;
    case "My Life, My Sounds":
      return `${TEXTURES_BASE}CP02-079EN.png`;
    case "Ryo Matsunaga":
      return `${TEXTURES_BASE}CP02-080EN.png`;
    case "Mirei Hayasaka":
      return `${TEXTURES_BASE}CP02-081EN.png`;
    case "Rina Fujimoto":
      return `${TEXTURES_BASE}CP02-082EN.png`;
    case "Syoko Hoshi":
      return `${TEXTURES_BASE}CP02-083EN.png`;
    case "Syoko Hoshi Evolved":
      return `${TEXTURES_BASE}CP02-084EN.png`;
    case "Last Daylight":
      return `${TEXTURES_BASE}CP02-085EN.png`;

    case "Kaede Takagaki":
      return `${TEXTURES_BASE}CP02-U11EN.png`;
    case "Shin Sato":
      return `${TEXTURES_BASE}CP02-087EN.png`;
    case "Shin Sato Evolved":
      return `${TEXTURES_BASE}CP02-U12aEN.png`;
    case "Nana Abe":
      return `${TEXTURES_BASE}CP02-089EN.png`;
    case "Nana Abe Evolved":
      return `${TEXTURES_BASE}CP02-090EN.png`;
    case "Akane Hino":
      return `${TEXTURES_BASE}CP02-091EN.png`;
    case "Classroom Lily":
      return `${TEXTURES_BASE}CP02-092EN.png`;
    case "Risa Matoba":
      return `${TEXTURES_BASE}CP02-093EN.png`;
    case "Haru Yuuki":
      return `${TEXTURES_BASE}CP02-094EN.png`;
    case "Haru Yuuki Evolved":
      return `${TEXTURES_BASE}CP02-095EN.png`;
    case "Psychic Maiden":
      return `${TEXTURES_BASE}CP02-096EN.png`;
    case "Natalia":
      return `${TEXTURES_BASE}CP02-097EN.png`;
    case "Shizuku Oikawa":
      return `${TEXTURES_BASE}CP02-098EN.png`;
    case "Layla":
      return `${TEXTURES_BASE}CP02-099EN.png`;
    case "Layla Evolved":
      return `${TEXTURES_BASE}CP02-100EN.png`;
    case "Sanae Katagiri":
      return `${TEXTURES_BASE}CP02-101EN.png`;
    case "Winter Night Prayer":
      return `${TEXTURES_BASE}CP02-102EN.png`;

    case "New Generations":
      return `${TEXTURES_BASE}CP02-U13bEN.png`;
    case "New Wave":
      return `${TEXTURES_BASE}CP02-104EN.png`;
    case "Master Trainer":
      return `${TEXTURES_BASE}CP02-105EN.png`;
    case "Expert Trainer":
      return `${TEXTURES_BASE}CP02-106EN.png`;
    case "Trainer":
      return `${TEXTURES_BASE}CP02-107EN.png`;
    case "Rookie Trainer":
      return `${TEXTURES_BASE}CP02-108EN.png`;

    case "Lymaga, Forest Champion":
      return `${TEXTURES_BASE}BP06-001EN.png`;
    case "Lymaga, Forest Champion Evolved":
      return `${TEXTURES_BASE}BP06-002EN.png`;
    case "Amataz, Fairy Blader":
      return `${TEXTURES_BASE}BP06-003EN.png`;
    case "Greenbrier Elf":
      return `${TEXTURES_BASE}BP06-004EN.png`;
    case "Wildwood Matriarch":
      return `${TEXTURES_BASE}BP06-005EN.png`;
    case "Wildwood Matriarch Evolved":
      return `${TEXTURES_BASE}BP06-006EN.png`;
    case "Fairy Dragon":
      return `${TEXTURES_BASE}BP06-007EN.png`;
    case "Woodland Cleaver":
      return `${TEXTURES_BASE}BP06-008EN.png`;
    case "Woodland Cleaver Evolved":
      return `${TEXTURES_BASE}BP06-009EN.png`;
    case "Assault Jaguar":
      return `${TEXTURES_BASE}BP06-010EN.png`;
    case "Spiritshine":
      return `${TEXTURES_BASE}BP06-011EN.png`;
    case "Greenwood Guardian":
      return `${TEXTURES_BASE}BP06-012EN.png`;
    case "Crossbow Sniper":
      return `${TEXTURES_BASE}BP06-013EN.png`;
    case "Mallet Monkey":
      return `${TEXTURES_BASE}BP06-014EN.png`;
    case "Mallet Monkey Evolved":
      return `${TEXTURES_BASE}BP06-015EN.png`;
    case "Elven Sentry":
      return `${TEXTURES_BASE}BP06-016EN.png`;
    case "Synchronized Slash":
      return `${TEXTURES_BASE}BP06-017EN.png`;
    case "Kagemitsu, Matchless Blade":
      return `${TEXTURES_BASE}BP06-018EN.png`;
    case "Ralmia, Sonic Racer":
      return `${TEXTURES_BASE}BP06-019EN.png`;
    case "Ralmia, Sonic Racer Evolved":
      return `${TEXTURES_BASE}BP06-020EN.png`;
    case "Steadfast Samurai":
      return `${TEXTURES_BASE}BP06-021EN.png`;
    case "Hero of Antiquity":
      return `${TEXTURES_BASE}BP06-022EN.png`;
    case "Hero of Antiquity Evolved":
      return `${TEXTURES_BASE}BP06-023EN.png`;
    case "Courtly Dance":
      return `${TEXTURES_BASE}BP06-024EN.png`;
    case "Quickdraw Maven":
      return `${TEXTURES_BASE}BP06-025EN.png`;
    case "Quickdraw Maven Evolved":
      return `${TEXTURES_BASE}BP06-026EN.png`;
    case "Twinsword Master":
      return `${TEXTURES_BASE}BP06-027EN.png`;
    case "Grand Acquisition":
      return `${TEXTURES_BASE}BP06-028EN.png`;
    case "Samurai Outlaw":
      return `${TEXTURES_BASE}BP06-029EN.png`;
    case "Samurai Outlaw Evolved":
      return `${TEXTURES_BASE}BP06-030EN.png`;
    case "Adept Thief":
      return `${TEXTURES_BASE}BP06-031EN.png`;
    case "Petalwink Paladin":
      return `${TEXTURES_BASE}BP06-032EN.png`;
    case "Levin Scholar":
      return `${TEXTURES_BASE}BP06-033EN.png`;
    case "Breakneck Draw":
      return `${TEXTURES_BASE}BP06-034EN.png`;
    case "Kuon, Founder of Onmyodo":
      return `${TEXTURES_BASE}BP06-035EN.png`;
    case "Mysteria, Magic Founder":
      return `${TEXTURES_BASE}BP06-036EN.png`;
    case "Mysteria, Magic Founder Evolved":
      return `${TEXTURES_BASE}BP06-037EN.png`;
    case "Curse Crafter":
      return `${TEXTURES_BASE}BP06-038EN.png`;
    case "Curse Crafter Evolved":
      return `${TEXTURES_BASE}BP06-039EN.png`;
    case "Hulking Giant":
      return `${TEXTURES_BASE}BP06-040EN.png`;
    case "Shikigami Summons":
      return `${TEXTURES_BASE}BP06-041EN.png`;
    case "Demoncaller":
      return `${TEXTURES_BASE}BP06-042EN.png`;
    case "Demoncaller Evolved":
      return `${TEXTURES_BASE}BP06-043EN.png`;
    case "Traditional Sorcerer":
      return `${TEXTURES_BASE}BP06-044EN.png`;
    case "Crimson Meteor Storm":
      return `${TEXTURES_BASE}BP06-045EN.png`;
    case "Talisman Disciple":
      return `${TEXTURES_BASE}BP06-046EN.png`;
    case "Charming Gentlemouse":
      return `${TEXTURES_BASE}BP06-047EN.png`;
    case "Charming Gentlemouse Evolved":
      return `${TEXTURES_BASE}BP06-048EN.png`;
    case "Passionate Potioneer":
      return `${TEXTURES_BASE}BP06-049EN.png`;
    case "Golem's Rampage":
      return `${TEXTURES_BASE}BP06-050EN.png`;
    case "Mirror of Truth":
      return `${TEXTURES_BASE}BP06-051EN.png`;
    case "Garyu, Surpreme Dragonkin":
      return `${TEXTURES_BASE}BP06-052EN.png`;
    case "Garyu, Surpreme Dragonkin Evolved":
      return `${TEXTURES_BASE}BP06-053EN.png`;
    case "Filene, Whitefrost Dragonewt":
      return `${TEXTURES_BASE}BP06-054EN.png`;
    case "Phoenix Empress":
      return `${TEXTURES_BASE}BP06-055EN.png`;
    case "Wyrm God of the Skies":
      return `${TEXTURES_BASE}BP06-056EN.png`;
    case "Wyrm God of the Skies Evolved":
      return `${TEXTURES_BASE}BP06-057EN.png`;
    case "Whitefrost Whisper":
      return `${TEXTURES_BASE}BP06-058EN.png`;
    case "Ice Dancing Dragonewt":
      return `${TEXTURES_BASE}BP06-059EN.png`;
    case "Ice Dancing Dragonewt Evolved":
      return `${TEXTURES_BASE}BP06-060EN.png`;
    case "Jadelong Tactician":
      return `${TEXTURES_BASE}BP06-061EN.png`;
    case "Aquascale Stalwart":
      return `${TEXTURES_BASE}BP06-062EN.png`;
    case "Swordwhip Dragoon":
      return `${TEXTURES_BASE}BP06-063EN.png`;
    case "Dragonblader":
      return `${TEXTURES_BASE}BP06-064EN.png`;
    case "Dragonblader Evolved":
      return `${TEXTURES_BASE}BP06-065EN.png`;
    case "Trident Merman":
      return `${TEXTURES_BASE}BP06-066EN.png`;
    case "Dragon Chef":
      return `${TEXTURES_BASE}BP06-067EN.png`;
    case "Flamewinged Might":
      return `${TEXTURES_BASE}BP06-068EN.png`;
    case "Ginsetsu, Great Fox":
      return `${TEXTURES_BASE}BP06-069EN.png`;
    case "Ginsetsu, Great Fox Evolved":
      return `${TEXTURES_BASE}BP06-070EN.png`;
    case "Aragavy the Berserker":
      return `${TEXTURES_BASE}BP06-071EN.png`;
    case "Shuten-Doji":
      return `${TEXTURES_BASE}BP06-072EN.png`;
    case "Shuten-Doji Evolved":
      return `${TEXTURES_BASE}BP06-073EN.png`;
    case "Bear Pelt Warrior":
      return `${TEXTURES_BASE}BP06-074EN.png`;
    case "Yuzuki, Righteous Demon":
      return `${TEXTURES_BASE}BP06-075EN.png`;
    case "Kasha":
      return `${TEXTURES_BASE}BP06-076EN.png`;
    case "Cougar Pelt Warrior":
      return `${TEXTURES_BASE}BP06-077EN.png`;
    case "Cougar Pelt Warrior Evolved":
      return `${TEXTURES_BASE}BP06-078EN.png`;
    case "Unleash the Nightmare":
      return `${TEXTURES_BASE}BP06-079EN.png`;
    case "Zashiki-Warashi":
      return `${TEXTURES_BASE}BP06-080EN.png`;
    case "Zashiki-Warashi Evolved":
      return `${TEXTURES_BASE}BP06-081EN.png`;
    case "Antelope Pelt Warrior":
      return `${TEXTURES_BASE}BP06-082EN.png`;
    case "Rookie Succubus":
      return `${TEXTURES_BASE}BP06-083EN.png`;
    case "Demonic Procession":
      return `${TEXTURES_BASE}BP06-084EN.png`;
    case "Berserker's Pelt":
      return `${TEXTURES_BASE}BP06-085EN.png`;
    case "Wilbert, Grand Knight":
      return `${TEXTURES_BASE}BP06-086EN.png`;
    case "Karula, Arts Master":
      return `${TEXTURES_BASE}BP06-087EN.png`;
    case "Karula, Arts Master Evolved":
      return `${TEXTURES_BASE}BP06-088EN.png`;
    case "Saintly Leader":
      return `${TEXTURES_BASE}BP06-089EN.png`;
    case "Phantom Blade Wielder":
      return `${TEXTURES_BASE}BP06-090EN.png`;
    case "Phantom Blade Wielder Evolved":
      return `${TEXTURES_BASE}BP06-091EN.png`;
    case "Manifest Devotion":
      return `${TEXTURES_BASE}BP06-092EN.png`;
    case "Holy Lancer":
      return `${TEXTURES_BASE}BP06-093EN.png`;
    case "Holy Lancer Evolved":
      return `${TEXTURES_BASE}BP06-094EN.png`;
    case "Boost Kicker":
      return `${TEXTURES_BASE}BP06-095EN.png`;
    case "Feather Sanctuary":
      return `${TEXTURES_BASE}BP06-096EN.png`;
    case "Winged Staff Priestess":
      return `${TEXTURES_BASE}BP06-097EN.png`;
    case "Gravity Grappler":
      return `${TEXTURES_BASE}BP06-098EN.png`;
    case "Barrage Brawler":
      return `${TEXTURES_BASE}BP06-099EN.png`;
    case "Barrage Brawler Evolved":
      return `${TEXTURES_BASE}BP06-100EN.png`;
    case "Holy Counterattack":
      return `${TEXTURES_BASE}BP06-101EN.png`;
    case "Focus":
      return `${TEXTURES_BASE}BP06-102EN.png`;
    case "Mammoth God's Colosseum":
      return `${TEXTURES_BASE}BP06-103EN.png`;
    case "Badb Catha":
      return `${TEXTURES_BASE}BP06-104EN.png`;
    case "Badb Catha Evolved":
      return `${TEXTURES_BASE}BP06-105EN.png`;
    case "Mithra, Daybreak Diety":
      return `${TEXTURES_BASE}BP06-106EN.png`;
    case "Mithra, Daybreak Diety Evolved":
      return `${TEXTURES_BASE}BP06-107EN.png`;
    case "Fall from Grace":
      return `${TEXTURES_BASE}BP06-108EN.png`;
    case "Colosseum on High":
      return `${TEXTURES_BASE}BP06-109EN.png`;
    case "Chaht, Ringside Announcer":
      return `${TEXTURES_BASE}BP06-110EN.png`;
    case "Chaht, Ringside Announcer Evolved":
      return `${TEXTURES_BASE}BP06-111EN.png`;
    case "Clash of Heroes":
      return `${TEXTURES_BASE}BP06-112EN.png`;
    case "Biofrabrication":
      return `${TEXTURES_BASE}BP06-113EN.png`;
    case "Sweet-Tooth Sleuth":
      return `${TEXTURES_BASE}BP06-114EN.png`;
    case "Bazooka Goblins":
      return `${TEXTURES_BASE}BP06-115EN.png`;
    case "Bazooka Goblins Evolved":
      return `${TEXTURES_BASE}BP06-116EN.png`;
    case "Sentry Gate":
      return `${TEXTURES_BASE}BP06-117EN.png`;

    case "Izudia, Omen of Unkilling":
      return `${TEXTURES_BASE}BP05-001EN.png`;
    case "Izudia, Omen of Unkilling Evolved":
      return `${TEXTURES_BASE}BP05-002EN.png`;
    case "Spinaria, Keeper of Enigmas":
      return `${TEXTURES_BASE}BP05-003EN.png`;
    case "Apostle of Unkilling":
      return `${TEXTURES_BASE}BP05-004EN.png`;
    case "Apostle of Unkilling Evolved":
      return `${TEXTURES_BASE}BP05-005EN.png`;
    case "Morton the Manipulator":
      return `${TEXTURES_BASE}BP05-006EN.png`;
    case "Fairy Torrent":
      return `${TEXTURES_BASE}BP05-007EN.png`;
    case "Disciple of Unkilling":
      return `${TEXTURES_BASE}BP05-008EN.png`;
    case "Noah, Vengeful Puppeteer":
      return `${TEXTURES_BASE}BP05-009EN.png`;
    case "Noah, Vengeful Puppeteer Evolved":
      return `${TEXTURES_BASE}BP05-010EN.png`;
    case "Mark of the Unkilling":
      return `${TEXTURES_BASE}BP05-011EN.png`;
    case "Servant of Unkilling":
      return `${TEXTURES_BASE}BP05-012EN.png`;
    case "Mechanical Bowman":
      return `${TEXTURES_BASE}BP05-013EN.png`;
    case "Flower Doll":
      return `${TEXTURES_BASE}BP05-014EN.png`;
    case "Flower Doll Evolved":
      return `${TEXTURES_BASE}BP05-015EN.png`;
    case "Automaton Soldier":
      return `${TEXTURES_BASE}BP05-016EN.png`;
    case "Mark of the Six":
      return `${TEXTURES_BASE}BP05-017EN.png`;

    case "Octrice, Omen of Usurpation":
      return `${TEXTURES_BASE}BP05-018EN.png`;
    case "Octrice, Omen of Usurpation Evolved":
      return `${TEXTURES_BASE}BP05-019EN.png`;
    case "Magna Legacy":
      return `${TEXTURES_BASE}BP05-020EN.png`;
    case "Apostle of Usurpation":
      return `${TEXTURES_BASE}BP05-021EN.png`;
    case "Apostle of Usurpation Evolved":
      return `${TEXTURES_BASE}BP05-022EN.png`;
    case "Empyreal Swordsman":
      return `${TEXTURES_BASE}BP05-023EN.png`;
    case "Confront Adversity":
      return `${TEXTURES_BASE}BP05-024EN.png`;
    case "Disciple of Usurpation":
      return `${TEXTURES_BASE}BP05-025EN.png`;
    case "Fervent Maachine Soldier":
      return `${TEXTURES_BASE}BP05-026EN.png`;
    case "Geno, Machine Artisan":
      return `${TEXTURES_BASE}BP05-027EN.png`;
    case "Geno, Machine Artisan Evolved":
      return `${TEXTURES_BASE}BP05-028EN.png`;
    case "Servant of Usurpation":
      return `${TEXTURES_BASE}BP05-029EN.png`;
    case "Captain Meteo":
      return `${TEXTURES_BASE}BP05-030EN.png`;
    case "Captain Meteo Evolved":
      return `${TEXTURES_BASE}BP05-031EN.png`;
    case "Gravikinetic Warrior":
      return `${TEXTURES_BASE}BP05-032EN.png`;
    case "Usurping Spineblade":
      return `${TEXTURES_BASE}BP05-033EN.png`;
    case "Avaritia":
      return `${TEXTURES_BASE}BP05-034EN.png`;

    case "Raio, Omen of Truth":
      return `${TEXTURES_BASE}BP05-035EN.png`;
    case "Raio, Omen of Truth Evolved":
      return `${TEXTURES_BASE}BP05-036EN.png`;
    case "Lishenna, Omen of Destruction":
      return `${TEXTURES_BASE}BP05-037EN.png`;
    case "Apostle of Truth":
      return `${TEXTURES_BASE}BP05-038EN.png`;
    case "Apostle of Truth Evolved":
      return `${TEXTURES_BASE}BP05-039EN.png`;
    case "Safira, Synthetic Beast":
      return `${TEXTURES_BASE}BP05-040EN.png`;
    case "Destructive Refrain":
      return `${TEXTURES_BASE}BP05-041EN.png`;
    case "Iron Staff Mechanic":
      return `${TEXTURES_BASE}BP05-042EN.png`;
    case "Iron Staff Mechanic Evolved":
      return `${TEXTURES_BASE}BP05-043EN.png`;
    case "Truth's Adjudication":
      return `${TEXTURES_BASE}BP05-044EN.png`;
    case "Monochromatic Destruction":
      return `${TEXTURES_BASE}BP05-045EN.png`;
    case "Disciple of Truth":
      return `${TEXTURES_BASE}BP05-046EN.png`;
    case "Disciple of Destruction":
      return `${TEXTURES_BASE}BP05-047EN.png`;
    case "Servant of Destruction":
      return `${TEXTURES_BASE}BP05-048EN.png`;
    case "Servant of Destruction Evolved":
      return `${TEXTURES_BASE}BP05-049EN.png`;
    case "Honest Cohort":
      return `${TEXTURES_BASE}BP05-050EN.png`;
    case "Metaproduction":
      return `${TEXTURES_BASE}BP05-051EN.png`;

    case "Galmieux, Omen of Disdain":
      return `${TEXTURES_BASE}BP05-052EN.png`;
    case "Galmieux, Omen of Disdain Evolved":
      return `${TEXTURES_BASE}BP05-053EN.png`;
    case "Electromagical Rhino":
      return `${TEXTURES_BASE}BP05-054EN.png`;
    case "Apostle of Disdain":
      return `${TEXTURES_BASE}BP05-055EN.png`;
    case "Apostle of Disdain Evolved":
      return `${TEXTURES_BASE}BP05-056EN.png`;
    case "God Bullet Golem":
      return `${TEXTURES_BASE}BP05-057EN.png`;
    case "Disdainful Rending":
      return `${TEXTURES_BASE}BP05-058EN.png`;
    case "Disciple of Disdain":
      return `${TEXTURES_BASE}BP05-059EN.png`;
    case "Cursed Stone":
      return `${TEXTURES_BASE}BP05-060EN.png`;
    case "Cursed Stone Evolved":
      return `${TEXTURES_BASE}BP05-061EN.png`;
    case "Amethyst Giant":
      return `${TEXTURES_BASE}BP05-062EN.png`;
    case "Servant of Disdain":
      return `${TEXTURES_BASE}BP05-063EN.png`;
    case "Silver Automaton":
      return `${TEXTURES_BASE}BP05-064EN.png`;
    case "Airship Whale":
      return `${TEXTURES_BASE}BP05-065EN.png`;
    case "Airship Whale Evolved":
      return `${TEXTURES_BASE}BP05-066EN.png`;
    case "Colossal Construct":
      return `${TEXTURES_BASE}BP05-067EN.png`;
    case "Total Domination":
      return `${TEXTURES_BASE}BP05-068EN.png`;

    case "Valnareik, Omen of Lust":
      return `${TEXTURES_BASE}BP05-069EN.png`;
    case "Rulenye, Omen of Silence":
      return `${TEXTURES_BASE}BP05-070EN.png`;
    case "Rulenye, Omen of Silence Evolved":
      return `${TEXTURES_BASE}BP05-071EN.png`;
    case "Apostle of Lust":
      return `${TEXTURES_BASE}BP05-072EN.png`;
    case "Apostle of Silence":
      return `${TEXTURES_BASE}BP05-073EN.png`;
    case "Apostle of Silence Evolved":
      return `${TEXTURES_BASE}BP05-074EN.png`;
    case "Disciple of Lust":
      return `${TEXTURES_BASE}BP05-075EN.png`;
    case "Masked Puppet":
      return `${TEXTURES_BASE}BP05-076EN.png`;
    case "Masked Puppet Evolved":
      return `${TEXTURES_BASE}BP05-077EN.png`;
    case "Wings of Lust":
      return `${TEXTURES_BASE}BP05-078EN.png`;
    case "Silent Purge":
      return `${TEXTURES_BASE}BP05-079EN.png`;
    case "Servant of Lust":
      return `${TEXTURES_BASE}BP05-080EN.png`;
    case "Servant of Lust Evolved":
      return `${TEXTURES_BASE}BP05-081EN.png`;
    case "Servant of Silence":
      return `${TEXTURES_BASE}BP05-082EN.png`;
    case "Hamelin":
      return `${TEXTURES_BASE}BP05-083EN.png`;
    case "Embracing Wings":
      return `${TEXTURES_BASE}BP05-084EN.png`;
    case "Thundering Roar":
      return `${TEXTURES_BASE}BP05-085EN.png`;

    case "Marwynn, Omen of Repose":
      return `${TEXTURES_BASE}BP05-086EN.png`;
    case "Marwynn, Omen of Repose Evolved":
      return `${TEXTURES_BASE}BP05-087EN.png`;
    case "Deus Ex Machina":
      return `${TEXTURES_BASE}BP05-088EN.png`;
    case "Apostle of Repose":
      return `${TEXTURES_BASE}BP05-089EN.png`;
    case "Apostle of Repose Evolved":
      return `${TEXTURES_BASE}BP05-090EN.png`;
    case "Hakrabi":
      return `${TEXTURES_BASE}BP05-091EN.png`;
    case "Ancient Protector":
      return `${TEXTURES_BASE}BP05-092EN.png`;
    case "Disciple of Repose":
      return `${TEXTURES_BASE}BP05-093EN.png`;
    case "Unidentified Subject":
      return `${TEXTURES_BASE}BP05-094EN.png`;
    case "Unidentified Subject Evolved":
      return `${TEXTURES_BASE}BP05-095EN.png`;
    case "Silver Cog Spinner":
      return `${TEXTURES_BASE}BP05-096EN.png`;
    case "Servant of Repose":
      return `${TEXTURES_BASE}BP05-097EN.png`;
    case "Demon's Epitaph":
      return `${TEXTURES_BASE}BP05-098EN.png`;
    case "Demon's Epitaph Evolved":
      return `${TEXTURES_BASE}BP05-099EN.png`;
    case "The Saviors":
      return `${TEXTURES_BASE}BP05-100EN.png`;
    case "Realm of Repose":
      return `${TEXTURES_BASE}BP05-101EN.png`;
    case "Ancient Amplifier":
      return `${TEXTURES_BASE}BP05-102EN.png`;

    case "Mjerrabaine, Omen of One":
      return `${TEXTURES_BASE}BP05-103EN.png`;
    case "Mjerrabaine, Omen of One Evolved":
      return `${TEXTURES_BASE}BP05-104EN.png`;
    case "Gilnelise, Omen of Craving":
      return `${TEXTURES_BASE}BP05-105EN.png`;
    case "Apostle of Craving":
      return `${TEXTURES_BASE}BP05-106EN.png`;
    case "Apostle of Craving Evolved":
      return `${TEXTURES_BASE}BP05-107EN.png`;
    case "Lyrial, Archer Throne":
      return `${TEXTURES_BASE}BP05-108EN.png`;
    case "Feena, Dynamite Daredevil":
      return `${TEXTURES_BASE}BP05-109EN.png`;
    case "Rosa, Mech Wing Maiden":
      return `${TEXTURES_BASE}BP05-110EN.png`;
    case "Rosa, Mech Wing Maiden Evolved":
      return `${TEXTURES_BASE}BP05-111EN.png`;
    case "Enlightenment":
      return `${TEXTURES_BASE}BP05-112EN.png`;
    case "Craving's Splendor":
      return `${TEXTURES_BASE}BP05-113EN.png`;
    case "Cat Cannoneer":
      return `${TEXTURES_BASE}BP05-114EN.png`;
    case "Cat Cannoneer Evolved":
      return `${TEXTURES_BASE}BP05-115EN.png`;
    case "Steel Demolitionist":
      return `${TEXTURES_BASE}BP05-116EN.png`;
    case "Gliesaray":
      return `${TEXTURES_BASE}BP05-117EN.png`;

    case "Cassiopeia":
      return `${TEXTURES_BASE}BP04-001EN.png`;
    case "C.C., Woodland Witch":
      return `${TEXTURES_BASE}BP04-002EN.png`;
    case "Deepwood Anomaly":
      return `${TEXTURES_BASE}BP04-003EN.png`;
    case "Deepwood Anomaly Evolved":
      return `${TEXTURES_BASE}BP04-004EN.png`;
    case "King Elephant":
      return `${TEXTURES_BASE}BP04-005EN.png`;
    case "King Elephant Evolved":
      return `${TEXTURES_BASE}BP04-006EN.png`;
    case "Fashionista Nelcha":
      return `${TEXTURES_BASE}BP04-007EN.png`;
    case "Spring-Green Protection":
      return `${TEXTURES_BASE}BP04-008EN.png`;
    case "Inviolable Verdancy":
      return `${TEXTURES_BASE}BP04-009EN.png`;
    case "Sukuna, Brave and Small":
      return `${TEXTURES_BASE}BP04-010EN.png`;
    case "Sukuna, Brave and Small Evolved":
      return `${TEXTURES_BASE}BP04-011EN.png`;
    case "Dolorblade Demon":
      return `${TEXTURES_BASE}BP04-012EN.png`;
    case "Elf Song":
      return `${TEXTURES_BASE}BP04-013EN.png`;
    case "Starry Elf":
      return `${TEXTURES_BASE}BP04-014EN.png`;
    case "Fita the Gentle Elf":
      return `${TEXTURES_BASE}BP04-015EN.png`;
    case "Fita the Gentle Elf Evolved":
      return `${TEXTURES_BASE}BP04-016EN.png`;
    case "Dryad":
      return `${TEXTURES_BASE}BP04-017EN.png`;
    case "Beetle Warrior":
      return `${TEXTURES_BASE}BP04-018EN.png`;
    case "Ivy Spellbomb":
      return `${TEXTURES_BASE}BP04-019EN.png`;
    case "Mars, Silent Flame General":
      return `${TEXTURES_BASE}BP04-020EN.png`;
    case "Mars, Silent Flame General Evolved":
      return `${TEXTURES_BASE}BP04-021EN.png`;
    case "Gawain of the Round Table":
      return `${TEXTURES_BASE}BP04-022EN.png`;
    case "Barbarossa":
      return `${TEXTURES_BASE}BP04-023EN.png`;
    case "Barbarossa Evolved":
      return `${TEXTURES_BASE}BP04-024EN.png`;
    case "Perseus":
      return `${TEXTURES_BASE}BP04-025EN.png`;
    case "Cyclone Blade":
      return `${TEXTURES_BASE}BP04-026EN.png`;
    case "Chivalrous Charge":
      return `${TEXTURES_BASE}BP04-027EN.png`;
    case "Shrouded Assassin":
      return `${TEXTURES_BASE}BP04-028EN.png`;
    case "Shrouded Assassin Evolved":
      return `${TEXTURES_BASE}BP04-029EN.png`;
    case "Lord General Romeo":
      return `${TEXTURES_BASE}BP04-030EN.png`;
    case "Round Table Assembly":
      return `${TEXTURES_BASE}BP04-031EN.png`;
    case "Princess Juliet":
      return `${TEXTURES_BASE}BP04-032EN.png`;
    case "Flail Knight":
      return `${TEXTURES_BASE}BP04-033EN.png`;
    case "Pollux":
      return `${TEXTURES_BASE}BP04-034EN.png`;
    case "Tristan of the Round Table":
      return `${TEXTURES_BASE}BP04-035EN.png`;
    case "Tristan of the Round Table Evolved":
      return `${TEXTURES_BASE}BP04-036EN.png`;
    case "Armor of the Stars":
      return `${TEXTURES_BASE}BP04-037EN.png`;
    case "Wordwielder Ginger":
      return `${TEXTURES_BASE}BP04-038EN.png`;
    case "Wordwielder Ginger Evolved":
      return `${TEXTURES_BASE}BP04-039EN.png`;
    case "Giant Chimera":
      return `${TEXTURES_BASE}BP04-040EN.png`;
    case "Star Reader Stella":
      return `${TEXTURES_BASE}BP04-041EN.png`;
    case "Europa":
      return `${TEXTURES_BASE}BP04-042EN.png`;
    case "Europa Evolved":
      return `${TEXTURES_BASE}BP04-043EN.png`;
    case "Chain of Calling":
      return `${TEXTURES_BASE}BP04-044EN.png`;
    case "Noble Instruction":
      return `${TEXTURES_BASE}BP04-045EN.png`;
    case "Freshman Lou":
      return `${TEXTURES_BASE}BP04-046EN.png`;
    case "Magic Illusionist":
      return `${TEXTURES_BASE}BP04-047EN.png`;
    case "Magic Illusionist Evolved":
      return `${TEXTURES_BASE}BP04-048EN.png`;
    case "Concentration":
      return `${TEXTURES_BASE}BP04-049EN.png`;
    case "Show of Loyalty":
      return `${TEXTURES_BASE}BP04-050EN.png`;
    case "Dazzling Healer":
      return `${TEXTURES_BASE}BP04-051EN.png`;
    case "Dazzling Healer Evolved":
      return `${TEXTURES_BASE}BP04-052EN.png`;
    case "Mage of Nightfall":
      return `${TEXTURES_BASE}BP04-053EN.png`;
    case "Astrologist of the Mist":
      return `${TEXTURES_BASE}BP04-054EN.png`;
    case "Magic Owl":
      return `${TEXTURES_BASE}BP04-055EN.png`;
    case "Starseer's Telescope":
      return `${TEXTURES_BASE}BP04-056EN.png`;
    case "Sibyl of the Waterwyrm":
      return `${TEXTURES_BASE}BP04-057EN.png`;
    case "Kallen, Crimson Yaksha":
      return `${TEXTURES_BASE}BP04-058EN.png`;
    case "Python":
      return `${TEXTURES_BASE}BP04-059EN.png`;
    case "Python Evolved":
      return `${TEXTURES_BASE}BP04-060EN.png`;
    case "Lævateinn Dragon, Defense Form Evolved":
      return `${TEXTURES_BASE}BP04-061EN.png`;
    case "Lævateinn Dragon, Blast Form Evolved":
      return `${TEXTURES_BASE}BP04-062EN.png`;
    case "Prime Dragon Keeper":
      return `${TEXTURES_BASE}BP04-063EN.png`;
    case "Star Phoenix":
      return `${TEXTURES_BASE}BP04-064EN.png`;
    case "Star Phoenix Evolved":
      return `${TEXTURES_BASE}BP04-065EN.png`;
    case "Lightning Blast":
      return `${TEXTURES_BASE}BP04-066EN.png`;
    case "Guren Revolt":
      return `${TEXTURES_BASE}BP04-067EN.png`;
    case "Venomous Pucewyrm":
      return `${TEXTURES_BASE}BP04-068EN.png`;
    case "Cetus":
      return `${TEXTURES_BASE}BP04-069EN.png`;
    case "Cetus Evolved":
      return `${TEXTURES_BASE}BP04-070EN.png`;
    case "Dragonewt Fist":
      return `${TEXTURES_BASE}BP04-071EN.png`;
    case "Divine Tiger":
      return `${TEXTURES_BASE}BP04-072EN.png`;
    case "Dragonrearer Matilda":
      return `${TEXTURES_BASE}BP04-073EN.png`;
    case "Aqua Nerid":
      return `${TEXTURES_BASE}BP04-074EN.png`;
    case "Hippocampus":
      return `${TEXTURES_BASE}BP04-075EN.png`;
    case "Hippocampus Evolved":
      return `${TEXTURES_BASE}BP04-076EN.png`;
    case "Scaled Berserker":
      return `${TEXTURES_BASE}BP04-077EN.png`;
    case "Dragon's Nest":
      return `${TEXTURES_BASE}BP04-078EN.png`;
    case "Venomfang Medusa":
      return `${TEXTURES_BASE}BP04-079EN.png`;
    case "Howling Demon":
      return `${TEXTURES_BASE}BP04-080EN.png`;
    case "Howling Demon Evolved":
      return `${TEXTURES_BASE}BP04-081EN.png`;
    case "Demonlord Eachtar":
      return `${TEXTURES_BASE}BP04-082EN.png`;
    case "Lelouch, Leader of the Black Knights":
      return `${TEXTURES_BASE}BP04-083EN.png`;
    case "Stheno":
      return `${TEXTURES_BASE}BP04-084EN.png`;
    case "Stheno Evolved":
      return `${TEXTURES_BASE}BP04-085EN.png`;
    case "Trial of the Gorgons":
      return `${TEXTURES_BASE}BP04-086EN.png`;
    case "Fenrir":
      return `${TEXTURES_BASE}BP04-087EN.png`;
    case "Fenrir Evolved":
      return `${TEXTURES_BASE}BP04-088EN.png`;
    case "Euryale":
      return `${TEXTURES_BASE}BP04-089EN.png`;
    case "Grave Desecration":
      return `${TEXTURES_BASE}BP04-090EN.png`;
    case "Emperor's Command":
      return `${TEXTURES_BASE}BP04-091EN.png`;
    case "Demonic Drummer":
      return `${TEXTURES_BASE}BP04-092EN.png`;
    case "Castor":
      return `${TEXTURES_BASE}BP04-093EN.png`;
    case "Frogbat":
      return `${TEXTURES_BASE}BP04-094EN.png`;
    case "Frogbat Evolved":
      return `${TEXTURES_BASE}BP04-095EN.png`;
    case "Scorpius":
      return `${TEXTURES_BASE}BP04-096EN.png`;
    case "Venomous Bite":
      return `${TEXTURES_BASE}BP04-097EN.png`;
    case "Aether of the White Wing":
      return `${TEXTURES_BASE}BP04-098EN.png`;
    case "Dark Jeanne":
      return `${TEXTURES_BASE}BP04-099EN.png`;
    case "Dark Jeanne Evolved":
      return `${TEXTURES_BASE}BP04-100EN.png`;
    case "Zoe, Princess of Goldenia":
      return `${TEXTURES_BASE}BP04-101EN.png`;
    case "Zoe, Princess of Goldenia Evolved":
      return `${TEXTURES_BASE}BP04-102EN.png`;
    case "Andromeda":
      return `${TEXTURES_BASE}BP04-103EN.png`;
    case "Globe of the Starways":
      return `${TEXTURES_BASE}BP04-104EN.png`;
    case "Dark Charisma":
      return `${TEXTURES_BASE}BP04-105EN.png`;
    case "Star Priestess":
      return `${TEXTURES_BASE}BP04-106EN.png`;
    case "Star Priestess Evolved":
      return `${TEXTURES_BASE}BP04-107EN.png`;
    case "Calydonian Boar":
      return `${TEXTURES_BASE}BP04-108EN.png`;
    case "Star Torrent":
      return `${TEXTURES_BASE}BP04-109EN.png`;
    case "Starchaser Sprite":
      return `${TEXTURES_BASE}BP04-110EN.png`;
    case "Sister of Punishment":
      return `${TEXTURES_BASE}BP04-111EN.png`;
    case "Mist Shaman":
      return `${TEXTURES_BASE}BP04-112EN.png`;
    case "Mist Shaman Evolved":
      return `${TEXTURES_BASE}BP04-113EN.png`;
    case "Octobishop":
      return `${TEXTURES_BASE}BP04-114EN.png`;
    case "Candelabra of Prayers":
      return `${TEXTURES_BASE}BP04-115EN.png`;
    case "Zodiac Demon":
      return `${TEXTURES_BASE}BP04-116EN.png`;
    case "Israfil":
      return `${TEXTURES_BASE}BP04-117EN.png`;
    case "Israfil Evolved":
      return `${TEXTURES_BASE}BP04-118EN.png`;
    case "Grimnir, War Cyclone":
      return `${TEXTURES_BASE}BP04-119EN.png`;
    case "Grimnir, War Cyclone Evolved":
      return `${TEXTURES_BASE}BP04-120EN.png`;
    case "Arriet, Soothing Harpist":
      return `${TEXTURES_BASE}BP04-121EN.png`;
    case "Staircase to Paradise":
      return `${TEXTURES_BASE}BP04-122EN.png`;
    case "Purehearted Singer":
      return `${TEXTURES_BASE}BP04-123EN.png`;
    case "Goblin Princess":
      return `${TEXTURES_BASE}BP04-124EN.png`;
    case "Goblin Princess Evolved":
      return `${TEXTURES_BASE}BP04-125EN.png`;
    case "Mystic Ring":
      return `${TEXTURES_BASE}BP04-126EN.png`;
    case "Owlcat":
      return `${TEXTURES_BASE}BP04-127EN.png`;
    case "Owlcat Evolved":
      return `${TEXTURES_BASE}BP04-128EN.png`;
    case "Mr. Full Moon":
      return `${TEXTURES_BASE}BP04-129EN.png`;
    case "Night's Way":
      return `${TEXTURES_BASE}BP04-130EN.png`;

    case "Beauty and the Beast":
      return `${TEXTURES_BASE}BP03-001EN.png`;
    case "Cosmos Fang":
      return `${TEXTURES_BASE}BP03-002EN.png`;
    case "Cosmos Fang Evolved":
      return `${TEXTURES_BASE}BP03-003EN.png`;
    case "Magical Fairy, Lilac":
      return `${TEXTURES_BASE}BP03-004EN.png`;
    case "Slade Blossoming Wolf":
      return `${TEXTURES_BASE}BP03-005EN.png`;
    case "Slade Blossoming Wolf Evolved":
      return `${TEXTURES_BASE}BP03-006EN.png`;
    case "Elf Twins' Assault":
      return `${TEXTURES_BASE}BP03-007EN.png`;
    case "Abby the Axe Girl":
      return `${TEXTURES_BASE}BP03-008EN.png`;
    case "Gerbera Bear":
      return `${TEXTURES_BASE}BP03-009EN.png`;
    case "Gerbera Bear Evolved":
      return `${TEXTURES_BASE}BP03-010EN.png`;
    case "Flower Princess":
      return `${TEXTURES_BASE}BP03-012EN.png`;
    case "Wood of Brambles":
      return `${TEXTURES_BASE}BP03-011EN.png`;
    case "Fen Sprite":
      return `${TEXTURES_BASE}BP03-013EN.png`;
    case "Tweedle Dum, Tweedle Dee":
      return `${TEXTURES_BASE}BP03-014EN.png`;
    case "Tweedle Dum, Tweedle Dee Evolved":
      return `${TEXTURES_BASE}BP03-015EN.png`;
    case "Floral Breeze":
      return `${TEXTURES_BASE}BP03-016EN.png`;
    case "Woodland Band":
      return `${TEXTURES_BASE}BP03-017EN.png`;
    case "Cinderella":
      return `${TEXTURES_BASE}BP03-018EN.png`;
    case "Valiant Fencer":
      return `${TEXTURES_BASE}BP03-019EN.png`;
    case "Valiant Fencer Evolved":
      return `${TEXTURES_BASE}BP03-020EN.png`;
    case "Maisy, Red Riding Hood":
      return `${TEXTURES_BASE}BP03-021EN.png`;
    case "Amerro, Spear Knight":
      return `${TEXTURES_BASE}BP03-022EN.png`;
    case "Amerro, Spear Knight Evolved":
      return `${TEXTURES_BASE}BP03-023EN.png`;
    case "Castle in the Sky":
      return `${TEXTURES_BASE}BP03-024EN.png`;
    case "Young Ogrehunter Momo":
      return `${TEXTURES_BASE}BP03-025EN.png`;
    case "Mach Knight":
      return `${TEXTURES_BASE}BP03-026EN.png`;
    case "Mach Knight Evolved":
      return `${TEXTURES_BASE}BP03-027EN.png`;
    case "Kiss of the Princess":
      return `${TEXTURES_BASE}BP03-028EN.png`;
    case "Rabbit Ear Attendant":
      return `${TEXTURES_BASE}BP03-029EN.png`;
    case "Old Man and Old Woman":
      return `${TEXTURES_BASE}BP03-030EN.png`;
    case "Bladed Hedgehog":
      return `${TEXTURES_BASE}BP03-031EN.png`;
    case "Bladed Hedgehog Evolved":
      return `${TEXTURES_BASE}BP03-032EN.png`;
    case "Ironwrought Defender":
      return `${TEXTURES_BASE}BP03-033EN.png`;
    case "Heroic Entry":
      return `${TEXTURES_BASE}BP03-034EN.png`;
    case "Wizardess of Oz":
      return `${TEXTURES_BASE}BP03-035EN.png`;
    case "Witch of Calamity, Millie Parfait":
      return `${TEXTURES_BASE}BP03-036EN.png`;
    case "Mystic King":
      return `${TEXTURES_BASE}BP03-037EN.png`;
    case "Mystic King Evolved":
      return `${TEXTURES_BASE}BP03-038EN.png`;
    case "Falise, Leonardian Mage":
      return `${TEXTURES_BASE}BP03-039EN.png`;
    case "Milady, Mystic Queen":
      return `${TEXTURES_BASE}BP03-040EN.png`;
    case "Milady, Mystic Queen Evolved":
      return `${TEXTURES_BASE}BP03-041EN.png`;
    case "Check":
      return `${TEXTURES_BASE}BP03-042EN.png`;
    case "Mr. Heinlein, Shadow Mage":
      return `${TEXTURES_BASE}BP03-043EN.png`;
    case "Magical Knight":
      return `${TEXTURES_BASE}BP03-044EN.png`;
    case "Magical Knight Evolved":
      return `${TEXTURES_BASE}BP03-045EN.png`;
    case "Gingerbread House":
      return `${TEXTURES_BASE}BP03-046EN.png`;
    case "It's a Sweets Buffet!":
      return `${TEXTURES_BASE}BP03-047EN.png`;
    case "Witch of Sweets":
      return `${TEXTURES_BASE}BP03-048EN.png`;
    case "Witch of Sweets Evolved":
      return `${TEXTURES_BASE}BP03-049EN.png`;
    case "Magical Rook":
      return `${TEXTURES_BASE}BP03-050EN.png`;
    case "Magical Bishop":
      return `${TEXTURES_BASE}BP03-051EN.png`;
    case "Blitz":
      return `${TEXTURES_BASE}BP03-052EN.png`;
    case "Witch's Cauldron":
      return `${TEXTURES_BASE}BP03-053EN.png`;
    case "The Cauldron of Calamity":
      return `${TEXTURES_BASE}BP03-054EN.png`;
    case "Jabberwock U":
      return `${TEXTURES_BASE}BP03-U04EN.png`;
    case "Lævateinn Dragon":
      return `${TEXTURES_BASE}BP03-056EN.png`;
    case "Lævateinn Dragon Evolved":
      return `${TEXTURES_BASE}BP03-057EN.png`;
    case "Lævateinn Dragon Attack Form Evolved":
      return `${TEXTURES_BASE}BP03-058EN.png`;
    case "Red Ragewyrm":
      return `${TEXTURES_BASE}BP03-059EN.png`;
    case "Draconir, Knuckle Dragon":
      return `${TEXTURES_BASE}BP03-060EN.png`;
    case "Draconir, Knuckle Dragon Evolved":
      return `${TEXTURES_BASE}BP03-061EN.png`;
    case "Tilting at Windmills":
      return `${TEXTURES_BASE}BP03-062EN.png`;
    case "Master of Draconic Arts":
      return `${TEXTURES_BASE}BP03-063EN.png`;
    case "Hammer Dragonewt":
      return `${TEXTURES_BASE}BP03-064EN.png`;
    case "Hammer Dragonewt Evolved":
      return `${TEXTURES_BASE}BP03-065EN.png`;
    case "Draconic Smash":
      return `${TEXTURES_BASE}BP03-066EN.png`;
    case "Elder Tortoise":
      return `${TEXTURES_BASE}BP03-067EN.png`;
    case "Trinity Dragon":
      return `${TEXTURES_BASE}BP03-068EN.png`;
    case "Dragon Summoner":
      return `${TEXTURES_BASE}BP03-069EN.png`;
    case "Dragon Summoner Evolved":
      return `${TEXTURES_BASE}BP03-070EN.png`;
    case "Lance Lizard":
      return `${TEXTURES_BASE}BP03-071EN.png`;
    case "Armor Burst":
      return `${TEXTURES_BASE}BP03-072EN.png`;
    case "Dark Alice":
      return `${TEXTURES_BASE}BP03-073EN.png`;
    case "Masquerade Ghost":
      return `${TEXTURES_BASE}BP03-074EN.png`;
    case "Masquerade Ghost Evolved":
      return `${TEXTURES_BASE}BP03-075EN.png`;
    case "Odile, Black Swan":
      return `${TEXTURES_BASE}BP03-076EN.png`;
    case "Demonium, Punk Devil":
      return `${TEXTURES_BASE}BP03-077EN.png`;
    case "Baccherus, Peppy Ghostie":
      return `${TEXTURES_BASE}BP03-078EN.png`;
    case "Baccherus, Peppy Ghostie Evolved":
      return `${TEXTURES_BASE}BP03-079EN.png`;
    case "Demon Maestro":
      return `${TEXTURES_BASE}BP03-080EN.png`;
    case "Trombone Devil":
      return `${TEXTURES_BASE}BP03-081EN.png`;
    case "Trombone Devil Evolved":
      return `${TEXTURES_BASE}BP03-082EN.png`;
    case "Furtive Fangs":
      return `${TEXTURES_BASE}BP03-083EN.png`;
    case "Pumpkin Necromancer":
      return `${TEXTURES_BASE}BP03-084EN.png`;
    case "Parade Raven":
      return `${TEXTURES_BASE}BP03-085EN.png`;
    case "Mischievous Zombie":
      return `${TEXTURES_BASE}BP03-086EN.png`;
    case "Mischievous Zombie Evolved":
      return `${TEXTURES_BASE}BP03-087EN.png`;
    case "Devilish Flautist":
      return `${TEXTURES_BASE}BP03-088EN.png`;
    case "Infernal Orchestration":
      return `${TEXTURES_BASE}BP03-089EN.png`;
    case "Princess Snow White":
      return `${TEXTURES_BASE}BP03-090EN.png`;
    case "Diamond Master":
      return `${TEXTURES_BASE}BP03-091EN.png`;
    case "Diamond Master Evolved":
      return `${TEXTURES_BASE}BP03-092EN.png`;
    case "Odette, White Swan":
      return `${TEXTURES_BASE}BP03-093EN.png`;
    case "Wingy Chirpy Gemstone":
      return `${TEXTURES_BASE}BP03-094EN.png`;
    case "Wingy Chirpy Gemstone Evolved":
      return `${TEXTURES_BASE}BP03-095EN.png`;
    case "Alice's Adventure":
      return `${TEXTURES_BASE}BP03-096EN.png`;
    case "White Knight":
      return `${TEXTURES_BASE}BP03-097EN.png`;
    case "Ruby Falcon":
      return `${TEXTURES_BASE}BP03-098EN.png`;
    case "Ruby Falcon Evolved":
      return `${TEXTURES_BASE}BP03-099EN.png`;
    case "March Hare's Teatime":
      return `${TEXTURES_BASE}BP03-100EN.png`;
    case "Tin Soldier":
      return `${TEXTURES_BASE}BP03-101EN.png`;
    case "Pinion Prince":
      return `${TEXTURES_BASE}BP03-102EN.png`;
    case "Pinion Prince Evolved":
      return `${TEXTURES_BASE}BP03-103EN.png`;
    case "Birdkeeping Disciple":
      return `${TEXTURES_BASE}BP03-104EN.png`;
    case "Amethyst Lion":
      return `${TEXTURES_BASE}BP03-105EN.png`;
    case "Bejeweled Shrine":
      return `${TEXTURES_BASE}BP03-106EN.png`;
    case "Alice, Wonderland Explorer":
      return `${TEXTURES_BASE}BP03-107EN.png`;
    case "Alice, Wonderland Explorer Evolved":
      return `${TEXTURES_BASE}BP03-108EN.png`;
    case "Angel of Chaos":
      return `${TEXTURES_BASE}BP03-109EN.png`;
    case "Rapunzel":
      return `${TEXTURES_BASE}BP03-110EN.png`;
    case "Seraph of Sin":
      return `${TEXTURES_BASE}BP03-111EN.png`;
    case "Garuel, Seraphic Leo":
      return `${TEXTURES_BASE}BP03-112EN.png`;
    case "Garuel, Seraphic Leo Evolved":
      return `${TEXTURES_BASE}BP03-113EN.png`;
    case "Actress Feria":
      return `${TEXTURES_BASE}BP03-114EN.png`;
    case "Humpty Dumpty":
      return `${TEXTURES_BASE}BP03-115EN.png`;
    case "Humpty Dumpty Evolved":
      return `${TEXTURES_BASE}BP03-116EN.png`;
    case "Winged Inversion":
      return `${TEXTURES_BASE}BP03-117EN.png`;
    case "Angel of Darkness":
      return `${TEXTURES_BASE}BP03-118EN.png`;
    case "Harbringer of the Night":
      return `${TEXTURES_BASE}BP03-119EN.png`;
    case "Harbringer of the Night Evolved":
      return `${TEXTURES_BASE}BP03-120EN.png`;
    case "Eggsplosion":
      return `${TEXTURES_BASE}BP03-121EN.png`;
    case "Tazuna Hayakawa [Traccen Reception]":
      return `${TEXTURES_BASE}CSD01-007EN.png`;
    case "Riko Kashimoto":
      return `${TEXTURES_BASE}CSD01-030EN.png`;
    case "Aoi Kiryuin":
      return `${TEXTURES_BASE}CSD01-031EN.png`;
    case "Silence Suzuka":
      return `${TEXTURES_BASE}CP01-SP01EN.png`;
    case "Silence Suzuka Evolved":
      return `${TEXTURES_BASE}CP01-SP02EN.png`;
    case "Smart Falcon":
      return `${TEXTURES_BASE}CP01-SP03EN.png`;
    case "Gold City":
      return `${TEXTURES_BASE}CP01-004EN.png`;
    case "Eat Fast! Yum Fast!":
      return `${TEXTURES_BASE}CP01-005EN.png`;
    case "Shinko Windy":
      return `${TEXTURES_BASE}CP01-006EN.png`;
    case "Eishin Flash":
      return `${TEXTURES_BASE}CP01-007EN.png`;
    case "Systematic Squats":
      return `${TEXTURES_BASE}CP01-008EN.png`;
    case "Marvelous Sunday":
      return `${TEXTURES_BASE}CP01-009EN.png`;
    case "Yukino Bijin":
      return `${TEXTURES_BASE}CP01-010EN.png`;
    case "Ines Fujin":
      return `${TEXTURES_BASE}CP01-011EN.png`;
    case "Taiki Shuttle":
      return `${TEXTURES_BASE}CP01-012EN.png`;
    case "Haru Urara":
      return `${TEXTURES_BASE}CP01-013EN.png`;
    case "Tokai Teio":
      return `${TEXTURES_BASE}CP01-SP04EN.png`;
    case "Tokai Teio Evolved":
      return `${TEXTURES_BASE}CP01-SP05EN.png`;
    case "Narita Brian":
      return `${TEXTURES_BASE}CP01-SP06EN.png`;
    case "Winning Ticket":
      return `${TEXTURES_BASE}CP01-017EN.png`;
    case "Outrunning the Encroaching Heat":
      return `${TEXTURES_BASE}CP01-018EN.png`;
    case "Air Groove":
      return `${TEXTURES_BASE}CP01-019EN.png`;
    case "Hishi Amazon":
      return `${TEXTURES_BASE}CP01-020EN.png`;
    case "Trial Initiation":
      return `${TEXTURES_BASE}CP01-021EN.png`;
    case "Sirius Symboli":
      return `${TEXTURES_BASE}CP01-022EN.png`;
    case "Narita Taishin":
      return `${TEXTURES_BASE}CP01-023EN.png`;
    case "Symboli Rudolf":
      return `${TEXTURES_BASE}CP01-024EN.png`;
    case "Biko Pegasus":
      return `${TEXTURES_BASE}CP01-025EN.png`;
    case "Fuji Kiseki":
      return `${TEXTURES_BASE}CP01-026EN.png`;
    case "Agnes Tachyon":
      return `${TEXTURES_BASE}CP01-SP07EN.png`;
    case "Agnes Tachyon Evolved":
      return `${TEXTURES_BASE}CP01-SP08EN.png`;
    case "Daiwa Scarlet":
      return `${TEXTURES_BASE}CP01-SP09EN.png`;
    case "Vodka":
      return `${TEXTURES_BASE}CP01-030EN.png`;
    case "Make! Some! NOISE!":
      return `${TEXTURES_BASE}CP01-031EN.png`;
    case "Zenno Rob Roy":
      return `${TEXTURES_BASE}CP01-032EN.png`;
    case "Agens Digital":
      return `${TEXTURES_BASE}CP01-033EN.png`;
    case "Lamplit Training of a Witch-to-Be":
      return `${TEXTURES_BASE}CP01-034EN.png`;
    case "Admire Vega":
      return `${TEXTURES_BASE}CP01-035EN.png`;
    case "Kawakami Princess":
      return `${TEXTURES_BASE}CP01-036EN.png`;
    case "Nakayama Festa":
      return `${TEXTURES_BASE}CP01-037EN.png`;
    case "Tosen Jordan":
      return `${TEXTURES_BASE}CP01-038EN.png`;
    case "Narita Top Road":
      return `${TEXTURES_BASE}CP01-039EN.png`;
    case "Special Week":
      return `${TEXTURES_BASE}CP01-SP10EN.png`;
    case "Special Week Evolved":
      return `${TEXTURES_BASE}CP01-SP11EN.png`;
    case "Oguri Cap":
      return `${TEXTURES_BASE}CP01-SP12EN.png`;
    case "Seiun Sky":
      return `${TEXTURES_BASE}CP01-043EN.png`;
    case "Champion's Passion":
      return `${TEXTURES_BASE}CP01-044EN.png`;
    case "King Halo":
      return `${TEXTURES_BASE}CP01-045EN.png`;
    case "Tamamo Cross":
      return `${TEXTURES_BASE}CP01-046EN.png`;
    case "Flowers for You":
      return `${TEXTURES_BASE}CP01-047EN.png`;
    case "Bamboo Memory":
      return `${TEXTURES_BASE}CP01-048EN.png`;
    case "Yaeno Muteki":
      return `${TEXTURES_BASE}CP01-049EN.png`;
    case "Grass Wonder":
      return `${TEXTURES_BASE}CP01-050EN.png`;
    case "Super Creek":
      return `${TEXTURES_BASE}CP01-051EN.png`;
    case "Hishi Akebono":
      return `${TEXTURES_BASE}CP01-052EN.png`;
    case "Maruzensky":
      return `${TEXTURES_BASE}CP01-SP13EN.png`;
    case "Maruzensky Evolved":
      return `${TEXTURES_BASE}CP01-SP14EN.png`;
    case "Rice Shower":
      return `${TEXTURES_BASE}CP01-SP15EN.png`;
    case "Nice Nature":
      return `${TEXTURES_BASE}CP01-056EN.png`;

    case "7 More Centimeters":
      return `${TEXTURES_BASE}CP01-057EN.png`;
    case "Fine Motion":
      return `${TEXTURES_BASE}CP01-058EN.png`;
    case "Mayano Top Gun":
      return `${TEXTURES_BASE}CP01-059EN.png`;
    case "My Solo Drawn to Raindrop Drums":
      return `${TEXTURES_BASE}CP01-060EN.png`;
    case "Curren Chan":
      return `${TEXTURES_BASE}CP01-061EN.png`;
    case "Twin Turbo":
      return `${TEXTURES_BASE}CP01-062EN.png`;
    case "Sakura Chiyono O":
      return `${TEXTURES_BASE}CP01-063EN.png`;
    case "Seeking the Pearl":
      return `${TEXTURES_BASE}CP01-064EN.png`;
    case "Matikanetannhauser":
      return `${TEXTURES_BASE}CP01-065EN.png`;
    case "Mejiro McQueen":
      return `${TEXTURES_BASE}CP01-SP16EN.png`;
    case "Mejiro McQueen Evolved":
      return `${TEXTURES_BASE}CP01-SP17EN.png`;
    case "Gold Ship":
      return `${TEXTURES_BASE}CP01-SP18EN.png`;
    case "Ikuno Dictus":
      return `${TEXTURES_BASE}CP01-069EN.png`;
    case "The Will to Overtake":
      return `${TEXTURES_BASE}CP01-070EN.png`;
    case "Meisho Doto":
      return `${TEXTURES_BASE}CP01-071EN.png`;
    case "Mejiro Ryan":
      return `${TEXTURES_BASE}CP01-072EN.png`;
    case "Fate's Forecast":
      return `${TEXTURES_BASE}CP01-073EN.png`;
    case "Inari One":
      return `${TEXTURES_BASE}CP01-074EN.png`;
    case "Mejiro Dober":
      return `${TEXTURES_BASE}CP01-075EN.png`;
    case "Mejiro Ardan":
      return `${TEXTURES_BASE}CP01-076EN.png`;
    case "Mejiro Palmer":
      return `${TEXTURES_BASE}CP01-077EN.png`;
    case "T.M Opera O":
      return `${TEXTURES_BASE}CP01-078EN.png`;
    case "Riko Kashimoto [Planned Perfection]":
      return `${TEXTURES_BASE}CP01-SP19EN.png`;
    case "Close Knit Ambitions":
      return `${TEXTURES_BASE}CP01-080EN.png`;
    case "Take a Jab!":
      return `${TEXTURES_BASE}CP01-081EN.png`;
    case "Aoi Kiryuin [Trainers' Teamwork]":
      return `${TEXTURES_BASE}CP01-082EN.png`;
    case "Sasami Anshinzawa":
      return `${TEXTURES_BASE}CP01-083EN.png`;
    case "Tazuna Hayakawa":
      return `${TEXTURES_BASE}CP01-084EN.png`;
    case "Carrot":
      return `${TEXTURES_BASE}CP01-085EN.png`;

    case "Crystalia Tia":
      return `${TEXTURES_BASE}BP02-001EN.png`;
    case "Crystalia Tia Evolved":
      return `${TEXTURES_BASE}BP02-002EN.png`;
    case "White Wolf of Eldwood":
      return `${TEXTURES_BASE}BP02-003EN.png`;
    case "Elf Girl Liza":
      return `${TEXTURES_BASE}BP02-004EN.png`;
    case "Elf Knight Cynthia":
      return `${TEXTURES_BASE}BP02-005EN.png`;
    case "Grand Archer Seiwyn":
      return `${TEXTURES_BASE}BP02-006EN.png`;
    case "Grand Archer Seiwyn Evolved":
      return `${TEXTURES_BASE}BP02-007EN.png`;
    case "Crystalia Lily":
      return `${TEXTURES_BASE}BP02-008EN.png`;
    case "Crystalia Lily Evolved":
      return `${TEXTURES_BASE}BP02-009EN.png`;
    case "Baalt King of the Elves":
      return `${TEXTURES_BASE}BP02-010EN.png`;
    case "Elven Archery":
      return `${TEXTURES_BASE}BP02-011EN.png`;
    case "Dwarf Perfumer":
      return `${TEXTURES_BASE}BP02-012EN.png`;
    case "Elf Healer":
      return `${TEXTURES_BASE}BP02-013EN.png`;
    case "Forest Gigas":
      return `${TEXTURES_BASE}BP02-014EN.png`;
    case "Forest Gigas Evolved":
      return `${TEXTURES_BASE}BP02-015EN.png`;
    case "Elf Bard":
      return `${TEXTURES_BASE}BP02-016EN.png`;
    case "Rose Deer":
      return `${TEXTURES_BASE}BP02-017EN.png`;
    case "Albert Levin Saber":
      return `${TEXTURES_BASE}BP02-018EN.png`;
    case "Albert Levin Saber Evolved":
      return `${TEXTURES_BASE}BP02-019EN.png`;
    case "Alexander":
      return `${TEXTURES_BASE}BP02-020EN.png`;
    case "Amelia, Silver Paladin":
      return `${TEXTURES_BASE}BP02-021EN.png`;
    case "Leonidas":
      return `${TEXTURES_BASE}BP02-022EN.png`;
    case "Leonidas Evolved":
      return `${TEXTURES_BASE}BP02-023EN.png`;
    case "White Paladin":
      return `${TEXTURES_BASE}BP02-024EN.png`;
    case "Jeno, Levin Vanguard":
      return `${TEXTURES_BASE}BP02-025EN.png`;
    case "Jeno, Levin Vanguard Evolved":
      return `${TEXTURES_BASE}BP02-026EN.png`;
    case "Yurius, Levin Duke":
      return `${TEXTURES_BASE}BP02-027EN.png`;
    case "Whole-Souled Swing":
      return `${TEXTURES_BASE}BP02-028EN.png`;
    case "Swift Infiltrator":
      return `${TEXTURES_BASE}BP02-029EN.png`;
    case "Samurai":
      return `${TEXTURES_BASE}BP02-030EN.png`;
    case "Avant Blader":
      return `${TEXTURES_BASE}BP02-031EN.png`;
    case "Avant Blader Evolved":
      return `${TEXTURES_BASE}BP02-032EN.png`;
    case "Flame Soldier":
      return `${TEXTURES_BASE}BP02-033EN.png`;
    case "Gunner Maid Seria":
      return `${TEXTURES_BASE}BP02-034EN.png`;
    case "Daria Dimensional Witch":
      return `${TEXTURES_BASE}BP02-035EN.png`;
    case "Daria Dimensional Witch Evolved":
      return `${TEXTURES_BASE}BP02-036EN.png`;
    case "Sun Oracle Pascale":
      return `${TEXTURES_BASE}BP02-037EN.png`;
    case "Anne, Belle of Mysteria":
      return `${TEXTURES_BASE}BP02-038EN.png`;
    case "Anne, Belle of Mysteria Evolved":
      return `${TEXTURES_BASE}BP02-039EN.png`;
    case "Grea the Dragonborn":
      return `${TEXTURES_BASE}BP02-040EN.png`;
    case "Rimewind":
      return `${TEXTURES_BASE}BP02-041EN.png`;
    case "Remi & Rami, Witchy Duo":
      return `${TEXTURES_BASE}BP02-042EN.png`;
    case "Remi & Rami, Witchy Duo Evolved":
      return `${TEXTURES_BASE}BP02-043EN.png`;
    case "Shadow Witch":
      return `${TEXTURES_BASE}BP02-044EN.png`;
    case "Multipart Expirement":
      return `${TEXTURES_BASE}BP02-045EN.png`;
    case "Craig, Wizard of Mysteria":
      return `${TEXTURES_BASE}BP02-046EN.png`;
    case "Craig, Wizard of Mysteria Evolved":
      return `${TEXTURES_BASE}BP02-047EN.png`;
    case "Grand Gargoyle":
      return `${TEXTURES_BASE}BP02-048EN.png`;
    case "Witchbolt":
      return `${TEXTURES_BASE}BP02-049EN.png`;
    case "Magical Strategy":
      return `${TEXTURES_BASE}BP02-050EN.png`;
    case "Red-Hot Ritual":
      return `${TEXTURES_BASE}BP02-051EN.png`;
    case "Imperial Dragoon":
      return `${TEXTURES_BASE}BP02-052EN.png`;
    case "Imperial Dragoon Evolved":
      return `${TEXTURES_BASE}BP02-053EN.png`;
    case "Dragonsong Flute":
      return `${TEXTURES_BASE}BP02-054EN.png`;
    case "Neptune":
      return `${TEXTURES_BASE}BP02-055EN.png`;
    case "Neptune Evolved":
      return `${TEXTURES_BASE}BP02-056EN.png`;
    case "Draconic Fervor":
      return `${TEXTURES_BASE}BP02-057EN.png`;
    case "Polyphonic Roar":
      return `${TEXTURES_BASE}BP02-058EN.png`;
    case "Siegfried":
      return `${TEXTURES_BASE}BP02-059EN.png`;
    case "Siegfried Evolved":
      return `${TEXTURES_BASE}BP02-060EN.png`;
    case "Transmogrified Wyrm":
      return `${TEXTURES_BASE}BP02-061EN.png`;
    case "Dracomancer's Rites":
      return `${TEXTURES_BASE}BP02-062EN.png`;
    case "Wildfang Dragonewt":
      return `${TEXTURES_BASE}BP02-063EN.png`;
    case "Mushussu":
      return `${TEXTURES_BASE}BP02-064EN.png`;
    case "Dragontamer":
      return `${TEXTURES_BASE}BP02-065EN.png`;
    case "Dragontamer Evolved":
      return `${TEXTURES_BASE}BP02-066EN.png`;
    case "Twin-Headed Dragon":
      return `${TEXTURES_BASE}BP02-067EN.png`;
    case "Draconic Armor":
      return `${TEXTURES_BASE}BP02-068EN.png`;
    case "Vania, Vampire Princess":
      return `${TEXTURES_BASE}BP02-069EN.png`;
    case "Soul Dealer":
      return `${TEXTURES_BASE}BP02-070EN.png`;
    case "Soul Dealer Evolved":
      return `${TEXTURES_BASE}BP02-071EN.png`;
    case "Underworld Watchman Khawy":
      return `${TEXTURES_BASE}BP02-072EN.png`;
    case "Azazel":
      return `${TEXTURES_BASE}BP02-073EN.png`;
    case "Azazel Evolved":
      return `${TEXTURES_BASE}BP02-074EN.png`;
    case "Vampiric Fortress":
      return `${TEXTURES_BASE}BP02-075EN.png`;
    case "Veight, Vampire Noble":
      return `${TEXTURES_BASE}BP02-076EN.png`;
    case "Veight, Vampire Noble Evolved":
      return `${TEXTURES_BASE}BP02-077EN.png`;
    case "Trick Dullahan":
      return `${TEXTURES_BASE}BP02-078EN.png`;
    case "Precious Bloodfangs":
      return `${TEXTURES_BASE}BP02-079EN.png`;

    case "Mini Soul Devil":
      return `${TEXTURES_BASE}BP02-080EN.png`;
    case "Moriana the Bejeweled":
      return `${TEXTURES_BASE}BP02-081EN.png`;
    case "Demonic Hedonist":
      return `${TEXTURES_BASE}BP02-082EN.png`;
    case "Demonic Hedonist Evolved":
      return `${TEXTURES_BASE}BP02-083EN.png`;
    case "Bone Chimera":
      return `${TEXTURES_BASE}BP02-084EN.png`;
    case "Necrocarnival":
      return `${TEXTURES_BASE}BP02-085EN.png`;
    case "Heavenly Aegis":
      return `${TEXTURES_BASE}BP02-086EN.png`;
    case "Heavenly Aegis Evolved":
      return `${TEXTURES_BASE}BP02-087EN.png`;
    case "Enstatued Seraph":
      return `${TEXTURES_BASE}BP02-088EN.png`;
    case "Kaguya":
      return `${TEXTURES_BASE}BP02-089EN.png`;
    case "Kaguya Evolved":
      return `${TEXTURES_BASE}BP02-090EN.png`;
    case "Tribunal of Good and Evil":
      return `${TEXTURES_BASE}BP02-091EN.png`;
    case "Elana's Prayer":
      return `${TEXTURES_BASE}BP02-092EN.png`;
    case "Radiance Angel":
      return `${TEXTURES_BASE}BP02-093EN.png`;
    case "Radiance Angel Evolved":
      return `${TEXTURES_BASE}BP02-094EN.png`;
    case "Saphire Priestess":
      return `${TEXTURES_BASE}BP02-095EN.png`;
    case "Beastcall Aria":
      return `${TEXTURES_BASE}BP02-096EN.png`;
    case "Frog Cleric":
      return `${TEXTURES_BASE}BP02-097EN.png`;
    case "Sky Sprite":
      return `${TEXTURES_BASE}BP02-098EN.png`;
    case "Soul Collector":
      return `${TEXTURES_BASE}BP02-099EN.png`;
    case "Soul Collector Evolved":
      return `${TEXTURES_BASE}BP02-100EN.png`;
    case "Sledgehammer Exorcist":
      return `${TEXTURES_BASE}BP02-101EN.png`;
    case "Emerald Maiden":
      return `${TEXTURES_BASE}BP02-102EN.png`;
    case "Dark Angel Olivia":
      return `${TEXTURES_BASE}BP02-103EN.png`;
    case "Bahamut":
      return `${TEXTURES_BASE}BP02-104EN.png`;
    case "Bahamut Evolved":
      return `${TEXTURES_BASE}BP02-105EN.png`;
    case "Demonic Simulacrum":
      return `${TEXTURES_BASE}BP02-106EN.png`;
    case "Archangel Reina":
      return `${TEXTURES_BASE}BP02-107EN.png`;
    case "Archangel Reina Evolved":
      return `${TEXTURES_BASE}BP02-108EN.png`;
    case "Surefire Bullet":
      return `${TEXTURES_BASE}BP02-109EN.png`;
    case "Unicorn Dancer Unicorn":
      return `${TEXTURES_BASE}BP02-110EN.png`;
    case "Unicorn Dancer Unicorn Evolved":
      return `${TEXTURES_BASE}BP02-111EN.png`;
    case "Gourmet Emperor Khaiza":
      return `${TEXTURES_BASE}BP02-112EN.png`;
    case "Call of Cocytus":
      return `${TEXTURES_BASE}BP02-113EN.png`;
    case "Hamsa":
      return `${TEXTURES_BASE}BP02-114EN.png`;
    case "Sektor":
      return `${TEXTURES_BASE}BP02-115EN.png`;
    case "Sektor Evolved":
      return `${TEXTURES_BASE}BP02-116EN.png`;
    case "Dance of Death":
      return `${TEXTURES_BASE}BP02-117EN.png`;

    case "Skullfane":
      return `${TEXTURES_BASE}SD06-001EN.png`;
    case "Hare of Illusions":
      return `${TEXTURES_BASE}SD06-002EN.png`;
    case "Priest of the Cudgel":
      return `${TEXTURES_BASE}SD06-003EN.png`;
    case "Priest of the Cudgel Evolved":
      return `${TEXTURES_BASE}SD06-004EN.png`;
    case "Acolyte's Light":
      return `${TEXTURES_BASE}SD06-005EN.png`;
    case "Dual Flames":
      return `${TEXTURES_BASE}SD06-006EN.png`;
    case "Ardent Nun":
      return `${TEXTURES_BASE}SD06-009EN.png`;
    case "Ardent Nun Evolved":
      return `${TEXTURES_BASE}SD06-010EN.png`;
    case "Guardian Nun":
      return `${TEXTURES_BASE}SD06-011EN.png`;
    case "Guardian Nun Evolved":
      return `${TEXTURES_BASE}SD06-012EN.png`;
    case "Pinion Prayer":
      return `${TEXTURES_BASE}SD06-015EN.png`;
    case "Beastly Vow":
      return `${TEXTURES_BASE}SD06-016EN.png`;
    case "Queen Vampire":
      return `${TEXTURES_BASE}SD05-001EN.png`;
    case "Alucard":
      return `${TEXTURES_BASE}SD05-002EN.png`;
    case "Playful Necromancer":
      return `${TEXTURES_BASE}SD05-003EN.png`;
    case "Playful Necromancer Evolved":
      return `${TEXTURES_BASE}SD05-004EN.png`;
    case "Midnight Vampire":
      return `${TEXTURES_BASE}SD05-005EN.png`;
    case "Night Horde":
      return `${TEXTURES_BASE}SD05-006EN.png`;
    case "Lesser Mummy":
      return `${TEXTURES_BASE}SD05-010EN.png`;
    case "Lesser Mummy Evolved":
      return `${TEXTURES_BASE}SD05-011EN.png`;
    case "Lilith":
      return `${TEXTURES_BASE}SD05-012EN.png`;
    case "Lilith Evolved":
      return `${TEXTURES_BASE}SD05-013EN.png`;
    case "Undying Resentment":
      return `${TEXTURES_BASE}SD05-015EN.png`;
    case "Summon Bloodkin":
      return `${TEXTURES_BASE}SD05-016EN.png`;
    case "Fafnir":
      return `${TEXTURES_BASE}SD04-001EN.png`;
    case "Dragon Oracle":
      return `${TEXTURES_BASE}PR-235EN.png`;
    case "Dragon Warrior":
      return `${TEXTURES_BASE}SD04-003EN.png`;
    case "Dragon Warrior Evolved":
      return `${TEXTURES_BASE}SD04-004EN.png`;
    case "Dragonewt Princess":
      return `${TEXTURES_BASE}SD04-005EN.png`;
    case "Dragonguard":
      return `${TEXTURES_BASE}SD04-006EN.png`;
    case "Roc":
      return `${TEXTURES_BASE}SD04-009EN.png`;
    case "Roc Evolved":
      return `${TEXTURES_BASE}SD04-010EN.png`;
    case "Glint Dragon":
      return `${TEXTURES_BASE}SD04-011EN.png`;
    case "Dragonrider":
      return `${TEXTURES_BASE}SD04-012EN.png`;
    case "Dragonrider Evolved":
      return `${TEXTURES_BASE}SD04-013EN.png`;
    case "Seabrand Dragon":
      return `${TEXTURES_BASE}SD04-014EN.png`;
    case "Mythril Golem":
      return `${TEXTURES_BASE}SD03-001EN.png`;
    case "Rune Blade Summoner":
      return `${TEXTURES_BASE}SD03-002EN.png`;
    case "Demonflame Mage":
      return `${TEXTURES_BASE}SD03-003EN.png`;
    case "Demonflame Mage Evolved":
      return `${TEXTURES_BASE}SD03-004EN.png`;
    case "Insight":
      return `${TEXTURES_BASE}SD03-005EN.png`;
    case "Fire Chain":
      return `${TEXTURES_BASE}SD03-006EN.png`;
    case "Penguin Wizard":
      return `${TEXTURES_BASE}SD03-008EN.png`;
    case "Penguin Wizard Evolved":
      return `${TEXTURES_BASE}SD03-009EN.png`;
    case "Sammy Wizard's Apprentice":
      return `${TEXTURES_BASE}SD03-010EN.png`;
    case "Sammy Wizard's Apprentice Evolved":
      return `${TEXTURES_BASE}SD03-011EN.png`;
    case "Magic Missle":
      return `${TEXTURES_BASE}SD03-015EN.png`;
    case "Conjure Golem":
      return `${TEXTURES_BASE}SD03-016EN.png`;
    case "Tsubasa":
      return `${TEXTURES_BASE}SD02-001EN.png`;
    case "Latham, Vanguard Captain":
      return `${TEXTURES_BASE}SD02-002EN.png`;
    case "Floral Fencer":
      return `${TEXTURES_BASE}SD02-003EN.png`;
    case "Floral Fencer Evolved":
      return `${TEXTURES_BASE}SD02-004EN.png`;
    case "Moonlight Assassin":
      return `${TEXTURES_BASE}SD02-005EN.png`;
    case "White General":
      return `${TEXTURES_BASE}SD02-006EN.png`;
    case "Fencer":
      return `${TEXTURES_BASE}SD02-009EN.png`;
    case "Oathless Knight":
      return `${TEXTURES_BASE}SD02-010EN.png`;
    case "Oathless Knight Evolved":
      return `${TEXTURES_BASE}SD02-011EN.png`;
    case "Quickblader":
      return `${TEXTURES_BASE}SD02-012EN.png`;
    case "Quickblader Evolved":
      return `${TEXTURES_BASE}SD02-013EN.png`;
    case "Unbridled Fury":
      return `${TEXTURES_BASE}SD02-016EN.png`;
    case "Aria, Fairy Princess":
      return `${TEXTURES_BASE}SD01-001EN.png`;
    case "Titania's Sanctuary":
      return `${TEXTURES_BASE}SD01-002EN.png`;
    case "Rose Gardener":
      return `${TEXTURES_BASE}SD01-003EN.png`;
    case "Rose Gardener Evolved":
      return `${TEXTURES_BASE}SD01-004EN.png`;
    case "Waltzing Fairy":
      return `${TEXTURES_BASE}SD01-005EN.png`;
    case "Fairy Caster":
      return `${TEXTURES_BASE}SD01-006EN.png`;
    case "Treant":
      return `${TEXTURES_BASE}SD01-009EN.png`;
    case "Treant Evolved":
      return `${TEXTURES_BASE}SD01-010EN.png`;
    case "Water Fairy":
      return `${TEXTURES_BASE}SD01-011EN.png`;
    case "Water Fairy Evolved":
      return `${TEXTURES_BASE}SD01-012EN.png`;
    case "Elf Wanderer":
      return `${TEXTURES_BASE}SD01-013EN.png`;
    case "Sylvan Justice":
      return `${TEXTURES_BASE}SD01-016EN.png`;

    case "Rose Queen":
      return `${TEXTURES_BASE}BP01-001EN.png`;
    case "Ancient Elf":
      return `${TEXTURES_BASE}BP01-002EN.png`;
    case "Ancient Elf Evolved":
      return `${TEXTURES_BASE}BP01-003EN.png`;
    case "Rhinoceroach":
      return `${TEXTURES_BASE}BP01-004EN.png`;
    case "Rhinoceroach Evolved":
      return `${TEXTURES_BASE}BP01-005EN.png`;
    case "Robin Hood":
      return `${TEXTURES_BASE}BP01-006EN.png`;
    case "Silver Bolt":
      return `${TEXTURES_BASE}BP01-007EN.png`;
    case "Homecoming":
      return `${TEXTURES_BASE}BP01-008EN.png`;
    case "Elven Princess Mage":
      return `${TEXTURES_BASE}BP01-009EN.png`;
    case "Elven Princess Mage Evolved":
      return `${TEXTURES_BASE}BP01-010EN.png`;
    case "Blessed Fairy Dancer":
      return `${TEXTURES_BASE}BP01-011EN.png`;
    case "Elf Child May":
      return `${TEXTURES_BASE}BP01-012EN.png`;
    case "Fairy Beast":
      return `${TEXTURES_BASE}BP01-013EN.png`;
    case "Noble Fairy":
      return `${TEXTURES_BASE}BP01-014EN.png`;
    case "Nature's Guidance":
      return `${TEXTURES_BASE}BP01-015EN.png`;
    case "Harvest Festival":
      return `${TEXTURES_BASE}BP01-016EN.png`;
    case "Elf Metallurgist":
      return `${TEXTURES_BASE}BP01-017EN.png`;
    case "Archer":
      return `${TEXTURES_BASE}BP01-018EN.png`;
    case "Archer Evolved":
      return `${TEXTURES_BASE}BP01-019EN.png`;
    case "Fairy Whisperer":
      return `${TEXTURES_BASE}BP01-020EN.png`;
    case "Okami":
      return `${TEXTURES_BASE}BP01-021EN.png`;
    case "Mana Elk":
      return `${TEXTURES_BASE}BP01-022EN.png`;
    case "Fairy Circle":
      return `${TEXTURES_BASE}BP01-023EN.png`;
    case "Woodkin Curse":
      return `${TEXTURES_BASE}BP01-024EN.png`;
    case "Woodland Refuge":
      return `${TEXTURES_BASE}BP01-025EN.png`;
    case "Sea Queen Otohime":
      return `${TEXTURES_BASE}BP01-026EN.png`;
    case "Sea Queen Otohime Evolved":
      return `${TEXTURES_BASE}BP01-027EN.png`;
    case "Aurelia, Regal Saber":
      return `${TEXTURES_BASE}BP01-028EN.png`;
    case "Shadowed Assassin":
      return `${TEXTURES_BASE}BP01-029EN.png`;
    case "Shadowed Assassin Evolved":
      return `${TEXTURES_BASE}BP01-030EN.png`;
    case "Frontguard General":
      return `${TEXTURES_BASE}BP01-031EN.png`;
    case "Alwida's Command":
      return `${TEXTURES_BASE}BP01-032EN.png`;
    case "Royal Banner":
      return `${TEXTURES_BASE}BP01-033EN.png`;
    case "Maid Leader":
      return `${TEXTURES_BASE}BP01-034EN.png`;
    case "Maid Leader Evolved":
      return `${TEXTURES_BASE}BP01-035EN.png`;
    case "Gemstaff Commander":
      return `${TEXTURES_BASE}BP01-036EN.png`;
    case "Sage Commander":
      return `${TEXTURES_BASE}BP01-037EN.png`;
    case "Swordsman":
      return `${TEXTURES_BASE}BP01-038EN.png`;
    case "Pompous Princess":
      return `${TEXTURES_BASE}BP01-039EN.png`;
    case "Ninja Master":
      return `${TEXTURES_BASE}BP01-040EN.png`;
    case "Arthurian Light":
      return `${TEXTURES_BASE}BP01-041EN.png`;
    case "Ninja Trainee":
      return `${TEXTURES_BASE}BP01-042EN.png`;
    case "Fervid Soldier":
      return `${TEXTURES_BASE}BP01-043EN.png`;
    case "Fervid Soldier Evolved":
      return `${TEXTURES_BASE}BP01-044EN.png`;
    case "Luminous Knight":
      return `${TEXTURES_BASE}BP01-045EN.png`;
    case "Veteran Lancer":
      return `${TEXTURES_BASE}BP01-046EN.png`;
    case "Navy Lieutenant":
      return `${TEXTURES_BASE}BP01-047EN.png`;
    case "Novice Trooper":
      return `${TEXTURES_BASE}BP01-048EN.png`;
    case "Forge Weaponry":
      return `${TEXTURES_BASE}BP01-049EN.png`;
    case "Onslaught":
      return `${TEXTURES_BASE}BP01-050EN.png`;
    case "Arch Summoner Erasmus":
      return `${TEXTURES_BASE}BP01-051EN.png`;
    case "Merlin":
      return `${TEXTURES_BASE}BP01-052EN.png`;
    case "Merlin Evolved":
      return `${TEXTURES_BASE}BP01-053EN.png`;
    case "Ancient Alchemist":
      return `${TEXTURES_BASE}BP01-054EN.png`;
    case "Ancient Alchemist Evolved":
      return `${TEXTURES_BASE}BP01-055EN.png`;
    case "Arcane Enlightenment":
      return `${TEXTURES_BASE}BP01-056EN.png`;
    case "Dimension Shift":
      return `${TEXTURES_BASE}BP01-057EN.png`;
    case "Juno's Secret Laboratory":
      return `${TEXTURES_BASE}BP01-058EN.png`;
    case "Spectral Wizard":
      return `${TEXTURES_BASE}BP01-059EN.png`;
    case "Spectral Wizard Evolved":
      return `${TEXTURES_BASE}BP01-060EN.png`;
    case "Flame Destroyer":
      return `${TEXTURES_BASE}BP01-061EN.png`;
    case "Dragonbond Mage":
      return `${TEXTURES_BASE}BP01-062EN.png`;
    case "Golem Protection":
      return `${TEXTURES_BASE}BP01-063EN.png`;
    case "Alchemical Lore":
      return `${TEXTURES_BASE}BP01-064EN.png`;
    case "Fate's Hand":
      return `${TEXTURES_BASE}BP01-065EN.png`;
    case "Price of Magic":
      return `${TEXTURES_BASE}BP01-066EN.png`;
    case "Runic Guardian":
      return `${TEXTURES_BASE}BP01-067EN.png`;
    case "Crafty Warlock":
      return `${TEXTURES_BASE}BP01-068EN.png`;
    case "Crafty Warlock Evolved":
      return `${TEXTURES_BASE}BP01-069EN.png`;
    case "Lightning Shooter":
      return `${TEXTURES_BASE}BP01-070EN.png`;
    case "Wind Blast":
      return `${TEXTURES_BASE}BP01-071EN.png`;
    case "Sorcery Cache":
      return `${TEXTURES_BASE}BP01-072EN.png`;
    case "Fiery Embrace":
      return `${TEXTURES_BASE}BP01-073EN.png`;
    case "Alchemist's Workshop":
      return `${TEXTURES_BASE}BP01-074EN.png`;

    case "Teachings of Creation":
      return `${TEXTURES_BASE}BP01-075EN.png`;
    case "Dark Dragoon Forte":
      return `${TEXTURES_BASE}BP01-076EN.png`;
    case "Dark Dragoon Forte Evolved":
      return `${TEXTURES_BASE}BP01-077EN.png`;
    case "Aiela, Dragon Knight":
      return `${TEXTURES_BASE}BP01-079EN.png`;
    case "Zirnitra":
      return `${TEXTURES_BASE}BP01-078EN.png`;
    case "Genesis Dragon":
      return `${TEXTURES_BASE}BP01-080EN.png`;
    case "Shapeshifting Mage":
      return `${TEXTURES_BASE}BP01-081EN.png`;
    case "Shapeshifting Mage Evolved":
      return `${TEXTURES_BASE}BP01-082EN.png`;
    case "Phoenix Roost":
      return `${TEXTURES_BASE}BP01-083EN.png`;
    case "Wyvern Cavalier":
      return `${TEXTURES_BASE}BP01-084EN.png`;
    case "Dragonewt Scholar":
      return `${TEXTURES_BASE}BP01-085EN.png`;
    case "Shenlong":
      return `${TEXTURES_BASE}BP01-086EN.png`;
    case "Shenlong Evolved":
      return `${TEXTURES_BASE}BP01-087EN.png`;
    case "Imprisoned Dragon":
      return `${TEXTURES_BASE}BP01-088EN.png`;
    case "Conflagration":
      return `${TEXTURES_BASE}BP01-089EN.png`;
    case "Serpent's Wrath":
      return `${TEXTURES_BASE}BP01-090EN.png`;
    case "Wyrm Spire":
      return `${TEXTURES_BASE}BP01-091EN.png`;
    case "Ivory Dragon":
      return `${TEXTURES_BASE}BP01-092EN.png`;
    case "Ivory Dragon Evolved":
      return `${TEXTURES_BASE}BP01-093EN.png`;
    case "Fire Lizard":
      return `${TEXTURES_BASE}BP01-094EN.png`;
    case "Ace Dragoon":
      return `${TEXTURES_BASE}BP01-095EN.png`;
    case "Mist Dragon":
      return `${TEXTURES_BASE}BP01-096EN.png`;
    case "Dread Dragon":
      return `${TEXTURES_BASE}BP01-097EN.png`;
    case "Blazing Breath":
      return `${TEXTURES_BASE}BP01-098EN.png`;
    case "Dragon Wings":
      return `${TEXTURES_BASE}BP01-099EN.png`;
    case "Dragon Emissary":
      return `${TEXTURES_BASE}BP01-100EN.png`;
    case "Cerberus":
      return `${TEXTURES_BASE}BP01-101EN.png`;
    case "Cerberus Evolved":
      return `${TEXTURES_BASE}BP01-102EN.png`;
    case "Lord Atomy":
      return `${TEXTURES_BASE}BP01-103EN.png`;
    case "Medusa":
      return `${TEXTURES_BASE}BP01-104EN.png`;
    case "Righteous Devil":
      return `${TEXTURES_BASE}BP01-105EN.png`;
    case "Righteous Devil Evolved":
      return `${TEXTURES_BASE}BP01-106EN.png`;
    case "Mordecai the Duelist":
      return `${TEXTURES_BASE}BP01-107EN.png`;
    case "Dire Bond":
      return `${TEXTURES_BASE}BP01-108EN.png`;
    case "Hell's Unleasher":
      return `${TEXTURES_BASE}BP01-109EN.png`;
    case "Crazed Executioner":
      return `${TEXTURES_BASE}BP01-110EN.png`;
    case "Crazed Executioner Evolved":
      return `${TEXTURES_BASE}BP01-111EN.png`;
    case "Dark Summoner":
      return `${TEXTURES_BASE}BP01-112EN.png`;
    case "Dark General":
      return `${TEXTURES_BASE}BP01-113EN.png`;
    case "Phantom Howl":
      return `${TEXTURES_BASE}BP01-114EN.png`;
    case "Death's Breath":
      return `${TEXTURES_BASE}BP01-115EN.png`;
    case "Soul Conversion":
      return `${TEXTURES_BASE}BP01-116EN.png`;
    case "Skeleton Fighter":
      return `${TEXTURES_BASE}BP01-117EN.png`;
    case "Ambling Wraith":
      return `${TEXTURES_BASE}BP01-118EN.png`;
    case "Spectre":
      return `${TEXTURES_BASE}BP01-119EN.png`;
    case "Spartoi Sergeant":
      return `${TEXTURES_BASE}BP01-120EN.png`;
    case "Rabbit Necromancer":
      return `${TEXTURES_BASE}BP01-121EN.png`;
    case "Wardrobe Raider":
      return `${TEXTURES_BASE}BP01-122EN.png`;
    case "Wardrobe Raider Evolved":
      return `${TEXTURES_BASE}BP01-123EN.png`;
    case "Undead King":
      return `${TEXTURES_BASE}BP01-124EN.png`;
    case "Razory Claw":
      return `${TEXTURES_BASE}BP01-125EN.png`;
    case "Moon Al-mi'raj":
      return `${TEXTURES_BASE}BP01-126EN.png`;
    case "Jeanne d'Arc":
      return `${TEXTURES_BASE}BP01-127EN.png`;
    case "Jeanne d'Arc Evolved":
      return `${TEXTURES_BASE}BP01-128EN.png`;
    case "Arch Priestess Laelia":
      return `${TEXTURES_BASE}BP01-129EN.png`;
    case "Arch Priestess Laelia Evolved":
      return `${TEXTURES_BASE}BP01-130EN.png`;
    case "Themis's Decree":
      return `${TEXTURES_BASE}BP01-131EN.png`;
    case "Chorus of Prayer":
      return `${TEXTURES_BASE}BP01-132EN.png`;
    case "Sacred Plea":
      return `${TEXTURES_BASE}BP01-133EN.png`;
    case "Temple Defender":
      return `${TEXTURES_BASE}BP01-134EN.png`;
    case "Prism Priestess":
      return `${TEXTURES_BASE}BP01-135EN.png`;
    case "Prism Priestess Evolved":
      return `${TEXTURES_BASE}BP01-136EN.png`;
    case "Cleric Lancer":
      return `${TEXTURES_BASE}BP01-137EN.png`;
    case "Shrine Knight Maiden":
      return `${TEXTURES_BASE}BP01-138EN.png`;
    case "Blackened Scripture":
      return `${TEXTURES_BASE}BP01-139EN.png`;
    case "Dark Offering":
      return `${TEXTURES_BASE}BP01-140EN.png`;
    case "Holy Sentinel":
      return `${TEXTURES_BASE}BP01-141EN.png`;
    case "Cruel Priestess":
      return `${TEXTURES_BASE}BP01-142EN.png`;
    case "Sister Initiate":
      return `${TEXTURES_BASE}BP01-143EN.png`;
    case "Mainyu":
      return `${TEXTURES_BASE}BP01-144EN.png`;
    case "Mainyu Evolved":
      return `${TEXTURES_BASE}BP01-145EN.png`;
    case "Snake Priestess":
      return `${TEXTURES_BASE}BP01-146EN.png`;
    case "Curate":
      return `${TEXTURES_BASE}BP01-147EN.png`;
    case "Hallowed Dogma":
      return `${TEXTURES_BASE}BP01-148EN.png`;
    case "Guardian Sun":
      return `${TEXTURES_BASE}BP01-149EN.png`;
    case "Death Sentence":
      return `${TEXTURES_BASE}BP01-150EN.png`;
    case "Gabriel":
      return `${TEXTURES_BASE}BP01-151EN.png`;
    case "Lucifer":
      return `${TEXTURES_BASE}BP01-152EN.png`;
    case "Lucifer Evolved":
      return `${TEXTURES_BASE}BP01-153EN.png`;
    case "Flame and Glass":
      return `${TEXTURES_BASE}BP01-154EN.png`;
    case "Urd":
      return `${TEXTURES_BASE}BP01-155EN.png`;
    case "Urd Evolved":
      return `${TEXTURES_BASE}BP01-156EN.png`;
    case "Wind God":
      return `${TEXTURES_BASE}BP01-157EN.png`;
    case "Gilgamesh":
      return `${TEXTURES_BASE}BP01-158EN.png`;
    case "Bellringer Angel":
      return `${TEXTURES_BASE}BP01-159EN.png`;
    case "Bellringer Angel Evolved":
      return `${TEXTURES_BASE}BP01-160EN.png`;
    case "Altered Fate":
      return `${TEXTURES_BASE}BP01-161EN.png`;
    case "Path to Purgatory":
      return `${TEXTURES_BASE}BP01-162EN.png`;
    case "Lizardman":
      return `${TEXTURES_BASE}BP01-163EN.png`;
    case "Goblinmount Demon":
      return `${TEXTURES_BASE}BP01-164EN.png`;
    case "Goblinmount Demon Evolved":
      return `${TEXTURES_BASE}BP01-165EN.png`;
    case "Harnessed Flame":
      return `${TEXTURES_BASE}BP01-166EN.png`;
    case "Harnessed Glass":
      return `${TEXTURES_BASE}BP01-167EN.png`;
    case "Demonic Strike":
      return `${TEXTURES_BASE}BP01-168EN.png`;
    case "Execution":
      return `${TEXTURES_BASE}BP01-169EN.png`;
    case "Trail of Light":
      return `${TEXTURES_BASE}BP01-170EN.png`;
    case "Goblin":
      return `${TEXTURES_BASE}BP01-171EN.png`;
    case "Goblin Evolved":
      return `${TEXTURES_BASE}BP01-172EN.png`;
    case "Fighter":
      return `${TEXTURES_BASE}BP01-173EN.png`;
    case "Goliath":
      return `${TEXTURES_BASE}BP01-174EN.png`;
    case "Goliath Evolved":
      return `${TEXTURES_BASE}BP01-175EN.png`;
    case "Angelic Sword Maiden":
      return `${TEXTURES_BASE}BP01-176EN.png`;
    case "Healing Angel":
      return `${TEXTURES_BASE}BP01-177EN.png`;
    case "Healing Angel Evolved":
      return `${TEXTURES_BASE}BP01-178EN.png`;
    case "Angelic Snipe":
      return `${TEXTURES_BASE}BP01-179EN.png`;
    case "Angelic Barrage":
      return `${TEXTURES_BASE}BP01-180EN.png`;

    case "Guardian Golem TOKEN":
      return `${TEXTURES_BASE}BP16-T01EN.png`;
    case "Looking Smart! TOKEN":
      return `${TEXTURES_BASE}BP16-T02EN.png`;
    case "Fire Drake Whelp TOKEN":
      return `${TEXTURES_BASE}BP16-T03EN.png`;
    case "Mimi, Right Paw Hellhound TOKEN":
      return `${TEXTURES_BASE}BP16-T04EN.png`;
    case "Coco, Left Paw Hellhound TOKEN":
      return `${TEXTURES_BASE}BP16-T05EN.png`;
    case "Silent Rider TOKEN":
      return `${TEXTURES_BASE}BP16-T06EN.png`;
    case "Servant of Cocytus TOKEN":
      return `${TEXTURES_BASE}BP16-T07EN.png`;
    case "Demon of Purgatory TOKEN":
      return `${TEXTURES_BASE}BP16-T08EN.png`;
    case "Astaroth's Reckoning TOKEN":
      return `${TEXTURES_BASE}BP16-T09EN.png`;

    case "Annihilating Onslaught TOKEN":
      return `${TEXTURES_BASE}BP15-PR09EN.png`;
    case "Remnant of Hollowness TOKEN":
      return `${TEXTURES_BASE}BP15-PR10EN.png`;
    case "Gilded Blade TOKEN":
      return `${TEXTURES_BASE}BP15-T01EN.png`;
    case "Gilded Goblet TOKEN":
      return `${TEXTURES_BASE}BP15-T02EN.png`;
    case "Gilded Boots TOKEN":
      return `${TEXTURES_BASE}BP15-T03EN.png`;
    case "Ersatz Elimination TOKEN":
      return `${TEXTURES_BASE}BP15-PR11EN.png`;
    case "Melodious Monody TOKEN":
      return `${TEXTURES_BASE}BP15-PR12EN.png`;
    case "Fangs of Ardent Destruction TOKEN":
      return `${TEXTURES_BASE}BP15-PR13EN.png`;
    case "Wings of Desire TOKEN":
      return `${TEXTURES_BASE}BP15-PR14EN.png`;
    case "Scream Diffusion TOKEN":
      return `${TEXTURES_BASE}BP15-PR15EN.png`;
    case "Rulenye, Screaming Echo TOKEN":
      return `${TEXTURES_BASE}BP15-T04EN.png`;
    case "Torrent of Despair TOKEN":
      return `${TEXTURES_BASE}BP15-PR16EN.png`;
    case "Great Testimony TOKEN":
      return `${TEXTURES_BASE}BP15-PR17EN.png`;
    case "Ravenous Sweetness TOKEN":
      return `${TEXTURES_BASE}BP15-PR18EN.png`;

    case "Sootspawn TOKEN":
      return `${TEXTURES_BASE}BP14-T01EN.png`;
    case "Glittering Gold TOKEN":
      return `${TEXTURES_BASE}BP14-T02EN.png`;
    case "Flame General's Regalia TOKEN":
      return `${TEXTURES_BASE}BP14-T03EN.png`;
    case "Tidal Tyranny TOKEN":
      return `${TEXTURES_BASE}BP14-T04EN.png`;
    case "Wolfling's Struggle TOKEN":
      return `${TEXTURES_BASE}BP14-T05EN.png`;
    case "Fox of Invitation TOKEN":
      return `${TEXTURES_BASE}BP14-T06EN.png`;
    case "Mercurial Might TOKEN":
      return `${TEXTURES_BASE}BP14-T07EN.png`;

    case "Anne's Summoning TOKEN":
      return `${TEXTURES_BASE}BP13-T01EN.png`;
    case "Resentful Blaze TOKEN":
      return `${TEXTURES_BASE}BP13-T02EN.png`;
    case "Blood Arts TOKEN":
      return `${TEXTURES_BASE}BP13-T03EN.png`;
    case "Darkest Desire TOKEN":
      return `${TEXTURES_BASE}BP13-T04EN.png`;
    case "Keenedge Artifact TOKEN":
      return `${TEXTURES_BASE}BP13-T05EN.png`;

    case "Carbuncle's Sparkle TOKEN":
      return `${TEXTURES_BASE}BP12-T01EN.png`;
    case "Twilight Blade TOKEN":
      return `${TEXTURES_BASE}BP12-T02EN.png`;
    case "Armored Tentacle":
    case "Armored Tentacle TOKEN":
      return `${TEXTURES_BASE}BP12-T03EN.png`;
    case "Assault Tentacle":
    case "Assault Tentacle TOKEN":
      return `${TEXTURES_BASE}BP12-T04EN.png`;
    case "Medusiana TOKEN":
      return `${TEXTURES_BASE}BP12-T05EN.png`;

    case "Val, Trusty Getaway Car TOKEN":
      return `${TEXTURES_BASE}BP11-T01EN.png`;
    case "Magitrain TOKEN":
      return `${TEXTURES_BASE}BP11-T02EN.png`;
    case "Dutiful Steed TOKEN":
      return `${TEXTURES_BASE}BP11-T03EN.png`;
    case "Bullet Bike TOKEN":
      return `${TEXTURES_BASE}BP11-T04EN.png`;
    case "Arcane Personnel Carrier TOKEN":
      return `${TEXTURES_BASE}BP11-T05EN.png`;

    case "Exterminus Weapon TOKEN":
      return `${TEXTURES_BASE}BP10-T01EN.png`;
    case "Devoted Dragon TOKEN":
      return `${TEXTURES_BASE}BP10-T02EN.png`;

    case "Instant Poison TOKEN":
      return `${TEXTURES_BASE}BP09-T01EN.png`;
    case "Eternal Potion TOKEN":
      return `${TEXTURES_BASE}BP09-T02EN.png`;
    case "Mysterian Missile TOKEN":
      return `${TEXTURES_BASE}BP09-T03EN.png`;
    case "Aftershock TOKEN":
      return `${TEXTURES_BASE}BP09-T04EN.png`;

    case "Lloyd TOKEN":
      return `${TEXTURES_BASE}BP08-T01EN.png`;
    case "Victoria TOKEN":
      return `${TEXTURES_BASE}BP08-T02EN.png`;
    case "Otohime's Vanguard TOKEN":
      return `${TEXTURES_BASE}BP08-T03EN.png`;

    case "Assembly Droid TOKEN":
      return `${TEXTURES_BASE}BP07-T01EN.png`;
    case "Repair Mode TOKEN":
      return `${TEXTURES_BASE}BP07-T02EN.png`;
    case "Naterran Great Tree TOKEN":
      return `${TEXTURES_BASE}BP07-T03EN.png`;

    case "Enchanted Slippers TOKEN":
      return `${TEXTURES_BASE}PR-153EN.png`;
    case "Enchanted Dress TOKEN":
      return `${TEXTURES_BASE}PR-154EN.png`;
    case "Cute Earrings TOKEN":
      return `${TEXTURES_BASE}CP02-T01EN.png`;
    case "Cool Earrings TOKEN":
      return `${TEXTURES_BASE}CP02-T04EN.png`;
    case "Passion Earrings TOKEN":
      return `${TEXTURES_BASE}CP02-T07EN.png`;
    case "Celestial Shikigami TOKEN":
      return `${TEXTURES_BASE}BP06-T01EN.png`;
    case "Paper Shikigami TOKEN":
      return `${TEXTURES_BASE}BP06-T02EN.png`;
    case "One-Tailed Fox TOKEN":
      return `${TEXTURES_BASE}BP06-T03EN.png`;
    case "Destruction in White TOKEN":
      return `${TEXTURES_BASE}BP05-T01EN.png`;
    case "Destruction in Black TOKEN":
      return `${TEXTURES_BASE}BP05-T02EN.png`;
    case "Puppet TOKEN":
      return `${TEXTURES_BASE}BP05-T03EN.png`;
    case "Ancient Artifact TOKEN":
      return `${TEXTURES_BASE}BP05-T04EN.png`;
    case "Mystic Artifact TOKEN":
      return `${TEXTURES_BASE}BP05-T05EN.png`;
    case "Serpent TOKEN":
      return `${TEXTURES_BASE}BP04-T01EN.png`;
    case "Goblin King TOKEN":
      return `${TEXTURES_BASE}BP04-T02EN.png`;
    case "Gargantuan Ghost TOKEN":
      return `${TEXTURES_BASE}BP03-T01EN.png`;
    case "Crystalia Eve TOKEN":
      return `${TEXTURES_BASE}BP02-T01EN.png`;
    case "Shield Guardian TOKEN":
      return `${TEXTURES_BASE}BP02-T02EN.png`;
    case "Leonidas's Resolve TOKEN":
      return `${TEXTURES_BASE}BP02-T03EN.png`;
    case "Magical Pawn TOKEN":
      return `${TEXTURES_BASE}BP02-T04EN.png`;
    case "Megalorca TOKEN":
      return `${TEXTURES_BASE}BP02-T05EN.png`;
    case "Hellflame Dragon TOKEN":
      return `${TEXTURES_BASE}BP02-T06EN.png`;
    case "Draconic Weapon TOKEN":
      return `${TEXTURES_BASE}BP02-T07EN.png`;
    case "Ephemeral Moon TOKEN":
      return `${TEXTURES_BASE}BP02-T08EN.png`;
    case "Thorn Burst TOKEN":
      return `${TEXTURES_BASE}BP01-T01EN.png`;
    case "Fairy Wisp TOKEN":
      return `${TEXTURES_BASE}BP01-T02EN.png`;
    case "Fairy TOKEN":
      return `${TEXTURES_BASE}BP01-T03EN.png`;
    case "Otohime's Bodyguard TOKEN":
      return `${TEXTURES_BASE}BP01-T04EN.png`;
    case "Knight TOKEN":
      return `${TEXTURES_BASE}BP01-T05EN.png`;
    case "Viking TOKEN":
      return `${TEXTURES_BASE}BP01-T06EN.png`;
    case "Steelclad Knight TOKEN":
      return `${TEXTURES_BASE}BP01-T07EN.png`;
    case "Strikeform Golem TOKEN":
      return `${TEXTURES_BASE}BP01-T08EN.png`;
    case "Guardform Golem TOKEN":
      return `${TEXTURES_BASE}BP01-T09EN.png`;
    case "Magic Sediment TOKEN":
      return `${TEXTURES_BASE}BP01-T10EN.png`;
    case "Dragon TOKEN":
      return `${TEXTURES_BASE}BP01-T11EN.png`;
    case "Mimi TOKEN":
      return `${TEXTURES_BASE}BP01-T12EN.png`;
    case "Coco TOKEN":
      return `${TEXTURES_BASE}BP01-T13EN.png`;
    case "Ghost TOKEN":
      return `${TEXTURES_BASE}BP01-T14EN.png`;
    case "Forest Bat TOKEN":
      return `${TEXTURES_BASE}BP01-T15EN.png`;
    case "Holy Falcon TOKEN":
      return `${TEXTURES_BASE}BP01-T16EN.png`;
    case "Holy Tiger TOKEN":
      return `${TEXTURES_BASE}BP01-T17EN.png`;
    case "Card":
      return `${TEXTURES_BASE}default.png`;
    case "Arisa, Evergreen Arrow":
      return `${TEXTURES_BASE}BP17-001EN.png`;
    case "Ladica, Verdant Claw":
      return `${TEXTURES_BASE}BP17-002EN.png`;
    case "Ladica, Verdant Claw Evolved":
      return `${TEXTURES_BASE}BP17-003EN.png`;
    case "Setus, Sunlit Hero":
      return `${TEXTURES_BASE}BP17-004EN.png`;
    case "Lococo, Little Puppeteer":
      return `${TEXTURES_BASE}BP17-005EN.png`;
    case "Lococo, Little Puppeteer Evolved":
      return `${TEXTURES_BASE}BP17-006EN.png`;
    case "Friendly Embrace":
      return `${TEXTURES_BASE}BP17-007EN.png`;
    case "Forest Guardian's Bow":
      return `${TEXTURES_BASE}BP17-008EN.png`;
    case "Beastfolk Harvester":
      return `${TEXTURES_BASE}BP17-009EN.png`;
    case "Beastfolk Harvester Evolved":
      return `${TEXTURES_BASE}BP17-010EN.png`;
    case "Heroic Resolve":
      return `${TEXTURES_BASE}BP17-011EN.png`;
    case "Inverted Manipulation":
      return `${TEXTURES_BASE}BP17-012EN.png`;
    case "Blossom Treant":
      return `${TEXTURES_BASE}BP17-013EN.png`;
    case "Blossom Treant Evolved":
      return `${TEXTURES_BASE}BP17-014EN.png`;
    case "Sköll Lookout":
      return `${TEXTURES_BASE}BP17-015EN.png`;
    case "Elf Sorcerer":
      return `${TEXTURES_BASE}BP17-016EN.png`;
    case "Threadsnipper Puppet":
      return `${TEXTURES_BASE}BP17-017EN.png`;
    case "Heroic Fairy Champion":
      return `${TEXTURES_BASE}BP17-018EN.png`;
    case "Erika, Loyal Swordsavant":
      return `${TEXTURES_BASE}BP17-019EN.png`;
    case "Mistolina & Bayleon":
      return `${TEXTURES_BASE}BP17-020EN.png`;
    case "Mistolina & Bayleon Evolved":
      return `${TEXTURES_BASE}BP17-021EN.png`;
    case "Leod, Moonlit Executioner":
      return `${TEXTURES_BASE}BP17-022EN.png`;
    case "Frenzied Corpsmaster":
      return `${TEXTURES_BASE}BP17-023EN.png`;
    case "Frenzied Corpsmaster Evolved":
      return `${TEXTURES_BASE}BP17-024EN.png`;
    case "Sunny Day Encounter":
      return `${TEXTURES_BASE}BP17-025EN.png`;
    case "Killer Instincts":
      return `${TEXTURES_BASE}BP17-026EN.png`;
    case "Valhorean Dealer":
      return `${TEXTURES_BASE}BP17-027EN.png`;
    case "Valhorean Dealer Evolved":
      return `${TEXTURES_BASE}BP17-028EN.png`;
    case "Bladerights Lieutenant":
      return `${TEXTURES_BASE}BP17-029EN.png`;
    case "Shadowed Memories":
      return `${TEXTURES_BASE}BP17-030EN.png`;
    case "Fox Lancer":
      return `${TEXTURES_BASE}BP17-031EN.png`;
    case "Fox Lancer Evolved":
      return `${TEXTURES_BASE}BP17-032EN.png`;
    case "Stone Merchant":
      return `${TEXTURES_BASE}BP17-033EN.png`;
    case "Victorious Grappler":
      return `${TEXTURES_BASE}BP17-034EN.png`;
    case "Countersolari Survivor":
      return `${TEXTURES_BASE}BP17-035EN.png`;
    case "Brothers United":
      return `${TEXTURES_BASE}BP17-036EN.png`;
    case "Isabelle, Intrepid Mage":
      return `${TEXTURES_BASE}BP17-037EN.png`;
    case "Isabelle, Intrepid Mage Evolved":
      return `${TEXTURES_BASE}BP17-038EN.png`;
    case "Eleanor, Glorious Flower":
      return `${TEXTURES_BASE}BP17-039EN.png`;
    case "Belphomet, Ultimate Creator":
      return `${TEXTURES_BASE}BP17-040EN.png`;
    case "Tetra, Serene Sapphire":
      return `${TEXTURES_BASE}BP17-041EN.png`;
    case "Tetra, Serene Sapphire Evolved":
      return `${TEXTURES_BASE}BP17-042EN.png`;
    case "Mega Enforcer":
      return `${TEXTURES_BASE}BP17-043EN.png`;
    case "Nefarious Invasion":
      return `${TEXTURES_BASE}BP17-044EN.png`;
    case "Marie, Flowery Magician":
      return `${TEXTURES_BASE}BP17-045EN.png`;
    case "Marie, Flowery Magician Evolved":
      return `${TEXTURES_BASE}BP17-046EN.png`;
    case "Enforcer":
      return `${TEXTURES_BASE}BP17-047EN.png`;
    case "Fruits of Wisdom":
      return `${TEXTURES_BASE}BP17-048EN.png`;
    case "Awakened Robot":
      return `${TEXTURES_BASE}BP17-049EN.png`;
    case "Awakened Robot Evolved":
      return `${TEXTURES_BASE}BP17-050EN.png`;
    case "Covenant Mage":
      return `${TEXTURES_BASE}BP17-051EN.png`;
    case "Jetbroom Witch":
      return `${TEXTURES_BASE}BP17-052EN.png`;
    case "Panacea Alchemist":
      return `${TEXTURES_BASE}BP17-053EN.png`;
    case "Mysterian Wisdom":
      return `${TEXTURES_BASE}BP17-054EN.png`;
    case "Rowen, Dragon Lance":
      return `${TEXTURES_BASE}BP17-055EN.png`;
    case "Valdain, Forest Shadow":
      return `${TEXTURES_BASE}BP17-056EN.png`;
    case "Disrestan, Ocean Harbinger":
      return `${TEXTURES_BASE}BP17-057EN.png`;
    case "Disrestan, Ocean Harbinger Evolved":
      return `${TEXTURES_BASE}BP17-058EN.png`;
    case "Djeana, the Stouthearted":
      return `${TEXTURES_BASE}BP17-059EN.png`;
    case "Djeana, the Stouthearted Evolved":
      return `${TEXTURES_BASE}BP17-060EN.png`;
    case "Verdant Rebirth":
      return `${TEXTURES_BASE}BP17-061EN.png`;
    case "Dragonslayer Spear":
      return `${TEXTURES_BASE}BP17-062EN.png`;
    case "Forestclaw Sentinel":
      return `${TEXTURES_BASE}BP17-063EN.png`;
    case "Forestclaw Sentinel Evolved":
      return `${TEXTURES_BASE}BP17-064EN.png`;
    case "Rock Whale":
      return `${TEXTURES_BASE}BP17-065EN.png`;
    case "Newfound Allies":
      return `${TEXTURES_BASE}BP17-066EN.png`;
    case "Shark Warrior":
      return `${TEXTURES_BASE}BP17-067EN.png`;
    case "Shark Warrior Evolved":
      return `${TEXTURES_BASE}BP17-068EN.png`;
    case "Poisonous Dilophosaurus":
      return `${TEXTURES_BASE}BP17-069EN.png`;
    case "Mánagarmr Scout":
      return `${TEXTURES_BASE}BP17-070EN.png`;
    case "Mermaid Archer":
      return `${TEXTURES_BASE}BP17-071EN.png`;
    case "Touching Thoughts":
      return `${TEXTURES_BASE}BP17-072EN.png`;
    case "Luna, Soul Keeper":
      return `${TEXTURES_BASE}BP17-073EN.png`;
    case "Urias, Final Vampire":
      return `${TEXTURES_BASE}BP17-074EN.png`;
    case "Urias, Final Vampire Evolved":
      return `${TEXTURES_BASE}BP17-075EN.png`;
    case "Mono, Immortal Garnet":
      return `${TEXTURES_BASE}BP17-076EN.png`;
    case "Aenea, Creative Amethyst":
      return `${TEXTURES_BASE}BP17-077EN.png`;
    case "Aenea, Creative Amethyst Evolved":
      return `${TEXTURES_BASE}BP17-078EN.png`;
    case "Nicola, Enduring Steward":
      return `${TEXTURES_BASE}BP17-079EN.png`;
    case "Steeled Hopes":
      return `${TEXTURES_BASE}BP17-080EN.png`;
    case "Amy, Psychopomp Guide":
      return `${TEXTURES_BASE}BP17-081EN.png`;
    case "Amy, Psychopomp Guide Evolved":
      return `${TEXTURES_BASE}BP17-082EN.png`;
    case "Roly-Poly Mk II":
      return `${TEXTURES_BASE}BP17-083EN.png`;
    case "Allure of Shadows":
      return `${TEXTURES_BASE}BP17-084EN.png`;
    case "Rouge Vampire":
      return `${TEXTURES_BASE}BP17-085EN.png`;
    case "Rouge Vampire Evolved":
      return `${TEXTURES_BASE}BP17-086EN.png`;
    case "Vampiric Bloodbinder":
      return `${TEXTURES_BASE}BP17-087EN.png`;
    case "Trampling Terror":
      return `${TEXTURES_BASE}BP17-088EN.png`;
    case "Soul Commander":
      return `${TEXTURES_BASE}BP17-089EN.png`;
    case "Midnight Gossip":
      return `${TEXTURES_BASE}BP17-090EN.png`;
    case "Eris, Atoned Priestess":
      return `${TEXTURES_BASE}BP17-091EN.png`;
    case "Relic Goddess ADVANCED":
      return `${TEXTURES_BASE}BP17-092EN.png`;
    case "Yuwan, Dimensional Avenger":
      return `${TEXTURES_BASE}BP17-093EN.png`;
    case "Yuwan, Dimensional Avenger Evolved":
      return `${TEXTURES_BASE}BP17-094EN.png`;
    case "Meowskers, Fluffy Consul":
      return `${TEXTURES_BASE}BP17-095EN.png`;
    case "Marlone, Peace Advocate":
      return `${TEXTURES_BASE}BP17-096EN.png`;
    case "Marlone, Peace Advocate Evolved":
      return `${TEXTURES_BASE}BP17-097EN.png`;
    case "Vice, Death Grip":
      return `${TEXTURES_BASE}BP17-098EN.png`;
    case "Automachina Maiden":
      return `${TEXTURES_BASE}BP17-099EN.png`;
    case "Aerial Craft":
      return `${TEXTURES_BASE}BP17-100EN.png`;
    case "Aerial Craft Evolved":
      return `${TEXTURES_BASE}BP17-101EN.png`;
    case "Balance and Obliteration":
      return `${TEXTURES_BASE}BP17-102EN.png`;
    case "Unlikely Fellowship":
      return `${TEXTURES_BASE}BP17-103EN.png`;
    case "Steelwing":
      return `${TEXTURES_BASE}BP17-104EN.png`;
    case "Steelwing Evolved":
      return `${TEXTURES_BASE}BP17-105EN.png`;
    case "Technomancer":
      return `${TEXTURES_BASE}BP17-106EN.png`;
    case "Android Artisan":
      return `${TEXTURES_BASE}BP17-107EN.png`;
    case "Mark Unleashed":
      return `${TEXTURES_BASE}BP17-108EN.png`;
    case "Unicorn Altar":
      return `${TEXTURES_BASE}BP17-109EN.png`;
    case "Maisha, Purgation's Vessel":
      return `${TEXTURES_BASE}BP17-110EN.png`;
    case "Maisha, Purgation's Vessel Evolved":
      return `${TEXTURES_BASE}BP17-111EN.png`;
    case "Great Mother's Embrace":
      return `${TEXTURES_BASE}BP17-112EN.png`;
    case "Hoverboard Mercenary":
      return `${TEXTURES_BASE}BP17-113EN.png`;
    case "Hoverboard Mercenary Evolved":
      return `${TEXTURES_BASE}BP17-114EN.png`;
    case "Cosmic Angel":
      return `${TEXTURES_BASE}BP17-115EN.png`;
    case "Guild Assembly":
      return `${TEXTURES_BASE}BP17-116EN.png`;
    case "Naterra's Future":
      return `${TEXTURES_BASE}BP17-117EN.png`;
    case "Unnamed Determination":
      return `${TEXTURES_BASE}BP17-118EN.png`;
    case "Aiolon's Remains":
      return `${TEXTURES_BASE}BP17-119EN.png`;
    case "Lococo's Teddy Bear TOKEN":
      return `${TEXTURES_BASE}BP17-T01EN.png`;
    case "Gale Arrow TOKEN":
      return `${TEXTURES_BASE}BP17-T02EN.png`;
    case "Storm Arrow TOKEN":
      return `${TEXTURES_BASE}BP17-T03EN.png`;
    case "Quadra Magic TOKEN":
      return `${TEXTURES_BASE}BP17-T04EN.png`;
    case "Elements of Creation TOKEN":
      return `${TEXTURES_BASE}BP17-T05EN.png`;
    case "Curse of the Black Dragon TOKEN":
      return `${TEXTURES_BASE}BP17-T06EN.png`;
    case "A Horrible Night TOKEN":
      return `${TEXTURES_BASE}BP17-T07EN.png`;
    case "Luna's Doll TOKEN":
      return `${TEXTURES_BASE}BP17-T08EN.png`;
    case "Eschamali Adviser TOKEN":
      return `${TEXTURES_BASE}BP17-T09EN.png`;
    case "Eschamali Constable TOKEN":
      return `${TEXTURES_BASE}BP17-T10EN.png`;
    case "Anastasia [Seize the Light]":
      return `${TEXTURES_BASE}ECP02-001EN.png`;
    case "Anastasia [Seize the Light] Evolved":
      return `${TEXTURES_BASE}ECP02-002EN.png`;
    case "Hajime Fujiwara [Pink Blossom Dream]":
      return `${TEXTURES_BASE}ECP02-003EN.png`;
    case "Riina Tada [Wannabe Legend]":
      return `${TEXTURES_BASE}ECP02-006EN.png`;
    case "Riina Tada [Wannabe Legend] Evolved":
      return `${TEXTURES_BASE}ECP02-007EN.png`;
    case "Hinako Kita [True Dream]":
      return `${TEXTURES_BASE}ECP02-008EN.png`;
    case "Hinako Kita [True Dream] Evolved":
      return `${TEXTURES_BASE}ECP02-009EN.png`;
    case "Miku Maekawa [Meownderful World]":
      return `${TEXTURES_BASE}ECP02-010EN.png`;
    case "Blossoms' Advance":
      return `${TEXTURES_BASE}ECP02-011EN.png`;
    case "Mio Honda [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-013EN.png`;
    case "Mio Honda [Cinderella Girl] Evolved":
      return `${TEXTURES_BASE}ECP02-014EN.png`;
    case "Karen Hojo [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-016EN.png`;
    case "Airi Totoki [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-017EN.png`;
    case "Airi Totoki [Cinderella Girl] Evolved":
      return `${TEXTURES_BASE}ECP02-018EN.png`;
    case "Mayu Sakuma [Love-Laden Gift]":
      return `${TEXTURES_BASE}ECP02-019EN.png`;
    case "Mayu Sakuma [Love-Laden Gift] Evolved":
      return `${TEXTURES_BASE}ECP02-020EN.png`;
    case "Chieri Ogata [Happiness Tune]":
      return `${TEXTURES_BASE}ECP02-021EN.png`;
    case "Chieri Ogata [Happiness Tune] Evolved":
      return `${TEXTURES_BASE}ECP02-022EN.png`;
    case "Nagi Hisakawa [Everyday Fairy Tale]":
      return `${TEXTURES_BASE}ECP02-023EN.png`;
    case "Miho Kohinata [Youthful Romance]":
      return `${TEXTURES_BASE}ECP02-024EN.png`;
    case "Dancing in the Rain":
      return `${TEXTURES_BASE}ECP02-025EN.png`;
    case "Syuko Shiomi [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-026EN.png`;
    case "Glitz & Glam☆Parade":
      return `${TEXTURES_BASE}ECP02-029EN.png`;
    case "Sae Kobayakawa [Dancing Flowers]":
      return `${TEXTURES_BASE}ECP02-030EN.png`;
    case "Sae Kobayakawa [Dancing Flowers] Evolved":
      return `${TEXTURES_BASE}ECP02-031EN.png`;
    case "Hiromi Seki [Twinkle in My Eye]":
      return `${TEXTURES_BASE}ECP02-032EN.png`;
    case "Hiromi Seki [Twinkle in My Eye] Evolved":
      return `${TEXTURES_BASE}ECP02-033EN.png`;
    case "Shiki Ichinose [Mystic Elixir]":
      return `${TEXTURES_BASE}ECP02-034EN.png`;
    case "Kanade Hayami [Faraway Reflection]":
      return `${TEXTURES_BASE}ECP02-035EN.png`;
    case "Tomoe Murakami [Crimson Fighter]":
      return `${TEXTURES_BASE}ECP02-036EN.png`;
    case "Fumika Sagisawa [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-037EN.png`;
    case "Fumika Sagisawa [Cinderella Girl] Evolved":
      return `${TEXTURES_BASE}ECP02-038EN.png`;
    case "Akira Sunazuka [Online Life]":
      return `${TEXTURES_BASE}ECP02-039EN.png`;
    case "Yui Ohtsuki [Lollipop Darling]":
      return `${TEXTURES_BASE}ECP02-042EN.png`;
    case "Yui Ohtsuki [Lollipop Darling] Evolved":
      return `${TEXTURES_BASE}ECP02-043EN.png`;
    case "Hotaru Shiragiku [Unbreakable]":
      return `${TEXTURES_BASE}ECP02-044EN.png`;
    case "Hotaru Shiragiku [Unbreakable] Evolved":
      return `${TEXTURES_BASE}ECP02-045EN.png`;
    case "Star of the Show":
      return `${TEXTURES_BASE}ECP02-046EN.png`;
    case "Syoko Hoshi [individuals]":
      return `${TEXTURES_BASE}ECP02-048EN.png`;
    case "Mirei Hayasaka [individuals]":
      return `${TEXTURES_BASE}ECP02-049EN.png`;
    case "Nono Morikubo [individuals]":
      return `${TEXTURES_BASE}ECP02-050EN.png`;
    case "Nono Morikubo [individuals] Evolved":
      return `${TEXTURES_BASE}ECP02-051EN.png`;
    case "Chitose Kurosaki [Memento Mori]":
      return `${TEXTURES_BASE}ECP02-053EN.png`;
    case "Chitose Kurosaki [Memento Mori] Evolved":
      return `${TEXTURES_BASE}ECP02-054EN.png`;
    case "Natsuki Kimura [Scarlet Love Song]":
      return `${TEXTURES_BASE}ECP02-055EN.png`;
    case "Natsuki Kimura [Scarlet Love Song] Evolved":
      return `${TEXTURES_BASE}ECP02-056EN.png`;
    case "Takumi Mukai [No One Can Stop Me]":
      return `${TEXTURES_BASE}ECP02-057EN.png`;
    case "Koume Shirasaka [Haunted Gown]":
      return `${TEXTURES_BASE}ECP02-058EN.png`;
    case "Self-Proclaimed Fan Favorite":
      return `${TEXTURES_BASE}ECP02-059EN.png`;
    case "Nana Abe [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-060EN.png`;
    case "Nana Abe [Cinderella Girl] Evolved":
      return `${TEXTURES_BASE}ECP02-061EN.png`;
    case "Kaede Takagaki [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-062EN.png`;
    case "Kako Takafuji [Lady Luck]":
      return `${TEXTURES_BASE}ECP02-065EN.png`;
    case "Kako Takafuji [Lady Luck] Evolved":
      return `${TEXTURES_BASE}ECP02-066EN.png`;
    case "Kotoka Saionji [Pure Euphoria]":
      return `${TEXTURES_BASE}ECP02-067EN.png`;
    case "Kotoka Saionji [Pure Euphoria] Evolved":
      return `${TEXTURES_BASE}ECP02-068EN.png`;
    case "Haru Yuuki [Secret Blue Rose]":
      return `${TEXTURES_BASE}ECP02-069EN.png`;
    case "Natalia [One Thousand and One Nights]":
      return `${TEXTURES_BASE}ECP02-070EN.png`;
    case "A Sweet Romantic Summer":
      return `${TEXTURES_BASE}ECP02-071EN.png`;
    case "Curtain Call of Smiles":
      return `${TEXTURES_BASE}ECP02-072EN.png`;
    case "Minami Nitta [Goddess by the Sunlit Sea]":
      return `${TEXTURES_BASE}ECP02-U01EN.png`;
    case "Yuki Himekawa [Challengers' Cheer]":
      return `${TEXTURES_BASE}ECP02-U02EN.png`;
    case "Rin & Mio":
      return `${TEXTURES_BASE}ECP02-U03aEN.png`;
    case "Uzuki Shimamura [Magical New Me]":
      return `${TEXTURES_BASE}ECP02-U04EN.png`;
    case "Mika & Rika":
      return `${TEXTURES_BASE}ECP02-U05aEN.png`;
    case "Yuuki Otokura [Ripples of My Heart]":
      return `${TEXTURES_BASE}ECP02-U06EN.png`;
    case "Akari & Akira":
      return `${TEXTURES_BASE}ECP02-U07aEN.png`;
    case "Riamu Yumemi [Shout It to the World]":
      return `${TEXTURES_BASE}ECP02-U08EN.png`;
    case "Ranko Kanzaki [Princess in White]":
      return `${TEXTURES_BASE}ECP02-U09EN.png`;
    case "Asuka Ninomiya [Gentle Evening]":
      return `${TEXTURES_BASE}ECP02-U10EN.png`;
    case "Eve Santaclaus [Holy Night Miracle]":
      return `${TEXTURES_BASE}ECP02-U11EN.png`;
    case "Miyu Mifune [Parfum Géranium]":
      return `${TEXTURES_BASE}ECP02-U12EN.png`;
    case "Tsubaki":
      return `${TEXTURES_BASE}SD02-001EN.png`;
    case "Sammy, Wizard's Apprentice":
      return `${TEXTURES_BASE}SD03-010EN.png`;
    case "Sammy, Wizard's Apprentice Evolved":
      return `${TEXTURES_BASE}SD03-011EN.png`;
    case "Magic Missile":
      return `${TEXTURES_BASE}SD03-015EN.png`;
    case "Spinaria, Wavering Will":
      return `${TEXTURES_BASE}SDD01-003EN.png`;
    case "Godsent Stride":
      return `${TEXTURES_BASE}SDD02-015EN.png`;
    case "Slade, Blossoming Wolf":
      return `${TEXTURES_BASE}BP03-005EN.png`;
    case "Slade, Blossoming Wolf Evolved":
      return `${TEXTURES_BASE}BP03-006EN.png`;
    case "Biofabrication":
      return `${TEXTURES_BASE}BP06-113EN.png`;
    case "Regal Wildcat":
      return `${TEXTURES_BASE}PR-440EN.png`;
    case "Mithra, Daybreak Deity":
      return `${TEXTURES_BASE}BP06-106EN.png`;
    case "Mithra, Daybreak Deity Evolved":
      return `${TEXTURES_BASE}BP06-107EN.png`;
    case "Serpent Wrath":
      return `${TEXTURES_BASE}BP01-090EN.png`;
    case "Colette, Holy Gunner":
      return `${TEXTURES_BASE}BP08-093EN.png`;
    case "Colette, Holy Gunner Evolved":
      return `${TEXTURES_BASE}BP08-094EN.png`;
    case "Albert, Levin Saber":
      return `${TEXTURES_BASE}BP02-018EN.png`;
    case "Albert, Levin Saber Evolved":
      return `${TEXTURES_BASE}BP02-019EN.png`;
    case "Genesis of Legend":
      return `${TEXTURES_BASE}PR-137EN.png`;
    case "Wingy, Chirpy Gemstone":
      return `${TEXTURES_BASE}BP03-094EN.png`;
    case "Wingy, Chirpy Gemstone Evolved":
      return `${TEXTURES_BASE}BP03-095EN.png`;
    case "Fervent Machine Soldier":
      return `${TEXTURES_BASE}BP05-026EN.png`;
    case "Unicorn Dancer Unica":
      return `${TEXTURES_BASE}BP02-110EN.png`;
    case "Unicorn Dancer Unica Evolved":
      return `${TEXTURES_BASE}BP02-111EN.png`;
    case "Jabberwock":
      return `${TEXTURES_BASE}BP03-055EN.png`;
    case "Grand Summoning":
      return `${TEXTURES_BASE}PR-219EN.png`;
    case "Dragonrend Quake":
      return `${TEXTURES_BASE}PR-138EN.png`;
    case "Spawn of the Abyss Evolved":
      return `${TEXTURES_BASE}PR-220EN.png`;
    case "Mimi, Infernal Right Paw TOKEN":
      return `${TEXTURES_BASE}BP01-T12EN.png`;
    case "Coco, Infernal Left Paw TOKEN":
      return `${TEXTURES_BASE}BP01-T13EN.png`;
    case "Pulsefire Assault":
      return `${TEXTURES_BASE}SS01-U01EN.png`;
    case "New Year's Soul Devil":
      return `${TEXTURES_BASE}NY2024-001EN.png`;
    case "Baalt, King of the Elves":
      return `${TEXTURES_BASE}BP02-010EN.png`;
    case "Sparkling☆Days":
      return `${TEXTURES_BASE}CP02-028EN.png`;
    case "Riamu's Reverie":
      return `${TEXTURES_BASE}PR-146EN.png`;
    case "Sweet Sentiments":
      return `${TEXTURES_BASE}PR-147EN.png`;
    case "Marlone, Light of Balance Evolved":
      return `${TEXTURES_BASE}BP07-091EN.png`;
    case "Blue Storm Supreme Dragon, Glory Maelstrom Evolved":
      return `${TEXTURES_BASE}CP03-002EN.png`;
    case "Evolution Point":
      return `${TEXTURES_BASE}PR-388EN.png`;
    case "Super-Evolution Point":
      return `${TEXTURES_BASE}PR-389EN.png`;
    case "Airi Totoki [Anniversary Princess]":
      return `${TEXTURES_BASE}PR-451EN.png`;
    case "Cute Pendant TOKEN":
      return `${TEXTURES_BASE}PR-453EN.png`;
    case "Cute Tiara TOKEN":
      return `${TEXTURES_BASE}PR-454EN.png`;
    case "Cool Pendant TOKEN":
      return `${TEXTURES_BASE}PR-456EN.png`;
    case "Cool Tiara TOKEN":
      return `${TEXTURES_BASE}PR-457EN.png`;
    case "Passion Pendant TOKEN":
      return `${TEXTURES_BASE}PR-459EN.png`;
    case "Passion Tiara TOKEN":
      return `${TEXTURES_BASE}PR-460EN.png`;
    case "Anastasia [All-Out Vacation]":
      return `${TEXTURES_BASE}PR-461EN.png`;
    case "Miku Maekawa [Summer Cat Rendezvous]":
      return `${TEXTURES_BASE}PR-462EN.png`;
    case "Summer Sea Breeze":
      return `${TEXTURES_BASE}PR-463EN.png`;
    case "Miho Kohinata [Summer Firsts]":
      return `${TEXTURES_BASE}PR-464EN.png`;
    case "Mio Honda [Mermaid Star]":
      return `${TEXTURES_BASE}PR-465EN.png`;
    case "Beachside Memories":
      return `${TEXTURES_BASE}PR-466EN.png`;
    case "Summer Encounter":
      return `${TEXTURES_BASE}PR-467EN.png`;
    case "#UNICUS":
      return `${TEXTURES_BASE}CP02-U13aEN.png`;
    case "Close-Knit Ambitions":
      return `${TEXTURES_BASE}CP01-080EN.png`;
    case "Harbinger of the Night":
      return `${TEXTURES_BASE}BP03-119EN.png`;
    case "Ms. Tart Man":
      return `${TEXTURES_BASE}BP08-U07EN.png`;
    case "Tazuna Hayakawa [Tracen Reception]":
      return `${TEXTURES_BASE}CSD01-007EN.png`;
    case "* (Asterisk)":
      return `${TEXTURES_BASE}CP02-U01aEN.png`;
    case "Aiko Takamori [Handmade Happiness]":
      return `${TEXTURES_BASE}CSD02c-002EN.png`;
    case "Cheshire Cat":
      return `${TEXTURES_BASE}BP07-012EN.png`;
    case "Grand Archer Selwyn":
      return `${TEXTURES_BASE}BP02-006EN.png`;
    case "Minami Nitta [Water's Edge Bride]":
      return `${TEXTURES_BASE}ECP02-004EN.png`;
    case "Otoha Umeki":
      return `${TEXTURES_BASE}CP02-016EN.png`;
    case "Yuki Himekawa [Full Swing☆Cheer]":
      return `${TEXTURES_BASE}ECP02-005EN.png`;
    case "Agnes Digital":
      return `${TEXTURES_BASE}CP01-033EN.png`;
    case "Daria, Dimensional Witch":
      return `${TEXTURES_BASE}BP02-035EN.png`;
    case "Hagoromo Komachi":
      return `${TEXTURES_BASE}CP02-U06aEN.png`;
    case "Mika Jougasaki [My★Style]":
      return `${TEXTURES_BASE}ECP02-027EN.png`;
    case "Multipart Experiment":
      return `${TEXTURES_BASE}BP02-045EN.png`;
    case "Prophetess of Creation":
      return `${TEXTURES_BASE}BP08-037EN.png`;
    case "Yuuki Otokura [Together with Me]":
      return `${TEXTURES_BASE}ECP02-028EN.png`;
    case "Akari Tsujino [Twice as Lovely]":
      return `${TEXTURES_BASE}ECP02-040EN.png`;
    case "Aqua Nereid":
      return `${TEXTURES_BASE}BP04-074EN.png`;
    case "BRIGHT:LIGHTS":
      return `${TEXTURES_BASE}CP02-U08aEN.png`;
    case "Garyu, Supreme Dragonkin":
      return `${TEXTURES_BASE}BP06-052EN.png`;
    case "Gattling Claw Dragon":
      return `${TEXTURES_BASE}CP03-077EN.png`;
    case "Iron Tail Dragon":
      return `${TEXTURES_BASE}CP03-080EN.png`;
    case "Riamu Yumemi [Party Night]":
      return `${TEXTURES_BASE}ECP02-041EN.png`;
    case "Slaughtering Dragonewt":
      return `${TEXTURES_BASE}BP10-060EN.png`;
    case "Asuka Ninomiya [Sweet & Charming]":
      return `${TEXTURES_BASE}ECP02-052EN.png`;
    case "Lelouch, Righteous Emperor":
      return `${TEXTURES_BASE}BP04-SP01EN.png`;
    case "Nephthys":
      return `${TEXTURES_BASE}BP08-071EN.png`;
    case "Ranko Kanzaki [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-047EN.png`;
    case "Silvernail Markswoman":
      return `${TEXTURES_BASE}BP14-082EN.png`;
    case "Eve Santaclaus [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-063EN.png`;
    case "Evil-Eye Princess, Euryale":
      return `${TEXTURES_BASE}CP03-110EN.png`;
    case "Marlone, Light of Balance":
      return `${TEXTURES_BASE}BP07-090EN.png`;
    case "Miyu Mifune [Rouge Couture]":
      return `${TEXTURES_BASE}ECP02-064EN.png`;
    case "Psychic☆Maiden":
      return `${TEXTURES_BASE}CP02-096EN.png`;
    case "Sapphire Priestess":
      return `${TEXTURES_BASE}BP02-095EN.png`;
    case "T. M. Opera O":
      return `${TEXTURES_BASE}CP01-078EN.png`;
    case "Rin Shibuya [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-012EN.png`;
    case "Uzuki Shimamura [Cinderella Girl]":
      return `${TEXTURES_BASE}ECP02-015EN.png`;
    case "A Super Successful Event! Evolved":
      return `${TEXTURES_BASE}ECP01-058EN.png`;
    case "At the End of the Day Evolved":
      return `${TEXTURES_BASE}ECP01-060EN.png`;
    case "Forth! Into the Great Age of Agriculture! Evolved":
      return `${TEXTURES_BASE}ECP01-061EN.png`;
    case "Harbinger of the Night Evolved":
      return `${TEXTURES_BASE}BP03-120EN.png`;
    case "Hungry for a Miracle Evolved":
      return `${TEXTURES_BASE}ECP01-059EN.png`;
    case "Workshop! Farmers for a Day! Evolved":
      return `${TEXTURES_BASE}ECP01-062EN.png`;
    case "Barking Manticore Evolved":
      return `${TEXTURES_BASE}CP03-047EN.png`;
    case "Daria, Dimensional Witch Evolved":
      return `${TEXTURES_BASE}BP02-036EN.png`;
    case "Mysterian Whitewyrm Evolved":
      return `${TEXTURES_BASE}BP09-042EN.png`;
    case "Blazing Flare Dragon Evolved":
      return `${TEXTURES_BASE}CP03-067EN.png`;
    case "Embodiment of Victory, Aleph Evolved":
      return `${TEXTURES_BASE}CSD03b-005EN.png`;
    case "Garyu, Supreme Dragonkin Evolved":
      return `${TEXTURES_BASE}BP06-053EN.png`;
    case "Lævateinn Dragon, Attack Form Evolved":
      return `${TEXTURES_BASE}BP03-058EN.png`;
    case "Slaughtering Dragonewt Evolved":
      return `${TEXTURES_BASE}BP10-061EN.png`;
    case "Virtuous Lindworm Evolved":
      return `${TEXTURES_BASE}BP09-069EN.png`;
    case "Celia, Hope's Strategist Evolved":
      return `${TEXTURES_BASE}BP09-019EN.png`;
    case "King of Knights, Alfred Evolved":
      return `${TEXTURES_BASE}CSD03a-002EN.png`;
    case "Soul Saver Dragon Evolved":
      return `${TEXTURES_BASE}CP03-026EN.png`;
    case "Ceryneian Lighthind Evolved":
      return `${TEXTURES_BASE}BP09-110EN.png`;
    case "SugarSugar☆Mi〜n Evolved":
      return `${TEXTURES_BASE}CP02-U12aEN.png`;
    case "Fortuna Regina Evolved":
      return `${TEXTURES_BASE}CP02-U09aEN.png`;
    case "Silvernail Markswoman Evolved":
      return `${TEXTURES_BASE}BP14-083EN.png`;
    case "Vania, Kind Queen Evolved":
      return `${TEXTURES_BASE}BP09-090EN.png`;
    case "Grand Archer Selwyn Evolved":
      return `${TEXTURES_BASE}BP02-007EN.png`;
    case "Navalgazer Dragon Evolved":
      return `${TEXTURES_BASE}CP03-006EN.png`;
    case "Orchis, Resolute Puppet Evolved":
      return `${TEXTURES_BASE}BP08-003EN.png`;
    case "Paula, Gentle Warmth Evolved":
      return `${TEXTURES_BASE}BP09-005EN.png`;



















    case "Rolo Rone, Verdant Purifier":
      return `${TEXTURES_BASE}BP18-001EN.png`;
    case "Rolo Rone, Verdant Purifier Evolved":
      return `${TEXTURES_BASE}BP18-002EN.png`;
    case "Kyou, Verdant Path Shepherd":
      return `${TEXTURES_BASE}BP18-003EN.png`;
    case "Tia, Crystalian Noble":
      return `${TEXTURES_BASE}BP18-004EN.png`;
    case "Verdant Authority Caretaker":
      return `${TEXTURES_BASE}BP18-005EN.png`;
    case "Verdant Authority Caretaker Evolved":
      return `${TEXTURES_BASE}BP18-006EN.png`;
    case "May, Eager Elf":
      return `${TEXTURES_BASE}BP18-007EN.png`;
    case "Sprouting Retribution":
      return `${TEXTURES_BASE}BP18-008EN.png`;
    case "Verdant City Pugilist":
      return `${TEXTURES_BASE}BP18-009EN.png`;
    case "Verdant City Pugilist Evolved":
      return `${TEXTURES_BASE}BP18-010EN.png`;
    case "Blossoming Lunerian":
      return `${TEXTURES_BASE}BP18-011EN.png`;
    case "Blossoming Lunerian Evolved":
      return `${TEXTURES_BASE}BP18-012EN.png`;
    case "Sowing Paradise":
      return `${TEXTURES_BASE}BP18-013EN.png`;
    case "Verdant Law Supplicant":
      return `${TEXTURES_BASE}BP18-014EN.png`;
    case "Verdant Law Supplicant Evolved":
      return `${TEXTURES_BASE}BP18-015EN.png`;
    case "Milolo, Li'l Mountain Lass":
      return `${TEXTURES_BASE}BP18-016EN.png`;
    case "Rayne, Elf Smith":
      return `${TEXTURES_BASE}BP18-017EN.png`;
    case "Furious Mountain Deity":
      return `${TEXTURES_BASE}BP18-018EN.png`;
    case "Airbound Barrage":
      return `${TEXTURES_BASE}BP18-019EN.png`;
    case "Shinra, All-Discerning":
      return `${TEXTURES_BASE}BP18-020EN.png`;
    case "Shinra, All-Discerning Evolved":
      return `${TEXTURES_BASE}BP18-021EN.png`;
    case "Gamma, Canine Mediator":
      return `${TEXTURES_BASE}BP18-022EN.png`;
    case "Gawain, Oath to Glory":
      return `${TEXTURES_BASE}BP18-023EN.png`;
    case "Bird's-Eye Investigator":
      return `${TEXTURES_BASE}BP18-024EN.png`;
    case "Bird's-Eye Investigator Evolved":
      return `${TEXTURES_BASE}BP18-025EN.png`;
    case "Darksaber Melissa":
      return `${TEXTURES_BASE}BP18-026EN.png`;
    case "Gigabyte Blade":
      return `${TEXTURES_BASE}BP18-027EN.png`;
    case "Cold Case Analyst":
      return `${TEXTURES_BASE}BP18-028EN.png`;
    case "Cold Case Analyst Evolved":
      return `${TEXTURES_BASE}BP18-029EN.png`;
    case "Lucius, Sellsword":
      return `${TEXTURES_BASE}BP18-030EN.png`;
    case "Unorthodox Assistance":
      return `${TEXTURES_BASE}BP18-031EN.png`;
    case "Blind Spot Surveyor":
      return `${TEXTURES_BASE}BP18-032EN.png`;
    case "Blind Spot Surveyor Evolved":
      return `${TEXTURES_BASE}BP18-033EN.png`;
    case "Monika, Cloudhall Admiral":
      return `${TEXTURES_BASE}BP18-034EN.png`;
    case "Monika, Cloudhall Admiral Evolved":
      return `${TEXTURES_BASE}BP18-035EN.png`;
    case "Princess Teena":
      return `${TEXTURES_BASE}BP18-036EN.png`;
    case "Holy Bear Knight":
      return `${TEXTURES_BASE}BP18-037EN.png`;
    case "Luminous Standard":
      return `${TEXTURES_BASE}BP18-038EN.png`;
    case "Mana, Sterling Luster":
      return `${TEXTURES_BASE}BP18-039EN.png`;
    case "Mana, Sterling Luster Evolved":
      return `${TEXTURES_BASE}BP18-040EN.png`;
    case "Francoise, Bejeweled Manager":
      return `${TEXTURES_BASE}BP18-041EN.png`;
    case "Ginger, Accursed Word":
      return `${TEXTURES_BASE}BP18-042EN.png`;
    case "Bejeweled Supermodel":
      return `${TEXTURES_BASE}BP18-043EN.png`;
    case "Bejeweled Supermodel Evolved":
      return `${TEXTURES_BASE}BP18-044EN.png`;
    case "Aleister, Argenteum Astrum":
      return `${TEXTURES_BASE}BP18-045EN.png`;
    case "Brilliant Cut":
      return `${TEXTURES_BASE}BP18-046EN.png`;
    case "Bejeweled Advisor":
      return `${TEXTURES_BASE}BP18-047EN.png`;
    case "Bejeweled Advisor Evolved":
      return `${TEXTURES_BASE}BP18-048EN.png`;
    case "Mari, Card Conjurer":
      return `${TEXTURES_BASE}BP18-049EN.png`;
    case "Clandestine Dealings":
      return `${TEXTURES_BASE}BP18-050EN.png`;
    case "Bejeweled Bouncer":
      return `${TEXTURES_BASE}BP18-051EN.png`;
    case "Bejeweled Bouncer Evolved":
      return `${TEXTURES_BASE}BP18-052EN.png`;
    case "Carbuncle of Mysteria":
      return `${TEXTURES_BASE}BP18-053EN.png`;
    case "Carbuncle of Mysteria Evolved":
      return `${TEXTURES_BASE}BP18-054EN.png`;
    case "Illusionist":
      return `${TEXTURES_BASE}BP18-055EN.png`;
    case "Enchanted Sword":
      return `${TEXTURES_BASE}BP18-056EN.png`;
    case "Authoring Tomorrow":
      return `${TEXTURES_BASE}BP18-057EN.png`;
    case "El, Destructive Dragon":
      return `${TEXTURES_BASE}BP18-058EN.png`;
    case "El, Destructive Dragon Evolved":
      return `${TEXTURES_BASE}BP18-059EN.png`;
    case "Tenka, Hot-Blooded Vice-Prez":
      return `${TEXTURES_BASE}BP18-060EN.png`;
    case "Fafnir, Cunning Wyrm":
      return `${TEXTURES_BASE}BP18-061EN.png`;
    case "Dragon-Eyed Secretary":
      return `${TEXTURES_BASE}BP18-062EN.png`;
    case "Dragon-Eyed Secretary Evolved":
      return `${TEXTURES_BASE}BP18-063EN.png`;
    case "Prophetic Dragon":
      return `${TEXTURES_BASE}BP18-064EN.png`;
    case "After-School Break":
      return `${TEXTURES_BASE}BP18-065EN.png`;
    case "Neon-Tailed Prefect":
      return `${TEXTURES_BASE}BP18-066EN.png`;
    case "Neon-Tailed Prefect Evolved":
      return `${TEXTURES_BASE}BP18-067EN.png`;
    case "Ian, Dragon Buster":
      return `${TEXTURES_BASE}BP18-068EN.png`;
    case "Ian, Dragon Buster Evolved":
      return `${TEXTURES_BASE}BP18-069EN.png`;
    case "Red-Winged Admissions Gift":
      return `${TEXTURES_BASE}BP18-070EN.png`;
    case "Lightning-Clawed Loafer":
      return `${TEXTURES_BASE}BP18-071EN.png`;
    case "Lightning-Clawed Loafer Evolved":
      return `${TEXTURES_BASE}BP18-072EN.png`;
    case "Serpent Drake":
      return `${TEXTURES_BASE}BP18-073EN.png`;
    case "Draconic Mercenary":
      return `${TEXTURES_BASE}BP18-074EN.png`;
    case "Estrella Beast":
      return `${TEXTURES_BASE}BP18-075EN.png`;
    case "Orca Run":
      return `${TEXTURES_BASE}BP18-076EN.png`;
    case "Ilze & Urze, Centennial Reapers":
      return `${TEXTURES_BASE}BP18-077EN.png`;
    case "Ilze & Urze, Centennial Reapers Evolved":
      return `${TEXTURES_BASE}BP18-078EN.png`;
    case "Vedd, Burial Wolf":
      return `${TEXTURES_BASE}BP18-079EN.png`;
    case "Vania, Crimson Majesty":
      return `${TEXTURES_BASE}BP18-080EN.png`;
    case "Vania, Crimson Majesty Evolved":
      return `${TEXTURES_BASE}BP18-081EN.png`;
    case "Covetous Serpent":
      return `${TEXTURES_BASE}BP18-082EN.png`;
    case "Covetous Serpent Evolved":
      return `${TEXTURES_BASE}BP18-083EN.png`;
    case "Veight, Twilit Highborn":
      return `${TEXTURES_BASE}BP18-084EN.png`;
    case "Crescent Moon of Centennial Death":
      return `${TEXTURES_BASE}BP18-085EN.png`;
    case "Exhumation Crow":
      return `${TEXTURES_BASE}BP18-086EN.png`;
    case "Exhumation Crow Evolved":
      return `${TEXTURES_BASE}BP18-087EN.png`;
    case "Full Moon of Centennial Demise":
      return `${TEXTURES_BASE}BP18-088EN.png`;
    case "Vampire Queen's Castle":
      return `${TEXTURES_BASE}BP18-089EN.png`;
    case "Gnawing Rat":
      return `${TEXTURES_BASE}BP18-090EN.png`;
    case "Gnawing Rat Evolved":
      return `${TEXTURES_BASE}BP18-091EN.png`;
    case "Beryl, Dreameater":
      return `${TEXTURES_BASE}BP18-092EN.png`;
    case "Beryl, Dreameater Evolved":
      return `${TEXTURES_BASE}BP18-093EN.png`;
    case "Prince Catacomb":
      return `${TEXTURES_BASE}BP18-094EN.png`;
    case "Bloodthirsty Hamster":
      return `${TEXTURES_BASE}BP18-095EN.png`;
    case "Nightscreech":
      return `${TEXTURES_BASE}BP18-096EN.png`;
    case "Seishiro, Admonishing Faith":
      return `${TEXTURES_BASE}BP18-097EN.png`;
    case "Seishiro, Admonishing Faith Evolved":
      return `${TEXTURES_BASE}BP18-098EN.png`;
    case "Tenmei, Insatiable Adjudicator":
      return `${TEXTURES_BASE}BP18-099EN.png`;
    case "Elana, Purest Prayer":
      return `${TEXTURES_BASE}BP18-100EN.png`;
    case "Conferrer of Vows":
      return `${TEXTURES_BASE}BP18-101EN.png`;
    case "Conferrer of Vows Evolved":
      return `${TEXTURES_BASE}BP18-102EN.png`;
    case "Imina, Mad Eidolon":
      return `${TEXTURES_BASE}BP18-103EN.png`;
    case "Unshakable Prayer":
      return `${TEXTURES_BASE}BP18-104EN.png`;
    case "Deliverer of Punishment":
      return `${TEXTURES_BASE}BP18-105EN.png`;
    case "Deliverer of Punishment Evolved":
      return `${TEXTURES_BASE}BP18-106EN.png`;
    case "Lorena, Iron-Willed Priest":
      return `${TEXTURES_BASE}BP18-107EN.png`;
    case "Lorena, Iron-Willed Priest Evolved":
      return `${TEXTURES_BASE}BP18-108EN.png`;
    case "Guiding Words":
      return `${TEXTURES_BASE}BP18-109EN.png`;
    case "Votary of Contemplation":
      return `${TEXTURES_BASE}BP18-110EN.png`;
    case "Votary of Contemplation Evolved":
      return `${TEXTURES_BASE}BP18-111EN.png`;
    case "Mugnier, Purifying Light":
      return `${TEXTURES_BASE}BP18-112EN.png`;
    case "Armed Al-mi'raj":
      return `${TEXTURES_BASE}BP18-113EN.png`;
    case "Heavenly Hound":
      return `${TEXTURES_BASE}BP18-114EN.png`;
    case "Golden Bell":
      return `${TEXTURES_BASE}BP18-115EN.png`;
    case "Bansai Suzuki, Deacon Shinobi":
      return `${TEXTURES_BASE}BP18-116EN.png`;
    case "Saito, Mao Ward Officer":
      return `${TEXTURES_BASE}BP18-117EN.png`;
    case "Saito, Mao Ward Officer Evolved":
      return `${TEXTURES_BASE}BP18-118EN.png`;
    case "Warped Progress":
      return `${TEXTURES_BASE}BP18-119EN.png`;
    case "Togh Keyoh, Neometropolis":
      return `${TEXTURES_BASE}BP18-120EN.png`;
    case "Stunfist Assassin":
      return `${TEXTURES_BASE}BP18-121EN.png`;
    case "Stunfist Assassin Evolved":
      return `${TEXTURES_BASE}BP18-122EN.png`;
    case "A-Class Pyromancy":
      return `${TEXTURES_BASE}BP18-123EN.png`;
    case "Cyberglasses Criminal":
      return `${TEXTURES_BASE}BP18-124EN.png`;
    case "Cyberglasses Criminal Evolved":
      return `${TEXTURES_BASE}BP18-125EN.png`;
    case "Third-Class Officer":
      return `${TEXTURES_BASE}BP18-126EN.png`;
    case "Seeds of Salvation TOKEN":
      return `${TEXTURES_BASE}BP18-T01EN.png`;
    case "All-Access Search TOKEN":
      return `${TEXTURES_BASE}BP18-T02EN.png`;
    case "Adorn with Jewels TOKEN":
      return `${TEXTURES_BASE}BP18-T03EN.png`;
    case "Ginger's Curse TOKEN":
      return `${TEXTURES_BASE}BP18-T04EN.png`;
    case "Youthful Strike TOKEN":
      return `${TEXTURES_BASE}BP18-T05EN.png`;
    case "Adelle, Jealous Dragon TOKEN":
      return `${TEXTURES_BASE}BP18-T06EN.png`;
    case "Diurnal Slumber TOKEN":
      return `${TEXTURES_BASE}BP18-T07EN.png`;
    case "Righteous Conviction TOKEN":
      return `${TEXTURES_BASE}BP18-T08EN.png`;
    case "Totem of Madness TOKEN":
      return `${TEXTURES_BASE}BP18-T09EN.png`;
    case "Bansai Suzuki, Clone Technique TOKEN":
      return `${TEXTURES_BASE}BP18-T10EN.png`;
    case "Kokkoro":
      return `${TEXTURES_BASE}CP04-001EN.png`;
    case "Kokkoro Evolved":
      return `${TEXTURES_BASE}CP04-002EN.png`;
    case "Eris":
      return `${TEXTURES_BASE}CP04-003EN.png`;
    case "Nephi=Nela":
      return `${TEXTURES_BASE}CP04-004EN.png`;
    case "Shiori":
      return `${TEXTURES_BASE}CP04-005EN.png`;
    case "Shiori Evolved":
      return `${TEXTURES_BASE}CP04-006EN.png`;
    case "Anemone":
      return `${TEXTURES_BASE}CP04-007EN.png`;
    case "Makoto":
      return `${TEXTURES_BASE}CP04-008EN.png`;
    case "Rino":
      return `${TEXTURES_BASE}CP04-009EN.png`;
    case "Rino Evolved":
      return `${TEXTURES_BASE}CP04-010EN.png`;
    case "Kururu":
      return `${TEXTURES_BASE}CP04-011EN.png`;
    case "Nea":
      return `${TEXTURES_BASE}CP04-012EN.png`;
    case "Lima":
      return `${TEXTURES_BASE}CP04-013EN.png`;
    case "Lima Evolved":
      return `${TEXTURES_BASE}CP04-014EN.png`;
    case "Aoi":
      return `${TEXTURES_BASE}CP04-015EN.png`;
    case "Nebbia":
      return `${TEXTURES_BASE}CP04-016EN.png`;
    case "Suzuna":
      return `${TEXTURES_BASE}CP04-017EN.png`;
    case "Aurora Healing":
      return `${TEXTURES_BASE}CP04-018EN.png`;
    case "Pecorine":
      return `${TEXTURES_BASE}CP04-019EN.png`;
    case "Pecorine Evolved":
      return `${TEXTURES_BASE}CP04-020EN.png`;
    case "Christina":
      return `${TEXTURES_BASE}CP04-021EN.png`;
    case "Labyrista":
      return `${TEXTURES_BASE}CP04-022EN.png`;
    case "Jun":
      return `${TEXTURES_BASE}CP04-023EN.png`;
    case "Jun Evolved":
      return `${TEXTURES_BASE}CP04-024EN.png`;
    case "Riri":
      return `${TEXTURES_BASE}CP04-025EN.png`;
    case "Creditta":
      return `${TEXTURES_BASE}CP04-026EN.png`;
    case "Tomo":
      return `${TEXTURES_BASE}CP04-027EN.png`;
    case "Tomo Evolved":
      return `${TEXTURES_BASE}CP04-028EN.png`;
    case "Shizuru":
      return `${TEXTURES_BASE}CP04-029EN.png`;
    case "Ruka":
      return `${TEXTURES_BASE}CP04-030EN.png`;
    case "Tamaki":
      return `${TEXTURES_BASE}CP04-031EN.png`;
    case "Tamaki Evolved":
      return `${TEXTURES_BASE}CP04-032EN.png`;
    case "Mitsuki":
      return `${TEXTURES_BASE}CP04-033EN.png`;
    case "Matsuri":
      return `${TEXTURES_BASE}CP04-034EN.png`;
    case "Ninon":
      return `${TEXTURES_BASE}CP04-035EN.png`;
    case "Princess Strike":
      return `${TEXTURES_BASE}CP04-036EN.png`;
    case "Karyl":
      return `${TEXTURES_BASE}CP04-037EN.png`;
    case "Karyl Evolved":
      return `${TEXTURES_BASE}CP04-038EN.png`;
    case "Yuni":
      return `${TEXTURES_BASE}CP04-039EN.png`;
    case "Neneka":
      return `${TEXTURES_BASE}CP04-040EN.png`;
    case "Maho":
      return `${TEXTURES_BASE}CP04-041EN.png`;
    case "Maho Evolved":
      return `${TEXTURES_BASE}CP04-042EN.png`;
    case "Precia":
      return `${TEXTURES_BASE}CP04-043EN.png`;
    case "The Shared Illusion of Truth and Existence":
      return `${TEXTURES_BASE}CP04-044EN.png`;
    case "Kyoka":
      return `${TEXTURES_BASE}CP04-045EN.png`;
    case "Kyoka Evolved":
      return `${TEXTURES_BASE}CP04-046EN.png`;
    case "Chieru":
      return `${TEXTURES_BASE}CP04-047EN.png`;
    case "Chloe":
      return `${TEXTURES_BASE}CP04-048EN.png`;
    case "Yuki":
      return `${TEXTURES_BASE}CP04-049EN.png`;
    case "Yuki Evolved":
      return `${TEXTURES_BASE}CP04-050EN.png`;
    case "Hatsune":
      return `${TEXTURES_BASE}CP04-051EN.png`;
    case "Nanaka":
      return `${TEXTURES_BASE}CP04-052EN.png`;
    case "Cheru Cheru☆Carnival":
      return `${TEXTURES_BASE}CP04-053EN.png`;
    case "Dark Eclipse":
      return `${TEXTURES_BASE}CP04-054EN.png`;
    case "Sheffy":
      return `${TEXTURES_BASE}CP04-055EN.png`;
    case "Sheffy Evolved":
      return `${TEXTURES_BASE}CP04-056EN.png`;
    case "Homare":
      return `${TEXTURES_BASE}CP04-057EN.png`;
    case "Muimi":
      return `${TEXTURES_BASE}CP04-058EN.png`;
    case "Kaya":
      return `${TEXTURES_BASE}CP04-059EN.png`;
    case "Kaya Evolved":
      return `${TEXTURES_BASE}CP04-060EN.png`;
    case "Hiyori":
      return `${TEXTURES_BASE}CP04-061EN.png`;
    case "Inori":
      return `${TEXTURES_BASE}CP04-063EN.png`;
    case "Inori Evolved":
      return `${TEXTURES_BASE}CP04-064EN.png`;
    case "Lind":
      return `${TEXTURES_BASE}CP04-065EN.png`;
    case "Wyrm":
      return `${TEXTURES_BASE}CP04-066EN.png`;
    case "Mifuyu":
      return `${TEXTURES_BASE}CP04-067EN.png`;
    case "Mifuyu Evolved":
      return `${TEXTURES_BASE}CP04-068EN.png`;
    case "Kaori":
      return `${TEXTURES_BASE}CP04-069EN.png`;
    case "Ayane":
      return `${TEXTURES_BASE}CP04-070EN.png`;
    case "Dragon's End Fist":
      return `${TEXTURES_BASE}CP04-071EN.png`;
    case "Prank Declaration":
      return `${TEXTURES_BASE}CP04-072EN.png`;
    case "Illya":
      return `${TEXTURES_BASE}CP04-073EN.png`;
    case "Illya Evolved":
      return `${TEXTURES_BASE}CP04-074EN.png`;
    case "Ranpha":
      return `${TEXTURES_BASE}CP04-075EN.png`;
    case "Violet":
      return `${TEXTURES_BASE}CP04-076EN.png`;
    case "Shinobu":
      return `${TEXTURES_BASE}CP04-077EN.png`;
    case "Shinobu Evolved":
      return `${TEXTURES_BASE}CP04-078EN.png`;
    case "Grace":
      return `${TEXTURES_BASE}CP04-079EN.png`;
    case "Rei":
      return `${TEXTURES_BASE}CP04-080EN.png`;
    case "Yori":
      return `${TEXTURES_BASE}CP04-081EN.png`;
    case "Yori Evolved":
      return `${TEXTURES_BASE}CP04-082EN.png`;
    case "Akari":
      return `${TEXTURES_BASE}CP04-083EN.png`;
    case "Miyako":
      return `${TEXTURES_BASE}CP04-084EN.png`;
    case "Misaki":
      return `${TEXTURES_BASE}CP04-085EN.png`;
    case "Misaki Evolved":
      return `${TEXTURES_BASE}CP04-086EN.png`;
    case "Kuuka":
      return `${TEXTURES_BASE}CP04-087EN.png`;
    case "Io":
      return `${TEXTURES_BASE}CP04-088EN.png`;
    case "Eriko":
      return `${TEXTURES_BASE}CP04-089EN.png`;
    case "Infinite Break - Code: Null":
      return `${TEXTURES_BASE}CP04-090EN.png`;
    case "Saren":
      return `${TEXTURES_BASE}CP04-091EN.png`;
    case "Saren Evolved":
      return `${TEXTURES_BASE}CP04-092EN.png`;
    case "Nozomi":
      return `${TEXTURES_BASE}CP04-093EN.png`;
    case "Akino":
      return `${TEXTURES_BASE}CP04-094EN.png`;
    case "Yui":
      return `${TEXTURES_BASE}CP04-095EN.png`;
    case "Yui Evolved":
      return `${TEXTURES_BASE}CP04-096EN.png`;
    case "Quria":
      return `${TEXTURES_BASE}CP04-097EN.png`;
    case "Yukari":
      return `${TEXTURES_BASE}CP04-098EN.png`;
    case "Chika":
      return `${TEXTURES_BASE}CP04-099EN.png`;
    case "Chika Evolved":
      return `${TEXTURES_BASE}CP04-100EN.png`;
    case "Misato":
      return `${TEXTURES_BASE}CP04-101EN.png`;
    case "Capture String":
      return `${TEXTURES_BASE}CP04-102EN.png`;
    case "Mimi":
      return `${TEXTURES_BASE}CP04-103EN.png`;
    case "Mimi Evolved":
      return `${TEXTURES_BASE}CP04-104EN.png`;
    case "Suzume":
      return `${TEXTURES_BASE}CP04-105EN.png`;
    case "Mahiru":
      return `${TEXTURES_BASE}CP04-106EN.png`;
    case "Kurumi":
      return `${TEXTURES_BASE}CP04-107EN.png`;
    case "Donguri Charge":
      return `${TEXTURES_BASE}CP04-108EN.png`;
    case "Omniscient Kaiser":
      return `${TEXTURES_BASE}CP04-109EN.png`;
    case "Omniscient Kaiser Evolved":
      return `${TEXTURES_BASE}CP04-110EN.png`;
    case "Misora":
      return `${TEXTURES_BASE}CP04-111EN.png`;
    case "Lailael":
      return `${TEXTURES_BASE}CP04-112EN.png`;
    case "Ameth":
      return `${TEXTURES_BASE}CP04-115EN.png`;
    case "Ameth Evolved":
      return `${TEXTURES_BASE}CP04-116EN.png`;
    case "Croce":
      return `${TEXTURES_BASE}CP04-117EN.png`;
    case "Kasumi":
      return `${TEXTURES_BASE}CP04-118EN.png`;
    case "Kasumi Evolved":
      return `${TEXTURES_BASE}CP04-119EN.png`;
    case "Call of the Guild":
      return `${TEXTURES_BASE}CP04-120EN.png`;
    case "Ayumi":
      return `${TEXTURES_BASE}CP04-121EN.png`;
    case "Ames Amulet TOKEN":
      return `${TEXTURES_BASE}CP04-T01EN.png`;
    case "Princess Sword TOKEN":
      return `${TEXTURES_BASE}CP04-T02EN.png`;
    case "Holy Castle Sword, Avalon TOKEN":
      return `${TEXTURES_BASE}CP04-T03EN.png`;
    case "Queen's Console TOKEN":
      return `${TEXTURES_BASE}CP04-T04EN.png`;
    case "Neneka, Mirror Image TOKEN":
      return `${TEXTURES_BASE}CP04-T05EN.png`;
    case "Chaos Grimoire TOKEN":
      return `${TEXTURES_BASE}CP04-T06EN.png`;
    case "Wand of Mirage TOKEN":
      return `${TEXTURES_BASE}CP04-T07EN.png`;
    case "Ice Drachen TOKEN":
      return `${TEXTURES_BASE}CP04-T08EN.png`;
    case "Proof of Bonds TOKEN":
      return `${TEXTURES_BASE}CP04-T09EN.png`;
    case "Skullfather TOKEN":
      return `${TEXTURES_BASE}CP04-T10EN.png`;
    case "Dark Axe Nachtfang TOKEN":
      return `${TEXTURES_BASE}CP04-T11EN.png`;
    case "Glorious Feather TOKEN":
      return `${TEXTURES_BASE}CP04-T12EN.png`;
    case "Yuni, Chloe & Chieru":
      return `${TEXTURES_BASE}CP04-U06EN.png`;
    case "Ranpha & Misora":
      return `${TEXTURES_BASE}CP04-U10EN.png`;
    case "Nozomi, Chika & Tsumugi":
      return `${TEXTURES_BASE}CP04-U12EN.png`;
    case "Magachiyo, Barbed Convict":
      return `${TEXTURES_BASE}BP19-001EN.png`;
    case "Magachiyo, Barbed Convict Evolved":
      return `${TEXTURES_BASE}BP19-002EN.png`;
    case "Wimael, Redolent Enforcer":
      return `${TEXTURES_BASE}BP19-003EN.png`;
    case "Zwei, Symphonic Heart":
      return `${TEXTURES_BASE}BP19-004EN.png`;
    case "Verdant Lieutenant":
      return `${TEXTURES_BASE}BP19-005EN.png`;
    case "Verdant Lieutenant Evolved":
      return `${TEXTURES_BASE}BP19-006EN.png`;
    case "Warden of Balms":
      return `${TEXTURES_BASE}BP19-007EN.png`;
    case "Synchronous Hearts":
      return `${TEXTURES_BASE}BP19-008EN.png`;
    case "Budding Initiate":
      return `${TEXTURES_BASE}BP19-009EN.png`;
    case "Budding Initiate Evolved":
      return `${TEXTURES_BASE}BP19-010EN.png`;
    case "Leafshade Assassin":
      return `${TEXTURES_BASE}BP19-011EN.png`;
    case "Puppet Workout":
      return `${TEXTURES_BASE}BP19-012EN.png`;
    case "Beast Lancer":
      return `${TEXTURES_BASE}BP19-013EN.png`;
    case "Beast Lancer Evolved":
      return `${TEXTURES_BASE}BP19-014EN.png`;
    case "Merchant of the Wood":
      return `${TEXTURES_BASE}BP19-015EN.png`;
    case "Rogue Puppeteer":
      return `${TEXTURES_BASE}BP19-016EN.png`;
    case "Support Troop Elf":
      return `${TEXTURES_BASE}BP19-017EN.png`;
    case "Galepierce":
      return `${TEXTURES_BASE}BP19-018EN.png`;
    case "Barbaros, Briny Convict":
      return `${TEXTURES_BASE}BP19-019EN.png`;
    case "Barbaros, Briny Convict Evolved":
      return `${TEXTURES_BASE}BP19-020EN.png`;
    case "Radiel, Valorous Enforcer":
      return `${TEXTURES_BASE}BP19-021EN.png`;
    case "Gildaria, Anathema of Peace":
      return `${TEXTURES_BASE}BP19-022EN.png`;
    case "Gildaria, Anathema of Peace Evolved":
      return `${TEXTURES_BASE}BP19-023EN.png`;
    case "Warden of Honor":
      return `${TEXTURES_BASE}BP19-024EN.png`;
    case "Warden of Honor Evolved":
      return `${TEXTURES_BASE}BP19-025EN.png`;
    case "Tidal Gunner":
      return `${TEXTURES_BASE}BP19-026EN.png`;
    case "Prim, Princess's Picnic":
      return `${TEXTURES_BASE}BP19-027EN.png`;
    case "Storm-Wracked First Mate":
      return `${TEXTURES_BASE}BP19-028EN.png`;
    case "Storm-Wracked First Mate Evolved":
      return `${TEXTURES_BASE}BP19-029EN.png`;
    case "Deep-Sea Scout":
      return `${TEXTURES_BASE}BP19-030EN.png`;
    case "Return from the Brink":
      return `${TEXTURES_BASE}BP19-031EN.png`;
    case "Felpurr Maid":
      return `${TEXTURES_BASE}BP19-032EN.png`;
    case "Felpurr Maid Evolved":
      return `${TEXTURES_BASE}BP19-033EN.png`;
    case "Knightly Thief":
      return `${TEXTURES_BASE}BP19-034EN.png`;
    case "Heavy Warrior":
      return `${TEXTURES_BASE}BP19-035EN.png`;
    case "Ninja Onslaught":
      return `${TEXTURES_BASE}BP19-036EN.png`;
    case "Cannon Volley":
      return `${TEXTURES_BASE}BP19-037EN.png`;
    case "Sephie, Depraved Convict":
      return `${TEXTURES_BASE}BP19-038EN.png`;
    case "Sephie, Depraved Convict Evolved":
      return `${TEXTURES_BASE}BP19-039EN.png`;
    case "Simael, Cleansing Enforcer":
      return `${TEXTURES_BASE}BP19-040EN.png`;
    case "Kyrzael, Killshot Enforcer":
      return `${TEXTURES_BASE}BP19-041EN.png`;
    case "Obsessive Scholar":
      return `${TEXTURES_BASE}BP19-042EN.png`;
    case "Obsessive Scholar Evolved":
      return `${TEXTURES_BASE}BP19-043EN.png`;
    case "Warden of the Trigger":
      return `${TEXTURES_BASE}BP19-044EN.png`;
    case "Warden of the Arcane":
      return `${TEXTURES_BASE}BP19-045EN.png`;
    case "Devoted Researcher":
      return `${TEXTURES_BASE}BP19-046EN.png`;
    case "Devoted Researcher Evolved":
      return `${TEXTURES_BASE}BP19-047EN.png`;
    case "Volunteer Test Subject":
      return `${TEXTURES_BASE}BP19-048EN.png`;
    case "Astral Dancer":
      return `${TEXTURES_BASE}BP19-049EN.png`;
    case "Electrokitty":
      return `${TEXTURES_BASE}BP19-050EN.png`;
    case "Electrokitty Evolved":
      return `${TEXTURES_BASE}BP19-051EN.png`;
    case "Outdoorsmage":
      return `${TEXTURES_BASE}BP19-052EN.png`;
    case "Ultramarine Witch":
      return `${TEXTURES_BASE}BP19-053EN.png`;
    case "Feline Magic":
      return `${TEXTURES_BASE}BP19-054EN.png`;
    case "Meandering Bolt":
      return `${TEXTURES_BASE}BP19-055EN.png`;
    case "Antemaria, Huntress Convict":
      return `${TEXTURES_BASE}BP19-056EN.png`;
    case "Drazael, Ravening Enforcer":
      return `${TEXTURES_BASE}BP19-057EN.png`;
    case "Drazael, Ravening Enforcer Evolved":
      return `${TEXTURES_BASE}BP19-058EN.png`;
    case "Masamune, One-Eyed Dragon":
      return `${TEXTURES_BASE}BP19-059EN.png`;
    case "Scorched-Earth Tyrant":
      return `${TEXTURES_BASE}BP19-060EN.png`;
    case "Scorched-Earth Tyrant Evolved":
      return `${TEXTURES_BASE}BP19-061EN.png`;
    case "Neptune, Arbiter of Tides":
      return `${TEXTURES_BASE}BP19-062EN.png`;
    case "Warden of the Adamant Claw":
      return `${TEXTURES_BASE}BP19-063EN.png`;
    case "Hotheaded Marauder":
      return `${TEXTURES_BASE}BP19-064EN.png`;
    case "Hotheaded Marauder Evolved":
      return `${TEXTURES_BASE}BP19-065EN.png`;
    case "Razor-Clawed Thief":
      return `${TEXTURES_BASE}BP19-066EN.png`;
    case "Seasoned Merman":
      return `${TEXTURES_BASE}BP19-067EN.png`;
    case "Dancing Crab":
      return `${TEXTURES_BASE}BP19-068EN.png`;
    case "Dancing Crab Evolved":
      return `${TEXTURES_BASE}BP19-069EN.png`;
    case "Mermaid Songstress":
      return `${TEXTURES_BASE}BP19-070EN.png`;
    case "Dark Mermaid":
      return `${TEXTURES_BASE}BP19-071EN.png`;
    case "Dragonewt's Might":
      return `${TEXTURES_BASE}BP19-072EN.png`;
    case "Call of the Megalorca":
      return `${TEXTURES_BASE}BP19-073EN.png`;
    case "Istyndet, Soul Convict":
      return `${TEXTURES_BASE}BP19-074EN.png`;
    case "Garodeth, Insurgent Convict":
      return `${TEXTURES_BASE}BP19-075EN.png`;
    case "Garodeth, Insurgent Convict Evolved":
      return `${TEXTURES_BASE}BP19-076EN.png`;
    case "Zeronua, Demon of Domination":
      return `${TEXTURES_BASE}BP19-077EN.png`;
    case "Abyssal Colonel":
      return `${TEXTURES_BASE}BP19-078EN.png`;
    case "Abyssal Colonel Evolved":
      return `${TEXTURES_BASE}BP19-079EN.png`;
    case "Myroel, Death Enforcer":
      return `${TEXTURES_BASE}BP19-080EN.png`;
    case "Genomuel, Wyrm Enforcer":
      return `${TEXTURES_BASE}BP19-081EN.png`;
    case "Underworld Lieutenant":
      return `${TEXTURES_BASE}BP19-082EN.png`;
    case "Underworld Lieutenant Evolved":
      return `${TEXTURES_BASE}BP19-083EN.png`;
    case "Warden of Corpses":
      return `${TEXTURES_BASE}BP19-084EN.png`;
    case "Raging Commander":
      return `${TEXTURES_BASE}BP19-085EN.png`;
    case "Vicious Blitzer":
      return `${TEXTURES_BASE}BP19-086EN.png`;
    case "Vicious Blitzer Evolved":
      return `${TEXTURES_BASE}BP19-087EN.png`;
    case "Fallen Sergeant":
      return `${TEXTURES_BASE}BP19-088EN.png`;
    case "Steamrolling Tank":
      return `${TEXTURES_BASE}BP19-089EN.png`;
    case "Howling Scream":
      return `${TEXTURES_BASE}BP19-090EN.png`;
    case "Prison of Pain":
      return `${TEXTURES_BASE}BP19-091EN.png`;
    case "Erralde, Troth Convict":
      return `${TEXTURES_BASE}BP19-092EN.png`;
    case "Uneriel, Winged Enforcer":
      return `${TEXTURES_BASE}BP19-093EN.png`;
    case "Uneriel, Winged Enforcer Evolved":
      return `${TEXTURES_BASE}BP19-094EN.png`;
    case "Zoe, Queen of Hope":
      return `${TEXTURES_BASE}BP19-095EN.png`;
    case "Warden of the Wings":
      return `${TEXTURES_BASE}BP19-096EN.png`;
    case "Warden of the Wings Evolved":
      return `${TEXTURES_BASE}BP19-097EN.png`;
    case "Executor of the Oath":
      return `${TEXTURES_BASE}BP19-098EN.png`;
    case "Meus Gourmand":
      return `${TEXTURES_BASE}BP19-099EN.png`;
    case "Agent of the Commandments":
      return `${TEXTURES_BASE}BP19-100EN.png`;
    case "Agent of the Commandments Evolved":
      return `${TEXTURES_BASE}BP19-101EN.png`;
    case "Follower of the Precepts":
      return `${TEXTURES_BASE}BP19-102EN.png`;
    case "Sacrosanct Temple":
      return `${TEXTURES_BASE}BP19-103EN.png`;
    case "Sacred Tiger":
      return `${TEXTURES_BASE}BP19-104EN.png`;
    case "Sacred Tiger Evolved":
      return `${TEXTURES_BASE}BP19-105EN.png`;
    case "Avaricious Altruist":
      return `${TEXTURES_BASE}BP19-106EN.png`;
    case "Sword Al-mi'raj":
      return `${TEXTURES_BASE}BP19-107EN.png`;
    case "Luminescent Gem":
      return `${TEXTURES_BASE}BP19-108EN.png`;
    case "Holybeast Ruins":
      return `${TEXTURES_BASE}BP19-109EN.png`;
    case "Cutthroat, Discord Convict":
      return `${TEXTURES_BASE}BP19-110EN.png`;
    case "Cutthroat, Discord Convict Evolved":
      return `${TEXTURES_BASE}BP19-111EN.png`;
    case "Eudie, Maiden Reborn":
      return `${TEXTURES_BASE}BP19-112EN.png`;
    case "Zerael, Regent of Rebirth":
      return `${TEXTURES_BASE}BP19-113EN.png`;
    case "Zerael, Regent of Vicissitude ADVANCED":
      return `${TEXTURES_BASE}BP19-114EN.png`;
    case "Ironforged Right Hand":
      return `${TEXTURES_BASE}BP19-115EN.png`;
    case "Azvaldt":
      return `${TEXTURES_BASE}BP19-116EN.png`;
    case "Smeltwork Bodyguard":
      return `${TEXTURES_BASE}BP19-117EN.png`;
    case "Smeltwork Bodyguard Evolved":
      return `${TEXTURES_BASE}BP19-118EN.png`;
    case "Warden of Recurrence":
      return `${TEXTURES_BASE}BP19-119EN.png`;
    case "Blackrust Underling":
      return `${TEXTURES_BASE}BP19-120EN.png`;
    case "Dread Pirate's Flag TOKEN":
      return `${TEXTURES_BASE}BP19-T01EN.png`;
    case "Multi-Headed Test Subject TOKEN":
      return `${TEXTURES_BASE}BP19-T02EN.png`;
    case "Izudia, Annihilation Manifest":
      return `${TEXTURES_BASE}BP20-001EN.png`;
    case "Krulle, Heir to Unkilling":
      return `${TEXTURES_BASE}BP20-002EN.png`;
    case "Krulle, Heir to Unkilling Evolved":
      return `${TEXTURES_BASE}BP20-003EN.png`;
    case "Plumeria, Serene Goddess":
      return `${TEXTURES_BASE}BP20-004EN.png`;
    case "Windbloom Sylph":
      return `${TEXTURES_BASE}BP20-005EN.png`;
    case "Windbloom Sylph Evolved":
      return `${TEXTURES_BASE}BP20-006EN.png`;
    case "Congregrant of Unkilling":
      return `${TEXTURES_BASE}BP20-007EN.png`;
    case "Eradicating Arrow":
      return `${TEXTURES_BASE}BP20-008EN.png`;
    case "Supplicant of Unkilling":
      return `${TEXTURES_BASE}BP20-009EN.png`;
    case "Supplicant of Unkilling Evolved":
      return `${TEXTURES_BASE}BP20-010EN.png`;
    case "Greatwood Warrior":
      return `${TEXTURES_BASE}BP20-011EN.png`;
    case "Hamlet of Unkilling":
      return `${TEXTURES_BASE}BP20-012EN.png`;
    case "Bearer of the Fairy Blade":
      return `${TEXTURES_BASE}BP20-013EN.png`;
    case "Bearer of the Fairy Blade Evolved":
      return `${TEXTURES_BASE}BP20-014EN.png`;
    case "Devotee of Unkilling":
      return `${TEXTURES_BASE}BP20-015EN.png`;
    case "Ageless Bystander":
      return `${TEXTURES_BASE}BP20-016EN.png`;
    case "Cutie Cat":
      return `${TEXTURES_BASE}BP20-017EN.png`;
    case "Bestial Swipe":
      return `${TEXTURES_BASE}BP20-018EN.png`;
    case "Octrice, Hollowness Manifest":
      return `${TEXTURES_BASE}BP20-019EN.png`;
    case "Sinciro, Heir to Usurpation":
      return `${TEXTURES_BASE}BP20-020EN.png`;
    case "Sinciro, Heir to Usurpation Evolved":
      return `${TEXTURES_BASE}BP20-021EN.png`;
    case "Aurelia, Glorious Saber":
      return `${TEXTURES_BASE}BP20-022EN.png`;
    case "Congregant of Usurpation":
      return `${TEXTURES_BASE}BP20-023EN.png`;
    case "Congregant of Usurpation Evolved":
      return `${TEXTURES_BASE}BP20-024EN.png`;
    case "Fearful Fighter":
      return `${TEXTURES_BASE}BP20-025EN.png`;
    case "Returning Slash":
      return `${TEXTURES_BASE}BP20-026EN.png`;
    case "Peppy Scout":
      return `${TEXTURES_BASE}BP20-027EN.png`;
    case "Peppy Scout Evolved":
      return `${TEXTURES_BASE}BP20-028EN.png`;
    case "Supplicant of Usurpation":
      return `${TEXTURES_BASE}BP20-029EN.png`;
    case "Lair of Usurpation":
      return `${TEXTURES_BASE}BP20-030EN.png`;
    case "Comrade of the Swordmaster":
      return `${TEXTURES_BASE}BP20-031EN.png`;
    case "Comrade of the Swordmaster Evolved":
      return `${TEXTURES_BASE}BP20-032EN.png`;
    case "Devotee of Usurpation":
      return `${TEXTURES_BASE}BP20-033EN.png`;
    case "Mercurial Mercenary":
      return `${TEXTURES_BASE}BP20-034EN.png`;
    case "Palace Knight":
      return `${TEXTURES_BASE}BP20-035EN.png`;
    case "Shield Bash":
      return `${TEXTURES_BASE}BP20-036EN.png`;
    case "Lishenna, Melody Manifest":
      return `${TEXTURES_BASE}BP20-037EN.png`;
    case "Velharia, Heir to Truth":
      return `${TEXTURES_BASE}BP20-038EN.png`;
    case "Velharia, Heir to Truth Evolved":
      return `${TEXTURES_BASE}BP20-039EN.png`;
    case "Axia, Heir to Destruction":
      return `${TEXTURES_BASE}BP20-040EN.png`;
    case "Axia, Heir to Destruction Evolved":
      return `${TEXTURES_BASE}BP20-041EN.png`;
    case "Raio, Elimination Manifest":
      return `${TEXTURES_BASE}BP20-042EN.png`;
    case "Raio, Elimination Manifest Evolved":
      return `${TEXTURES_BASE}BP20-043EN.png`;
    case "Congregant of Destruction":
      return `${TEXTURES_BASE}BP20-044EN.png`;
    case "Devastating Soprano":
      return `${TEXTURES_BASE}BP20-045EN.png`;
    case "Congregant of Truth":
      return `${TEXTURES_BASE}BP20-046EN.png`;
    case "Congregant of Truth Evolved":
      return `${TEXTURES_BASE}BP20-047EN.png`;
    case "Supplicant of Destruction":
      return `${TEXTURES_BASE}BP20-048EN.png`;
    case "Illusory Conjuration":
      return `${TEXTURES_BASE}BP20-049EN.png`;
    case "Devotee of Destruction":
      return `${TEXTURES_BASE}BP20-050EN.png`;
    case "Devotee of Destruction Evolved":
      return `${TEXTURES_BASE}BP20-051EN.png`;
    case "Supplicant of Truth":
      return `${TEXTURES_BASE}BP20-052EN.png`;
    case "Devotee of Truth":
      return `${TEXTURES_BASE}BP20-053EN.png`;
    case "Ascetic of Wuxing":
      return `${TEXTURES_BASE}BP20-054EN.png`;
    case "Wasteland of Destruction":
      return `${TEXTURES_BASE}BP20-055EN.png`;
    case "Galmieux, Ardor Manifest":
      return `${TEXTURES_BASE}BP20-056EN.png`;
    case "Azurifrit, Heir to Disdain":
      return `${TEXTURES_BASE}BP20-057EN.png`;
    case "Azurifrit, Heir to Disdain Evolved":
      return `${TEXTURES_BASE}BP20-058EN.png`;
    case "Dagon, Lord of the Seas":
      return `${TEXTURES_BASE}BP20-059EN.png`;
    case "Spoiled Mermanager":
      return `${TEXTURES_BASE}BP20-060EN.png`;
    case "Spoiled Mermanager Evolved":
      return `${TEXTURES_BASE}BP20-061EN.png`;
    case "Congregant of Disdain":
      return `${TEXTURES_BASE}BP20-062EN.png`;
    case "Ferocious Flame":
      return `${TEXTURES_BASE}BP20-063EN.png`;
    case "Supplicant of Disdain":
      return `${TEXTURES_BASE}BP20-064EN.png`;
    case "Supplicant of Disdain Evolved":
      return `${TEXTURES_BASE}BP20-065EN.png`;
    case "Encounter from the Deep":
      return `${TEXTURES_BASE}BP20-066EN.png`;
    case "Nation of Disdain":
      return `${TEXTURES_BASE}BP20-067EN.png`;
    case "Snowstorm Dragonewt":
      return `${TEXTURES_BASE}BP20-068EN.png`;
    case "Snowstorm Dragonewt Evolved":
      return `${TEXTURES_BASE}BP20-069EN.png`;
    case "Devotee of Disdain":
      return `${TEXTURES_BASE}BP20-070EN.png`;
    case "Militant Mermaid":
      return `${TEXTURES_BASE}BP20-071EN.png`;
    case "Ocean Rider":
      return `${TEXTURES_BASE}BP20-072EN.png`;
    case "Raging Lightning":
      return `${TEXTURES_BASE}BP20-073EN.png`;
    case "Rulenye & Valnareik":
      return `${TEXTURES_BASE}BP20-074EN.png`;
    case "Rulenye & Valnareik Evolved":
      return `${TEXTURES_BASE}BP20-075EN.png`;
    case "Sham-Nacha, Heir to Entwining":
      return `${TEXTURES_BASE}BP20-076EN.png`;
    case "Sham-Nacha, Heir to Entwining Evolved":
      return `${TEXTURES_BASE}BP20-077EN.png`;
    case "Diabolus Hedone":
      return `${TEXTURES_BASE}BP20-078EN.png`;
    case "Congregant of Entwining":
      return `${TEXTURES_BASE}BP20-079EN.png`;
    case "Congregant of Entwining Evolved":
      return `${TEXTURES_BASE}BP20-080EN.png`;
    case "Hervör":
      return `${TEXTURES_BASE}BP20-081EN.png`;
    case "Screaming and Loathing":
      return `${TEXTURES_BASE}BP20-082EN.png`;
    case "Spirited Gravekeeper":
      return `${TEXTURES_BASE}BP20-083EN.png`;
    case "Spirited Gravekeeper Evolved":
      return `${TEXTURES_BASE}BP20-084EN.png`;
    case "Supplicant of Entwining":
      return `${TEXTURES_BASE}BP20-085EN.png`;
    case "Castle of Entwining":
      return `${TEXTURES_BASE}BP20-086EN.png`;
    case "Ephemeral Demon Princess":
      return `${TEXTURES_BASE}BP20-087EN.png`;
    case "Ephemeral Demon Princess Evolved":
      return `${TEXTURES_BASE}BP20-088EN.png`;
    case "Devotee of Entwining":
      return `${TEXTURES_BASE}BP20-089EN.png`;
    case "Wicked Collector":
      return `${TEXTURES_BASE}BP20-090EN.png`;
    case "Nemean Lion":
      return `${TEXTURES_BASE}BP20-091EN.png`;
    case "March of the Brutes":
      return `${TEXTURES_BASE}BP20-092EN.png`;
    case "Marwynn, Despair Manifest":
      return `${TEXTURES_BASE}BP20-093EN.png`;
    case "Himeka, Heir to Repose":
      return `${TEXTURES_BASE}BP20-094EN.png`;
    case "Himeka, Heir to Repose Evolved":
      return `${TEXTURES_BASE}BP20-095EN.png`;
    case "Holy Serpent's Blessing":
      return `${TEXTURES_BASE}BP20-096EN.png`;
    case "Congregant of Repose":
      return `${TEXTURES_BASE}BP20-097EN.png`;
    case "Congregant of Repose Evolved":
      return `${TEXTURES_BASE}BP20-098EN.png`;
    case "Sacred Sheep":
      return `${TEXTURES_BASE}BP20-099EN.png`;
    case "Shining Disenchantment":
      return `${TEXTURES_BASE}BP20-100EN.png`;
    case "Supplicant of Repose":
      return `${TEXTURES_BASE}BP20-101EN.png`;
    case "Supplicant of Repose Evolved":
      return `${TEXTURES_BASE}BP20-102EN.png`;
    case "Temple of Repose":
      return `${TEXTURES_BASE}BP20-103EN.png`;
    case "Winged Lion Statue":
      return `${TEXTURES_BASE}BP20-104EN.png`;
    case "Knight of the Holy Order":
      return `${TEXTURES_BASE}BP20-105EN.png`;
    case "Knight of the Holy Order Evolved":
      return `${TEXTURES_BASE}BP20-106EN.png`;
    case "Devotee of Repose":
      return `${TEXTURES_BASE}BP20-107EN.png`;
    case "Featherfolk Courier":
      return `${TEXTURES_BASE}BP20-108EN.png`;
    case "Peckish Al-mi'raj":
      return `${TEXTURES_BASE}BP20-109EN.png`;
    case "Blinding Faith":
      return `${TEXTURES_BASE}BP20-110EN.png`;
    case "Mjerrabaine, Great Manifest":
      return `${TEXTURES_BASE}BP20-111EN.png`;
    case "Mjerrabaine, Great Manifest Evolved":
      return `${TEXTURES_BASE}BP20-112EN.png`;
    case "Gilnelise, Voracity Manifest":
      return `${TEXTURES_BASE}BP20-113EN.png`;
    case "Dogged One":
      return `${TEXTURES_BASE}BP20-114EN.png`;
    case "Dogged One Evolved":
      return `${TEXTURES_BASE}BP20-115EN.png`;
    case "Inspirational One":
      return `${TEXTURES_BASE}BP20-116EN.png`;
    case "Tablet of Tribulations":
      return `${TEXTURES_BASE}BP20-117EN.png`;
    case "Apostle of Voracity":
      return `${TEXTURES_BASE}BP20-118EN.png`;
    case "Apostle of Voracity Evolved":
      return `${TEXTURES_BASE}BP20-119EN.png`;
    case "Greatness Ascended":
      return `${TEXTURES_BASE}BP20-120EN.png`;
    case "Crest: Krulle, Heir to Unkilling TOKEN":
      return `${TEXTURES_BASE}BP20-T01EN.png`;
    case "Crest: Octrice, Hollowness Manifest TOKEN":
      return `${TEXTURES_BASE}BP20-T02EN.png`;
    case "White Psalm, New Revelation TOKEN":
      return `${TEXTURES_BASE}BP20-T03EN.png`;
    case "Black Psalm, New Revelation TOKEN":
      return `${TEXTURES_BASE}BP20-T04EN.png`;
    case "Crest: Galmieux, Ardor Manifest TOKEN":
      return `${TEXTURES_BASE}BP20-T05EN.png`;
    case "Crest: Sham-Nacha, Heir to Entwining TOKEN":
      return `${TEXTURES_BASE}BP20-T06EN.png`;
    case "Crest: Marwynn, Despair Manifest TOKEN":
      return `${TEXTURES_BASE}BP20-T07EN.png`;
    case "Crest: Himeka, Heir to Repose TOKEN":
      return `${TEXTURES_BASE}BP20-T08EN.png`;
    case "Crest: Congregant of Repose TOKEN":
      return `${TEXTURES_BASE}BP20-T09EN.png`;
    case "Crest: Supplicant of Repose TOKEN":
      return `${TEXTURES_BASE}BP20-T10EN.png`;
    case "Crest: Mjerrabaine, Great Manifest TOKEN":
      return `${TEXTURES_BASE}BP20-T11EN.png`;
    case "Rulenye, Echoing Scream TOKEN":
      return `${TEXTURES_BASE}EBD03-T03EN.png`;
    case "Princess Knight":
      return `${TEXTURES_BASE}CP04-113EN.png`;
    case "Princess Knight Evolved":
      return `${TEXTURES_BASE}CP04-114EN.png`;
    case "miroir":
      return `${TEXTURES_BASE}CP02-SP04aEN.png`;
    case "Kyoko Igarashi [Love Letter] TOKEN":
      return `${TEXTURES_BASE}ECP02-T01EN.png`;
    case "Shiki Ichinose [Tsubomi] TOKEN":
      return `${TEXTURES_BASE}ECP02-T02EN.png`;
    case "Sachiko Koshimizu [Lunatic Show] TOKEN":
      return `${TEXTURES_BASE}ECP02-T03EN.png`;
    case "Kaede Takagaki [Nation Blue] TOKEN":
      return `${TEXTURES_BASE}ECP02-T04EN.png`;
    case "Riina Tada [Eight-Beat Rocker] TOKEN":
      return `${TEXTURES_BASE}ECP02-T05EN.png`;
    case "Sae Kobayakawa [Pastel Pink Love] TOKEN":
      return `${TEXTURES_BASE}ECP02-T06EN.png`;
    case "Ranko Kanzaki [Nation Blue] TOKEN":
      return `${TEXTURES_BASE}ECP02-T07EN.png`;
    case "Shin Sato [Gutsy☆Reporter] TOKEN":
      return `${TEXTURES_BASE}ECP02-T08EN.png`;
    case "Akari Tsujino [Brand New!] TOKEN":
      return `${TEXTURES_BASE}ECP02-T09EN.png`;
    case "Asuka Ninomiya [Saite Jewel] TOKEN":
      return `${TEXTURES_BASE}ECP02-T10EN.png`;
    case "Yoshino Yorita [Warrior's Path] TOKEN":
      return `${TEXTURES_BASE}ECP02-T11EN.png`;
    case "Chie Sasaki [Step to Mirai] TOKEN":
      return `${TEXTURES_BASE}ECP02-T12EN.png`;
    case "Arisu Tachibana [Ikenai GO AHEAD] TOKEN":
      return `${TEXTURES_BASE}ECP02-T13EN.png`;
    case "Yukimi Sajo [Hands and Days Together] TOKEN":
      return `${TEXTURES_BASE}ECP02-T14EN.png`;
    case "Castelle, Budding Mage":
      return `${TEXTURES_BASE}BP21-001EN.png`;
    case "Lyelth, Immaculate Idol":
      return `${TEXTURES_BASE}BP21-002EN.png`;
    case "Lyelth, Immaculate Idol Evolved":
      return `${TEXTURES_BASE}BP21-003EN.png`;
    case "Titania, Queen of Fairies":
      return `${TEXTURES_BASE}BP21-004EN.png`;
    case "Cleaver Cat":
      return `${TEXTURES_BASE}BP21-005EN.png`;
    case "Cleaver Cat Evolved":
      return `${TEXTURES_BASE}BP21-006EN.png`;
    case "Cynthia, Chivalrous Elf":
      return `${TEXTURES_BASE}BP21-007EN.png`;
    case "Dwarven Lumberjack":
      return `${TEXTURES_BASE}BP21-008EN.png`;
    case "Elven Farmhand":
      return `${TEXTURES_BASE}BP21-009EN.png`;
    case "Elven Farmhand Evolved":
      return `${TEXTURES_BASE}BP21-010EN.png`;
    case "Fauna Handler":
      return `${TEXTURES_BASE}BP21-011EN.png`;
    case "Fairy Funfact":
      return `${TEXTURES_BASE}BP21-012EN.png`;
    case "Bladebunny":
      return `${TEXTURES_BASE}BP21-013EN.png`;
    case "Bladebunny Evolved":
      return `${TEXTURES_BASE}BP21-014EN.png`;
    case "Vanguard Tigress":
      return `${TEXTURES_BASE}BP21-015EN.png`;
    case "Flying Mistletoe Squirrel":
      return `${TEXTURES_BASE}BP21-016EN.png`;
    case "Spiritelementalist":
      return `${TEXTURES_BASE}BP21-017EN.png`;
    case "Wild Profusion":
      return `${TEXTURES_BASE}BP21-018EN.png`;
    case "Lecia & Nano, Twilight Trainees":
      return `${TEXTURES_BASE}BP21-019EN.png`;
    case "Galdr, Heroic Headmaster":
      return `${TEXTURES_BASE}BP21-020EN.png`;
    case "Galdr, Heroic Headmaster Evolved":
      return `${TEXTURES_BASE}BP21-021EN.png`;
    case "Yurius, Levin Authority":
      return `${TEXTURES_BASE}BP21-022EN.png`;
    case "Agile Twinblader":
      return `${TEXTURES_BASE}BP21-023EN.png`;
    case "Agile Twinblader Evolved":
      return `${TEXTURES_BASE}BP21-024EN.png`;
    case "Weiss, Discerning Professor":
      return `${TEXTURES_BASE}BP21-025EN.png`;
    case "Twilight and Silver":
      return `${TEXTURES_BASE}BP21-026EN.png`;
    case "Tony, Plucky Polliwog":
      return `${TEXTURES_BASE}BP21-027EN.png`;
    case "Tony, Plucky Polliwog Evolved":
      return `${TEXTURES_BASE}BP21-028EN.png`;
    case "Deadeye Trainee":
      return `${TEXTURES_BASE}BP21-029EN.png`;
    case "Sharp Strategist":
      return `${TEXTURES_BASE}BP21-030EN.png`;
    case "Kitty Sergeant":
      return `${TEXTURES_BASE}BP21-031EN.png`;
    case "Kitty Sergeant Evolved":
      return `${TEXTURES_BASE}BP21-032EN.png`;
    case "Fervent Fist-Fighter":
      return `${TEXTURES_BASE}BP21-033EN.png`;
    case "Levin Archer":
      return `${TEXTURES_BASE}BP21-034EN.png`;
    case "Aggressive Advance":
      return `${TEXTURES_BASE}BP21-035EN.png`;
    case "Lieutenant's Report":
      return `${TEXTURES_BASE}BP21-036EN.png`;
    case "Amaryllis, the Princess":
      return `${TEXTURES_BASE}BP21-037EN.png`;
    case "Anne, Brilliant Mage":
      return `${TEXTURES_BASE}BP21-038EN.png`;
    case "Anne, Brilliant Mage Evolved":
      return `${TEXTURES_BASE}BP21-039EN.png`;
    case "Ceridwen, Eternal Duality":
      return `${TEXTURES_BASE}BP21-040EN.png`;
    case "Grea, Crimson Promise":
      return `${TEXTURES_BASE}BP21-041EN.png`;
    case "Grea, Crimson Promise Evolved":
      return `${TEXTURES_BASE}BP21-042EN.png`;
    case "Mysterian Exchange Party":
      return `${TEXTURES_BASE}BP21-043EN.png`;
    case "Mystic Rune":
      return `${TEXTURES_BASE}BP21-044EN.png`;
    case "Gruinne, Leonardian Provost":
      return `${TEXTURES_BASE}BP21-045EN.png`;
    case "Gruinne, Leonardian Provost Evolved":
      return `${TEXTURES_BASE}BP21-046EN.png`;
    case "Leeds, Pining Witch":
      return `${TEXTURES_BASE}BP21-047EN.png`;
    case "Bell Witch":
      return `${TEXTURES_BASE}BP21-048EN.png`;
    case "Wolf Whisperer":
      return `${TEXTURES_BASE}BP21-049EN.png`;
    case "Wolf Whisperer Evolved":
      return `${TEXTURES_BASE}BP21-050EN.png`;
    case "Evamia, Spinner of Threads":
      return `${TEXTURES_BASE}BP21-051EN.png`;
    case "Arcane Instruction":
      return `${TEXTURES_BASE}BP21-052EN.png`;
    case "Aqueous Sphere":
      return `${TEXTURES_BASE}BP21-053EN.png`;
    case "Binding Ritual":
      return `${TEXTURES_BASE}BP21-054EN.png`;
    case "Lilium, the Wyrmwitch":
      return `${TEXTURES_BASE}BP21-055EN.png`;
    case "Lilium, the Witchwyrm Evolved":
      return `${TEXTURES_BASE}BP21-056EN.png`;
    case "Coach Joe, Fiery Counselor":
      return `${TEXTURES_BASE}BP21-057EN.png`;
    case "Lumiore, Prestigious Gold":
      return `${TEXTURES_BASE}BP21-058EN.png`;
    case "Grand Slam Tamer":
      return `${TEXTURES_BASE}BP21-059EN.png`;
    case "Grand Slam Tamer Evolved":
      return `${TEXTURES_BASE}BP21-060EN.png`;
    case "Dion, Scarlet Scion":
      return `${TEXTURES_BASE}BP21-061EN.png`;
    case "Argente, Purest Silver":
      return `${TEXTURES_BASE}BP21-062EN.png`;
    case "Dragonborn Striker":
      return `${TEXTURES_BASE}BP21-063EN.png`;
    case "Dragonborn Striker Evolved":
      return `${TEXTURES_BASE}BP21-064EN.png`;
    case "Gunbein, Lofty Dragonewt":
      return `${TEXTURES_BASE}BP21-065EN.png`;
    case "Charlotte, Dragonewt":
      return `${TEXTURES_BASE}BP21-066EN.png`;
    case "Ipupiara":
      return `${TEXTURES_BASE}BP21-067EN.png`;
    case "Ipupiara Evolved":
      return `${TEXTURES_BASE}BP21-068EN.png`;
    case "Megalorca Rider":
      return `${TEXTURES_BASE}BP21-069EN.png`;
    case "Augite Wyrm":
      return `${TEXTURES_BASE}BP21-070EN.png`;
    case "Stormscale":
      return `${TEXTURES_BASE}BP21-071EN.png`;
    case "Dragon Hunt":
      return `${TEXTURES_BASE}BP21-072EN.png`;
    case "Cornelius, the Corpse King":
      return `${TEXTURES_BASE}BP21-073EN.png`;
    case "Cornelius, the Corpse King Evolved":
      return `${TEXTURES_BASE}BP21-074EN.png`;
    case "Galom, Empress Fist":
      return `${TEXTURES_BASE}BP21-075EN.png`;
    case "Vulgus, Infernal Headmistress":
      return `${TEXTURES_BASE}BP21-076EN.png`;
    case "Arka, Sin Spinner":
      return `${TEXTURES_BASE}BP21-077EN.png`;
    case "Arka, Sin Spinner Evolved":
      return `${TEXTURES_BASE}BP21-078EN.png`;
    case "Exella, Nocturnal General":
      return `${TEXTURES_BASE}BP21-079EN.png`;
    case "Bad-Girl Life":
      return `${TEXTURES_BASE}BP21-080EN.png`;
    case "Mach-Speed Maron":
      return `${TEXTURES_BASE}BP21-081EN.png`;
    case "Mach-Speed Maron Evolved":
      return `${TEXTURES_BASE}BP21-082EN.png`;
    case "Demon-Eyed Gangster":
      return `${TEXTURES_BASE}BP21-083EN.png`;
    case "Noble Demoness":
      return `${TEXTURES_BASE}BP21-084EN.png`;
    case "Bonebreaker Bladesman":
      return `${TEXTURES_BASE}BP21-085EN.png`;
    case "Bonebreaker Bladesman Evolved":
      return `${TEXTURES_BASE}BP21-086EN.png`;
    case "Denan, Big Bad Boss":
      return `${TEXTURES_BASE}BP21-087EN.png`;
    case "Malicious Blader":
      return `${TEXTURES_BASE}BP21-088EN.png`;
    case "Serenading Succubus":
      return `${TEXTURES_BASE}BP21-089EN.png`;
    case "Spirit Invasion":
      return `${TEXTURES_BASE}BP21-090EN.png`;
    case "Verdilia, Rogue Professor":
      return `${TEXTURES_BASE}BP21-091EN.png`;
    case "Verdilia, Rogue Professor Evolved":
      return `${TEXTURES_BASE}BP21-092EN.png`;
    case "Elluvia, Graceful Lady":
      return `${TEXTURES_BASE}BP21-093EN.png`;
    case "Wilbert, Desolate Paladin":
      return `${TEXTURES_BASE}BP21-094EN.png`;
    case "Wilbert, Desolate Paladin Evolved":
      return `${TEXTURES_BASE}BP21-095EN.png`;
    case "Lou, Lady-in-Training":
      return `${TEXTURES_BASE}BP21-096EN.png`;
    case "Lou, Lady-in-Training Evolved":
      return `${TEXTURES_BASE}BP21-097EN.png`;
    case "Kira, Resilient Maiden":
      return `${TEXTURES_BASE}BP21-098EN.png`;
    case "Orchid's Examination Hall":
      return `${TEXTURES_BASE}BP21-099EN.png`;
    case "Pureflame Lady":
      return `${TEXTURES_BASE}BP21-100EN.png`;
    case "Pureflame Lady Evolved":
      return `${TEXTURES_BASE}BP21-101EN.png`;
    case "Kyrie, Fragment of Hope":
      return `${TEXTURES_BASE}BP21-102EN.png`;
    case "Pureflower Maiden":
      return `${TEXTURES_BASE}BP21-103EN.png`;
    case "Zlatorog":
      return `${TEXTURES_BASE}BP21-104EN.png`;
    case "Zlatorog Evolved":
      return `${TEXTURES_BASE}BP21-105EN.png`;
    case "Aqua Priestess":
      return `${TEXTURES_BASE}BP21-106EN.png`;
    case "Holy Armored Cheetah":
      return `${TEXTURES_BASE}BP21-107EN.png`;
    case "Hierophant's Implements":
      return `${TEXTURES_BASE}BP21-108EN.png`;
    case "Sublime Talisman":
      return `${TEXTURES_BASE}BP21-109EN.png`;
    case "Lucius, Travelled Trainer":
      return `${TEXTURES_BASE}BP21-110EN.png`;
    case "Lucius, Travelled Trainer Evolved":
      return `${TEXTURES_BASE}BP21-111EN.png`;
    case "Gretina, Champion Fighter":
      return `${TEXTURES_BASE}BP21-112EN.png`;
    case "Arriet, Luxvoice Learner":
      return `${TEXTURES_BASE}BP21-113EN.png`;
    case "Lainecrest Academy":
      return `${TEXTURES_BASE}BP21-114EN.png`;
    case "Goblin Genius":
      return `${TEXTURES_BASE}BP21-115EN.png`;
    case "Goblin's Gratitude":
      return `${TEXTURES_BASE}BP21-116EN.png`;
    case "Lyelth's Marionette TOKEN":
      return `${TEXTURES_BASE}BP21-T01EN.png`;
    case "Verdant Prayer TOKEN":
      return `${TEXTURES_BASE}BP21-T02EN.png`;
    case "Curse of Suffering TOKEN":
      return `${TEXTURES_BASE}BP21-T03EN.png`;
    case "Emergency Summoning TOKEN":
      return `${TEXTURES_BASE}BP21-T04EN.png`;
    case "Reactive Barrier TOKEN":
      return `${TEXTURES_BASE}BP21-T05EN.png`;
    case "Lilium's Hatchling TOKEN":
      return `${TEXTURES_BASE}BP21-T06EN.png`;
    case "Lilium's Dragon TOKEN":
      return `${TEXTURES_BASE}BP21-T07EN.png`;
    case "Holy Cavalier TOKEN":
      return `${TEXTURES_BASE}BP21-T08EN.png`;
    case "Cyclical Guidance TOKEN":
      return `${TEXTURES_BASE}BP21-T09EN.png`;
    case "Crest: Wilbert, Desolate Paladin TOKEN":
      return `${TEXTURES_BASE}BP21-T10EN.png`;
    case "Nephi Nela":
      return `${TEXTURES_BASE}CP04-004EN.png`;
    case "Cleuru":
      return `${TEXTURES_BASE}CP04-011EN.png`;
    case "Lily":
      return `${TEXTURES_BASE}CP04-025EN.png`;
    case "Construct of Truth and Being":
      return `${TEXTURES_BASE}CP04-044EN.png`;
    case "Chellerific Carnival":
      return `${TEXTURES_BASE}CP04-053EN.png`;
    case "Until We Meet Again":
      return `${TEXTURES_BASE}CP04-062EN.png`;
    case "Prank Proclamation":
      return `${TEXTURES_BASE}CP04-072EN.png`;
    case "Kuka":
      return `${TEXTURES_BASE}CP04-087EN.png`;
    case "Demonic Salvation: Infinity":
      return `${TEXTURES_BASE}CP04-090EN.png`;
    case "Clear":
      return `${TEXTURES_BASE}CP04-097EN.png`;
    case "Threading Snare":
      return `${TEXTURES_BASE}CP04-102EN.png`;
    case "Amped on Acorns":
      return `${TEXTURES_BASE}CP04-108EN.png`;
    case "Lyrael":
      return `${TEXTURES_BASE}CP04-112EN.png`;
    case "Ever-Lively Table":
      return `${TEXTURES_BASE}CP04-EP01EN.png`;
    case "Shizuru & Rino Evolved":
      return `${TEXTURES_BASE}CP04-P06EN.png`;
    case "Misogi, Mimi & Kyoka Evolved":
      return `${TEXTURES_BASE}CP04-P34EN.png`;
    case "Kokkoro [Princess Form]":
      return `${TEXTURES_BASE}CP04-PR01EN.png`;
    case "Pecorine [Princess Form]":
      return `${TEXTURES_BASE}CP04-PR02EN.png`;
    case "Karyl [Princess Form]":
      return `${TEXTURES_BASE}CP04-PR03EN.png`;
    case "Sheffy [Princess Form]":
      return `${TEXTURES_BASE}CP04-PR04EN.png`;
    case "Hiyori [Princess Form]":
      return `${TEXTURES_BASE}CP04-PR05EN.png`;
    case "Rei [Princess Form]":
      return `${TEXTURES_BASE}CP04-PR06EN.png`;
    case "Yui [Princess Form]":
      return `${TEXTURES_BASE}CP04-PR07EN.png`;
    case "Akino & Saren Evolved":
      return `${TEXTURES_BASE}CP04-SL22EN.png`;
    case "Ameth Amulet TOKEN":
      return `${TEXTURES_BASE}CP04-T01EN.png`;
    case "Sanctum Blade Avalon TOKEN":
      return `${TEXTURES_BASE}CP04-T03EN.png`;
    case "Mirror Image Neneka TOKEN":
      return `${TEXTURES_BASE}CP04-T05EN.png`;
    case "Mirage Wand TOKEN":
      return `${TEXTURES_BASE}CP04-T07EN.png`;
    case "Eisdrache TOKEN":
      return `${TEXTURES_BASE}CP04-T08EN.png`;
    case "Precious Memento TOKEN":
      return `${TEXTURES_BASE}CP04-T09EN.png`;
    case "Brilliant Fairy":
      return `${TEXTURES_BASE}BP22-001EN.png`;
    case "Noxious Elf":
      return `${TEXTURES_BASE}BP22-002EN.png`;
    case "Aerin, Forever Brilliant":
      return `${TEXTURES_BASE}BP22-003EN.png`;
    case "Aerin, Forever Brilliant Evolved":
      return `${TEXTURES_BASE}BP22-004EN.png`;
    case "Flower Fox":
      return `${TEXTURES_BASE}BP22-005EN.png`;
    case "Flower Fox Evolved":
      return `${TEXTURES_BASE}BP22-006EN.png`;
    case "King of Vines":
      return `${TEXTURES_BASE}BP22-007EN.png`;
    case "Blast Fairy":
      return `${TEXTURES_BASE}BP22-008EN.png`;
    case "Wellspring Elf Princess":
      return `${TEXTURES_BASE}BP22-009EN.png`;
    case "Wellspring Elf Princess Evolved":
      return `${TEXTURES_BASE}BP22-010EN.png`;
    case "Aqua Fairy":
      return `${TEXTURES_BASE}BP22-011EN.png`;
    case "Lily, Crystalian Conductor":
      return `${TEXTURES_BASE}BP22-012EN.png`;
    case "Coldhearted Dark Elf":
      return `${TEXTURES_BASE}BP22-013EN.png`;
    case "Coldhearted Dark Elf Evolved":
      return `${TEXTURES_BASE}BP22-014EN.png`;
    case "Fairy Bringer":
      return `${TEXTURES_BASE}BP22-015EN.png`;
    case "Wily Puck":
      return `${TEXTURES_BASE}BP22-016EN.png`;
    case "Dungeoncrawl Fairy":
      return `${TEXTURES_BASE}BP22-017EN.png`;
    case "Seed Barrage":
      return `${TEXTURES_BASE}BP22-018EN.png`;
    case "Victorious Blader":
      return `${TEXTURES_BASE}BP22-019EN.png`;
    case "Golden Warrior":
      return `${TEXTURES_BASE}BP22-020EN.png`;
    case "Armelize, Opulent Strategist":
      return `${TEXTURES_BASE}BP22-021EN.png`;
    case "Armelize, Opulent Strategist Evolved":
      return `${TEXTURES_BASE}BP22-022EN.png`;
    case "Assault Knight":
      return `${TEXTURES_BASE}BP22-023EN.png`;
    case "Assault Knight Evolved":
      return `${TEXTURES_BASE}BP22-024EN.png`;
    case "Fangblade Slayer":
      return `${TEXTURES_BASE}BP22-025EN.png`;
    case "Claymore Master":
      return `${TEXTURES_BASE}BP22-026EN.png`;
    case "Axe Pirate":
      return `${TEXTURES_BASE}BP22-027EN.png`;
    case "Axe Pirate Evolved":
      return `${TEXTURES_BASE}BP22-028EN.png`;
    case "Armed Butler":
      return `${TEXTURES_BASE}BP22-029EN.png`;
    case "Shield Phalanx":
      return `${TEXTURES_BASE}BP22-030EN.png`;
    case "Calculating Captain":
      return `${TEXTURES_BASE}BP22-031EN.png`;
    case "Calculating Captain Evolved":
      return `${TEXTURES_BASE}BP22-032EN.png`;
    case "Suave Bandit":
      return `${TEXTURES_BASE}BP22-033EN.png`;
    case "Sword-Swinging Bandit":
      return `${TEXTURES_BASE}BP22-034EN.png`;
    case "Resplendent Knight":
      return `${TEXTURES_BASE}BP22-035EN.png`;
    case "Wandering Knight":
      return `${TEXTURES_BASE}BP22-036EN.png`;
    case "Chrono Witch":
      return `${TEXTURES_BASE}BP22-037EN.png`;
    case "Chrono Witch Evolved":
      return `${TEXTURES_BASE}BP22-038EN.png`;
    case "Pursuer Golem":
      return `${TEXTURES_BASE}BP22-039EN.png`;
    case "Levi, Wizard of Ages":
      return `${TEXTURES_BASE}BP22-040EN.png`;
    case "Levi, Wizard of Ages Evolved":
      return `${TEXTURES_BASE}BP22-041EN.png`;
    case "Witching Moggy":
      return `${TEXTURES_BASE}BP22-042EN.png`;
    case "Witching Moggy Evolved":
      return `${TEXTURES_BASE}BP22-043EN.png`;
    case "Great Magician":
      return `${TEXTURES_BASE}BP22-044EN.png`;
    case "Lazuli, Gateway Homunculus":
      return `${TEXTURES_BASE}BP22-045EN.png`;
    case "Elina, Winged Evangelist":
      return `${TEXTURES_BASE}BP22-046EN.png`;
    case "Elina, Winged Evangelist Evolved":
      return `${TEXTURES_BASE}BP22-047EN.png`;
    case "Parasol Witch":
      return `${TEXTURES_BASE}BP22-048EN.png`;
    case "Carnelia, Servant of Darkness":
      return `${TEXTURES_BASE}BP22-049EN.png`;
    case "Blade Mage":
      return `${TEXTURES_BASE}BP22-050EN.png`;
    case "Blade Mage Evolved":
      return `${TEXTURES_BASE}BP22-051EN.png`;
    case "Frost Golem":
      return `${TEXTURES_BASE}BP22-052EN.png`;
    case "Iceshard Beast":
      return `${TEXTURES_BASE}BP22-053EN.png`;
    case "Golem Assault":
      return `${TEXTURES_BASE}BP22-054EN.png`;
    case "Mirrored Summoning":
      return `${TEXTURES_BASE}BP22-055EN.png`;
    case "Ignis Dragon":
      return `${TEXTURES_BASE}BP22-056EN.png`;
    case "Ignis Dragon Evolved":
      return `${TEXTURES_BASE}BP22-057EN.png`;
    case "Brutal Dragonewt":
      return `${TEXTURES_BASE}BP22-058EN.png`;
    case "Giselle, Ocean Star":
      return `${TEXTURES_BASE}BP22-059EN.png`;
    case "Noir & Blanc, Brothers":
      return `${TEXTURES_BASE}BP22-060EN.png`;
    case "Noir & Blanc, Brothers Evolved":
      return `${TEXTURES_BASE}BP22-061EN.png`;
    case "Bejeweled Dragon":
      return `${TEXTURES_BASE}BP22-062EN.png`;
    case "Ethica, Firebrand Claw":
      return `${TEXTURES_BASE}BP22-063EN.png`;
    case "Coral Spirit":
      return `${TEXTURES_BASE}BP22-064EN.png`;
    case "Coral Spirit Evolved":
      return `${TEXTURES_BASE}BP22-065EN.png`;
    case "Shield Dragon":
      return `${TEXTURES_BASE}BP22-066EN.png`;
    case "Piercing Roar":
      return `${TEXTURES_BASE}BP22-067EN.png`;
    case "Hailwyrm":
      return `${TEXTURES_BASE}BP22-068EN.png`;
    case "Hailwyrm Evolved":
      return `${TEXTURES_BASE}BP22-069EN.png`;
    case "Ironscale Serpent Drake":
      return `${TEXTURES_BASE}BP22-070EN.png`;
    case "Electrodrake":
      return `${TEXTURES_BASE}BP22-071EN.png`;
    case "Breath of the Salamander":
      return `${TEXTURES_BASE}BP22-072EN.png`;
    case "Canyon of the Dragons":
      return `${TEXTURES_BASE}BP22-073EN.png`;
    case "Skeleton Raider":
      return `${TEXTURES_BASE}BP22-074EN.png`;
    case "Dark Emperor":
      return `${TEXTURES_BASE}BP22-075EN.png`;
    case "Dark Emperor Evolved":
      return `${TEXTURES_BASE}BP22-076EN.png`;
    case "Cernunnos":
      return `${TEXTURES_BASE}BP22-077EN.png`;
    case "Suzy, Hexcaster":
      return `${TEXTURES_BASE}BP22-078EN.png`;
    case "Suzy, Hexcaster Evolved":
      return `${TEXTURES_BASE}BP22-079EN.png`;
    case "Dog of the Dead":
      return `${TEXTURES_BASE}BP22-080EN.png`;
    case "Goblin Reaper":
      return `${TEXTURES_BASE}BP22-081EN.png`;
    case "Scarlet Vampire":
      return `${TEXTURES_BASE}BP22-082EN.png`;
    case "Scarlet Vampire Evolved":
      return `${TEXTURES_BASE}BP22-083EN.png`;
    case "Deathcat Reaper":
      return `${TEXTURES_BASE}BP22-084EN.png`;
    case "Huginn & Muninn":
      return `${TEXTURES_BASE}BP22-085EN.png`;
    case "Thunderbolt Fiend":
      return `${TEXTURES_BASE}BP22-086EN.png`;
    case "Thunderbolt Fiend Evolved":
      return `${TEXTURES_BASE}BP22-087EN.png`;
    case "Lurching Corpse":
      return `${TEXTURES_BASE}BP22-088EN.png`;
    case "Goblin Zombie":
      return `${TEXTURES_BASE}BP22-089EN.png`;
    case "Bubbly Reaper":
      return `${TEXTURES_BASE}BP22-090EN.png`;
    case "Undead Stampede":
      return `${TEXTURES_BASE}BP22-091EN.png`;
    case "God of Curses":
      return `${TEXTURES_BASE}BP22-092EN.png`;
    case "Holy Saber":
      return `${TEXTURES_BASE}BP22-093EN.png`;
    case "Holy Saber Evolved":
      return `${TEXTURES_BASE}BP22-094EN.png`;
    case "Aether, Guardian of Light":
      return `${TEXTURES_BASE}BP22-095EN.png`;
    case "Sacred Lion":
      return `${TEXTURES_BASE}BP22-096EN.png`;
    case "Sacred Lion Evolved":
      return `${TEXTURES_BASE}BP22-097EN.png`;
    case "Cursed Maiden":
      return `${TEXTURES_BASE}BP22-098EN.png`;
    case "Garuda, Winged Sentinel":
      return `${TEXTURES_BASE}BP22-099EN.png`;
    case "Carmia, Miracle Optimist":
      return `${TEXTURES_BASE}BP22-100EN.png`;
    case "Carmia, Miracle Optimist Evolved":
      return `${TEXTURES_BASE}BP22-101EN.png`;
    case "Ascended Prism Priestess":
      return `${TEXTURES_BASE}BP22-102EN.png`;
    case "Sonia, Protector of Hope":
      return `${TEXTURES_BASE}BP22-103EN.png`;
    case "Holy Kitty":
      return `${TEXTURES_BASE}BP22-104EN.png`;
    case "Holy Kitty Evolved":
      return `${TEXTURES_BASE}BP22-105EN.png`;
    case "Sacred Ice-Crusher":
      return `${TEXTURES_BASE}BP22-106EN.png`;
    case "Tender Rabbit Healer":
      return `${TEXTURES_BASE}BP22-107EN.png`;
    case "Khonsu":
      return `${TEXTURES_BASE}BP22-108EN.png`;
    case "Forbidden Ritual":
      return `${TEXTURES_BASE}BP22-109EN.png`;
    case "Goblin Emperor":
      return `${TEXTURES_BASE}BP22-110EN.png`;
    case "Advent of Peace":
      return `${TEXTURES_BASE}BP22-111EN.png`;
    case "Feena, Super Cute Hunter":
      return `${TEXTURES_BASE}BP22-112EN.png`;
    case "Goblin Leader":
      return `${TEXTURES_BASE}BP22-113EN.png`;
    case "Goblin Leader Evolved":
      return `${TEXTURES_BASE}BP22-114EN.png`;
    case "Goblin Mage":
      return `${TEXTURES_BASE}BP22-115EN.png`;
    case "Haru Urara [I'll Win Someday!]":
      return `${TEXTURES_BASE}BP22-116EN.png`;
    case "Oguri Cap [Surging Beast]":
      return `${TEXTURES_BASE}BP22-117EN.png`;
    case "Oguri Cap [Surging Beast] Evolved":
      return `${TEXTURES_BASE}BP22-118EN.png`;
    case "Her Holiness's Decree TOKEN":
      return `${TEXTURES_BASE}BP22-T01EN.png`;
    case "Shadow General TOKEN":
      return `${TEXTURES_BASE}BP22-T02EN.png`;
    case "Radiant Artifact TOKEN":
      return `${TEXTURES_BASE}BP22-T03EN.png`;
    default: {
      const cardNo = cardNoFromStatsName(cardName);
      return cardNo ? `${TEXTURES_BASE}${cardNo}.png` : "";
    }
  }
};

// Raw name-keyed path without the cache-busting query — used where the result is
// matched/parsed rather than rendered (e.g. getCardNoFromName, adapter lookups).
export const cardImage = (cardName) => withVersion(rawCardImage(cardName));

/** Resolve official card number from a deck-builder card name via texture path. */
export function getCardNoFromName(cardName) {
  if (!cardName) return null;
  const path = cardImage(cardName);
  if (!path || path.includes("default.png")) return null;
  const match = path.match(/\/([^/?#]+)\.png(?:\?.*)?$/);
  return match ? match[1] : null;
}
