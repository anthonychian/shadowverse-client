import { supabase } from "./supabase";

// Deck sharing: a share is a frozen snapshot of one deck stored in the
// `shared_decks` table (see supabase/shared-decks.sql) under a short slug that
// doubles as its URL, /decks/<id>.
//
// Only signed-in (Discord) users can create one — that's enforced by the
// table's insert policy, not by hiding the button. Anyone can read a share
// while it's public; switching it to private makes the link 404 for everyone
// but the owner and drops its preview image.

const BUCKET = "deck-previews";

// Lowercase alphanumerics minus the characters people misread when copying a
// link out of a screenshot (l/1, 0/o).
const ID_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const ID_LENGTH = 8;
const ID_ATTEMPTS = 5;

// Postgres unique_violation — the slug we picked is already taken.
const PG_DUPLICATE = "23505";

const randomId = (length = ID_LENGTH) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = "";
  for (const b of bytes) out += ID_ALPHABET[b % ID_ALPHABET.length];
  return out;
};

// The link a user copies. Origin-based so it's right in dev and in production
// without a configured base URL.
export const shareUrl = (id) => `${window.location.origin}/decks/${id}`;

// Public URL of a preview object, or null when the share has no image.
export const previewUrl = (imagePath) =>
  imagePath
    ? supabase.storage.from(BUCKET).getPublicUrl(imagePath).data.publicUrl
    : null;

// Render + upload the og:image for a share. Returns the stored object name.
// The random suffix keeps a private share's image unguessable from its slug.
const uploadPreview = async (id, blob) => {
  const path = `${id}/${randomId(12)}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
  return path;
};

const removePreview = async (imagePath) => {
  if (!imagePath) return;
  const { error } = await supabase.storage.from(BUCKET).remove([imagePath]);
  // A missing object isn't worth failing the whole operation over.
  if (error) console.warn("Failed to remove share preview:", error.message);
};

// The share (if any) this user already made for a deck of this name, newest
// first. Used so re-sharing the same deck updates one link instead of piling up
// dead URLs.
export const findShareForDeck = async (userId, deckName) => {
  const { data, error } = await supabase
    .from("shared_decks")
    .select("*")
    .eq("owner_id", userId)
    .eq("deck->>name", deckName)
    .order("created_at", { ascending: false })
    .limit(1);
  if (error) throw error;
  return data?.[0] ?? null;
};

// Read a share for the public /decks/:id page. Returns null when the id is
// unknown *or* the share is private and the caller isn't its owner — RLS makes
// those two cases indistinguishable from here, which is the point.
export const getShare = async (id) => {
  const { data, error } = await supabase
    .from("shared_decks")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
};

// Mint a deck's URL. New shares start **private**: the row (and therefore the
// /decks/<id> address) exists from the moment a deck is saved, so there's one
// page to open, but it 404s for everyone except the owner until they actually
// share it. No preview image is rendered until then either.
export const createShare = async ({ userId, ownerName, deck }) => {
  let lastError = null;

  for (let i = 0; i < ID_ATTEMPTS; i++) {
    const id = randomId();
    const { data, error } = await supabase
      .from("shared_decks")
      .insert({
        id,
        owner_id: userId,
        owner_name: ownerName || null,
        deck,
        is_public: false,
      })
      .select()
      .single();
    if (!error) return data;
    lastError = error;
    if (error.code !== PG_DUPLICATE) throw error;
  }
  throw lastError || new Error("Could not allocate a share link.");
};

// The row for a deck, creating it if this deck doesn't have one yet. `shareId`
// is the id stored on the deck; decks saved before sharing existed don't have
// one, so fall back to matching on the deck name before minting a new row.
export const ensureShare = async ({ userId, ownerName, deck, shareId }) => {
  if (shareId) {
    const existing = await getShare(shareId);
    if (existing && existing.owner_id === userId) return existing;
  }
  const byName = await findShareForDeck(userId, deck.name);
  if (byName) return byName;
  return createShare({ userId, ownerName, deck });
};

// Replace a share's snapshot with the deck's current contents, keeping the same
// URL. Only a public share needs its preview image redrawn — a private one has
// none until it's shared.
export const updateShare = async ({ share, ownerName, deck, renderImage, onPreviewError }) => {
  const { data, error } = await supabase
    .from("shared_decks")
    .update({
      deck,
      owner_name: ownerName || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", share.id)
    .select()
    .single();
  if (error) throw error;

  if (!data.is_public) return data;

  await removePreview(share.image_path);
  return attachPreview({ ...data, image_path: null }, renderImage, onPreviewError);
};

// Flip a share between public and private. Going private drops the preview
// image so the picture isn't reachable either; going public regenerates it.
export const setSharePublic = async ({ share, isPublic, renderImage, onPreviewError }) => {
  if (!isPublic) {
    await removePreview(share.image_path);
    const { data, error } = await supabase
      .from("shared_decks")
      .update({
        is_public: false,
        image_path: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", share.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  }

  const { data, error } = await supabase
    .from("shared_decks")
    .update({ is_public: true, updated_at: new Date().toISOString() })
    .eq("id", share.id)
    .select()
    .single();
  if (error) throw error;
  return data.image_path ? data : attachPreview(data, renderImage, onPreviewError);
};

export const deleteShare = async (share) => {
  // Object first: the storage delete policy checks the row still exists.
  await removePreview(share.image_path);
  const { error } = await supabase
    .from("shared_decks")
    .delete()
    .eq("id", share.id);
  if (error) throw error;
};

// Render the preview for an existing row and record the object name. A failure
// here degrades the unfurl to the site's default image rather than breaking the
// share, so it does not throw — but it must not be silent either, or a share
// ends up with no image and nothing anywhere says why. Callers pass
// `onPreviewError` to surface it.
const attachPreview = async (row, renderImage, onPreviewError) => {
  if (!renderImage) return row;
  try {
    const blob = await renderImage(row.id);
    if (!blob) return row;
    const imagePath = await uploadPreview(row.id, blob);
    const { data, error } = await supabase
      .from("shared_decks")
      .update({ image_path: imagePath })
      .eq("id", row.id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    const msg = e?.message || String(e);
    console.warn("Failed to generate share preview image:", msg);
    if (onPreviewError) onPreviewError(msg);
    return row;
  }
};
