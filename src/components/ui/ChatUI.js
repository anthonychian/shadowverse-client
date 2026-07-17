import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton, InputBase, Button } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setChat, setCurrentCard } from "../../redux/CardSlice";
import { artImage, artThumb } from "../../decks/getCards";
import HideUiButton from "./HideUiButton";

// Shared palette, lifted from the Home "Announcements" board so the in-game chat
// reads as the same product surface: a dark translucent panel with a cyan-blue
// border + glow, serif body text and a mono timestamp.
const PANEL_BG = "rgba(10, 14, 20, 0.92)";
const BORDER = "rgba(72, 171, 224, 0.5)";
const GLOW = "0 0 22px rgba(10, 175, 230, 0.28)";
const ACCENT = "#48abe0";
const META = "#7da7bd";
const SERIF = "Noto Serif JP, serif";
const MONO = "Share Tech Mono, monospace";

// Unscaled panel width — must match the width in panelInner below. Used to
// work out how far the panel can scale before it would spill out of the gap
// between the Field and the right column (covering EnemyUI / PlayerUI).
const PANEL_WIDTH = 320;
// Breathing room kept between the panel's right edge and the enemy/player UI.
const GAP_MARGIN = 10;
// Never shrink below this fraction of the normal side-column scale: staying
// usable beats strictly never overlapping on very narrow (near-mobile) windows.
const MIN_FIT_FRACTION = 0.75;

// Game-log side accents: light blue for the player, light red for the opponent.
const LOG_MINE = {
  accent: "#9ed2ff",
  bg: "rgba(72, 171, 224, 0.10)",
  border: "rgba(120, 190, 240, 0.55)",
};
const LOG_THEIRS = {
  accent: "#ff9fa8",
  bg: "rgba(255, 110, 120, 0.10)",
  border: "rgba(255, 140, 150, 0.55)",
};

// Chat log entries are stored as "[HH:MM] (Me): text" / "[HH:MM] (Player 2): text".
// Pull the timestamp, sender and text apart so each can be styled on its own.
const parseMessage = (raw) => {
  const m = /^\[(.*?)\]\s*\((.*?)\):\s*([\s\S]*)$/.exec(raw || "");
  if (!m) return { time: "", text: raw || "", mine: raw?.[9] === "M" };
  return { time: m[1], text: m[3], mine: m[2] === "Me" };
};

