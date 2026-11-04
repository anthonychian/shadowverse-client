import React, {
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  useCallback,
} from "react";
import "../css/Game.css";
import Selection from "../components/ui/Selection";
import PlayerUI from "../components/ui/PlayerUI";
import EnemyUI from "../components/ui/EnemyUI";
import ChatUI from "../components/ui/ChatUI";
import PlayPoints from "../components/ui/PlayPoints";
import Hand from "../components/hand/Hand";
import Field from "../components/field/Field";
import { motion, MotionConfig } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import ZoomedCard from "../components/ui/ZoomedCard";
import ChoiceModal from "../components/automated/ChoiceModal";
import AutomatedControls from "../components/automated/AutomatedControls";
import UiChromeRestore from "../components/ui/UiChromeRestore";
import { useEngineSync } from "../components/hooks/useEngineSync";
import { setLeader, setMatchStart } from "../redux/CardSlice";
import { randomLeaderForClass } from "../decks/classLeaders";
import MatchTimer from "../components/ui/MatchTimer";
import initialWallpaper from "../../src/assets/wallpapers/3.png";

const RIGHT_CHAT_MIN_HEIGHT = 160;
const RIGHT_COLUMN_PADDING = 32;
const ENEMY_UI_LIFT = 16;
const RIGHT_UI_MIN_SCALE = 0.25;

