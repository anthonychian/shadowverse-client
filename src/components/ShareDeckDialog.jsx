import { useCallback, useEffect, useState } from "react";
import {
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControlLabel,
  Switch,
  TextField,
} from "@mui/material";

import {
  createShare,
  deleteShare,
  findShareForDeck,
  previewUrl,
  setSharePublic,
  shareUrl,
  updateShare,
} from "../lib/shares";
import { renderDeckShareImage } from "../lib/deckImage";
import { computeDeckClass } from "../decks/cardDetails";
import { COLORS, FONT } from "./deckbuilder/theme";

// Share controls for the deck page. A deck's link is minted (private) when the
// deck is saved, so this dialog is mostly the public/private switch; it can
// still mint one on the spot for decks saved before links existed. Creating a
// link requires a Discord login — the table's insert policy enforces that, this
// just explains it. Switching a link off 404s the page and drops its preview
// image; the snapshot itself is frozen until "Update snapshot" is pressed.

const dialogPaper = {
  background: "rgba(10, 14, 20, 0.96)",
  backgroundImage: "none",
  border: `1px solid ${COLORS.border}`,
  color: COLORS.text,
  fontFamily: FONT,
};

const actionSx = {
  fontFamily: FONT,
  textTransform: "none",
  color: COLORS.text,
  borderColor: COLORS.border,
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    color: COLORS.text,
    background: "rgba(255,255,255,0.06)",
    fontFamily: "monospace",
    fontSize: 14,
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: COLORS.border },
};

// The frozen copy stored with the share — the same shape the deck lists use, so
// the share page renders it with the ordinary deck components.
const snapshotOf = (deck) => ({
  name: deck.name,
  class: deck.class || computeDeckClass(deck.deck) || "",
  deck: deck.deck || [],
  evoDeck: deck.evoDeck || [],
  art: deck.art || {},
});

