import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dialog, IconButton, Snackbar } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import useMediaQuery from "@mui/material/useMediaQuery";

import { getShare, shareUrl } from "../lib/shares";
import { useAuth, discordName } from "../auth/AuthProvider";
import { createDeck, selectDecks } from "../redux/DeckSlice";
import { computeDeckClass } from "../decks/cardDetails";
import DeckShowcase from "../components/deckbuilder/DeckShowcase";
import ShareDeckDialog from "../components/ShareDeckDialog";
import CardInspector from "../components/deckbuilder/CardInspector";
import { COLORS, FONT } from "../components/deckbuilder/theme";

// The one deck view. Home's Preview opens it, and it's what a share link points
// at, so there's a single page to look at a deck rather than a modal and a page
// that can drift apart.
//
// Always backed by a `shared_decks` row: public to anyone while `is_public`,
// owner-only otherwise. RLS enforces that, so an unknown id and a switched-off
// link are indistinguishable to a visitor by design — and previewing your own
// deck requires a Discord login, because only a signed-in user can own a row.
//
// Anyone can copy a public deck into their own list, signed in or not.

// `#root` is pinned to 100vh with `overflow: clip` (src/index.css) so the Game
// board can own the viewport, which means a taller-than-screen page can't scroll
// the document. This view is long by nature, so it scrolls itself instead —
// which also gives the stats sidebar something to stick to.
const page = {
  height: "100%",
  overflowY: "auto",
  background: "linear-gradient(180deg, #070b12 0%, #0d1017 100%)",
  color: COLORS.text,
  fontFamily: FONT,
  padding: "16px 16px 40px",
  boxSizing: "border-box",
};

const panel = {
  background: "rgba(10, 14, 20, 0.75)",
  border: `1px solid ${COLORS.border}`,
  borderRadius: 14,
  padding: 18,
  boxSizing: "border-box",
  boxShadow: "0 0 24px rgba(10, 175, 230, 0.15)",
};

const actionSx = {
  fontFamily: FONT,
  textTransform: "none",
  color: COLORS.text,
  borderColor: COLORS.border,
};

const primarySx = { ...actionSx, background: COLORS.glow, fontWeight: 700 };

