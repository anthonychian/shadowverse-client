import React from "react";
import imageRamina from "../../assets/leaders/Ramina.png";
import imageJeanne from "../../assets/leaders/Jeanne.png";
import imageForte from "../../assets/leaders/Forte.png";
import imageGalmieux from "../../assets/leaders/Galmieux.png";
import imageKuon from "../../assets/leaders/Kuon.png";
import imageDaria from "../../assets/leaders/Daria.png";
import imageDionne from "../../assets/leaders/Dionne.png";
import imageAlbert from "../../assets/leaders/Albert.png";
import imageAria from "../../assets/leaders/Aria.png";
import imageCC from "../../assets/leaders/CC.png";
import imageExella from "../../assets/leaders/Exella.png";
import imageAmy from "../../assets/leaders/Amy.png";
import imageMaru from "../../assets/leaders/Maru.png";
import imageRin from "../../assets/leaders/Rin.png";
import imageUzuki from "../../assets/leaders/Uzuki.png";
import imageMio from "../../assets/leaders/Mio.png";

import "../../css/Leader.css";

export default function Leader({ name, active }) {
  let image;
  switch (name) {
    case "Galmieux":
      image = imageGalmieux;
      break;
    case "Forte":
      image = imageForte;
      break;
    case "Jeanne":
      image = imageJeanne;
      break;
    case "Ramina":
      image = imageRamina;
      break;
    case "Albert":
      image = imageAlbert;
      break;
    case "Dionne":
      image = imageDionne;
      break;
    case "Daria":
      image = imageDaria;
      break;
    case "Kuon":
      image = imageKuon;
      break;
    case "CC":
      image = imageCC;
      break;
    case "Aria":
      image = imageAria;
      break;
    case "Amy":
      image = imageAmy;
      break;
    case "Exella":
      image = imageExella;
      break;
    case "Maruzensky":
      image = imageMaru;
      break;
    case "Rin":
      image = imageRin;
      break;
    case "Uzuki":
      image = imageUzuki;
      break;
    case "Mio":
      image = imageMio;
      break;
    default:
      image = imageGalmieux;
  }
  return (
    <div className="LeaderContainer">
      {active ? (
        <img src={image} className="LeaderImageActive" alt="Leader" />
      ) : (
        <img src={image} className="LeaderImageInactive" alt="Leader" />
      )}
    </div>
  );
}