// `expanded`: the expanded-log view. The panel renders in-flow and stretches to
// fill the right column (Game.js places it between the compact enemy/player
// bars) instead of the fixed-width panel anchored beside the Field. Minimize is
// disabled there — the whole point of the mode is a large, always-open log.
export default function ChatUI({ scale = 1, setHovering, expanded = false }) {
  const dispatch = useDispatch();
  const [chatMessage, setChatMessage] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
  // "log" | "chat" — which tab of the panel is showing. Game Log is the first
  // tab and the default; the composer only appears on the chat tab.
  const [activeTab, setActiveTab] = useState("log");
  const logRef = useRef(null);
  const panelRef = useRef(null);
  const innerRef = useRef(null);
  // How far left of the right-column's left edge to shift the panel so its left
  // edge meets the Field's right edge. The board uses justify-content:
  // space-around, so there's a (screen-width-dependent) gap between the centre
  // Field and the right column — measure it instead of guessing.
  const [leftOffset, setLeftOffset] = useState(0);
  // Measured panel height: used to anchor the whole thing by its TOP (at
  // 50% − height/2) so the panel still sits centred, while the minimized chat
  // icon lands exactly where the header's minimize button was.
  const [panelHeight, setPanelHeight] = useState(0);
  // Width of the gap between the Field's right edge and the right column, and
  // the viewport height — both cap the panel's scale so the open chat never
  // covers EnemyUI/PlayerUI (or runs off screen vertically).
  const [gapWidth, setGapWidth] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const reduxChatLog = useSelector((state) => state.card.chatLog);
  const reduxGameLog = useSelector((state) => state.card.gameLog);
  const reduxMyArt = useSelector((state) => state.card.myArt);
  const reduxEnemyArt = useSelector((state) => state.card.enemyArt);
  // Per-card alternate-art choices from both players, so log thumbnails show
  // the same art as the cards on the board (same merge Selection/Game use).
  const logArt = { ...reduxEnemyArt, ...reduxMyArt };
  const reduxLastChatMessage = useSelector(
    (state) => state.card.lastChatMessage,
  );

  // Read the latest `minimized` from inside the message effect without making it
  // a dependency (which would re-fire on every collapse/expand).
  const minimizedRef = useRef(minimized);
  minimizedRef.current = minimized;

  // Keep the newest entry in view whenever the visible log grows or the user
  // switches tabs.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [reduxChatLog, reduxGameLog, activeTab]);

  // While minimized, a new incoming message pops a notification bubble next to
  // the chat launcher icon (same behaviour the old collapsed chat had).
  useEffect(() => {
    if (reduxLastChatMessage !== "" && minimizedRef.current) setOpenSnack(true);
  }, [reduxLastChatMessage]);

  // Auto-hide the bubble after 6s; a newer message while it's showing restarts
  // the countdown (reduxLastChatMessage in the deps).
  useEffect(() => {
    if (!openSnack) return undefined;
    const timer = setTimeout(() => setOpenSnack(false), 6000);
    return () => clearTimeout(timer);
  }, [openSnack, reduxLastChatMessage]);

  // Pin the panel's left edge to the Field's right edge: offset = Field right −
  // container left (negative, i.e. shifted left into the gap). Re-measured on
  // resize, on scale changes, and when the panel re-appears after being expanded.
  useLayoutEffect(() => {
    // Expanded mode is laid out by flex — nothing to measure or anchor.
    if (expanded) return undefined;
    const measure = () => {
      const panel = panelRef.current;
      const container = panel && panel.parentElement;
      const center = document.querySelector(".centerCanvas");
      if (panel && container && center) {
        const centerRight = center.getBoundingClientRect().right;
        const containerLeft = container.getBoundingClientRect().left;
        setLeftOffset(centerRight - containerLeft);
        // Free space runs up to where EnemyUI/PlayerUI actually start — they
        // sit inset within the right column, so this is wider than the column
        // edge. Use the leftmost of their edges; fall back to the column edge
        // if they aren't rendered.
        const uiPanels = Array.from(
          document.querySelectorAll(".rightSideCanvas .leaderPanel"),
        );
        const obstacleLeft = uiPanels.length
          ? Math.min(...uiPanels.map((el) => el.getBoundingClientRect().left))
          : containerLeft;
        setGapWidth(obstacleLeft - centerRight);
      }
      setViewportHeight(window.innerHeight);
      // Remember the open panel's height (offsetHeight ignores the scale
      // transform); it's retained while minimized so the icon stays put.
      if (innerRef.current) setPanelHeight(innerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
    // activeTab: the composer is hidden on the log tab, changing panel height.
  }, [scale, minimized, activeTab, expanded]);

  // The scale the panel actually renders at: the side-column scale, shrunk
  // only as much as needed so the panel stays clear of EnemyUI/PlayerUI and
  // fits the viewport height — but never below MIN_FIT_FRACTION of the normal
  // size, so it always stays usable.
  let effectiveScale = scale;
  if (gapWidth > 0) {
    effectiveScale = Math.min(
      effectiveScale,
      (gapWidth - GAP_MARGIN) / PANEL_WIDTH,
    );
  }
  if (panelHeight > 0 && viewportHeight > 0) {
    effectiveScale = Math.min(
      effectiveScale,
      (viewportHeight - 24) / panelHeight,
    );
  }
  effectiveScale = Math.max(effectiveScale, scale * MIN_FIT_FRACTION);

  const sendMessage = () => {
    if (chatMessage.trim() !== "") {
      dispatch(setChat(chatMessage));
      setChatMessage("");
    }
  };

  const restoreChat = () => {
    setMinimized(false);
    setOpenSnack(false);
  };

  // If a log thumbnail is being hovered when the log disappears (tab switch or
  // minimize), no mouseleave fires — close the zoom preview explicitly.
  useEffect(() => {
    if (activeTab !== "log" || minimized) setHovering?.(false);
  }, [activeTab, minimized, setHovering]);

  // The chat panel chrome (no positioning — the anchored wrapper in the render
  // places it). When minimized this is swapped for a small chat launcher at the
  // exact same spot.
  const panelInner = (
    <div
      ref={innerRef}
      style={{
        width: expanded ? "100%" : PANEL_WIDTH,
        ...(expanded ? { flex: 1, minHeight: 0 } : {}),
        display: "flex",
        flexDirection: "column",
        backgroundColor: PANEL_BG,
        backdropFilter: "blur(6px)",
        border: `1px solid ${BORDER}`,
        borderRadius: "14px",
        boxShadow: `${GLOW}, 0 12px 32px rgba(0, 0, 0, 0.5)`,
        overflow: "hidden",
      }}
    >
      {/* Header — minimize button on the LEFT so it lines up with the minimized
          chat icon, which sits at the panel's left (Field) edge. */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-start",
          gap: "0.5em",
          padding: "0.3em 0.4em",
          borderBottom: `1px solid ${BORDER}`,
          background:
            "linear-gradient(180deg, rgba(72,171,224,0.16) 0%, rgba(72,171,224,0) 100%)",
        }}
      >
        {!expanded && (
          <IconButton
            size="small"
            aria-label="minimize chat"
            onClick={() => setMinimized(true)}
            sx={{ color: META, "&:hover": { color: "#fff" } }}
          >
            <MinimizeIcon fontSize="small" />
          </IconButton>
        )}

        {/* Chat / Game Log tabs */}
        {[
          { key: "log", label: "Game Log" },
          { key: "chat", label: "Chat" },
        ].map(({ key, label }) => {
          const selected = activeTab === key;
          return (
            <button
              key={key}
              type="button"
              aria-pressed={selected}
              onClick={() => setActiveTab(key)}
              style={{
                padding: "0.3em 0.8em",
                borderRadius: "8px",
                border: selected
                  ? `1px solid ${ACCENT}`
                  : "1px solid transparent",
                background: selected
                  ? "rgba(72, 171, 224, 0.18)"
                  : "transparent",
                color: selected ? "#eaf6ff" : META,
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 0.5,
                textTransform: "uppercase",
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Message log */}
      <div
        ref={logRef}
        style={{
          // Expanded mode: fill whatever height the flex column grants the
          // panel. Normal mode: fixed heights — the log tab has no composer
          // below, so give the list that space back (keeps the overall panel
          // height about the same on both tabs).
          ...(expanded
            ? { flex: 1, minHeight: 0 }
            : { height: activeTab === "log" ? "660px" : "600px" }),
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.55em",
          padding: "0.8em 0.85em",
        }}
      >
        {activeTab === "log" &&
          reduxGameLog.map((entry, idx) => {
            const { time, text, mine } = parseMessage(entry.text);
            const side = mine ? LOG_MINE : LOG_THEIRS;
            // HP entries start with "-3 HP" / "+5 HP" — colour that token red
            // (loss) or green (gain); the rest of the line stays normal.
            const hpMatch = /^([+-]\d+ HP)([\s\S]*)$/.exec(text);
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.6em",
                  padding: "0.4em 0.55em",
                  borderRadius: "8px",
                  borderLeft: `3px solid ${side.border}`,
                  background: side.bg,
                }}
              >
                {/* Tiny thumbnail of the card the event is about; hovering it
                    shows the full card in the left-column ZoomedCard preview
                    (same mechanism as hovering a card on the board). */}
                {entry.card ? (
                  <img
                    src={artThumb(entry.card, logArt)}
                    onError={(e) => {
                      if (e.currentTarget.src.indexOf("/thumbs/") !== -1)
                        e.currentTarget.src = artImage(entry.card, logArt);
                    }}
                    alt={entry.card}
                    onMouseEnter={() => {
                      dispatch(setCurrentCard(entry.card));
                      setHovering?.(true);
                    }}
                    onMouseLeave={() => setHovering?.(false)}
                    style={{
                      width: expanded ? 44 : 26,
                      height: expanded ? 61 : 36,
                      objectFit: "cover",
                      borderRadius: 4,
                      border: "1px solid rgba(255, 255, 255, 0.2)",
                      flexShrink: 0,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    gap: 1,
                    minWidth: 0,
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: expanded ? 12.5 : 10.5,
                      letterSpacing: 0.4,
                    }}
                  >
                    <span style={{ color: side.accent }}>
                      {mine ? "You" : "Opponent"}
                    </span>
                    {time && <span style={{ color: META }}>{` · ${time}`}</span>}
                  </span>
                  <span
                    style={{
                      color: "#eaf6ff",
                      fontFamily: SERIF,
                      fontSize: expanded ? 16 : 13,
                      lineHeight: 1.35,
                      wordBreak: "break-word",
                    }}
                  >
                    {hpMatch ? (
                      <>
                        <span
                          style={{
                            color: hpMatch[1].startsWith("-")
                              ? "#ff7b72"
                              : "#7ee787",
                            fontWeight: 600,
                          }}
                        >
                          {hpMatch[1]}
                        </span>
                        {hpMatch[2]}
                      </>
                    ) : (
                      text
                    )}
                  </span>
                </div>
              </div>
            );
          })}
        {activeTab === "chat" &&
          reduxChatLog.map((raw, idx) => {
            const { time, text, mine } = parseMessage(raw);
            // Same side colours as the game log: light blue = you, light red
            // = opponent.
            const side = mine ? LOG_MINE : LOG_THEIRS;
            return (
              <div
                key={idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: mine ? "flex-end" : "flex-start",
                  maxWidth: "100%",
                }}
              >
                <div
                  style={{
                    maxWidth: "82%",
                    padding: "0.45em 0.65em",
                    borderRadius: mine
                      ? "12px 12px 4px 12px"
                      : "12px 12px 12px 4px",
                    background: side.bg,
                    border: `1px solid ${side.border}`,
                    color: "#eaf6ff",
                    fontFamily: SERIF,
                    fontSize: expanded ? 17 : 14,
                    lineHeight: 1.35,
                    whiteSpace: "pre-line",
                    wordBreak: "break-word",
                  }}
                >
                  {text}
                </div>
                <span
                  style={{
                    marginTop: 2,
                    padding: "0 0.25em",
                    fontFamily: MONO,
                    fontSize: expanded ? 12.5 : 10.5,
                    letterSpacing: 0.4,
                  }}
                >
                  <span style={{ color: side.accent }}>
                    {mine ? "You" : "Opponent"}
                  </span>
                  {time && <span style={{ color: META }}>{` · ${time}`}</span>}
                </span>
              </div>
            );
          })}
      </div>

      {/* Composer — only on the chat tab; the game log has no input at all. */}
      {activeTab === "chat" && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5em",
            padding: "0.65em 0.85em",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <InputBase
            value={chatMessage}
            placeholder="Type a message…"
            inputProps={{ maxLength: 50, "aria-label": "chat message" }}
            onChange={(e) => setChatMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                sendMessage();
              }
            }}
            sx={{
              flex: 1,
              px: 1.25,
              py: 0.55,
              borderRadius: "10px",
              backgroundColor: "rgba(0, 0, 0, 0.45)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              color: "#eaf6ff",
              fontFamily: SERIF,
              fontSize: expanded ? 16 : 14,
              transition: "border-color 120ms ease, box-shadow 120ms ease",
              "&.Mui-focused": {
                border: `1px solid ${ACCENT}`,
                boxShadow: "0 0 0 2px rgba(72, 171, 224, 0.25)",
              },
              "& input::placeholder": { color: META, opacity: 1 },
            }}
          />
          <IconButton
            aria-label="send message"
            onClick={sendMessage}
            disabled={chatMessage.trim() === ""}
            sx={{
              color: "#fff",
              backgroundColor: ACCENT,
              borderRadius: "10px",
              width: 38,
              height: 38,
              "&:hover": { backgroundColor: "#5cb9ec" },
              "&.Mui-disabled": {
                backgroundColor: "rgba(72, 171, 224, 0.25)",
                color: "rgba(255, 255, 255, 0.4)",
              },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </div>
      )}
    </div>
  );

  // Expanded-log view: just the panel, in-flow, stretching to fill the column
  // between the compact enemy/player bars. No anchored wrapper, no footprint
  // row (the Hide-UI control stays available in the top-left stack).
  if (expanded) {
    return (
      <div
        style={{
          flex: 1,
          minHeight: 0,
          width: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {panelInner}
      </div>
    );
  }

  return (
    <React.Fragment>
      {/* In-flow footprint: this is the 3rd flex item of the right column, so
          EnemyUI / PlayerUI keep their exact positions. Just the Hide-UI button
          now — the chat launcher lives at the panel's own spot (below). */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.35em",
          transform: `scale(${scale})`,
          transformOrigin: "center right",
        }}
      >
        <HideUiButton />
      </div>

      {/* Anchored at the Field's right edge, vertically centred. Shows the full
          chat panel, or — when minimized — just the chat launcher icon in the
          very same place (no longer the bottom-right corner). */}
      <div
        ref={panelRef}
        style={{
          position: "absolute",
          left: leftOffset,
          // Top-anchored at (vertical centre − half the panel height) so the
          // panel stays centred, and the minimized icon — which replaces the
          // header — appears at that same top spot (where the minimize button
          // was) rather than jumping to the vertical centre.
          top: `calc(50% - ${(panelHeight * effectiveScale) / 2}px)`,
          transform: `scale(${effectiveScale})`,
          transformOrigin: "top left",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        {minimized ? (
          <>
            {/* Hidden copy of the panel so its height can be measured even when
                the chat starts minimized (keeps the launcher icon anchored where
                the panel's minimize button will be). */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                visibility: "hidden",
                pointerEvents: "none",
              }}
            >
              {panelInner}
            </div>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
              <Button
                variant="outlined"
                aria-label="open chat"
                onClick={restoreChat}
                sx={{
                  minWidth: 0,
                  px: 1.25,
                  py: 0.75,
                  borderRadius: "10px",
                  border: `1px solid ${BORDER}`,
                  backgroundColor: PANEL_BG,
                  backdropFilter: "blur(6px)",
                  boxShadow: GLOW,
                  "&:hover": {
                    border: `1px solid ${ACCENT}`,
                    backgroundColor: "rgba(72, 171, 224, 0.18)",
                  },
                }}
              >
                <ChatIcon sx={{ color: "#eaf6ff" }} />
              </Button>

              {/* Notification bubble, right next to the launcher icon. Clicking
                  it opens the chat; the X just dismisses it. */}
              {openSnack && (
                <div
                  role="button"
                  aria-label="new chat message, open chat"
                  onClick={() => {
                    // A chat notification should land on the Chat tab, even
                    // though the panel defaults to the Game Log tab.
                    setActiveTab("chat");
                    restoreChat();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 8,
                    width: "max-content",
                    maxWidth: 260,
                    padding: "0.5em 0.5em 0.5em 0.75em",
                    backgroundColor: PANEL_BG,
                    backdropFilter: "blur(6px)",
                    color: "#eaf6ff",
                    border: `1px solid ${BORDER}`,
                    borderRadius: "12px",
                    boxShadow: GLOW,
                    fontFamily: SERIF,
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{ display: "flex", flexDirection: "column", gap: 3 }}
                  >
                    <span
                      style={{
                        color: ACCENT,
                        fontFamily: MONO,
                        fontSize: 11,
                        letterSpacing: 0.5,
                        textTransform: "uppercase",
                      }}
                    >
                      New message
                    </span>
                    <span style={{ fontSize: 14, wordBreak: "break-word" }}>
                      {reduxLastChatMessage}
                    </span>
                  </span>
                  <IconButton
                    size="small"
                    aria-label="dismiss notification"
                    sx={{ color: META, "&:hover": { color: "#fff" } }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenSnack(false);
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
            </div>
          </>
        ) : (
          panelInner
        )}
      </div>
    </React.Fragment>
  );
}
