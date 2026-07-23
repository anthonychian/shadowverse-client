import React, { useState, useEffect, useMemo, useRef } from "react";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import wallpaper from "../../src/assets/wallpapers/3.png";

import galmieux from "../../src/assets/wallpapers/Galmieux.png";
import viridia from "../../src/assets/wallpapers/viridia.png";
import piercye from "../../src/assets/wallpapers/piercye.png";
import kuon from "../../src/assets/wallpapers/Kuon.png";
import korwa from "../../src/assets/wallpapers/Korwa.png";
import tsubaki from "../../src/assets/wallpapers/Tsubaki.png";
import grimnir from "../../src/assets/wallpapers/Grimnir.png";

import cardback from "../assets/cardbacks/default.png";
import discord from "../assets/buttons/discord.png";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  setDeck,
  setEvoDeck,
  setRoom,
  setActiveUsers,
  setDeckClass,
  setMyArt,
} from "../redux/CardSlice";
import { deleteDeck, selectDecks } from "../redux/DeckSlice";
import { useAuth, discordName } from "../auth/AuthProvider";
import AccountBadge from "../components/AccountBadge";
import { cardImage, artThumb } from "../decks/getCards";
import useMediaQuery from "@mui/material/useMediaQuery";
import { computeDeckClass } from "../decks/cardDetails";
import {
  socket,
  saveRoom,
  getSavedRoom,
  clearSavedRoom,
  clearSavedState,
} from "../sockets";
import { setGameMode } from "../redux/GameStateSlice";
import ActiveGamesBoard from "../components/ui/ActiveGamesBoard";
import { ensureShare } from "../lib/shares";

import CloseIcon from "@mui/icons-material/Close";
import {
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip,
} from "@mui/material";

import "../css/Home.css";

// React Bits (reactbits.dev) flair: gradient title, star-orbit borders on the
// PLAY / JOIN ROOM buttons, a rolling odometer on the online tally, and the
// LogoLoop deck strip.
import Carousel from "../components/reactbits/Carousel";
import Counter from "../components/reactbits/Counter";
import GradientText from "../components/reactbits/GradientText";
import LogoLoop from "../components/reactbits/LogoLoop";
import StarBorder from "../components/reactbits/StarBorder";

// Names of the leaders shown on the Home screen, keyed by `leaderNum` (see
// randomLeader). Used as the default lobby display name so an un-named player is
// labelled after the leader currently on their Home page rather than "Anonymous".
const LEADER_NAMES = {
  1: "Galmieux",
  2: "Kuon",
  3: "Korwa",
  4: "Viridia",
  5: "Tsubaki",
  6: "Grimnir",
  7: "Piercye",
};


