import React, { useEffect } from "react";
import { Badge, Snackbar, SnackbarContent } from "@mui/material/";
import { motion } from "framer-motion";
import Dice from "react-dice-roll";
import { useDispatch, useSelector } from "react-redux";
import { setEnemyDice } from "../../redux/CardSlice";
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

import { styled } from "@mui/material/styles";
import Rating from "@mui/material/Rating";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import FiberManualRecordOutlinedIcon from "@mui/icons-material/FiberManualRecordOutlined";

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
  const dispatch = useDispatch();
  const reduxCurrentEnemyPlayPoints = useSelector(
    (state) => state.card.enemyPlayPoints.available
  );
  const reduxMaxEnemyPlayPoints = useSelector(
    (state) => state.card.enemyPlayPoints.max
  );
  const reduxEnemyHealth = useSelector((state) => state.card.enemyHealth);
  const reduxEnemyLeader = useSelector((state) => state.card.enemyLeader);
  const reduxEnemyEvoPoints = useSelector((state) => state.card.enemyEvoPoints);
  const reduxEnemyLeaderActive = useSelector(
    (state) => state.card.enemyLeaderActive
  );
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
  const reduxEnemyDice = useSelector((state) => state.card.enemyDice);

  useEffect(() => {
    if (reduxEnemyDice.show) {
      const timeoutId = setTimeout(() => {
        dispatch(setEnemyDice({ show: false, roll: 1 }));
      }, 2000);

      // Cleanup function to clear the timeout if the component unmounts
      return () => clearTimeout(timeoutId);
    }
  }, [reduxEnemyDice]);

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
      case "Orchis":
        return "linear-gradient(-60deg, #16a085 0%, #f4d03f 100%)";
      case "Dionne":
        return "linear-gradient(110.3deg, rgb(238, 179, 123) 8.7%, rgb(216, 103, 77) 47.5%, rgb(114, 43, 54) 89.1%)";
      case "Albert":
        return "linear-gradient(110.3deg, rgb(238, 179, 123) 8.7%, rgb(216, 103, 77) 47.5%, rgb(114, 43, 54) 89.1%)";
      case "Vania":
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
      case "Orchis":
        return forest;
      case "Dionne":
        return sword;
      case "Albert":
        return sword;
      case "Vania":
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

      <div style={{ height: "60px", width: "60px" }}>
        {reduxEnemyDice.show && (
          <motion.div
            id="dice"
            initial={{ opacity: 1.0 }}
            transition={{ delay: 1, duration: 1 }}
            animate={{ opacity: 0.0 }}
          >
            <Dice
              defaultValue={reduxEnemyDice.roll}
              size={60}
              faceBg={"transparent"}
            />
          </motion.div>
        )}
      </div>
      <Leader name={reduxEnemyLeader} active={reduxEnemyLeaderActive} />
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
            background: getColorFromLeader(reduxEnemyLeader),
            outline: "7px ridge rgba(0, 0, 0, 1.0)",
            userSelect: "none",
            height: "60px",
            width: "150px",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            fontSize: "45px",
            color: "white",
            zIndex: 1,
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
            background:
              "linear-gradient(to right, rgb(5, 117, 230), rgb(2, 27, 121))",
            fontFamily: "Noto Serif JP, serif",
            fontSize: "30px",
            outline: "7px ridge rgba(0, 0, 0, 1.0)",
            color: "white",
            zIndex: 1,
          }}
        >
          {reduxCurrentEnemyPlayPoints} / {reduxMaxEnemyPlayPoints}
          {/* <div>
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
          </div> */}
        </div>
        <div
          style={{
            height: "30px",
            width: "150px",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            background:
              "linear-gradient(to right, rgb(5, 117, 230), rgb(2, 27, 121))",
            fontFamily: "Noto Serif JP, serif",
            fontSize: "30px",
            outline: "3px ridge rgba(0, 0, 0, 1.0)",
            color: "white",
            zIndex: 1,
          }}
        >
          <div
            style={{
              fontFamily: "Noto Serif JP, serif",
              fontSize: "17px",
            }}
          >
            EP
          </div>
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
    </div>
  );
}