export default function ShareDeckDialog({
  open,
  onClose,
  deck,
  user,
  ownerName,
  // The row the page already loaded, so the dialog does not refetch it.
  initialShare = null,
  // Told about every change, so the page around it can restyle (the private
  // banner, the Copy link button) without its own refetch.
  onChange,
}) {
  const [share, setShareRow] = useState(initialShare);

  const setShare = (row) => {
    setShareRow(row);
    if (onChange) onChange(row);
  };
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(null); // human-readable "what's happening"
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  // Preview rendering fails independently of the share itself, so it gets its
  // own message rather than being swallowed or masquerading as a share error.
  const [previewError, setPreviewError] = useState("");

  const deckName = deck?.name;

  useEffect(() => {
    if (!open || !user || !deckName) return;
    // The page usually hands us the row already; only look it up when it did not
    // (a deck previewed from this device, or one saved before links existed).
    if (initialShare) {
      setShareRow(initialShare);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    setCopied(false);
    findShareForDeck(user.id, deckName)
      .then((row) => {
        if (!cancelled) setShare(row);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message || "Couldn’t check for an existing link.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [open, user, deckName, initialShare]);

  // Draws the deck's social preview. Passed down to the share helpers so the
  // image is regenerated whenever the snapshot changes or the link is switched
  // back on.
  const renderImage = useCallback(
    (id) =>
      renderDeckShareImage({
        deck: snapshotOf(deck),
        ownerName,
        url: shareUrl(id),
      }),
    [deck, ownerName],
  );

  const run = async (label, fn) => {
    setBusy(label);
    setError("");
    setPreviewError("");
    try {
      await fn();
    } catch (e) {
      setError(e.message || "Something went wrong.");
    } finally {
      setBusy(null);
    }
  };

  const handleCreate = () =>
    run("Creating link and rendering preview…", async () => {
      // Mint the row, then immediately publish it: pressing this button is the
      // act of sharing, so it should not leave a private link behind.
      const row = await createShare({
        userId: user.id,
        ownerName,
        deck: snapshotOf(deck),
      });
      setShare(
        await setSharePublic({
          share: row,
          isPublic: true,
          renderImage,
          onPreviewError: setPreviewError,
        }),
      );
    });

  const handleUpdate = () =>
    run("Updating snapshot…", async () => {
      const row = await updateShare({
        share,
        ownerName,
        deck: snapshotOf(deck),
        renderImage,
        onPreviewError: setPreviewError,
      });
      setShare(row);
    });

  const handleTogglePublic = (next) =>
    run(next ? "Turning the link back on…" : "Making it private…", async () => {
      const row = await setSharePublic({
        share,
        isPublic: next,
        renderImage,
        onPreviewError: setPreviewError,
      });
      setShare(row);
    });

  const handleDelete = () =>
    run("Deleting link…", async () => {
      await deleteShare(share);
      setShare(null);
    });

  const handleCopy = () => {
    navigator.clipboard
      ?.writeText(shareUrl(share.id))
      .then(() => setCopied(true))
      .catch(() => setError("Couldn’t copy to the clipboard."));
  };

  const url = share ? shareUrl(share.id) : "";
  const image = share ? previewUrl(share.image_path) : null;
  const working = busy !== null;

  return (
    <Dialog
      open={open}
      onClose={working ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      disableScrollLock
      PaperProps={{ sx: dialogPaper }}
    >
      <DialogTitle sx={{ fontFamily: FONT }}>
        Share “{deckName || "deck"}”
      </DialogTitle>

      <DialogContent>
        {!user ? (
          <DialogContentText sx={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 14 }}>
            Sign in with Discord to create a share link. Your decks stay private
            until you share one.
          </DialogContentText>
        ) : loading ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0" }}>
            <CircularProgress size={18} />
            <span style={{ color: COLORS.textDim, fontSize: 14 }}>Checking…</span>
          </div>
        ) : !share ? (
          <DialogContentText sx={{ color: COLORS.textDim, fontFamily: FONT, fontSize: 14, lineHeight: 1.7 }}>
            This creates a public link to a snapshot of this deck. Anyone with
            the link can view it and copy it into their own decks; editing this
            deck afterwards won’t change the link until you update it. You can
            switch the link off at any time.
          </DialogContentText>
        ) : (
          <>
            <TextField
              fullWidth
              size="small"
              value={url}
              InputProps={{ readOnly: true }}
              sx={fieldSx}
              onFocus={(e) => e.target.select()}
            />
            <FormControlLabel
              sx={{ mt: 1, color: COLORS.textDim, "& .MuiFormControlLabel-label": { fontFamily: FONT, fontSize: 14 } }}
              control={
                <Switch
                  checked={share.is_public}
                  disabled={working}
                  onChange={(e) => handleTogglePublic(e.target.checked)}
                />
              }
              label={
                share.is_public
                  ? "Public — anyone with the link can view this deck"
                  : "Private — the link shows nothing to anyone but you"
              }
            />
            {image && share.is_public && (
              <div style={{ marginTop: 8 }}>
                <div style={{ color: COLORS.textDim, fontSize: 12, marginBottom: 6 }}>
                  Link preview (what Discord shows):
                </div>
                <img
                  src={image}
                  alt="Deck preview"
                  style={{
                    width: "100%",
                    borderRadius: 8,
                    border: `1px solid ${COLORS.border}`,
                    display: "block",
                  }}
                />
              </div>
            )}
          </>
        )}

        {busy && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 12 }}>
            <CircularProgress size={18} />
            <span style={{ color: COLORS.textDim, fontSize: 14 }}>{busy}</span>
          </div>
        )}
        {copied && !busy && (
          <div style={{ color: COLORS.glow, fontSize: 13, marginTop: 10 }}>Link copied.</div>
        )}
        {error && (
          <div style={{ color: COLORS.danger, fontSize: 13, marginTop: 10 }}>{error}</div>
        )}
        {previewError && !busy && (
          <div style={{ color: COLORS.gold, fontSize: 13, marginTop: 10, lineHeight: 1.6 }}>
            The link works, but its preview image couldn’t be generated, so it
            will unfurl without one: {previewError}
          </div>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, flexWrap: "wrap", gap: 1 }}>
        <Button onClick={onClose} disabled={working} sx={actionSx}>
          Close
        </Button>
        {user && share && (
          <>
            <Button onClick={handleDelete} disabled={working} sx={{ ...actionSx, color: COLORS.danger }}>
              Delete link
            </Button>
            <Button onClick={handleUpdate} disabled={working} variant="outlined" sx={actionSx}>
              Update snapshot
            </Button>
            <Button
              onClick={handleCopy}
              disabled={working}
              variant="contained"
              sx={{ ...actionSx, background: COLORS.glow, fontWeight: 700 }}
            >
              Copy link
            </Button>
          </>
        )}
        {user && !share && !loading && deckName && (
          <Button
            onClick={handleCreate}
            disabled={working}
            variant="contained"
            sx={{ ...actionSx, background: COLORS.glow, fontWeight: 700 }}
          >
            Create share link
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
