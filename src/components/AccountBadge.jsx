import { useAuth, discordName, discordAvatar } from "../auth/AuthProvider";
import discordLogo from "../assets/buttons/discord.png";

// Discord account panel for the Home page. Logged out: a "sign in" button that
// starts the OAuth redirect. Logged in: avatar + name + a sign-out button.
// Renders nothing until the initial session check resolves so returning users
// don't see a "SIGN IN" flash. Rounded-rectangle glass styling to match the
// Home page's other panels (lobby board, announcements).
const panelStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: "12px 20px",
  backgroundColor: "rgba(10, 14, 20, 0.75)",
  border: "1px solid rgba(72, 171, 224, 0.5)",
  borderRadius: 12,
  color: "#daf6ff",
  fontFamily: "Share Tech Mono, monospace",
  fontSize: 16,
  letterSpacing: "0.06em",
  backdropFilter: "blur(8px)",
  boxShadow: "0 0 20px rgba(10, 175, 230, 0.25)",
  cursor: "pointer",
};

export default function AccountBadge({ style }) {
  const { user, authReady, signInWithDiscord, signOut } = useAuth();

  if (!authReady) return null;

  if (!user) {
    return (
      <button
        onClick={signInWithDiscord}
        style={{ ...panelStyle, ...style }}
        title="Sign in with Discord to store your decks in the cloud"
      >
        <img src={discordLogo} alt="" height={26} style={{ display: "block" }} />
        SIGN IN
      </button>
    );
  }

  const avatar = discordAvatar(user);
  return (
    <div style={{ ...panelStyle, cursor: "default", ...style }}>
      {avatar && (
        <img
          src={avatar}
          alt=""
          height={32}
          width={32}
          style={{ borderRadius: "50%", display: "block" }}
        />
      )}
      <span
        style={{
          maxWidth: 180,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {discordName(user) || "Signed in"}
      </span>
      <button
        onClick={signOut}
        title="Sign out (back to this device's local decks)"
        style={{
          background: "none",
          border: "none",
          color: "#7da7bd",
          fontFamily: "inherit",
          fontSize: 15,
          letterSpacing: "0.06em",
          cursor: "pointer",
          padding: 0,
          marginLeft: 4,
        }}
      >
        ✕
      </button>
    </div>
  );
}
