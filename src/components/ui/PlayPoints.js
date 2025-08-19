import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { socket } from "../../sockets";
import IconButton from "@mui/material/IconButton";
import "../../css/PlayPoints.css";
import { setLeaderActive } from "../../redux/CardSlice";
import { useDispatch, useSelector } from "react-redux";
import { setPlayPoints } from "../../redux/CardSlice";

export default function Scoreboard({ name }) {
  const dispatch = useDispatch();

  const reduxMaxPlayPoints = useSelector((state) => state.card.playPoints.max);
  const reduxCurrentPlayPoints = useSelector(
    (state) => state.card.playPoints.available
  );
  const reduxRoom = useSelector((state) => state.card.room);

  const buttonBackgroundColor = "rgba(0, 0, 0, 0.6)";

  const nextTurn = () => {
    incrementBoth();
    dispatch(setLeaderActive(true));
    // dispatch(drawFromDeck());
    socket.emit("send msg", {
      type: "leaderActive",
      data: true,
      room: reduxRoom,
    });
  };
  const endTurn = () => {
    dispatch(setLeaderActive(false));
    socket.emit("send msg", {
      type: "leaderActive",
      data: false,
      room: reduxRoom,
    });
  };

  const incrementCurrent = () => {
    if (reduxCurrentPlayPoints < reduxMaxPlayPoints) {
      dispatch(
        setPlayPoints({
          available: reduxCurrentPlayPoints + 1,
          max: reduxMaxPlayPoints,
        })
      );
    }
  };
  const decrementCurrent = () => {
    reduxCurrentPlayPoints > 0
      ? dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints - 1,
            max: reduxMaxPlayPoints,
          })
        )
      : dispatch(
          setPlayPoints({
            available: 0,
            max: reduxMaxPlayPoints,
          })
        );
  };
  const incrementMax = () => {
    reduxMaxPlayPoints < 10
      ? dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: reduxMaxPlayPoints + 1,
          })
        )
      : dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: 10,
          })
        );
  };
  const decrementMax = () => {
    reduxMaxPlayPoints > 0
      ? dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: reduxMaxPlayPoints - 1,
          })
        )
      : dispatch(
          setPlayPoints({
            available: reduxCurrentPlayPoints,
            max: 0,
          })
        );
  };
  const decrementMultiple = (idx) => {
    if (reduxCurrentPlayPoints === idx) {
      dispatch(
        setPlayPoints({
          available: idx - 1,
          max: reduxMaxPlayPoints,
        })
      );
    } else {
      dispatch(
        setPlayPoints({
          available: idx,
          max: reduxMaxPlayPoints,
        })
      );
    }
  };
  const incrementMultiple = (idx) => {
    dispatch(
      setPlayPoints({
        available: idx,
        max: reduxMaxPlayPoints,
      })
    );
  };
  const incrementBoth = () => {
    reduxMaxPlayPoints < 10
      ? dispatch(
          setPlayPoints({
            available: reduxMaxPlayPoints + 1,
            max: reduxMaxPlayPoints + 1,
          })
        )
      : dispatch(
          setPlayPoints({
            available: 10,
            max: 10,
          })
        );
  };

  return (
    <div className="PlayPointsContainer">
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
              <div key={`${idx}`}></div>
            )
          )}
        </div>
      </div>
      <div className="IncDecContainer">
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
      </div>
      {/* </div> */}
      <div className="buttonsContainer">
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
      </div>
      <div className="turnContainer">
        <div className="nextTurnContainer">
          <div className="buttonText" onClick={() => nextTurn()}>
            Next Turn
          </div>
        </div>
        <div className="endTurnContainer">
          <div className="buttonText" onClick={() => endTurn()}>
            End Turn
          </div>
        </div>
      </div>
    </div>
  );
}
