import React, { useState } from "react";
import Button from "@mui/material/Button";
import AnimatedList from "../reactbits/AnimatedList";

import forest from "../../assets/logo/forest.png";
import sword from "../../assets/logo/sword.png";
import rune from "../../assets/logo/rune.png";
import dragon from "../../assets/logo/dragon.png";
import abyss from "../../assets/logo/abyss.png";
import haven from "../../assets/logo/haven.png";
import idolmaster from "../../assets/logo/idolmaster.png";
import umamusume from "../../assets/logo/umamusume.png";
import vanguard from "../../assets/logo/vanguard.png";

// Map a deck's `class` field to its craft/collab icon. Unknown/neutral has no
// entry and falls back to a neutral placeholder in classIcon().
const CLASS_ICONS = {
  forest,
  sword,
  rune,
  dragon,
  abyss,
  haven,
  idolmaster,
  umamusume,
  vanguard,
};

function classIcon(deckClass) {
  return CLASS_ICONS[(deckClass || "").toLowerCase()] || null;
}

const panelText = {
  color: "#ffffff",
  fontFamily: "Noto Serif JP, serif",
};

function GameRow({ icon, name, code, players, right }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.6em",
        padding: "0.55em 0",
        borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon ? (
          <img
            src={icon}
            alt=""
            style={{ maxWidth: "100%", maxHeight: "100%" }}
          />
        ) : (
          <div
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              border: "2px solid rgba(125, 167, 189, 0.6)",
            }}
          />
        )}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div
          style={{
            ...panelText,
            fontSize: 15,
            fontWeight: "bold",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {name}
        </div>
        <div
          style={{
            color: "#7da7bd",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: 12,
          }}
        >
          #{code} · {players}/2 players
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </div>
  );
}

