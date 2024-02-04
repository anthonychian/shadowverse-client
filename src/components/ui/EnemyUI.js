import React from "react";
import { useSelector } from "react-redux";
import Leader from "./Leader";
import sword from "../../assets/logo/sword.png";
import forest from "../../assets/logo/forest.png";
import abyss from "../../assets/logo/abyss.png";
import dragon from "../../assets/logo/dragon.png";
import haven from "../../assets/logo/haven.png";
import rune from "../../assets/logo/rune.png";

export default function EnemyUI() {
  const reduxCurrentEnemyPlayPoints = useSelector(
    (state) => state.card.enemyPlayPoints.available
  );
  const reduxMaxEnemyPlayPoints = useSelector(
    (state) => state.card.enemyPlayPoints.max
  );
  const reduxEnemyHealth = useSelector((state) => state.card.enemyHealth);

  const reduxEnemyLeader = useSelector((state) => state.card.enemyLeader);

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
        return "rgba(246, 36, 89, 0.3)";
      case "Exella":
        return "rgba(246, 36, 89, 0.3)";
      case "Kuon":
        return "rgba(103, 128, 159, 0.3)";
      case "Daria":
        return "rgba(103, 128, 159, 0.3)";
      default:
        return "rgba(255, 165, 0, 0.3)";
    }
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

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "150px",
        width: "20vw",
        gap: "1em",
      }}
    >
      <Leader name={reduxEnemyLeader} />
      <div style={{ opacity: 0.75 }}>
        <img
          height={70}
          width={70}
          src={getClassFromLeader(reduxEnemyLeader)}
          alt={reduxEnemyLeader}
        />
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
            fontFamily: "Noto Serif JP, serif",
            backgroundColor: getColorFromLeader(reduxEnemyLeader),
            outline: "7px ridge rgba(0, 0, 0, 0.6)",
            userSelect: "none",
            height: "60px",
            width: "150px",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            fontSize: "45px",
            color: "white",
          }}
        >
          {reduxEnemyHealth}
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
          {reduxCurrentEnemyPlayPoints} / {reduxMaxEnemyPlayPoints}
        </div>
      </div>
    </div>
  );
}
