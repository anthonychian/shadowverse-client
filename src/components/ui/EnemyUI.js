import React from "react";
import { Snackbar, SnackbarContent } from "@mui/material/";
import { useSelector } from "react-redux";
import Leader from "./Leader";
import sword from "../../assets/logo/sword.png";
import forest from "../../assets/logo/forest.png";
import abyss from "../../assets/logo/abyss.png";
import dragon from "../../assets/logo/dragon.png";
import haven from "../../assets/logo/haven.png";
import rune from "../../assets/logo/rune.png";
import umamusume from "../../assets/logo/umamusume.png";
import idolmaster from "../../assets/logo/idolmaster.png";
import vanguard from "../../assets/logo/vanguard.png";
import priconne from "../../assets/logo/priconne.webp";

import { styled } from "@mui/material/styles";
import Rating from "@mui/material/Rating";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WifiIcon from "@mui/icons-material/Wifi";
import sepOn from "../../assets/logo/sep_on.png";
import sepOff from "../../assets/logo/sep_off.png";
import "../../css/EnemyUI.css";
import "../../css/LeaderPanel.css";
import HideUiButton from "./HideUiButton";

const StyledRating = styled(Rating)({
  "& .MuiRating-iconFilled": {
    color:
      "radial-gradient(circle at 10% 20%, rgb(255, 200, 124) 0%, rgb(252, 251, 121) 90%);",
  },
  "& .MuiRating-iconHover": {
    color: "#fec13f",
  },
});

