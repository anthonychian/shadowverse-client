import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import IconButton from "@mui/material/IconButton";
import "../../css/PlayPoints.css";
import { useDispatch } from "react-redux";
import { setPlayPoints } from "../../redux/CardSlice";

export default function Scoreboard({ name }) {
  const dispatch = useDispatch();

  const [maxPlayPoints, setMaxPlayPoints] = useState(0);
  const [currentPlayPoints, setCurrentPlayPoints] = useState(0);

  const buttonBackgroundColor = "rgba(0, 0, 0, 0.6)";

  const incrementCurrent = () => {
    currentPlayPoints < maxPlayPoints
      ? setCurrentPlayPoints(currentPlayPoints + 1)
      : setCurrentPlayPoints(currentPlayPoints);
  };
  const decrementCurrent = () => {
    currentPlayPoints > 0
      ? setCurrentPlayPoints(currentPlayPoints - 1)
      : setCurrentPlayPoints(0);
  };
  const incrementMax = () => {
    maxPlayPoints < 10
      ? setMaxPlayPoints(maxPlayPoints + 1)
      : setMaxPlayPoints(10);
  };
  const decrementMax = () => {
    maxPlayPoints > 0
      ? setMaxPlayPoints(maxPlayPoints - 1)
      : setMaxPlayPoints(0);
  };
  const decrementMultiple = (idx) => {
    if (currentPlayPoints === idx) {
      setCurrentPlayPoints(idx - 1);
    } else {
      setCurrentPlayPoints(idx);
    }
  };
  const incrementMultiple = (idx) => {
    setCurrentPlayPoints(idx);
  };
  const incrementBoth = () => {
    maxPlayPoints < 10
      ? setMaxPlayPoints(maxPlayPoints + 1)
      : setMaxPlayPoints(10);
    currentPlayPoints < 10 && maxPlayPoints + 1 < 10
      ? setCurrentPlayPoints(maxPlayPoints + 1)
      : setCurrentPlayPoints(10);
  };

  useEffect(() => {
    dispatch(
      setPlayPoints({
        available: currentPlayPoints,
        max: maxPlayPoints,
      })
    );
  }, [currentPlayPoints, maxPlayPoints]);

  return (
    <div className="PlayPointsContainer">
      <div className="CircleContainer">
        <div className="circles">
          {[...Array(10)].map((x, idx) =>
            maxPlayPoints >= 10 - idx ? (
              currentPlayPoints >= 10 - idx ? (
                <div
                  onClick={() => decrementMultiple(10 - idx)}
                  key={`circle-${idx}`}
                  className="circle"
                >
                  {10 - idx}
                </div>
              ) : (
                <div
                  onClick={() => incrementMultiple(10 - idx)}
                  key={`circleFaded-${idx}`}
                  className="circleFaded"
                >
                  {10 - idx}
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
          {maxPlayPoints < 10 ? (
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
          {maxPlayPoints > 0 && maxPlayPoints > currentPlayPoints ? (
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
            {currentPlayPoints < 10 && maxPlayPoints > 0 ? (
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
            {currentPlayPoints}/{maxPlayPoints}
          </div>
          <div className="downArrowContainer">
            {maxPlayPoints > 0 ? (
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
        <div className="nextTurnContainer">
          <div className="buttonText" onClick={() => incrementBoth()}>
            Next Turn
          </div>
        </div>
      </div>
    </div>
  );
}
