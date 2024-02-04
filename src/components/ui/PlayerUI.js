import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import IconButton from "@mui/material/IconButton";
import { useDispatch, useSelector } from "react-redux";
import { setHealth } from "../../redux/CardSlice";
import Leader from "./Leader";
import sword from "../../assets/logo/sword.png";
import forest from "../../assets/logo/forest.png";
import abyss from "../../assets/logo/abyss.png";
import dragon from "../../assets/logo/dragon.png";
import haven from "../../assets/logo/haven.png";
import rune from "../../assets/logo/rune.png";

export default function PlayerUI({ name }) {
  const dispatch = useDispatch();
  const [playerHealth, setPlayerHealth] = useState(20);
  const reduxCurrentPlayPoints = useSelector(
    (state) => state.card.playPoints.available
  );
  const reduxMaxPlayPoints = useSelector((state) => state.card.playPoints.max);

  useEffect(() => {
    dispatch(setHealth(playerHealth));
  }, [playerHealth]);

  const incrementPlayerPoints = () => {
    setPlayerHealth(playerHealth + 1);
  };

  const decrementPlayerPoints = () => {
    playerHealth > 0 ? setPlayerHealth(playerHealth - 1) : setPlayerHealth(0);
  };

  const getClassFromLeader = (name) => {
    switch (name) {
      case "Forte":
        return dragon;
      case "Galmieux":
        return dragon;
      case "Jeanne":
        return haven;
      case "Ramina":
        return haven;
      case "CC":
        return forest;
      case "Aria":
        return forest;
      case "Pompom":
        return sword;
      case "Albert":
        return sword;
      case "Itsurugi":
        return abyss;
      case "Exella":
        return abyss;
      case "Kuon":
        return rune;
      case "Daria":
        return rune;
      default:
        return dragon;
    }
  };
  const getColorFromLeader = (name) => {
    switch (name) {
      case "Forte":
        return "rgba(255, 165, 0, 0.3)";
      case "Galmieux":
        return "rgba(255, 165, 0, 0.3)";
      case "Jeanne":
        return "rgba(192, 192, 192, 0.3)";
      case "Ramina":
        return "rgba(192, 192, 192, 0.3)";
      case "CC":
        return "rgba(0, 255, 0, 0.3)";
      case "Aria":
        return "rgba(0, 255, 0, 0.3)";
      case "Pompom":
        return "rgba(255, 255, 0, 0.3)";
      case "Albert":
        return "rgba(255, 255, 0, 0.3)";
      case "Itsurugi":
        return "rgba(255, 0, 0, 0.3)";
      case "Exella":
        return "rgba(255, 0, 0, 0.3)";
      case "Kuon":
        return "rgba(103, 128, 159, 0.3)";
      case "Daria":
        return "rgba(103, 128, 159, 0.3)";
      default:
        return "rgba(255, 165, 0, 0.3)";
    }
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: "20vw",
        height: "150px",
        gap: "1em",
      }}
    >
      <Leader name={name} />
      <div style={{ opacity: 0.75 }}>
        <img height={70} width={70} src={getClassFromLeader(name)} alt={name} />
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "1em",
        }}
      >
        <div
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "1em",
          }}
        >
          <div
            style={{
              fontFamily: "Noto Serif JP, serif",
              backgroundColor: getColorFromLeader(name),
              outline: "7px ridge rgba(0, 0, 0, 0.6)",
              userSelect: "none",
              height: "60px",
              width: "150px",
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              fontSize: "45px",
            }}
          >
            <IconButton
              size="large"
              className="decButton"
              onClick={() => decrementPlayerPoints()}
            >
              <RemoveIcon
                sx={{ color: "white", width: "30px", height: "50px" }}
              />
            </IconButton>
            <div
              style={{
                color: "white",
                // color: playerHealth > 19 ? "white" : "red"
              }}
            >
              {playerHealth}
            </div>
            <IconButton size="large" onClick={() => incrementPlayerPoints()}>
              <AddIcon
                sx={{ color: "white", width: "30px", height: "50px" }}
                className="incButton"
              />
            </IconButton>
          </div>
          <div
            style={{
              height: "50px",
              width: "150px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              backgroundColor: "rgba(0, 0, 255, 0.3)",
              fontFamily: "Noto Serif JP, serif",
              fontSize: "30px",
              outline: "7px ridge rgba(0, 0, 0, 0.6)",
              color: "white",
            }}
          >
            {reduxCurrentPlayPoints} / {reduxMaxPlayPoints}
          </div>
        </div>
      </div>
    </div>
  );
}
