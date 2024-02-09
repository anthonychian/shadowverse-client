import React from "react";
import { Badge, Snackbar, SnackbarContent } from "@mui/material/";
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
  const reduxEnemyEvoPoints = useSelector((state) => state.card.enemyEvoPoints);
  const reduxEnemyViewingDeck = useSelector(
    (state) => state.card.enemyViewingDeck
  );
  const reduxEnemyViewingCemetery = useSelector(
    (state) => state.card.enemyViewingCemetery
  );
  const reduxEnemyViewingEvoDeck = useSelector(
    (state) => state.card.enemyViewingEvoDeck
  );
  const reduxEnemyViewingCemeteryOpponent = useSelector(
    (state) => state.card.enemyViewingCemeteryOpponent
  );
  const reduxEnemyViewingEvoDeckOpponent = useSelector(
    (state) => state.card.enemyViewingEvoDeckOpponent
  );
  const reduxEnemyViewingTopCards = useSelector(
    (state) => state.card.enemyViewingTopCards
  );
  const reduxEnemyViewingHand = useSelector(
    (state) => state.card.enemyViewingHand
  );

  const getColorFromLeader = (name) => {
    switch (name) {
      case "Forte":
        return "rgba(255, 165, 0, 0.5)";
      case "Galmieux":
        return "rgba(255, 165, 0, 0.5)";
      case "Jeanne":
        return "rgba(192, 192, 192, 0.5)";
      case "Ramina":
        return "rgba(192, 192, 192, 0.5)";
      case "CC":
        return "rgba(0, 255, 0, 0.5)";
      case "Aria":
        return "rgba(0, 255, 0, 0.5)";
      case "Pompom":
        return "rgba(255, 255, 0, 0.5)";
      case "Albert":
        return "rgba(255, 255, 0, 0.5)";
      case "Itsurugi":
        return "rgba(246, 36, 89, 0.5)";
      case "Exella":
        return "rgba(246, 36, 89, 0.5)";
      case "Kuon":
        return "rgba(103, 128, 159, 0.5)";
      case "Daria":
        return "rgba(103, 128, 159, 0.5)";
      default:
        return "rgba(255, 165, 0, 0.5)";
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
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyViewingDeck}
      >
        <SnackbarContent
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Noto Serif JP, serif",
          }}
          message={"Viewing Deck"}
        />
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyViewingCemetery}
      >
        <SnackbarContent
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Noto Serif JP, serif",
          }}
          message={"Viewing Cemetery"}
        />
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyViewingEvoDeck}
      >
        <SnackbarContent
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Noto Serif JP, serif",
          }}
          message={"Viewing Evolve Deck"}
        />
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyViewingCemeteryOpponent}
      >
        <SnackbarContent
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Noto Serif JP, serif",
          }}
          message={"Viewing Opponent's Cemetery"}
        />
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyViewingEvoDeckOpponent}
      >
        <SnackbarContent
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Noto Serif JP, serif",
          }}
          message={"Viewing Opponent's Evo Deck"}
        />
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyViewingTopCards}
      >
        <SnackbarContent
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Noto Serif JP, serif",
          }}
          message={"Viewing Top Cards"}
        />
      </Snackbar>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyViewingHand}
      >
        <SnackbarContent
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.7)",
            color: "white",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            fontSize: "30px",
            fontWeight: "bold",
            fontFamily: "Noto Serif JP, serif",
          }}
          message={"Viewing Opponent's Hand"}
        />
      </Snackbar>
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
            justifyContent: "space-evenly",
            alignItems: "center",
            backgroundColor: "rgba(0, 0, 255, 0.5)",
            fontFamily: "Noto Serif JP, serif",
            fontSize: "30px",
            outline: "7px ridge rgba(0, 0, 0, 0.6)",
            color: "white",
          }}
        >
          {reduxCurrentEnemyPlayPoints} / {reduxMaxEnemyPlayPoints}
          <div>
            <Badge color="info" size="small" badgeContent={reduxEnemyEvoPoints}>
              <div
                style={{
                  fontFamily: "Noto Serif JP, serif",
                  fontSize: "17px",
                }}
              >
                EP
              </div>
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
}
