import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { supabase } from "../lib/supabase";
import { store } from "../redux/store";
import { setCloudDecks } from "../redux/DeckSlice";

// Discord login + cloud deck sync. While logged in, the user's decks live in
// the `user_decks` Supabase table (one row per user, the whole list as jsonb)
// and DeckSlice.cloudDecks mirrors it; logged out, the app uses the local
// persisted list exactly as before. The two lists never merge.
//
// Sync model: on auth, fetch the row once and hydrate redux; afterwards any
// change to cloudDecks (createDeck/deleteDeck while logged in) is upserted
// back, debounced so a deck edit (delete+create in one tick) is one write.

const AuthContext = createContext({
  user: null,
  authReady: false,
  signInWithDiscord: () => {},
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

// Discord's display name out of Supabase user metadata. Discord puts the
// user-facing "Display Name" (global_name) under custom_claims; full_name/name
// hold the unique account username, kept only as fallbacks for accounts that
// never set a display name.
export const discordName = (user) =>
  user?.user_metadata?.custom_claims?.global_name ||
  user?.user_metadata?.full_name ||
  user?.user_metadata?.name ||
  "";

export const discordAvatar = (user) => user?.user_metadata?.avatar_url || "";

const PUSH_DEBOUNCE_MS = 400;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // False until Supabase resolves the initial session, so the UI can avoid
  // flashing "Sign in" at someone who is already logged in.
  const [authReady, setAuthReady] = useState(false);

  // The decks array as last seen in/pushed to Supabase. Reference-compared
  // against redux to detect edits that still need pushing. `null` = nothing
  // fetched (logged out or fetch in flight), which also blocks pushes.
  const lastSyncedRef = useRef(null);
  const fetchedForUserRef = useRef(null);
  const pushTimerRef = useRef(null);
  const userRef = useRef(null);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      const nextUser = session?.user ?? null;
      userRef.current = nextUser;
      setUser(nextUser);
      setAuthReady(true);

      if (!nextUser) {
        // Logged out (or the persisted session turned out to be dead):
        // back to the untouched local list.
        fetchedForUserRef.current = null;
        lastSyncedRef.current = null;
        store.dispatch(setCloudDecks(null));
        return;
      }

      // Fetch once per user, not on every TOKEN_REFRESHED — a refetch could
      // clobber an edit whose push is still debounced.
      if (fetchedForUserRef.current === nextUser.id) return;
      fetchedForUserRef.current = nextUser.id;

      supabase
        .from("user_decks")
        .select("decks")
        .eq("user_id", nextUser.id)
        .maybeSingle()
        .then(({ data, error }) => {
          if (userRef.current?.id !== nextUser.id) return; // logged out meanwhile
          if (error) {
            console.warn("Failed to load cloud decks:", error.message);
            fetchedForUserRef.current = null; // allow a retry on next auth event
            return;
          }
          const decks = data?.decks ?? [];
          lastSyncedRef.current = decks;
          store.dispatch(setCloudDecks(decks));
        });
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Push local edits to the cloud list back up to Supabase.
  useEffect(() => {
    const push = () => {
      const decks = store.getState().deck.cloudDecks;
      const u = userRef.current;
      if (!u || decks === null) return;
      supabase
        .from("user_decks")
        .upsert({ user_id: u.id, decks, updated_at: new Date().toISOString() })
        .then(({ error }) => {
          if (error) console.warn("Failed to save decks:", error.message);
          else lastSyncedRef.current = decks;
        });
    };

    const unsubscribe = store.subscribe(() => {
      const decks = store.getState().deck.cloudDecks;
      if (decks === null || lastSyncedRef.current === null) return;
      if (decks === lastSyncedRef.current) return;
      clearTimeout(pushTimerRef.current);
      pushTimerRef.current = setTimeout(push, PUSH_DEBOUNCE_MS);
    });
    return () => {
      unsubscribe();
      clearTimeout(pushTimerRef.current);
    };
  }, []);

  const signInWithDiscord = () =>
    supabase.auth.signInWithOAuth({
      provider: "discord",
      options: { redirectTo: window.location.origin },
    });

  const signOut = () => supabase.auth.signOut();

  return (
    <AuthContext.Provider value={{ user, authReady, signInWithDiscord, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