// One slot in the mobile deck carousel. A fixed-width centering slot so each
// item (scaled via transform, which doesn't affect layout) snaps to the centre.
const CAROUSEL_SLOT_W = 150;
const carouselSlot = {
  flexShrink: 0,
  width: CAROUSEL_SLOT_W,
  scrollSnapAlign: "center",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
};

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedDeck, setSelectedDeck] = useState({});
  const [deckMap] = useState(new Map());
  const [evoDeckMap] = useState(new Map());

  const [showSelected, setShowSelected] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [roomNumber, setRoomNumber] = useState("");
  const [name, setName] = useState("");
  const [openDialogue, setOpenDialogue] = useState(false);
  const [leaderImage, setLeaderImage] = useState(null);
  const [leaderNum, setLeaderNum] = useState(0);
  const [openSnack, setOpenSnack] = useState(false);
  const [deckIdx, setDeckIdx] = useState(0);
  // Join Room modal (desktop): opened by the JOIN ROOM button, holds the
  // room-code input.
  const [joinOpen, setJoinOpen] = useState(false);
  // Bottom-center hint snackbar (message string, or null when hidden). Shown
  // when PLAY / JOIN ROOM is pressed with no deck selected, or JOIN ROOM while
  // already hosting a room.
  const [hintSnack, setHintSnack] = useState(null);

  // Lobby board state. `rooms` is the live list of joinable public games pushed
  // by the server; `myRoom` is the room this tab is currently hosting (shown in
  // its own section with a public/private toggle), or null if none.
  const [rooms, setRooms] = useState([]);
  const [myRoom, setMyRoom] = useState(null);
  // A room this player was in and can rejoin (private to them ΓÇö see the lobby
  // effect). null when there's nothing to reconnect to.
  const [reconnectRoom, setReconnectRoom] = useState(null);

  // Phone layout: a single scrollable column instead of the desktop's
  // absolutely-positioned panels. The announcements board collapses behind a
  // toggle and the Discord/DingDongDB links are hidden to save space.
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [showAnnounce, setShowAnnounce] = useState(false);
  // Mobile deck carousel (infinite/looping). carouselActiveK = global slot index
  // (across the 3 rendered copies) nearest the centre ΓÇö that slot scales up.
  const carouselRef = useRef(null);
  const carouselSettleRef = useRef(null);
  const [carouselActiveK, setCarouselActiveK] = useState(0);

  const reduxDecks = useSelector(selectDecks);
  const reduxActiveUsers = useSelector((state) => state.card.activeUsers);
  const numLeaders = 7;

  // The display name is not user-editable: signed in via Discord it's the
  // Discord display name; otherwise it defaults to the leader shown on this
  // Home page (the only way to set a custom name is to log in with Discord).
  const { user: authUser } = useAuth();
  const displayName =
    (authUser && discordName(authUser)) || LEADER_NAMES[leaderNum] || "";

  // Announcements board ΓÇö add new entries to the top of this list.
  // Each entry: { date, title, body }
  const announcements = [
    {
      date: "2026-07-18",
      title: "Discord login & cloud decks",
      body: "Sign in with Discord to store your decks in the cloud and use them from any device.",
    },
    {
      date: "2026-06-21",
      title: "Card list updated to BP20",
      body: "The deck builder now includes all cards up to and including BP20.",
    },
    {
      date: "2026-06-21",
      title: "Click and drag added in Game",
      body: "Drag cards from your hand and from the deck, cemetery, and token modals straight onto the field.",
    },
    {
      date: "2026-06-21",
      title: "Import from Decklog EN/JP",
      body: "Build a deck instantly by importing from a Decklog EN/JP URL or share code.",
    },
    {
      date: "2026-06-11",
      title: "Automatic reconnection after desync",
      body: "Games now self-heal from desyncs and automatically reconnect you to keep play in sync.",
    },
  ];

  // Announcement entries mapped for the React Bits Carousel (date as `meta`).
  const announceItems = announcements.map((a, i) => ({
    id: i + 1,
    title: a.title,
    description: a.body,
    meta: a.date,
  }));

  useEffect(() => {
    dispatch(setGameMode("manual"));

    const onStartGame = () => handleNavigateToGame();

    const onActiveUsers = (data) => dispatch(setActiveUsers(data));
    socket.on("start_game", onStartGame);
    socket.on("active_users", onActiveUsers);
    // Remove these on unmount; otherwise each return trip to Home stacks another
    // start_game handler (firing navigate multiple times) and leaves a stale one
    // alive that could yank the host into a game while they're off another page.
    return () => {
      socket.off("start_game", onStartGame);
      socket.off("active_users", onActiveUsers);
    };
  }, [dispatch, socket]);

  // Subscribe to the lobby so the active-games board updates live. Request the
  // current snapshot on mount (also covers reconnects, since the listener stays
  // registered). Leave the lobby channel on unmount (e.g. navigating to a game).
  useEffect(() => {
    socket.on("rooms_update", (data) => {
      setRooms(Array.isArray(data) ? data : []);
      // The lobby changed (someone created/joined/left/disconnected). Re-probe
      // our saved room so a stale Reconnect card clears the moment the last
      // player leaves it (room drops to 0 connected). Without this the probe
      // would only run once on mount and the button would linger.
      const saved = getSavedRoom();
      if (saved) socket.emit("check_room", { room: saved });
    });

    // Reconnect probe: if this tab remembers a room, ask the server (privately)
    // whether it's still rejoinable. Offer a Reconnect card only when the room
    // is alive (an opponent is there) and this socket isn't already a member of
    // it ΓÇö i.e. a game we dropped out of, not our own open lobby room. A dead
    // room (0 connected) is forgotten so the stale entry doesn't linger.
    socket.on("room_status", ({ room, connected, isMember }) => {
      if (room !== getSavedRoom()) return;
      if (!isMember && connected >= 1 && connected < 2) {
        setReconnectRoom(room);
      } else {
        setReconnectRoom(null);
        if (connected === 0) {
          clearSavedRoom();
          clearSavedState(room);
        }
      }
    });

    socket.emit("lobby_join");
    socket.emit("request_rooms");
    const saved = getSavedRoom();
    if (saved) socket.emit("check_room", { room: saved });

    return () => {
      socket.emit("lobby_leave");
      socket.off("rooms_update");
      socket.off("room_status");
    };
  }, [socket]);

  useEffect(() => {
    setLeaderImage(randomLeader());
  }, []);

  useEffect(() => {
    setShowSelected(new Array(reduxDecks.length).fill(false));
  }, [reduxDecks]);

  // Centre the carousel on New Deck (middle copy) on mount / when the deck count
  // changes, so there's a full copy to swipe to on each side. Runs for both the
  // desktop and mobile layouts (only one carousel is mounted at a time, so the
  // single carouselRef always points at the visible one).
  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    const n = reduxDecks.length + 1;
    el.scrollLeft = n * CAROUSEL_SLOT_W;
    setCarouselActiveK(n);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, reduxDecks.length]);

  // const handleStartHover = (key) => {
  //   setHover(true);
  //   setHoverCard(key);
  // };
  // const handleEndHover = () => {
  //   setHover(false);
  //   setHoverCard("");
  // };

  // Preview opens the deck's own page — the same page its share link points at,
  // so there's only one deck view. It requires a Discord login: the page is a
  // `shared_decks` row, and only a signed-in user can own one. Decks saved
  // while signed in already have a URL; older ones get one on demand here.
  const handlePreviewDeck = async (deckArg) => {
    const d = deckArg || selectedDeck;
    handleClose();
    if (!d || !d.deck || d.deck.length === 0) return;

    if (!authUser) {
      setHintSnack("Sign in with Discord to preview a deck.");
      return;
    }
    if (d.shareId) {
      navigate(`/decks/${d.shareId}`);
      return;
    }
    try {
      const share = await ensureShare({
        userId: authUser.id,
        ownerName: discordName(authUser),
        deck: d,
      });
      navigate(`/decks/${share.id}`);
    } catch (e) {
      console.warn("Couldn’t open the deck's page:", e.message || e);
      setHintSnack("Couldn’t open this deck. Try again in a moment.");
    }
  };

  const handleOpenDialogue = () => {
    setOpenDialogue(true);
    handleClose();
  };
  const handleCloseDialogue = () => {
    setOpenDialogue(false);
  };

  // A deck's class: its declared class (required in the builder) or, for legacy
  // decks, computed from contents.
  const deckClassOf = (d) =>
    (d && (d.class || computeDeckClass(d.deck))) || "";

  // No deck picked yet: PLAY / JOIN ROOM render dimmed and clicking them shows
  // the select-a-deck hint instead of acting.
  const noDeck = Object.keys(selectedDeck).length === 0;

  const joinRoomWithMode = (roomId) => {
    dispatch(setRoom(roomId));
    saveRoom(roomId);
    dispatch(setDeckClass(deckClassOf(selectedDeck)));
    dispatch(setGameMode("manual"));
    socket.emit("join_room", roomId);
  };

  const handleCreateRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (socket.id) {
        const roomId = parseInt(Math.random() * 10000000).toString();
        // Hosting a fresh game abandons any game we could have reconnected to.
        const prev = getSavedRoom();
        if (prev && prev !== roomId) clearSavedState(prev);
        setReconnectRoom(null);
        setRoomNumber(roomId);
        const room = {
          roomId,
          hostName: displayName || "Challenger",
          // Prefer the deck's declared class (now required in the builder); fall
          // back to computing it from the card contents for legacy decks.
          deckClass: deckClassOf(selectedDeck),
          isPrivate: false,
        };
        setMyRoom(room);
        socket.emit("create_room", room);
        // Host stays on Home and waits for an opponent: emitting join_room here
        // would trip the server's start_game (it starts the game as soon as anyone
        // joins a room with <2 players), yanking the host into an empty game the
        // moment they press PLAY. The opponent's later join_room starts the game
        // for both.
        dispatch(setRoom(roomId));
        saveRoom(roomId);
        dispatch(setDeckClass(deckClassOf(selectedDeck)));
        dispatch(setGameMode("manual"));
      }
    }
  };
  const handleJoinRoom = () => {
    if (Object.keys(selectedDeck).length !== 0) {
      if (roomNumber !== "") {
        setRoomNumber(roomNumber.toString());
        joinRoomWithMode(roomNumber.toString());
      }
    }
  };

  // Submit from the Join Room modal. Same guards as handleJoinRoom (needs a
  // code and a selected deck); closes the modal once the join is sent.
  const handleJoinSubmit = () => {
    if (roomNumber === "" || Object.keys(selectedDeck).length === 0) return;
    handleJoinRoom();
    setJoinOpen(false);
  };

  // Join an open game straight from the board. Mirrors handleJoinRoom but takes
  // the target room id directly. Requires a selected deck (same guard as the
  // manual join/create flows) — without it there's nothing to play.
  const handleJoinPublicRoom = (roomId) => {
    if (Object.keys(selectedDeck).length === 0) return;
    setRoomNumber(roomId);
    joinRoomWithMode(roomId);
  };

  // Rejoin a game we previously dropped out of. The room/state are still in
  // sessionStorage, so navigating to /game lets Field.js run its normal rejoin +
  // state-resync handshake on mount.
  const handleReconnect = (roomId) => {
    dispatch(setRoom(roomId));
    saveRoom(roomId);
    navigate("/game");
  };

  const handleTogglePrivacy = (isPrivate) => {
    if (!myRoom) return;
    setMyRoom({ ...myRoom, isPrivate });
    socket.emit("set_room_privacy", { roomId: myRoom.roomId, isPrivate });
  };

  // Close the room we're hosting: tell the server to drop it (which de-registers
  // it from everyone's board) and clear our local state so the slot is gone.
  const handleCloseRoom = () => {
    if (!myRoom) return;
    socket.emit("leave_room", myRoom.roomId);
    clearSavedState(myRoom.roomId);
    clearSavedRoom();
    setMyRoom(null);
    setRoomNumber("");
    dispatch(setRoom(""));
  };

  const handleDeleteDeck = () => {
    handleClose();
    handleCloseDialogue();
    dispatch(deleteDeck(name));
  };

  const handleClose = () => {
    setContextMenu(null);
  };
  const handleContextMenu = (event, deck, idx) => {
    setName(deck.name);
    setDeckIdx(idx);
    event.preventDefault();
    setContextMenu(
      contextMenu === null
        ? {
            mouseX: event.clientX + 2,
            mouseY: event.clientY - 6,
          }
        : null,
    );
    handleSelectDeck(deck, idx);
  };

  const handleRoomNumberInput = (event) => {
    setRoomNumber(event.target.value);
  };

  const handleNavigateToDeck = () => {
    // Leaving matchmaking for the builder ΓÇö close any room we're hosting so it
    // doesn't linger on everyone's board as an unjoinable ghost.
    handleCloseRoom();
    navigate("/deck");
  };

  const handleEditDeck = () => {
    handleCloseRoom();
    navigate("/deck", {
      state: { deckName: name },
    });
  };

  const handleNavigateToGame = () => {
    // Mark this as a fresh game start (vs. a reconnect) so the game auto-selects
    // a leader for the deck's class on load.
    navigate("/game", { state: { fresh: true } });
  };

  const handleCardSelection = (card) => {
    if (deckMap.has(card)) {
      if (deckMap.get(card) === 1 && card === "Shenlong") return;
      else if (deckMap.get(card) === 1 && card === "Curse Crafter") return;
      else if (
        deckMap.get(card) === 3 &&
        card !== "Onion Patch" &&
        card !== "Rapid Fire"
      )
        return;
      else {
        deckMap.set(card, deckMap.get(card) + 1);
      }
    } else {
      deckMap.set(card, 1);
    }
    setDeck((deck) => [...deck, card]);
  };
  const handleEvoCardSelection = (card) => {
    if (evoDeckMap.has(card)) {
      if (
        evoDeckMap.get(card) === 3 &&
        card !== "Carrot" &&
        card !== "Drive Point"
      ) {
        return;
      } else {
        evoDeckMap.set(card, evoDeckMap.get(card) + 1);
      }
    } else {
      evoDeckMap.set(card, 1);
    }
    setEvoDeck((deck) => [...deck, card]);
  };
  const handleSelectDeck = (deck, idx) => {
    deckMap.clear();
    evoDeckMap.clear();
    for (let i = 0; i < deck.deck.length; i++) {
      handleCardSelection(deck.deck[i]);
    }
    for (let i = 0; i < deck.evoDeck.length; i++) {
      handleEvoCardSelection(deck.evoDeck[i]);
    }
    const newDeck = deck;
    setSelectedDeck(newDeck);
    let res = [];
    for (let i = 0; i < reduxDecks.length; i++) {
      if (i === idx) res.push(true);
      else res.push(false);
    }
    setShowSelected(res);

    dispatch(setDeck(newDeck.deck.toSorted(() => Math.random() - 0.5)));
    // Carry the deck's rarity/art choices into the game so cards render with the
    // chosen printing (synced to the opponent via full-state). Game-safe: only
    // affects which texture is shown, never card identity.
    dispatch(setMyArt(newDeck.art || {}));

    dispatch(
      setEvoDeck(
        newDeck.evoDeck.map((card) => {
          return { card: card, status: false };
        }),
      ),
    );
  };

  const randomLeader = () => {
    const num = Math.floor(Math.random() * numLeaders + 1);
    setLeaderNum(num);
    switch (num) {
      case 1:
        return galmieux;
      case 2:
        return kuon;
      case 3:
        return korwa;
      case 4:
        return viridia;
      case 5:
        return tsubaki;
      case 6:
        return grimnir;
      case 7:
        return piercye;
      default:
        return galmieux;
    }
  };

  const handleCloseSnack = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  // ---- mobile deck carousel (infinite, swipeable both directions) ----
  // The list is rendered as 3 identical copies. As the user swipes, the slot
  // nearest the centre is marked active (scaled up). When scrolling settles we
  // jump by one copy-width ΓÇö instantly, and invisibly since the copies are
  // identical ΓÇö to keep the view in the middle copy, so it never runs out of
  // room to swipe in either direction.
  const recenterCarousel = () => {
    const el = carouselRef.current;
    if (!el) return;
    const copyW = (reduxDecks.length + 1) * CAROUSEL_SLOT_W; // one copy of the list
    if (el.scrollLeft < copyW - 1) el.scrollLeft += copyW;
    else if (el.scrollLeft >= 2 * copyW - 1) el.scrollLeft -= copyW;
  };
  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el) return;
    const k = Math.round(el.scrollLeft / CAROUSEL_SLOT_W);
    setCarouselActiveK((p) => (p === k ? p : k));
    if (carouselSettleRef.current) clearTimeout(carouselSettleRef.current);
    carouselSettleRef.current = setTimeout(recenterCarousel, 130);
  };
  // Tap the centred item to use it; tap an off-centre item to bring it to centre.
  const onCarouselItemClick = (e, action) => {
    const el = carouselRef.current;
    const slot = e.currentTarget.closest("[data-k]");
    if (!el || !slot) return;
    const elRect = el.getBoundingClientRect();
    const r = slot.getBoundingClientRect();
    const delta = r.left + r.width / 2 - (elRect.left + elRect.width / 2);
    if (Math.abs(delta) < r.width / 2) action();
    else el.scrollBy({ left: delta, behavior: "smooth" });
  };

  // ---- React Bits LogoLoop deck strip ----
  // Used instead of the snap carousel only when there are enough decks for a
  // marquee to look right; below the threshold the old carousel renders.
  const useLoopStrip = reduxDecks.length > 3;

  // New Deck tile first, then one entry per saved deck. Memoized so the loop
  // doesn't remeasure on unrelated re-renders (rooms updates etc.).
  const loopItems = useMemo(
    () => [{ deck: null, idx: -1 }, ...reduxDecks.map((deck, idx) => ({ deck, idx }))],
    [reduxDecks],
  );

  // One tile in the loop. Same visuals/behavior as the old carousel tiles:
  // New Deck -> builder; deck click selects (desktop) or opens the options
  // menu (mobile); right-click opens the menu. Hovering pauses the loop so
  // tiles are clickable.
  const renderLoopTile = (it) => {
    if (!it.deck) {
      return (
        <div
          onClick={handleNavigateToDeck}
          onContextMenu={(e) => e.preventDefault()}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <img src={cardback} alt="cardback" draggable={false} />
          <div
            style={{
              color: "white",
              fontSize: 14,
              lineHeight: 1.3,
              fontFamily: "Noto Serif JP,serif",
              marginTop: 4,
            }}
          >
            NEW DECK
          </div>
        </div>
      );
    }
    const selected = !isMobile && showSelected[it.idx];
    return (
      <div
        onClick={(e) =>
          isMobile
            ? handleContextMenu(e, it.deck, it.idx)
            : handleSelectDeck(it.deck, it.idx)
        }
        onContextMenu={(e) => handleContextMenu(e, it.deck, it.idx)}
        style={{
          cursor: "pointer",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <img
          src={artThumb(it.deck.deck[Math.floor(it.deck.deck.length / 2)], it.deck.art)}
          alt={it.deck.name}
          draggable={false}
          style={{
            borderRadius: 8,
            outline: selected ? "3px solid #48abe0" : "none",
            boxShadow: selected ? "0 0 14px 2px rgba(72, 171, 224, 0.7)" : "none",
          }}
        />
        <div
          style={{
            marginTop: 4,
            maxWidth: 110,
            color: "white",
            fontSize: 13,
            lineHeight: 1.3,
            fontFamily: "Noto Serif JP,serif",
            textAlign: "center",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            background: "rgba(10, 14, 20, 0.8)",
            border: "1px solid rgba(72, 171, 224, 0.3)",
            borderRadius: 999,
            padding: "2px 10px",
          }}
        >
          {it.deck.name}
        </div>
      </div>
    );
  };

  // Shared deck carousel — used by both the desktop and mobile Home layouts
  // when there are few decks (the LogoLoop strip above takes over past
  // LOOP_MIN_DECKS, where a marquee reads better than a mostly-empty strip).
  // An infinite/looping strip of deck tiles plus a New Deck tile: scroll/swipe
  // to bring an item to the centre (it scales up), then tap the centred item, or
  // tap a side item to bring it to the centre.
  // - desktop: tapping the centred deck *selects* it (so the PLAY/JOIN buttons
  //   in the left panel act on it); right-click opens the Preview/Edit/Delete
  //   options menu. The selected deck is highlighted.
  // - mobile: tapping the centred deck opens the options menu directly (there's
  //   no separate PLAY button there).
  // `extraStyle` lets a caller tweak placement (e.g. the mobile column pins it
  // to the bottom with marginTop: auto).
  const renderDeckCarousel = ({ extraStyle = {}, desktop = false } = {}) => (
    <div
      ref={carouselRef}
      onScroll={handleCarouselScroll}
      style={{
        width: "100%",
        flexShrink: 0,
        display: "flex",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        paddingLeft: "calc(50% - 75px)",
        paddingRight: "calc(50% - 75px)",
        boxSizing: "border-box",
        WebkitOverflowScrolling: "touch",
        ...extraStyle,
      }}
    >
      {[0, 1, 2].map((copy) => {
        const items = [
          { type: "new" },
          ...reduxDecks.map((deck, idx) => ({ type: "deck", deck, idx })),
        ];
        const n = items.length;
        return items.map((it, logical) => {
          const gk = copy * n + logical;
          const active = carouselActiveK === gk;
          const tileStyle = {
            cursor: "pointer",
            transform: active ? "scale(1)" : "scale(0.78)",
            opacity: active ? 1 : 0.5,
            transition: "transform .2s ease, opacity .2s ease",
          };
          return (
            <div key={`${copy}-${logical}`} data-k={gk} style={carouselSlot}>
              {it.type === "new" ? (
                <div
                  onClick={(e) => onCarouselItemClick(e, handleNavigateToDeck)}
                  style={{ ...tileStyle, display: "flex", flexDirection: "column", alignItems: "center" }}
                >
                  <img height={150} src={cardback} alt="cardback" style={{ display: "block" }} />
                  <div style={{ color: "white", fontSize: 14, fontFamily: "Noto Serif JP,serif", marginTop: 4 }}>NEW DECK</div>
                </div>
              ) : (
                <div
                  onClick={(e) =>
                    onCarouselItemClick(
                      e,
                      desktop
                        ? () => handleSelectDeck(it.deck, it.idx)
                        : () => handleContextMenu(e, it.deck, it.idx),
                    )
                  }
                  onContextMenu={
                    desktop
                      ? (e) => handleContextMenu(e, it.deck, it.idx)
                      : (e) => e.preventDefault()
                  }
                  style={{ ...tileStyle, width: 110 }}
                >
                  <img
                    src={artThumb(it.deck.deck[Math.floor(it.deck.deck.length / 2)], it.deck.art)}
                    alt={it.deck.name}
                    loading="lazy"
                    style={{
                      width: "100%",
                      borderRadius: 8,
                      display: "block",
                      // Highlight the selected deck on desktop so it's clear
                      // which one PLAY/JOIN will use.
                      outline:
                        desktop && showSelected[it.idx]
                          ? "3px solid #48abe0"
                          : "none",
                      boxShadow:
                        desktop && showSelected[it.idx]
                          ? "0 0 14px 2px rgba(72, 171, 224, 0.7)"
                          : "none",
                    }}
                  />
                  <div
                    style={{
                      marginTop: 4,
                      color: "white",
                      fontSize: 13,
                      fontFamily: "Noto Serif JP,serif",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      background: "rgba(10, 14, 20, 0.8)",
                      border: "1px solid rgba(72, 171, 224, 0.3)",
                      borderRadius: 999,
                      padding: "2px 10px",
                    }}
                  >
                    {it.deck.name}
                  </div>
                </div>
              )}
            </div>
          );
        });
      })}
    </div>
  );

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseSnack}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  return (
    <div
      className="home-root"
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      style={{
        // On mobile, pin the page to the viewport so it can't scroll/overscroll
        // in any direction (content is designed to fit one screen).
        position: isMobile ? "fixed" : "relative",
        top: isMobile ? 0 : undefined,
        left: isMobile ? 0 : undefined,
        right: isMobile ? 0 : undefined,
        bottom: isMobile ? 0 : undefined,
        height: isMobile ? "100dvh" : "100vh",
        width: "100vw",
        background: "url(" + wallpaper + ") center center fixed",
        backgroundSize: "cover",
        display: "flex",
        // justifyContent: "center",
        alignItems: isMobile ? "stretch" : "center",
        flexDirection: isMobile ? "column" : "row",
        overflow: "hidden",
        overscrollBehavior: "none",
      }}
    >
      <Dialog
        open={openDialogue}
        onClose={handleCloseDialogue}
        disableScrollLock
        PaperProps={{
          component: "form",
        }}
      >
        <DialogTitle>Delete Deck</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this deck?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialogue}>No</Button>
          <Button onClick={handleDeleteDeck} type="submit">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      {/* Join Room modal — dark-glass dialog holding the room-code input.
          Enter or JOIN submits; requires a selected deck (same guard as the
          old inline input + button). */}
      <Dialog
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        disableScrollLock
        PaperProps={{
          sx: {
            background: "rgba(10, 14, 20, 0.92)",
            backgroundImage: "none",
            border: "1px solid rgba(72, 171, 224, 0.5)",
            borderRadius: "12px",
            boxShadow: "0 0 30px rgba(10, 175, 230, 0.35)",
            backdropFilter: "blur(10px)",
            width: 360,
          },
        }}
      >
        <DialogTitle
          sx={{
            color: "#daf6ff",
            fontFamily: "Share Tech Mono, monospace",
            letterSpacing: "0.1em",
            fontSize: 16,
            pb: 1,
          }}
        >
          JOIN ROOM
        </DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <input
            className="home-input"
            autoFocus
            style={{
              padding: ".6em .8em",
              fontSize: "16px",
              width: "100%",
              boxSizing: "border-box",
              textAlign: "center",
              fontFamily: "Noto Serif JP, serif",
            }}
            type="text"
            value={roomNumber}
            onChange={handleRoomNumberInput}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleJoinSubmit();
            }}
            placeholder="Room Code..."
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setJoinOpen(false)}
            sx={{
              fontFamily: "Noto Serif JP, serif",
              textTransform: "none",
              color: "#7da7bd",
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleJoinSubmit}
            disabled={roomNumber === ""}
            sx={{
              fontFamily: "Noto Serif JP, serif",
              textTransform: "none",
              fontWeight: "bold",
              color: "#eafaff",
              px: 3,
              borderRadius: "8px",
              background:
                "linear-gradient(135deg, rgba(18, 110, 178, 0.92) 0%, rgba(72, 171, 224, 0.88) 100%)",
              border: "1px solid rgba(140, 220, 255, 0.55)",
              "&:hover": {
                background:
                  "linear-gradient(135deg, rgba(28, 132, 205, 0.95) 0%, rgba(96, 192, 242, 0.92) 100%)",
                boxShadow: "0 0 16px rgba(72, 171, 224, 0.5)",
              },
              "&.Mui-disabled": {
                color: "rgba(234, 250, 255, 0.5)",
                opacity: 0.45,
              },
            }}
          >
            Join
          </Button>
        </DialogActions>
      </Dialog>
      <Snackbar
        open={openSnack}
        autoHideDuration={6000}
        onClose={handleCloseSnack}
        message="Copied link to clipboard"
        action={action}
      />
      <Snackbar
        open={hintSnack !== null}
        autoHideDuration={2500}
        onClose={(e, reason) => {
          if (reason === "clickaway") return;
          setHintSnack(null);
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        message={hintSnack}
        ContentProps={{
          sx: {
            justifyContent: "center",
            backgroundColor: "rgba(10, 14, 20, 0.92)",
            color: "#daf6ff",
            border: "1px solid rgba(72, 171, 224, 0.5)",
            borderRadius: "10px",
            boxShadow: "0 0 20px rgba(10, 175, 230, 0.3)",
            backdropFilter: "blur(8px)",
            fontFamily: "Noto Serif JP, serif",
          },
        }}
      />
      {!isMobile && (
      <>
      <AccountBadge style={{ position: "absolute", top: 14, left: 14, zIndex: 4 }} />
      <div
        style={{
          height: "100vh",
          width: "45%",
          // backgroundColor: "rgba(0, 0, 0, 0.60)",
          borderRadius: "10px",
          border: "4px solid #0000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-around",
          overflow: "hidden",
        }}
      >
        {/* Title — React Bits GradientText (replaced the SVE logo image). The
            wrapper keeps the old logo's 250px footprint so the column's
            space-around distribution — and the title's vertical position —
            match the logo layout. */}
        <div style={{ minHeight: 250, display: "flex", alignItems: "center" }}>
          <GradientText
            className="home-title"
            colors={["#2f8fd8", "#8cdcff", "#eafaff", "#48abe0"]}
            animationSpeed={6}
          >
            SVEClient
          </GradientText>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            width: "40%",
          }}
        >
          <Stack spacing={3.5} direction="column" alignItems="center">
            <StarBorder
              as="button"
              className="home-star-btn home-star-btn-play"
              color="#eafaff"
              speed="4s"
              thickness={1}
              onClick={() => {
                if (noDeck) {
                  setHintSnack("You must select a deck to continue");
                  return;
                }
                handleCreateRoom();
              }}
            >
              PLAY
            </StarBorder>
            <StarBorder
              as="button"
              className="home-star-btn"
              color="#8cdcff"
              speed="5s"
              thickness={1}
              onClick={() => {
                // Already hosting: joining another game would silently abandon
                // the open room, so block until it's closed.
                if (myRoom) {
                  setHintSnack("Close your current room before joining another game");
                  return;
                }
                if (noDeck) {
                  setHintSnack("You must select a deck to continue");
                  return;
                }
                setJoinOpen(true);
              }}
            >
              JOIN ROOM
            </StarBorder>
          </Stack>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "50%",
            width: "100%",
          }}
        >
          {useLoopStrip ? (
            <LogoLoop
              logos={loopItems}
              renderItem={renderLoopTile}
              speed={50}
              logoHeight={150}
              gap={48}
              pauseOnHover
              paused={contextMenu !== null}
              scaleOnHover
              draggable
              fadeOut
              fadeOutColor="rgba(8, 16, 30, 0.9)"
              width="100%"
              ariaLabel="Deck selection"
            />
          ) : (
            renderDeckCarousel({ desktop: true })
          )}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: "3%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "380px",
          maxWidth: "32vw",
          zIndex: 3,
          display: "flex",
          flexDirection: "column",
          gap: "0.5em",
        }}
      >
        <ActiveGamesBoard
          rooms={rooms}
          myRoom={myRoom}
          reconnectRoom={reconnectRoom}
          onJoin={handleJoinPublicRoom}
          onReconnect={handleReconnect}
          onTogglePrivacy={handleTogglePrivacy}
          onCloseRoom={handleCloseRoom}
        />
      </div>
      <div
        style={{
          position: "absolute",
          top: "5%",
          right: "0",
          width: "320px",
          maxHeight: "85%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "1em",
          zIndex: 2,
        }}
      >
        {reduxActiveUsers !== 0 && (
          <div
            style={{
              alignSelf: "flex-start",
              fontSize: 30,
              fontFamily: "Share Tech Mono, monospace",
              color: " #daf6ff",
              textShadow:
                "0 0 20px rgba(10, 175, 230, 1),  0 0 20px rgba(10, 175, 230, 0)",
            }}
          >
            <Counter
              value={reduxActiveUsers}
              fontSize={30}
              padding={4}
              gap={2}
              horizontalPadding={0}
              borderRadius={0}
              gradientHeight={0}
              containerStyle={{ verticalAlign: "middle" }}
            />{" "}
            users online
          </div>
        )}
        <div
          style={{
            width: "100%",
            maxHeight: "60vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "rgba(10, 14, 20, 0.75)",
            border: "1px solid rgba(72, 171, 224, 0.5)",
            borderRight: "none",
            borderRadius: "14px 0 0 14px",
            boxShadow: "0 0 20px rgba(10, 175, 230, 0.25)",
            backdropFilter: "blur(10px)",
            overflow: "hidden",
          }}
        >
        <div
          style={{
            padding: "0.6em 1em",
            borderBottom: "1px solid rgba(72, 171, 224, 0.35)",
            color: "#daf6ff",
            fontFamily: "Share Tech Mono, monospace",
            fontSize: 14,
            letterSpacing: "0.1em",
          }}
        >
          ANNOUNCEMENTS
        </div>
        {/* React Bits Carousel: one announcement per card, autoplaying (pauses
            on hover); drag or tap the dots to browse. */}
        <div
          className="home-announce-carousel"
          style={{ display: "flex", justifyContent: "center" }}
        >
          <Carousel
            items={announceItems}
            baseWidth={316}
            autoplay
            autoplayDelay={4000}
            pauseOnHover
            loop
          />
        </div>
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "4em",
          right: "2em",
          height: "10px",
          // width: "40px",
          color: "white",

          fontFamily: "Noto Serif JP, serif",
          borderRadius: "7px",
        }}
      >
        <a
          href="https://discord.gg/shadowverse-evolve-tcg-community-928746294384677004"
          target="_blank"
          rel="noreferrer noopener"
          style={{ position: "absolute", right: 0, zIndex: 2 }}
        >
          <img height={"40px"} src={discord} alt={"discord"} />
        </a>
      </div>
      <div className="LeaderContainerHome">
        <img
          className="LeaderImageHome"
          src={leaderImage}
          alt={"leader"}
          style={leaderNum === 6 ? { paddingTop: "100px" } : {}}
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "3.8em",
          right: "6em",
          height: "10px",
          // width: "40px",
          color: "white",

          fontFamily: "Noto Serif JP, serif",
          borderRadius: "7px",
        }}
      >
        <a
          href="https://dingdongdb.me/builder"
          target="_blank"
          rel="noreferrer noopener"
          style={{ position: "absolute", right: 10, zIndex: 2 }}
        >
          <Chip color="primary" label="DingDongDB" clickable />
        </a>
      </div>
      </>
      )}

      {isMobile && (
        <>
        {/* animated leader character ΓÇö large, fixed behind the UI, rising from
            the bottom to about the middle of the screen */}
        {leaderImage && (
          <div
            style={{
              position: "fixed",
              left: 0,
              right: 0,
              bottom: 0,
              height: "80vh",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
              overflow: "hidden",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            <img
              className="LeaderImageMobile"
              src={leaderImage}
              alt=""
              style={{ height: "100%", width: "auto", maxWidth: "none" }}
            />
          </div>
        )}
        <div
          style={{
            position: "relative",
            zIndex: 1,
            height: "100dvh",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 16,
            width: "100%",
            maxWidth: 460,
            margin: "0 auto",
            padding: "18px 14px 28px",
            boxSizing: "border-box",
          }}
        >
          <AccountBadge style={{ flexShrink: 0 }} />

          {/* users online */}
          {reduxActiveUsers !== 0 && (
            <div
              style={{
                fontSize: 14,
                fontFamily: "Share Tech Mono, monospace",
                color: "#daf6ff",
                textShadow: "0 0 12px rgba(10, 175, 230, 0.8)",
              }}
            >
              <Counter
                value={reduxActiveUsers}
                fontSize={14}
                padding={2}
                gap={1}
                horizontalPadding={0}
                borderRadius={0}
                gradientHeight={0}
                containerStyle={{ verticalAlign: "middle" }}
              />{" "}
              users online
            </div>
          )}

          {/* Active Games (capped so the column never needs to scroll; the
              room list scrolls internally) */}
          <div style={{ width: "100%", flexShrink: 0 }}>
            <ActiveGamesBoard
              rooms={rooms}
              myRoom={myRoom}
              reconnectRoom={reconnectRoom}
              onJoin={handleJoinPublicRoom}
              onReconnect={handleReconnect}
              onTogglePrivacy={handleTogglePrivacy}
              onCloseRoom={handleCloseRoom}
              maxHeight="42vh"
              isMobile
            />
          </div>

          {/* announcements (collapsible) ΓÇö directly under Active Games. The
              expanded panel is an overlay so it never reflows / moves anything. */}
          <div style={{ width: "100%", position: "relative", zIndex: 5, flexShrink: 0 }}>
            <Button
              fullWidth
              onClick={() => setShowAnnounce((s) => !s)}
              endIcon={<span style={{ fontSize: 13 }}>{showAnnounce ? "▲" : "▼"}</span>}
              sx={{
                fontFamily: "Share Tech Mono, monospace",
                textTransform: "none",
                letterSpacing: "0.08em",
                color: "#daf6ff",
                backgroundColor: "rgba(10, 14, 20, 0.75)",
                border: "1px solid rgba(72, 171, 224, 0.5)",
                borderRadius: "10px",
                justifyContent: "space-between",
                px: 2,
                py: 1,
              }}
            >
              ANNOUNCEMENTS
            </Button>
            {showAnnounce && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  left: 0,
                  right: 0,
                  zIndex: 6,
                  backgroundColor: "rgba(10, 14, 20, 0.96)",
                  border: "1px solid rgba(72, 171, 224, 0.5)",
                  borderRadius: 10,
                  padding: "0.5em",
                  boxShadow: "0 8px 24px rgba(0, 0, 0, 0.6)",
                }}
              >
                {/* React Bits Carousel — same autoplaying board as desktop. */}
                <div
                  className="home-announce-carousel"
                  style={{ display: "flex", justifyContent: "center" }}
                >
                  <Carousel
                    items={announceItems}
                    baseWidth={300}
                    autoplay
                    autoplayDelay={4000}
                    pauseOnHover
                    loop
                  />
                </div>
              </div>
            )}
          </div>

          {/* decks carousel (mobile): infinite/looping ΓÇö swipe either direction
              to bring New Deck or a deck to the centre (it scales up). Tap the
              centred item to use it (New Deck ΓåÆ builder; a deck ΓåÆ options), or
              tap a side item to bring it to the centre. Pinned to the bottom of
              the column via marginTop: auto. */}
          {useLoopStrip ? (
            <div style={{ width: "100%", marginTop: "auto", flexShrink: 0 }}>
              <LogoLoop
                logos={loopItems}
                renderItem={renderLoopTile}
                speed={45}
                logoHeight={130}
                gap={38}
                pauseOnHover
                paused={contextMenu !== null}
                draggable
                fadeOut
                fadeOutColor="rgba(8, 16, 30, 0.9)"
                width="100%"
                ariaLabel="Deck selection"
              />
            </div>
          ) : (
            renderDeckCarousel({ extraStyle: { marginTop: "auto" } })
          )}
        </div>
        </>
      )}
      <Menu
        open={contextMenu !== null}
        onClose={handleClose}
        disableScrollLock
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY - 150, left: contextMenu.mouseX - 35 }
            : undefined
        }
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem onClick={() => handlePreviewDeck()}>Preview</MenuItem>
        <MenuItem onClick={handleEditDeck}>Edit</MenuItem>
        <MenuItem onClick={handleOpenDialogue}>Delete</MenuItem>
      </Menu>

    </div>
  );
}
