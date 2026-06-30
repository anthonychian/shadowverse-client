import React, { useState, useEffect, useLayoutEffect, useRef } from "react";
import ChatIcon from "@mui/icons-material/Chat";
import SendIcon from "@mui/icons-material/Send";
import MinimizeIcon from "@mui/icons-material/Minimize";
import CloseIcon from "@mui/icons-material/Close";
import {
  IconButton,
  InputBase,
  Button,
  Snackbar,
  SnackbarContent,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { setChat } from "../../redux/CardSlice";
import HideUiButton from "./HideUiButton";

// Shared palette, lifted from the Home "Announcements" board so the in-game chat
// reads as the same product surface: a dark translucent panel with a cyan-blue
// border + glow, serif body text and a mono timestamp.
const PANEL_BG = "rgba(10, 14, 20, 0.92)";
const BORDER = "rgba(72, 171, 224, 0.5)";
const GLOW = "0 0 22px rgba(10, 175, 230, 0.28)";
const ACCENT = "#48abe0";
const META = "#7da7bd";
const BODY = "#c9d6dd";
const SERIF = "Noto Serif JP, serif";
const MONO = "Share Tech Mono, monospace";

// Chat log entries are stored as "[HH:MM] (Me): text" / "[HH:MM] (Player 2): text".
// Pull the timestamp, sender and text apart so each can be styled on its own.
const parseMessage = (raw) => {
  const m = /^\[(.*?)\]\s*\((.*?)\):\s*([\s\S]*)$/.exec(raw || "");
  if (!m) return { time: "", text: raw || "", mine: raw?.[9] === "M" };
  return { time: m[1], text: m[3], mine: m[2] === "Me" };
};

export default function ChatUI({ scale = 1 }) {
  const dispatch = useDispatch();
  const [chatMessage, setChatMessage] = useState("");
  const [minimized, setMinimized] = useState(false);
  const [openSnack, setOpenSnack] = useState(false);
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

  const reduxChatLog = useSelector((state) => state.card.chatLog);
  const reduxLastChatMessage = useSelector(
    (state) => state.card.lastChatMessage,
  );

  // Read the latest `minimized` from inside the message effect without making it
  // a dependency (which would re-fire on every collapse/expand).
  const minimizedRef = useRef(minimized);
  minimizedRef.current = minimized;

  // Keep the newest message in view whenever the log grows.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [reduxChatLog]);

  // While minimized, a new incoming message pops a notification snackbar (same
  // behaviour the old collapsed chat had).
  useEffect(() => {
    if (reduxLastChatMessage !== "" && minimizedRef.current) setOpenSnack(true);
  }, [reduxLastChatMessage]);

  // Pin the panel's left edge to the Field's right edge: offset = Field right −
  // container left (negative, i.e. shifted left into the gap). Re-measured on
  // resize, on scale changes, and when the panel re-appears after being expanded.
  useLayoutEffect(() => {
    const measure = () => {
      const panel = panelRef.current;
      const container = panel && panel.parentElement;
      const center = document.querySelector(".centerCanvas");
      if (panel && container && center) {
        setLeftOffset(
          center.getBoundingClientRect().right -
            container.getBoundingClientRect().left,
        );
      }
      // Remember the open panel's height (offsetHeight ignores the scale
      // transform); it's retained while minimized so the icon stays put.
      if (innerRef.current) setPanelHeight(innerRef.current.offsetHeight);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [scale, minimized]);

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

  // The chat panel chrome (no positioning — the anchored wrapper in the render
  // places it). When minimized this is swapped for a small chat launcher at the
  // exact same spot.
  const panelInner = (
    <div
      ref={innerRef}
      style={{
        width: 290,
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
        <IconButton
          size="small"
          aria-label="minimize chat"
          onClick={() => setMinimized(true)}
          sx={{ color: META, "&:hover": { color: "#fff" } }}
        >
          <MinimizeIcon fontSize="small" />
        </IconButton>
      </div>

      {/* Message log */}
      <div
        ref={logRef}
        style={{
          height: "190px",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          gap: "0.55em",
          padding: "0.8em 0.85em",
        }}
      >
        {reduxChatLog.length === 0 && (
          <div
            style={{
              margin: "auto",
              color: META,
              fontFamily: SERIF,
              fontSize: 13,
              textAlign: "center",
              opacity: 0.8,
            }}
          >
            No messages yet. Say hello!
          </div>
        )}
        {reduxChatLog.map((raw, idx) => {
          const { time, text, mine } = parseMessage(raw);
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
                  background: mine
                    ? "rgba(72, 171, 224, 0.20)"
                    : "rgba(255, 255, 255, 0.06)",
                  border: mine
                    ? "1px solid rgba(72, 171, 224, 0.5)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
                  color: mine ? "#eaf6ff" : BODY,
                  fontFamily: SERIF,
                  fontSize: 14,
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
                  color: META,
                  fontFamily: MONO,
                  fontSize: 10.5,
                  letterSpacing: 0.4,
                }}
              >
                {mine ? "You" : "Opponent"}
                {time ? ` · ${time}` : ""}
              </span>
            </div>
          );
        })}
      </div>

      {/* Composer */}
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
            fontSize: 14,
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
    </div>
  );

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
          top: `calc(50% - ${(panelHeight * scale) / 2}px)`,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
          zIndex: 10,
          pointerEvents: "auto",
        }}
      >
        {minimized ? (
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
        ) : (
          panelInner
        )}
      </div>

      {/* Notification while minimized — same as the old collapsed-chat behaviour. */}
      {minimized && (
        <Snackbar
          open={openSnack}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          autoHideDuration={6000}
          onClose={(e, reason) => {
            if (reason !== "clickaway") setOpenSnack(false);
          }}
        >
          <SnackbarContent
            sx={{
              backgroundColor: PANEL_BG,
              backdropFilter: "blur(6px)",
              color: "#eaf6ff",
              border: `1px solid ${BORDER}`,
              borderRadius: "12px",
              boxShadow: GLOW,
              fontFamily: SERIF,
            }}
            message={
              <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
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
                <span style={{ fontSize: 14 }}>{reduxLastChatMessage}</span>
              </span>
            }
            action={
              <IconButton
                size="small"
                aria-label="open chat"
                sx={{ color: META, "&:hover": { color: "#fff" } }}
                onClick={restoreChat}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            }
          />
        </Snackbar>
      )}
    </React.Fragment>
  );
}