// A name that doesn't collide with something already in the visitor's list.
const uniqueName = (base, existing) => {
  const taken = new Set(existing.map((d) => d.name));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 100; i++) {
    const candidate = `${base} (${i})`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base} (copy)`;
};

export default function SharedDeck() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useAuth();
  const decks = useSelector(selectDecks);
  const isMobile = useMediaQuery("(max-width: 900px)");

  const [share, setShare] = useState(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [snack, setSnack] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);

  const [inspectName, setInspectName] = useState(null);
  const [inspectCardNo, setInspectCardNo] = useState(null);
  const [inspectOpen, setInspectOpen] = useState(false);

    useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setFailed(false);
    getShare(id)
      .then((row) => {
        if (cancelled) return;
        setShare(row);
        setLoading(false);
      })
      .catch((e) => {
        if (cancelled) return;
        console.warn("Failed to load shared deck:", e.message || e);
        setFailed(true);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
    // Re-fetch when the auth session resolves: a private share is invisible
    // until Supabase knows the viewer is its owner.
  }, [id, user]);

  const deck = share?.deck ?? null;

  // Copy counts as Maps, the shape the deck components everywhere else expect.
  const { deckMap, evoDeckMap } = useMemo(() => {
    const build = (names = []) => {
      const map = new Map();
      for (const n of names) map.set(n, (map.get(n) || 0) + 1);
      return map;
    };
    return { deckMap: build(deck?.deck), evoDeckMap: build(deck?.evoDeck) };
  }, [deck]);

  const deckClass = deck ? deck.class || computeDeckClass(deck.deck) || "" : "";

  // What's rendered is the frozen snapshot, but Edit and "Update snapshot" have
  // to act on the owner's live deck — matched by share id, falling back to name
  // for decks saved before links were minted. Null for visitors, and for an
  // owner whose deck has since been deleted.
  const liveDeck = useMemo(() => {
    if (!share) return null;
    return (
      decks.find((d) => d.shareId === share.id) ||
      decks.find((d) => d.name === share.deck?.name) ||
      null
    );
  }, [share, decks]);

  const openInspect = (cardName) => {
    setInspectName(cardName);
    setInspectCardNo((deck?.art && deck.art[cardName]) || null);
    setInspectOpen(true);
  };

  const handleSave = () => {
    const saveName = uniqueName(deck.name || "Shared deck", decks);
    dispatch(
      createDeck({
        name: saveName,
        class: deckClass,
        deck: deck.deck,
        evoDeck: deck.evoDeck,
        art: deck.art || {},
      }),
    );
    setSnack(
      user
        ? `Saved as “${saveName}” in your cloud decks.`
        : `Saved as “${saveName}” on this device.`,
    );
  };

  // Hands the deck to the builder through its existing base64 route. btoa only
  // handles Latin-1, so a deck named with non-Latin characters can't travel
  // this way — those visitors save it and edit from Home instead.
  const builderLink = useMemo(() => {
    if (!deck) return null;
    try {
      return `/deck/${btoa(JSON.stringify([deck]))}`;
    } catch {
      return null;
    }
  }, [deck]);

  if (loading) {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: COLORS.textDim }}>Loading deck…</div>
      </div>
    );
  }

  if (failed || !deck) {
    return (
      <div style={{ ...page, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...panel, maxWidth: 460, textAlign: "center" }}>
          <h1 style={{ fontSize: 22, margin: "4px 0 10px" }}>
            {failed ? "Couldn’t load this deck" : "This deck isn’t available"}
          </h1>
          <p style={{ color: COLORS.textDim, fontSize: 14, lineHeight: 1.6 }}>
            {failed
              ? "Something went wrong fetching it. Try again in a moment."
              : "The link may be wrong, or its owner has set it back to private."}
          </p>
          <Button variant="outlined" sx={{ ...actionSx, mt: 1 }} onClick={() => navigate("/")}>
            Go to Shadowverse Evolve Simulator
          </Button>
        </div>
      </div>
    );
  }

  // The owner gets Share/Edit; everyone else gets Save-a-copy.
  const isMine = !!(user && share && user.id === share.owner_id);

  const actions = (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      {isMine ? (
        <>
          <Button variant="contained" sx={primarySx} onClick={() => setShareOpen(true)}>
            Share
          </Button>
          {liveDeck && (
            <Button
              variant="outlined"
              sx={actionSx}
              onClick={() => navigate("/deck", { state: { deckName: liveDeck.name } })}
            >
              Edit
            </Button>
          )}
        </>
      ) : (
        <>
          <Button variant="contained" sx={primarySx} onClick={handleSave}>
            Save to my decks
          </Button>
          {builderLink && (
            <Button variant="outlined" sx={actionSx} onClick={() => navigate(builderLink)}>
              Open in builder
            </Button>
          )}
        </>
      )}
      {share && (
        <Button
          variant="outlined"
          sx={actionSx}
          onClick={() => {
            navigator.clipboard
              ?.writeText(shareUrl(share.id))
              .then(() => setSnack("Link copied."))
              .catch(() => setSnack("Couldn’t copy the link."));
          }}
        >
          Copy link
        </Button>
      )}
      <Button variant="outlined" sx={actionSx} onClick={() => navigate("/")}>
        Home
      </Button>
    </div>
  );

  return (
    <div style={page}>
      {/* Deliberately not full-bleed. Cards scale with this column, so a wider
          page means bigger cards and more vertical space per row — the opposite
          of what fitting a whole deck on screen needs. ~1200px with 10 columns
          lands a card near 110px wide, the size Deck Log uses. */}
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {isMine && share && !share.is_public && (
          <div
            style={{
              ...panel,
              marginBottom: 14,
              borderColor: COLORS.gold,
              color: COLORS.gold,
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            This link is private — only you can open it. Use Share to turn it on.
          </div>
        )}
        <DeckShowcase
          deck={deck}
          deckMap={deckMap}
          evoDeckMap={evoDeckMap}
          deckClass={deckClass}
          ownerName={isMine ? "" : share?.owner_name}
          onInspect={openInspect}
          actions={actions}
          isMobile={isMobile}
          // No `fullArt`: at ~110px a card the 186px thumbnails are already
          // more than the display needs, and they keep a linked page around
          // 750KB instead of 3MB. Clicking a card still opens the full art.
        />
      </div>

      <ShareDeckDialog
        open={shareOpen}
        onClose={() => setShareOpen(false)}
        // The live deck, so "Update snapshot" re-freezes what the owner
        // actually has now rather than rewriting the snapshot with itself.
        deck={liveDeck || deck}
        user={user}
        ownerName={user ? discordName(user) : ""}
        initialShare={share}
        onChange={setShare}
      />

      {/* Card preview, styled like the in-game hover panel (see ui/ZoomedCard):
          the same gradient container, border and shadow, with CardInspector in
          gameStyle, so inspecting a card reads the same here as on the board. */}
      <Dialog
        open={inspectOpen}
        onClose={() => setInspectOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background:
              "linear-gradient(180deg, rgba(30,36,47,0.99) 0%, rgba(18,22,30,0.99) 100%)",
            backgroundImage:
              "linear-gradient(180deg, rgba(30,36,47,0.99) 0%, rgba(18,22,30,0.99) 100%)",
            border: "1px solid rgba(120,150,190,0.35)",
            borderRadius: "16px",
            boxShadow: "0 18px 60px rgba(0,0,0,0.75)",
            textAlign: "left",
            // Content-sized with a viewport cap. In `fill` mode the inspector
            // has a natural height, so pinning the Paper to a fixed one would
            // stretch or squeeze it; the cap is a maximum, not a target, and
            // only a very tall card on a short window ever scrolls.
            maxHeight: "94vh",
          },
        }}
      >
        {/* No fixed height and no clipping: the inspector sizes itself, and if
            a card is genuinely too tall for the window the Paper scrolls rather
            than cutting the text off. Bottom padding runs a little heavier than
            top, which reads as balanced rather than bottom-tight. */}
        <div style={{ position: "relative", padding: "26px 28px 34px", boxSizing: "border-box" }}>
          <IconButton
            onClick={() => setInspectOpen(false)}
            sx={{
              position: "absolute",
              top: 10,
              right: 14,
              zIndex: 4,
              color: "rgba(255,255,255,0.7)",
              background: "rgba(0,0,0,0.35)",
              "&:hover": { color: "#fff", background: "rgba(0,0,0,0.6)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          {/* The measure, not the dialog, is what keeps this readable: cap the
              content column and centre it, so the effect text stays a sane line
              length and the whitespace lands in even gutters either side. */}
          <div style={{ maxWidth: 660, margin: "0 auto" }}>
            <CardInspector
            name={inspectName}
            cardNo={inspectCardNo}
            readOnly
            gameStyle
            // `fill`, not `fitEffect`. fitEffect scales the text down to fit
            // the height left over after the art, so any misjudgement of that
            // budget shrinks the text toward invisible. `fill` is the mode
            // meant for a roomy preview dialog: the effect box takes its
            // natural height and the text is never scaled, so it's always
            // readable — the dialog absorbs the difference instead.
            fill
            // Undo `fill`'s type shrink and then some — this dialog has the
            // room, and the card text is the reason it's open.
            textScale={1.45}
            imageMaxHeight="min(52vh, 560px)"
            />
          </div>
        </div>
      </Dialog>

      <Snackbar
        open={snack !== null}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        message={snack}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}
