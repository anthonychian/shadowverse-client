import React, { useState, useEffect } from "react";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { IconButton, Badge } from "@mui/material/";
import { useDispatch, useSelector } from "react-redux";
import { setHealth, setEvoPoints, setDice } from "../../redux/CardSlice";
import Leader from "./Leader";
import sword from "../../assets/logo/sword.png";
import forest from "../../assets/logo/forest.png";
import abyss from "../../assets/logo/abyss.png";
import dragon from "../../assets/logo/dragon.png";
import haven from "../../assets/logo/haven.png";
import rune from "../../assets/logo/rune.png";
import uma from "../../assets/logo/carrot.png";
import cool from "../../assets/logo/cool.png";
import cute from "../../assets/logo/cute.png";
import passion from "../../assets/logo/passion.png";
import Dice from "react-dice-roll";
import { motion } from "framer-motion";

export default function PlayerUI({ name }) {
  const dispatch = useDispatch();
  const [ep, setEP] = useState(0);
  const [playerHealth, setPlayerHealth] = useState(20);
  const reduxCurrentEP = useSelector((state) => state.card.evoPoints);
  const reduxCurrentHealth = useSelector((state) => state.card.playerHealth);
  const reduxMaxPlayPoints = useSelector((state) => state.card.playPoints.max);
  const reduxCurrentPlayPoints = useSelector(
    (state) => state.card.playPoints.available
  );
  const reduxShowDice = useSelector((state) => state.card.showDice);
  const reduxLeaderActive = useSelector((state) => state.card.leaderActive);

  useEffect(() => {
    dispatch(setHealth(playerHealth));
  }, [playerHealth]);

  useEffect(() => {
    setPlayerHealth(reduxCurrentHealth);
  }, [reduxCurrentHealth]);

  useEffect(() => {
    setEP(reduxCurrentEP);
  }, [reduxCurrentEP]);

  const incrementPlayerPoints = () => {
    setPlayerHealth(playerHealth + 1);
  };

  const decrementPlayerPoints = () => {
    playerHealth > 0 ? setPlayerHealth(playerHealth - 1) : setPlayerHealth(0);
  };

  const handleEP = (event) => {
    // setEP(Number(event.target.value));
    dispatch(setEvoPoints(Number(event.target.value)));
  };

  const handleDiceRoll = (value) => {
    console.log(value);
    dispatch(setDice({ show: true, roll: value }));
  };

  // const incrementEP = () => {
  //   setEP((ep) => ep + 1);
  // };

  // const decrementEP = () => {
  //   ep > 0 ? setEP((ep) => ep - 1) : setEP(0);
  // };

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
      case "Dionne":
        return sword;
      case "Albert":
        return sword;
      case "Amy":
        return abyss;
      case "Mono":
        return abyss;
      case "Kuon":
        return rune;
      case "Daria":
        return rune;
      case "Maruzensky":
        return uma;
      case "Rin":
        return cool;
      case "Uzuki":
        return cute;
      case "Mio":
        return passion;
      default:
        return dragon;
    }
  };
  const getColorFromLeader = (name) => {
    switch (name) {
      case "Forte":
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
      case "Galmieux":
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
      case "Jeanne":
        return "linear-gradient(to top, #c79081 0%, #dfa579 100%)";
      case "Ramina":
        return "linear-gradient(to top, #c79081 0%, #dfa579 100%)";
      case "CC":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Aria":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Dionne":
        return "linear-gradient(110.3deg, rgb(238, 179, 123) 8.7%, rgb(216, 103, 77) 47.5%, rgb(114, 43, 54) 89.1%)";
      case "Albert":
        return "linear-gradient(110.3deg, rgb(238, 179, 123) 8.7%, rgb(216, 103, 77) 47.5%, rgb(114, 43, 54) 89.1%)";
      case "Amy":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Mono":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Kuon":
        return "linear-gradient(181deg, rgb(2, 0, 97) 15%, rgb(97, 149, 219) 158.5%)";
      case "Daria":
        return "linear-gradient(181deg, rgb(2, 0, 97) 15%, rgb(97, 149, 219) 158.5%)";
      case "Maruzensky":
        return "linear-gradient(109.6deg, rgb(0, 0, 0) 11.2%, rgb(247, 30, 30) 100.3%)";
      case "Rin":
        return "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)";
      case "Uzuki":
        return "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)";
      case "Mio":
        return "linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)";
      default:
        return "linear-gradient(to right, rgb(252, 74, 26), rgb(247, 183, 51))";
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
      <div style={{ height: "60px", width: "60px" }}>
        {reduxShowDice && (
          <motion.div>
            <Dice
              size={60}
              faceBg={"transparent"}
              onRoll={(value) => handleDiceRoll(value)}
            />
          </motion.div>
        )}
      </div>
      <Leader name={name} active={reduxLeaderActive} />
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
              background: getColorFromLeader(name),
              outline: "7px ridge rgba(0, 0, 0, 1.0)",
              userSelect: "none",
              height: "60px",
              width: "150px",
              display: "flex",
              justifyContent: "space-evenly",
              alignItems: "center",
              fontSize: "45px",
              zIndex: 1,
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
              justifyContent: "space-evenly",
              alignItems: "center",
              background:
                "linear-gradient(to right, rgb(5, 117, 230), rgb(2, 27, 121))",
              fontFamily: "Noto Serif JP, serif",
              fontSize: "30px",
              outline: "7px ridge rgba(0, 0, 0, 1.0)",
              color: "white",
              zIndex: 1,
            }}
          >
            {reduxCurrentPlayPoints} / {reduxMaxPlayPoints}
            <div>
              <Badge color="info" size="small" badgeContent={ep}>
                <div
                  style={{
                    fontFamily: "Noto Serif JP, serif",
                    fontSize: "17px",
                  }}
                >
                  EP
                </div>
                <input
                  value={ep}
                  onChange={handleEP}
                  type="number"
                  min={0}
                  style={{
                    position: "absolute",
                    zIndex: 10,
                    top: "0px",
                    left: "30px",
                    width: "15px",
                    fontSize: "20px",
                    fontFamily: "Noto Serif JP, serif",
                    textAlign: "center",
                    backgroundColor: "transparent",
                    color: "transparent",
                    border: "none",
                    outline: "none",
                    transform: "rotateY(180deg)",
                  }}
                />
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