export default function EnemyUI() {
  const reduxCurrentEnemyPlayPoints = useSelector(
    (state) => state.card.enemyPlayPoints.available,
  );
  const reduxMaxEnemyPlayPoints = useSelector(
    (state) => state.card.enemyPlayPoints.max,
  );
  const reduxEnemySuperEvo = useSelector(
    (state) => state.card.enemySuperEvoActive,
  );
  const reduxEnemyHealth = useSelector((state) => state.card.enemyHealth);
  const reduxEnemyLeader = useSelector((state) => state.card.enemyLeader);
  const reduxEnemyEvoPoints = useSelector((state) => state.card.enemyEvoPoints);
  const reduxEnemyLeaderActive = useSelector(
    (state) => state.card.enemyLeaderActive,
  );
  const reduxEnemyViewingDeck = useSelector(
    (state) => state.card.enemyViewingDeck,
  );
  const reduxEnemyViewingCemetery = useSelector(
    (state) => state.card.enemyViewingCemetery,
  );
  const reduxEnemyViewingEvoDeck = useSelector(
    (state) => state.card.enemyViewingEvoDeck,
  );
  const reduxEnemyViewingCemeteryOpponent = useSelector(
    (state) => state.card.enemyViewingCemeteryOpponent,
  );
  const reduxEnemyViewingEvoDeckOpponent = useSelector(
    (state) => state.card.enemyViewingEvoDeckOpponent,
  );
  const reduxEnemyViewingTopCards = useSelector(
    (state) => state.card.enemyViewingTopCards,
  );
  const reduxEnemyViewingHand = useSelector(
    (state) => state.card.enemyViewingHand,
  );
  const reduxEnemyLeftGame = useSelector(
    (state) => state.card.enemyLeftGame,
  );
  const reduxEnemyOnlineStatus = useSelector(
    (state) => state.card.enemyOnlineStatus,
  );

  const getColorFromLeader = (name) => {
    switch (name) {
      case "SiLong":
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
      case "Drache":
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
      case "Forte":
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
      case "Galmieux":
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
      case "Jeanne":
        return "linear-gradient(to top, #c79081 0%, #dfa579 100%)";
      case "Rola":
        return "linear-gradient(to top, #c79081 0%, #dfa579 100%)";
      case "CC":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Orchis":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Sekka":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Hozumi":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Piercye":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Bunny":
        return "linear-gradient(110.3deg, rgb(238, 179, 123) 8.7%, rgb(216, 103, 77) 47.5%, rgb(114, 43, 54) 89.1%)";
      case "Albert":
        return "linear-gradient(110.3deg, rgb(238, 179, 123) 8.7%, rgb(216, 103, 77) 47.5%, rgb(114, 43, 54) 89.1%)";
      case "Icy":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Anisage":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Vania":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Mono":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Amy":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Kuon":
        return "linear-gradient(181deg, rgb(2, 0, 97) 15%, rgb(97, 149, 219) 158.5%)";
      case "Daria":
        return "linear-gradient(181deg, rgb(2, 0, 97) 15%, rgb(97, 149, 219) 158.5%)";
      case "Manhatten Cafe":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Maruzensky":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Rin":
        return "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)";
      case "Uzuki":
        return "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)";
      case "Mio":
        return "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)";
      case "Vanguard":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Pecorine":
        return "linear-gradient(120deg, #f6a6c1 0%, #f06ba8 100%)";
      case "Karyl":
        return "linear-gradient(120deg, #f6a6c1 0%, #f06ba8 100%)";
      default:
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
    }
  };
  const getClassFromLeader = (name) => {
    switch (name) {
      case "SiLong":
        return dragon;
      case "Drache":
        return dragon;
      case "Forte":
        return dragon;
      case "Galmieux":
        return dragon;
      case "Jeanne":
        return haven;
      case "Rola":
        return haven;
      case "Sekka":
        return forest;
      case "Hozumi":
        return forest;
      case "CC":
        return forest;
      case "Piercye":
        return forest;
      case "Orchis":
        return forest;
      case "Bunny":
        return sword;
      case "Albert":
        return sword;
      case "Icy":
        return abyss;
      case "Anisage":
        return abyss;
      case "Vania":
        return abyss;
      case "Mono":
        return abyss;
      case "Amy":
        return abyss;
      case "Lishenna":
        return rune;
      case "Ceridwen":
        return rune;
      case "Kuon":
        return rune;
      case "Daria":
        return rune;
      case "Manhatten Cafe":
        return umamusume;
      case "Maruzensky":
        return umamusume;
      case "Rin":
        return idolmaster;
      case "Uzuki":
        return idolmaster;
      case "Mio":
        return idolmaster;
      case "Vanguard":
        return vanguard;
      case "Pecorine":
        return priconne;
      case "Karyl":
        return priconne;
      default:
        return dragon;
    }
  };

  return (
    <div className="leaderPanel" style={{ position: "relative" }}>
      <HideUiButton sx={{ position: "absolute", top: 0, right: 0, zIndex: 2 }} />
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
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={reduxEnemyLeftGame}
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
          message={"Opponent left the game"}
        />
      </Snackbar>

      {/* Hero: the animated leader with its class logo (and the wifi badge). */}
      <div className="leaderStageWrap">
        <Leader
          name={reduxEnemyLeader}
          active={reduxEnemyLeaderActive}
          width={300}
          height={300}
          side="enemy"
        />

        <div className="classBadge">
          <img
            src={getClassFromLeader(reduxEnemyLeader)}
            alt={reduxEnemyLeader}
          />
        </div>

        {!reduxEnemyOnlineStatus && (
          <div className="wifiBadge wifiOff" title="Disconnected">
            <WifiOffIcon sx={{ height: 22, width: 22 }} />
            <span className="wifiBadgeLabel">Disconnected</span>
          </div>
        )}
      </div>

      {/* Secondary: HP, play points, EP, super-evo grouped together (read-only). */}
      <div className="statRibbon">
        <div
          className="hpBlock"
          style={{ background: getColorFromLeader(reduxEnemyLeader) }}
        >
          <span className="hpValue">{reduxEnemyHealth}</span>
        </div>

        <div className="ppEpStack">
          <div className="ppPill">
            {reduxCurrentEnemyPlayPoints} / {reduxMaxEnemyPlayPoints}
          </div>
          <div className="epRow">
            <span className="epLabel">EP</span>
            <StyledRating
              name="customized-color"
              value={reduxEnemyEvoPoints}
              readOnly={true}
              max={3}
              icon={<FiberManualRecordIcon fontSize="inherit" />}
              emptyIcon={<FiberManualRecordOutlinedIcon fontSize="inherit" />}
            />
          </div>
        </div>

        <div className="evoBlock evoStatic">
          <img src={reduxEnemySuperEvo ? sepOn : sepOff} alt="super evo" />
        </div>
      </div>
    </div>
  );
}
