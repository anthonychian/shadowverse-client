import React, { useState, useEffect, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton } from "@mui/material/";
import { useDispatch, useSelector } from "react-redux";
import {
  setHealth,
  setEvoPoints,
  setSuperEvoActive,
  logHealthDiff,
} from "../../redux/CardSlice";
import { socket } from "../../sockets";
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
import WifiOffIcon from "@mui/icons-material/WifiOff";
import WifiIcon from "@mui/icons-material/Wifi";
import SyncIcon from "@mui/icons-material/Sync";
import "../../css/EnemyUI.css";
import "../../css/LeaderPanel.css";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";
import sepOn from "../../assets/logo/sep_on.png";
import sepOff from "../../assets/logo/sep_off.png";
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

export default function PlayerUI({ name }) {
  const dispatch = useDispatch();
  const [ep, setEP] = useState(0);
  const [superEvo, setSEP] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(20);
  // Guard so we don't push the local default (20) into shared state on mount —
  // that would clobber a health value just restored from a saved/recovered game
  // (reload or reconnect). Only health the user changes after mount propagates.
  const healthDidMount = useRef(false);
  const reduxCurrentSuperEvo = useSelector(
    (state) => state.card.superEvoActive,
  );
  const reduxCurrentEP = useSelector((state) => state.card.evoPoints);
  const reduxCurrentHealth = useSelector((state) => state.card.playerHealth);
  const reduxMaxPlayPoints = useSelector((state) => state.card.playPoints.max);
  const reduxCurrentPlayPoints = useSelector(
    (state) => state.card.playPoints.available,
  );
  const reduxLeaderActive = useSelector((state) => state.card.leaderActive);
  const reduxRoom = useSelector((state) => state.card.room);
  const reduxSelfOnlineStatus = useSelector(
    (state) => state.card.selfOnlineStatus,
  );
  const reduxSelfConnectionState = useSelector(
    (state) => state.card.selfConnectionState,
  );
  const reduxSelfResyncing = useSelector(
    (state) => state.card.selfResyncing,
  );
  const gameMode = useSelector((state) => state.gameState.gameMode);
  const automated = gameMode === "automated";
  const sepLit = automated ? reduxCurrentSuperEvo : superEvo;

  useEffect(() => {
    if (automated) setSEP(reduxCurrentSuperEvo);
  }, [automated, reduxCurrentSuperEvo]);

  useEffect(() => {
    if (!healthDidMount.current) {
      healthDidMount.current = true;
      return;
    }
    dispatch(setHealth(playerHealth));
  }, [playerHealth]);

  useEffect(() => {
    setPlayerHealth(reduxCurrentHealth);
  }, [reduxCurrentHealth]);

  useEffect(() => {
    setEP(reduxCurrentEP);
  }, [reduxCurrentEP]);

  // Aggregated HP logging, debounced: the burst is anchored at the HP value
  // BEFORE its first click, and every further click restarts a 2s countdown —
  // so the net difference is logged as one game-log entry 2s after the LAST
  // click (e.g. three "−1" clicks → "-3 HP"). A burst that nets out to zero
  // logs nothing.
  const hpLogWindow = useRef(null);
  const healthRef = useRef(playerHealth);
  healthRef.current = playerHealth;

  const noteHealthChange = (healthBefore) => {
    if (!hpLogWindow.current) {
      hpLogWindow.current = { baseline: healthBefore, timer: null };
    } else {
      clearTimeout(hpLogWindow.current.timer);
    }
    hpLogWindow.current.timer = setTimeout(() => {
      const diff = healthRef.current - hpLogWindow.current.baseline;
      hpLogWindow.current = null;
      if (diff !== 0) dispatch(logHealthDiff(diff));
    }, 2000);
  };

  // Flush the pending window's timer on unmount (skip the log — a torn-down
  // Game page shouldn't dispatch).
  useEffect(
    () => () => {
      if (hpLogWindow.current) clearTimeout(hpLogWindow.current.timer);
    },
    [],
  );

  const incrementPlayerPoints = () => {
    noteHealthChange(playerHealth);
    setPlayerHealth(playerHealth + 1);
  };

  const decrementPlayerPoints = () => {
    if (playerHealth > 0) noteHealthChange(playerHealth);
    playerHealth > 0 ? setPlayerHealth(playerHealth - 1) : setPlayerHealth(0);
  };

  const handleEP = (newValue) => {
    setEP(newValue);
    dispatch(setEvoPoints(newValue));
    console.log(newValue);
  };

  const handleSuperEvo = () => {
    setSEP(!superEvo);
    dispatch(setSuperEvoActive(!superEvo));
    socket.emit("send msg", {
      type: "superEvoActive",
      data: !superEvo,
      room: reduxRoom,
    });
  };

  // const incrementEP = () => {
  //   setEP((ep) => ep + 1);
  // };

  // const decrementEP = () => {
  //   ep > 0 ? setEP((ep) => ep - 1) : setEP(0);
  // };

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

  return (
    <div className="leaderPanel" style={{ position: "relative" }}>
      <HideUiButton sx={{ position: "absolute", top: 0, right: 0, zIndex: 2 }} />
      {/* Hero: the animated leader with its class logo (and the wifi badge). */}
      <div className="leaderStageWrap">
        <Leader
          name={name}
          active={reduxLeaderActive}
          width={300}
          height={300}
          side="mine"
        />

        <div className="classBadge">
          <img src={getClassFromLeader(name)} alt={name} />
        </div>

        {!reduxSelfOnlineStatus ? (
          (() => {
            const reconnecting = reduxSelfConnectionState === "reconnecting";
            const label = reconnecting ? "Reconnecting" : "Disconnected";
            return (
              <div className="wifiBadge wifiOff" title={label}>
                <WifiOffIcon sx={{ height: 22, width: 22 }} />
                <span className="wifiBadgeLabel">{label}</span>
              </div>
            );
          })()
        ) : reduxSelfResyncing ? (
          // Still connected, but repairing a detected desync (sequence gap).
          <div className="wifiBadge wifiResync" title="Resyncing…">
            <SyncIcon className="wifiSpin" sx={{ height: 22, width: 22 }} />
            <span className="wifiBadgeLabel">Resyncing</span>
          </div>
        ) : null}
      </div>

      {/* Secondary: HP, play points, EP, super-evo grouped together. */}
      <div className="statRibbon">
        <div className="hpBlock" style={{ background: getColorFromLeader(name) }}>
          <IconButton
            size="small"
            className="hpAdjust decButton"
            onClick={() => decrementPlayerPoints()}
          >
            <RemoveIcon sx={{ color: "white", width: "26px", height: "26px" }} />
          </IconButton>
          <span className="hpValue">{playerHealth}</span>
          <IconButton
            size="small"
            className="hpAdjust incButton"
            onClick={() => incrementPlayerPoints()}
          >
            <AddIcon sx={{ color: "white", width: "26px", height: "26px" }} />
          </IconButton>
        </div>

        <div className="ppEpStack">
          <div className="ppPill">
            {reduxCurrentPlayPoints} / {reduxMaxPlayPoints}
          </div>
          <div className="epRow">
            <span className="epLabel">EP</span>
            <StyledRating
              name="customized-color"
              value={ep}
              max={3}
              onChange={(event, newValue) => {
                handleEP(newValue);
              }}
              icon={<FiberManualRecordIcon fontSize="inherit" />}
              emptyIcon={<FiberManualRecordOutlinedIcon fontSize="inherit" />}
            />
          </div>
        </div>

        <div
          className="evoBlock"
          onClick={automated ? undefined : () => handleSuperEvo()}
          title="Super Evolve"
          style={automated ? { cursor: "default" } : undefined}
        >
          <img src={sepLit ? sepOn : sepOff} alt="super evo" />
        </div>
      </div>
    </div>
  );
}
