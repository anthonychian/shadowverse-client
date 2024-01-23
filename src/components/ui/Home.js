import React from "react";
import Leader from "../ui/Leader";
import Scoreboard from "../ui/Scoreboard";
import Voicelines from "../ui/Voicelines";
import PlayPoints from "../ui/PlayPoints";
import "../../css/Home.css";

export default function Home({ name }) {
  // let wallpaper;

  // switch (name) {
  //   case "Cernunnos":
  //     wallpaper = require("../../assets/leaders/Cernunnos/Wallpaper.png");
  //     break;
  //   case "Mizuchi":
  //     wallpaper = require("../../assets/leaders/Mizuchi/Wallpaper.png");
  //     break;
  //   case "Forte":
  //     wallpaper = require("../../assets/wallpapers/forteEvo.png");
  //     break;
  //   case "Pompom":
  //     wallpaper = require("../../assets/leaders/Pompom/Wallpaper.jpg");
  //     break;
  //   case "Daria":
  //     wallpaper = require("../../assets/leaders/Mizuchi/Wallpaper.png");
  //     break;
  //   case "Albert":
  //     wallpaper = require("../../assets/leaders/Forte/Wallpaper.png");
  //     break;
  //   case "Aria":
  //     wallpaper = require("../../assets/leaders/Mizuchi/Wallpaper.png");
  //     break;
  //   case "Exella":
  //     wallpaper = require("../../assets/leaders/Cernunnos/Wallpaper.png");
  //     break;
  //   case "Rola":
  //     wallpaper = require("../../assets/leaders/Forte/Wallpaper.png");
  //     break;
  //   default:
  //     wallpaper = require("../../assets/leaders/Cernunnos/Wallpaper.png");
  // }

  return (
    // <div
    //   style={{
    //     background: "url(" + wallpaper + ") no-repeat center center fixed",
    //     backgroundSize: "cover",
    //   }}
    // >
    <div className="Home-container">
      <header className="Home-header">
        <Leader name={name} />
        <Voicelines name={name} />
        <Scoreboard name={name} />
        <PlayPoints name={name} />
      </header>
    </div>
  );
}
