import { useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { socket } from "../../sockets";
import IconButton from "@mui/material/IconButton";
import "../../css/PlayPoints.css";
import {
  drawFromDeck,
  setFirstNextTurnTaken,
  setLeaderActive,
  setPlayPoints,
  setTurn,
} from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import { triggerGameAnimation } from "../field/animationBus";
import HideUiButton from "./HideUiButton";

export default function Scoreboard({ name }) {
  const dispatch = useDispatch();
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const automated = gameMode === "automated";

  const reduxMaxPlayPoints = useSelector((state) => state.card.playPoints.max);
  const reduxCurrentPlayPoints = useSelector(
    (state) => state.card.playPoints.available,
  );
  const reduxRoom = useSelector((state) => state.card.room);
  const reduxTurn = useSelector((state) => state.card.turn);
  const firstNextTurnTaken = useSelector(
    (state) => state.card.firstNextTurnTaken,
  );
  const reduxDeckSize = useSelector((state) => state.card.deck.length);
  const leaderActive = useSelector((state) => state.card.leaderActive);
  const enemyLeaderActive = useSelector(
    (state) => state.card.enemyLeaderActive,
  );
  const enemyEndTurnTaken = useSelector(
    (state) => state.card.enemyEndTurnTaken,
  );

  const canEndTurn = leaderActive;
  const canNextTurn =
    !leaderActive &&
    (!firstNextTurnTaken ||
      (enemyEndTurnTaken && !enemyLeaderActive));

  const buttonBackgroundColor = "rgba(0, 0, 0, 0.6)";

  const nextTurn = () => {
    if (!canNextTurn) return;
    incrementBoth();
    dispatch(setTurn(reduxTurn + 1));
    dispatch(setLeaderActive(true));
    if (!firstNextTurnTaken) {
      dispatch(setFirstNextTurnTaken(true));
      socket.emit("send msg", {
        type: "firstNextTurnTaken",
        data: true,
        room: reduxRoom,
      });
    } else if (reduxDeckSize > 0) {
      dispatch(drawFromDeck());
      triggerGameAnimation("draw", reduxRoom);
    }
    socket.emit("send msg", {
      type: "leaderActive",
      data: true,
      room: reduxRoom,
    });
  };
  const endTurn = () => {
    if (!canEndTurn) return;
    dispatch(setLeaderActive(false));
    socket.emit("send msg", {
      type: "leaderActive",
      data: false,
      room: reduxRoom,
    });
  };

  useEffect(() => {
    if (automated) return undefined;
    const handleKeyDown = (event) => {
      if (event.repeat || (event.code !== "Space" && event.key !== " ")) return;
      const target = event.target;
      const tag = target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || target?.isContentEditable) {
        return;
      }
      event.preventDefault();
      if (canNextTurn) nextTurn();
      else if (canEndTurn) endTurn();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [automated, canNextTurn, canEndTurn, nextTurn, endTurn]);

  const incrementCurrent = () => {
    if (reduxCurrentPlayPoints < reduxMaxPlayPoints) {
      dispatch(
        setPlayPoints({
          available: reduxCurrentPlayPoints + 1,
          max: reduxMaxPlayPoints,
        }),
      );
    }
  };
  const decrementCurrent = () => {
    reduxCurrentPlayPoints > 0
      ? dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints - 1,
            max: reduxMaxPlayPoints,
          }),
        )
      : dispatch(
          setPlayPoints({
            available: 0,
            max: reduxMaxPlayPoints,
          }),
        );
  };
  const incrementMax = () => {
    reduxMaxPlayPoints < 10
      ? dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: reduxMaxPlayPoints + 1,
          }),
        )
      : dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: 10,
          }),
        );
  };
  const decrementMax = () => {
    reduxMaxPlayPoints > 0
      ? dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: reduxMaxPlayPoints - 1,
          }),
        )
      : dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: 0,
          }),
        );
  };
  const decrementMultiple = (idx) => {
    if (reduxCurrentPlayPoints === idx) {
      dispatch(
        setPlayPoints({
          available: idx - 1,
          max: reduxMaxPlayPoints,
        }),
      );
    } else {
      dispatch(
        setPlayPoints({
          available: idx,
          max: reduxMaxPlayPoints,
        }),
      );
    }
  };
  const incrementMultiple = (idx) => {
    dispatch(
      setPlayPoints({
        available: idx,
        max: reduxMaxPlayPoints,
      }),
    );
  };
  const incrementBoth = () => {
    reduxMaxPlayPoints < 10
      ? dispatch(
          setPlayPoints({
            available: reduxMaxPlayPoints + 1,
            max: reduxMaxPlayPoints + 1,
          }),
        )
      : dispatch(
          setPlayPoints({
            available: 10,
            max: 10,
          }),
        );
  };

  return (
    <div className="PlayPointsContainer" style={{ position: "relative" }}>
      <HideUiButton sx={{ position: "absolute", top: 4, right: 4, zIndex: 2 }} />
      <div className="CircleContainer">
        <div className="circles">
          {[...Array(10)].map((x, idx) =>
            reduxMaxPlayPoints >= idx + 1 ? (
              reduxCurrentPlayPoints >= idx + 1 ? (
                <div
                  onClick={() => decrementMultiple(idx + 1)}
                  key={`circle-${idx}`}
                  className="circle"
                >
                  {idx + 1}
                </div>
              ) : (
                <div
                  onClick={() => incrementMultiple(idx + 1)}
                  key={`circleFaded-${idx}`}
                  className="circleFaded"
                >
                  {idx + 1}
                </div>
              )
            ) : (
              <div key={`socket-${idx}`} className="circleSocket">
                {idx + 1}
              </div>
            ),
          )}
        </div>
      </div>
      {!automated && <div className="IncDecContainer">
        <div className="inc">
          {reduxMaxPlayPoints < 10 ? (
            <IconButton
              sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
              onClick={() => incrementMax()}
            >
              <AddIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
                className="incButton"
              />
            </IconButton>
          ) : (
            <IconButton disabled>
              <AddIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
                className="incButton"
              />
            </IconButton>
          )}
        </div>

        <div className="dec">
          {reduxMaxPlayPoints > 0 &&
          reduxMaxPlayPoints > reduxCurrentPlayPoints ? (
            <IconButton
              sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
              onClick={() => decrementMax()}
            >
              <RemoveIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
              />
            </IconButton>
          ) : (
            <IconButton disabled>
              <RemoveIcon
                sx={{ color: "white", width: "30px", height: "30px" }}
              />
            </IconButton>
          )}
        </div>
      </div>}
      {/* </div> */}
      {!automated && <div className="buttonsContainer">
        <div className="pointsContainer">
          <div className="upArrowContainer">
            {reduxCurrentPlayPoints < 10 && reduxMaxPlayPoints > 0 ? (
              <IconButton
                sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
                onClick={() => incrementCurrent()}
              >
                <ExpandLessIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                  className="incButton"
                />
              </IconButton>
            ) : (
              <IconButton disabled>
                <AddIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                  className="incButton"
                />
              </IconButton>
            )}
          </div>
          <div className="points">
            {reduxCurrentPlayPoints}/{reduxMaxPlayPoints}
          </div>
          <div className="downArrowContainer">
            {reduxMaxPlayPoints > 0 ? (
              <IconButton
                sx={{ color: "white", backgroundColor: buttonBackgroundColor }}
                onClick={() => decrementCurrent()}
              >
                <ExpandMoreIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                />
              </IconButton>
            ) : (
              <IconButton disabled>
                <RemoveIcon
                  sx={{ color: "white", width: "30px", height: "30px" }}
                />
              </IconButton>
            )}
          </div>
        </div>
      </div>}
      {!automated && (
      <div className="turnContainer">
        <div
          className={`nextTurnContainer${canNextTurn ? "" : " turnDisabled"}`}
          onClick={() => canNextTurn && nextTurn()}
        >
          <div className="buttonText">Next Turn</div>
        </div>
        <div
          className={`endTurnContainer${canEndTurn ? "" : " turnDisabled"}`}
          onClick={() => canEndTurn && endTurn()}
        >
          <div className="buttonText">End Turn</div>
        </div>
      </div>
      )}
      {automated && (
        <div className="turnContainer">
          <div className="points" style={{ color: "white", marginTop: 8 }}>
            PP automated
          </div>
        </div>
      )}
    </div>
  );
}