export default function ActiveGamesBoard({
  rooms = [],
  myRoom = null,
  reconnectRoom = null,
  onJoin,
  onReconnect,
  onTogglePrivacy,
  onCloseRoom,
  maxHeight = "70vh",
  isMobile = false,
}) {
  // Never list the host's own room in the public section — it shows in "Your
  // room" instead, even while public (so they don't see a Join button on it).
  const publicRooms = rooms.filter(
    (r) => !myRoom || r.roomId !== myRoom.roomId,
  );

  // Copy-room-code feedback: the Copy button briefly reads "Copied!".
  const [copied, setCopied] = useState(false);
  const copyRoomCode = () => {
    if (!myRoom) return;
    const code = String(myRoom.roomId);
    // Textarea fallback for contexts where the async Clipboard API is
    // unavailable (e.g. plain-http hosts).
    const fallbackCopy = () => {
      const ta = document.createElement("textarea");
      ta.value = code;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    };
    const done = () => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    };
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(code).then(done, () => {
        fallbackCopy();
        done();
      });
    } else {
      fallbackCopy();
      done();
    }
  };

  return (
    <div
      style={{
        width: "100%",
        maxHeight,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "rgba(10, 14, 20, 0.75)",
        border: "1px solid rgba(72, 171, 224, 0.5)",
        borderRadius: "10px",
        boxShadow: "0 0 20px rgba(10, 175, 230, 0.25)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "0.6em 1em",
          borderBottom: "1px solid rgba(72, 171, 224, 0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: "#daf6ff",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: 18,
            letterSpacing: "0.08em",
            textShadow: "0 0 12px rgba(10, 175, 230, 0.8)",
          }}
        >
          ACTIVE GAMES
        </span>
        <span
          style={{
            color: "#7da7bd",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: 13,
          }}
        >
          {publicRooms.length} open
        </span>
      </div>

      {/* Rows as a React Bits AnimatedList: labels and game rows each
          scale/fade in as they scroll into view. Keyboard navigation stays off
          (it grabs Tab/arrow keys page-wide, which the Home inputs need). */}
      <AnimatedList
        className="home-games-list"
        enableArrowNavigation={false}
        displayScrollbar={false}
        showGradients
        items={buildListItems()}
      />
    </div>
  );

  // Assembles the list rows in display order: reconnect, your room, then the
  // public games (or the empty-state note).
  function buildListItems() {
    const sectionLabel = (text, key) => ({
      key,
      node: (
        <div
          style={{
            color: "#7da7bd",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: 11,
            letterSpacing: "0.1em",
            paddingTop: "0.6em",
          }}
        >
          {text}
        </div>
      ),
    });

    const listItems = [];
    if (reconnectRoom) {
      listItems.push(sectionLabel("RECONNECT", "reconnect-label"));
      listItems.push({
        key: "reconnect",
        node: (
          <GameRow
              icon={null}
              name="Your game in progress"
              code={reconnectRoom}
              players={1}
              right={
                <Button
                  size="small"
                  onClick={() => onReconnect?.(reconnectRoom)}
                  sx={{
                    minWidth: 0,
                    fontFamily: "Noto Serif JP, serif",
                    fontSize: 13,
                    fontWeight: "bold",
                    textTransform: "none",
                    color: "#0a0e14",
                    backgroundColor: "#f0c674",
                    borderRadius: "6px",
                    px: 1.5,
                    "&:hover": {
                      backgroundColor: "#f6d790",
                      boxShadow: "0 0 12px rgba(240, 198, 116, 0.8)",
                    },
                  }}
                >
                  Reconnect
                </Button>
              }
            />
        ),
      });
    }
    if (myRoom) {
      listItems.push(sectionLabel("YOUR ROOM", "mine-label"));
      listItems.push({
        key: "mine",
        node: (
          <GameRow
              icon={classIcon(myRoom.deckClass)}
              name={`${myRoom.hostName || "You"} (you)`}
              code={myRoom.roomId}
              players={1}
              right={
                <div style={{ display: "flex", alignItems: "center", gap: "0.4em" }}>
                  <Button
                    size="small"
                    onClick={copyRoomCode}
                    sx={{
                      minWidth: 0,
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: 11,
                      textTransform: "none",
                      color: copied ? "#7ee2a8" : "#48abe0",
                      border: "1px solid",
                      borderColor: copied
                        ? "rgba(126, 226, 168, 0.6)"
                        : "rgba(72, 171, 224, 0.6)",
                      borderRadius: "6px",
                      px: 1,
                      "&:hover": {
                        backgroundColor: "rgba(72, 171, 224, 0.15)",
                      },
                    }}
                  >
                    {copied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onTogglePrivacy?.(!myRoom.isPrivate)}
                    sx={{
                      minWidth: 0,
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: 11,
                      textTransform: "none",
                      color: myRoom.isPrivate ? "#f0c674" : "#48abe0",
                      border: "1px solid",
                      borderColor: myRoom.isPrivate
                        ? "rgba(240, 198, 116, 0.6)"
                        : "rgba(72, 171, 224, 0.6)",
                      borderRadius: "6px",
                      px: 1,
                    }}
                  >
                    {myRoom.isPrivate ? "Private" : "Public"}
                  </Button>
                  <Button
                    size="small"
                    onClick={() => onCloseRoom?.()}
                    aria-label="Close room"
                    sx={{
                      minWidth: 0,
                      fontFamily: "Share Tech Mono, monospace",
                      fontSize: 13,
                      lineHeight: 1,
                      textTransform: "none",
                      color: "#e06a6a",
                      border: "1px solid rgba(224, 106, 106, 0.6)",
                      borderRadius: "6px",
                      px: 0.8,
                      "&:hover": {
                        backgroundColor: "rgba(224, 106, 106, 0.15)",
                      },
                    }}
                  >
                    ✕
                  </Button>
                </div>
              }
            />
        ),
      });
      listItems.push(sectionLabel("PUBLIC", "public-label"));
    }

    if (publicRooms.length === 0) {
      listItems.push({
        key: "empty",
        node: (
          <div
            style={{
              ...panelText,
              color: "#c9d6dd",
              fontSize: 13,
              textAlign: "center",
              padding: "1.5em 0.5em",
              lineHeight: 1.4,
            }}
          >
            No open games right now.
            {!isMobile && (
              <>
                <br />
                Press PLAY to host one.
              </>
            )}
          </div>
        ),
      });
    } else {
      publicRooms.forEach((room) => {
        listItems.push({
          key: room.roomId,
          node: (
            <GameRow
              icon={classIcon(room.deckClass)}
              name={room.hostName || "Anonymous"}
              code={room.roomId}
              players={room.players}
              right={
                <Button
                  size="small"
                  onClick={() => onJoin?.(room.roomId)}
                  sx={{
                    minWidth: 0,
                    fontFamily: "Noto Serif JP, serif",
                    fontSize: 13,
                    fontWeight: "bold",
                    textTransform: "none",
                    color: "#0a0e14",
                    backgroundColor: "#48abe0",
                    borderRadius: "6px",
                    px: 1.5,
                    "&:hover": {
                      backgroundColor: "#6fc3ef",
                      boxShadow: "0 0 12px rgba(72, 171, 224, 0.8)",
                    },
                  }}
                >
                  Join
                </Button>
              }
            />
          ),
        });
      });
    }
    return listItems;
  }
}