export default function Game(callback) {
  useEngineSync();
  const [wallpaper, setWallpaper] = useState(initialWallpaper);
  const reduxLeader = useSelector((state) => state.card.leader);
  const [selectedOption, setSelectedOption] = useState(reduxLeader || "Galmieux");
  const reduxDeckClass = useSelector((state) => state.card.deckClass);
  const dispatch = useDispatch();
  const location = useLocation();

  useEffect(() => {
    if (reduxLeader) setSelectedOption(reduxLeader);
  }, [reduxLeader]);

  // Track the live leader so the delayed re-emit below sends whatever is current
  // (respecting a manual change), not a stale captured value.
  const leaderRef = useRef("");
  useEffect(() => {
    leaderRef.current = reduxLeader;
  }, [reduxLeader]);

  // On a fresh game load (both players entering a new game — not a reconnect),
  // auto-pick a random leader from the deck's class pool. Runs once on mount;
  // the deck class was stashed in Redux on game entry. The player can still
  // change leaders from the usual grid.
  useEffect(() => {
    if (!location.state?.fresh) return;
    const leader = randomLeaderForClass(reduxDeckClass);
    if (!leader) return;
    // Commit immediately so the player sees their leader right away (no flash of
    // the default). Both clients mount at game start, so the opponent's listener
    // may not have caught this first emit — re-emit the current leader shortly
    // after to guarantee delivery. setEnemyLeader is idempotent, so a duplicate
    // is harmless, and reading the live value respects a manual change made in
    // the meantime.
    dispatch(setLeader(leader));
    const t = setTimeout(() => {
      if (leaderRef.current) dispatch(setLeader(leaderRef.current));
    }, 1500);
    return () => clearTimeout(t);
  }, []);
  const constraintsRef = useRef(null);
  const [ready, setReady] = useState(false);
  // Start the match clock when players enter the room for a fresh game.
  // Resets happen in the CardSlice `reset` reducer on rematch.
  useEffect(() => {
    if (!location.state?.fresh) return;
    dispatch(setMatchStart(Date.now()));
  }, []);
  const [hovering, setHovering] = useState(false);
  const [readyToPlaceOnFieldFromHand, setReadyToPlaceOnFieldFromHand] =
    useState(false);
  const reduxCurrentCard = useSelector((state) => state.card.currentCard);
  const uiChromeHidden = useSelector((state) => state.gameState.uiChromeHidden);
  const chatExpanded = useSelector((state) => state.gameState.chatExpanded);
  const reduxMyArt = useSelector((state) => state.card.myArt);
  const reduxEnemyArt = useSelector((state) => state.card.enemyArt);
  // The zoomed card can be either player's; my own choices take precedence.
  const zoomArt = { ...reduxEnemyArt, ...reduxMyArt };

  // The board reports the scale it computed; the side panels (HP, leader, play
  // points, chat) shrink by the same factor so everything matches. Capped at 1
  // so they only ever scale down, never grow past their designed size.
  const [boardScale, setBoardScale] = useState(1);
  const sideScale = Math.min(boardScale, 1);

  // The hand is scaled by boardScale (below), so a dragged hand card would lag
  // the cursor by that factor. Map pointer coords into the hand's local space so
  // framer-motion's drag tracks the cursor 1:1. Matches the field-grid fix in
  // Field.js; the hand's drop handlers convert info.point back via getBoardScale().
  const handTransformPagePoint = useCallback(
    (point) => ({ x: point.x / (boardScale || 1), y: point.y / (boardScale || 1) }),
    [boardScale]
  );
  const leftScaleStyle = {
    transform: `scale(${sideScale})`,
    transformOrigin: "center left",
  };

  // Fit the leader art + stat ribbons to the right column on every screen size.
  // Only the leader art scales; the stat ribbon (HP, play points, turn counter)
  // always renders at the same 1:1 size as the expanded log.
  const enemyUiRef = useRef(null);
  const playerUiRef = useRef(null);
  const rightColRef = useRef(null);
  const [enemySize, setEnemySize] = useState(null);
  const [playerSize, setPlayerSize] = useState(null);
  const [rightFitScale, setRightFitScale] = useState(1);

  useLayoutEffect(() => {
    // Expanded-log view swaps the panels for compact bars laid out by flex —
    // nothing to measure (the refs aren't rendered).
    if (uiChromeHidden || chatExpanded) return undefined;
    const measure = () => {
      const eEl = enemyUiRef.current;
      const pEl = playerUiRef.current;
      const col = rightColRef.current;
      if (!eEl || !pEl || !col) return;
      // offsetWidth/offsetHeight ignore transforms → natural stage size. The
      // scale box's height is the scaled leader-art footprint, so the rest of
      // the panel (the stat ribbon) can be excluded from the scale math.
      const read = (el) => {
        const stage = el.querySelector(".leaderStageWrap");
        const box = el.querySelector(".leaderStageScaleBox") || stage;
        const stageW = stage?.offsetWidth ?? 0;
        const stageH = stage?.offsetHeight ?? 0;
        const restH = Math.max(0, el.offsetHeight - (box?.offsetHeight ?? 0));
        return { stageW, stageH, restH };
      };
      const e = read(eEl);
      const p = read(pEl);
      setEnemySize(e);
      setPlayerSize(p);
      const colRect = col.getBoundingClientRect();
      // Match the width of the expanded log's player/enemy bars: scale the
      // leader art up to the column width (not capped at its natural size).
      const maxStageW = Math.max(e.stageW, p.stageW);
      let fit = maxStageW > 0 ? (colRect.width - 4) / maxStageW : 1;
      // Height budget: only the scaled leader art counts against it; the
      // fixed-size stat ribbons are subtracted first.
      const stageTotalH = e.stageH + p.stageH;
      const restTotalH = e.restH + p.restH;
      if (stageTotalH > 0) {
        fit = Math.min(
          fit,
          (colRect.height - RIGHT_CHAT_MIN_HEIGHT - restTotalH) / stageTotalH,
        );
      }
      // Keep enough room for the chat down to very short viewports.
      setRightFitScale(Math.max(fit, RIGHT_UI_MIN_SCALE));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [uiChromeHidden, chatExpanded, selectedOption]);

  const rightUiScale = Math.min(sideScale, rightFitScale);

  // Free vertical space between the enemy and player panels after fitting. The
  // floating chat/game-log panel is capped to this so it can never cover either
  // leader panel.
  const rightChatGapHeight = Math.max(
    0,
    window.innerHeight -
      RIGHT_COLUMN_PADDING -
      (enemySize ? enemySize.stageH * rightUiScale + enemySize.restH : 0) -
      (playerSize ? playerSize.stageH * rightUiScale + playerSize.restH : 0),
  );

  const fitWrapStyle = {
    position: "relative",
    flexShrink: 0,
    width: "100%",
  };
  const fitInnerStyle = { width: "100%" };
  const enemyWrapStyle = {
    ...fitWrapStyle,
    transform: `translateY(-${ENEMY_UI_LIFT}px)`,
  };

  return (
    <div
      onContextMenu={(e) => e.nativeEvent.preventDefault()}
      className={"canvas"}
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        background: "url(" + wallpaper + ") center center fixed",
        // background: "url(" + wallpaper + ") ",
        backgroundSize: "cover",
      }}
    >
      <UiChromeRestore />
      <MatchTimer />
      {!uiChromeHidden && (
        <Selection
          setSelectedOption={setSelectedOption}
          // setWallpaper={setWallpaper}
        />
      )}
      {/* Left side  */}
      <div className={"leftSideCanvas"} style={{ position: "relative" }}>
        {!uiChromeHidden && (
          <div style={leftScaleStyle}>
            <PlayPoints name={selectedOption} />
          </div>
        )}
        {/* Hover preview fills the whole left column (the PlayPoints space),
            styled like the CreateDeck inspector. It overlays PlayPoints only
            while a card is being hovered. */}
        <ZoomedCard
          name={reduxCurrentCard}
          hovering={hovering}
          art={zoomArt}
        />
      </div>

      {/* Center Field */}
      <motion.div
        onContextMenu={(e) => e.nativeEvent.preventDefault()}
        className={"centerCanvas"}
        style={{
          // background: "linear-gradient(to top, #09203f 0%, #537895 100%)"
          background:
            "radial-gradient(circle, rgba(60,105,134,1) 0%, rgba(18,53,87,1) 70%, rgba(18,41,87,1) 84%, rgba(11,26,55,1) 100%)",
        }}
        ref={constraintsRef}
      >
        {/* Board area: fills the height above the hand and centers the board
            vertically, so on tall screens it sits in the middle instead of
            stuck at the top. The hand below stays pinned to the bottom. */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Field
            // dragging={dragging}
            ready={ready}
            setReady={setReady}
            setHovering={setHovering}
            readyToPlaceOnFieldFromHand={readyToPlaceOnFieldFromHand}
            setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
            onScaleChange={setBoardScale}
          />
        </div>
        {/* Scale the hand by the same factor as the board so the player's
            cards always match the on-field cards at every resolution. Anchor
            the scale to the bottom so the hand stays locked to the bottom edge
            instead of floating up by the scaled-away height. */}
        <div
          style={{
            transform: `scale(${boardScale})`,
            transformOrigin: "bottom center",
          }}
        >
          <MotionConfig transformPagePoint={handTransformPagePoint}>
            <Hand
              // setDragging={setDragging}
              setHovering={setHovering}
              constraintsRef={constraintsRef}
              ready={ready}
              setReady={setReady}
              setReadyToPlaceOnFieldFromHand={setReadyToPlaceOnFieldFromHand}
            />
          </MotionConfig>
        </div>
      </motion.div>

      {/* Right side */}
      {!uiChromeHidden && <ChoiceModal setHovering={setHovering} />}
      {!uiChromeHidden && <AutomatedControls />}

      {!uiChromeHidden && chatExpanded && (
        /* Expanded-log view: minimal stat bars — opponent pinned to the top,
           player to the bottom — with the chat/game log filling everything in
           between. No leader art, no fit-scaling (the bars are small). */
        <div className={"rightSideCanvas expandedLog"}>
          <EnemyUI compact />
          <ChatUI expanded setHovering={setHovering} />
          <PlayerUI compact name={selectedOption} />
        </div>
      )}

      {!uiChromeHidden && !chatExpanded && (
        <div
          className={"rightSideCanvas"}
          ref={rightColRef}
          style={{ position: "relative" }}
        >
          <div style={enemyWrapStyle}>
            <div ref={enemyUiRef} style={fitInnerStyle}>
              <EnemyUI stageScale={rightUiScale} />
            </div>
          </div>

          {/* Chat/game log floats at the field's right edge, vertically
              centred, instead of filling the column between the two UIs. */}
          <ChatUI
            scale={sideScale}
            availableHeight={rightChatGapHeight}
            setHovering={setHovering}
          />

          <div style={fitWrapStyle}>
            <div ref={playerUiRef} style={fitInnerStyle}>
              <PlayerUI stageScale={rightUiScale} name={selectedOption} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
